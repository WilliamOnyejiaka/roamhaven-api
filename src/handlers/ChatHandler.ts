import { Server } from "socket.io";
import { ISocket } from "../types";
import { UserSocket } from "../cache";
import Handler from "./Handler";
import { Namespaces, SocketEvents } from "../types/enums";
import { Chat, Message } from "../repos";

interface ChatDto {
    participants: number[]
};

interface MessageDto {
    sender: number,
    recipient: number,
    content: string,
    chatId?: string,
    status: string,
}


export default class ChatHandler {

    private static readonly userSocketCache = new UserSocket();


    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);

        const socketId = socket.id;

        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;

        console.log(`User id ${userId} , user type ${userType}`);

        const cache = await ChatHandler.userSocketCache.get(userId);
        if (cache.error) {
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
            return;
        }
        const socketData = cache.data;

        if (socketData) {
            socketData.chat = socketId;
            if (await ChatHandler.userSocketCache.set(userId, { ...socketData })) {
                console.log("successfully cached");
            }
        } else if (await ChatHandler.userSocketCache.set(userId, { chat: socketId, notification: null })) {
            console.log("New user cache was successfully created");
        }
    }

    public static async loadChats(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const chatModel = new Chat();

        let {
            page,
            limit
        } = data;

        if (!page || !limit) {
            socket.emit(SocketEvents.ERROR, Handler.responseData(400, true, "Invalid data provided"));
            return;
        }

        const { skip, take } = { skip: (page - 1) * limit, take: limit };
        const result = await chatModel.chats(userId, skip, take);

        if (result.error) {
            socket.emit(SocketEvents.ERROR, Handler.responseData(500, true, "Something went wrong"));
            return;
        }

        socket.emit(SocketEvents.CHATS, Handler.responseData(200, true, "Chats were retrieved successfully", result.data));
        return;
    }

    public static async loadMessages(io: Server, socket: ISocket, data: any) {
        const messageRepo = new Message();

        let {
            page,
            limit,
            chatId
        } = data;

        if (!page || !limit || !chatId) {
            socket.emit(SocketEvents.ERROR, Handler.responseData(400, true, "Invalid data provided"));
            return;
        }

        const { skip, take } = { skip: (page - 1) * limit, take: limit };
        const result = await messageRepo.messages(chatId, skip, take);

        if (result.error) {
            socket.emit(SocketEvents.ERROR, Handler.responseData(500, true, "Something went wrong"));
            return;
        }

        socket.emit(SocketEvents.MESSAGES, Handler.responseData(200, true, "Messages were retrieved successfully", result.data));
        return;
    }

    public static async sendMessage(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const chatNamespace = io.of(Namespaces.CHAT);
        const socketId = socket.id;
        const chatModel = new Chat();
        const messageModel = new Message();

        let {
            recipientId,
            content,
            chatId
        } = data;

        if (!recipientId || !content) {
            socket.emit(SocketEvents.ERROR, Handler.responseData(400, true, "Invalid data provided"));
            return;
        }

        const cache = await ChatHandler.userSocketCache.get(recipientId);
        if (cache.error) {
            socket.emit(SocketEvents.ERROR, Handler.responseData(500, true, "Something went wrong"));
            return;
        }

        const socketData = cache.data;
        const recipientSocketId = socketData.chat;
        const recipientIsOnline = socketData && recipientSocketId;

        if (!chatId) {
            console.log(`💬 Creating new chat for room `);
            const chatDto: ChatDto = {
                participants: [Number(recipientId), userId]
            };

            const messageDto: MessageDto = {
                sender: userId,
                recipient: recipientId,
                content,
                status: recipientIsOnline ? 'PENDING' : 'SENT',
            };

            const modelResponse = await chatModel.insertChat(chatDto, messageDto);
            if (modelResponse.error) {
                socket.emit(SocketEvents.ERROR, Handler.responseData(500, true, "Something went wrong"));
                return;
            }

            console.log(`✅ New chat has been created`);
            const room = (modelResponse.data as any).id as string;
            socket.emit('sentMessage', Handler.responseData(200, false, null, modelResponse.data));
            // chatNamespace.sockets.get(socketId)?.join(room);
            if (recipientIsOnline) {
                // chatNamespace.sockets.get(recipientSocketId)?.join(room);
                socket.to(recipientSocketId).emit('newChat', Handler.responseData(200, false, null, modelResponse));
                console.log(`✅ Message sent directly to user ${recipientId} via socket ${recipientSocketId}`);
            }

            return;
        } else {

            const messageDto: MessageDto = {
                sender: userId,
                recipient: recipientId,
                content,
                status: recipientIsOnline ? 'PENDING' : 'SENT',
                chatId
            };
            const modelResponse = await messageModel.insertMessage(messageDto as any);

            if (modelResponse.error) {
                socket.emit(SocketEvents.ERROR, Handler.responseData(500, true, "Something went wrong"));
                return;
            }

            // const senderSocket = io.sockets.sockets.get(socketId); // Get socket by ID
            const room = io.sockets.adapter.rooms.get(chatId); // Get room
            const senderIsInRoom = room && room.has(socketId); // Check if socket ID is in room
            const recipientIsInRoom = room && room.has(recipientId);

            if (!senderIsInRoom) chatNamespace.sockets.get(socketId)?.join(chatId);
            if (recipientIsOnline && !recipientIsInRoom) chatNamespace.sockets.get(recipientSocketId)?.join(chatId);

            chatNamespace.to(chatId).emit('receiveMessage', Handler.responseData(200, false, null, modelResponse));
            console.log(`✅ Message sent successfully to room ${chatId}`);
            return;
        }
    }
}