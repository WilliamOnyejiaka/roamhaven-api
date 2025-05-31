import { Server } from "socket.io";
import { ISocket } from "../types";
import { UserSocket } from "../cache";
import Handler from "./Handler";
import { Namespaces, SocketEvents } from "../types/enums";
import { Chat, Message } from "../models";

interface ChatDto {
    senderId: number,
    recipientId: number
}

interface MessageDto {
    sender: number,
    recipient: number,
    content: string,
    media: any[],
    chat?: string,
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

    public static async sendMessage(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const chatNamespace = io.of(Namespaces.CHAT);
        const notificationNamespace = io.of(Namespaces.NOTIFICATION);
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
                recipientId: Number(recipientId),
                senderId: userId
            };

            const messageDto: MessageDto = {
                sender: userId,
                recipient: recipientId,
                content,
                media: [],
                status: recipientIsOnline ? 'sent' : 'pending'
            }
            const modelResponse = await chatModel.createWithMessages(chatDto, messageDto);
            if (modelResponse.error) {
                socket.emit(SocketEvents.ERROR, Handler.responseData(500, true, "Something went wrong"));
                return;
            }
            // console.log(modelResponse);
            socket.emit('sentMessage', Handler.responseData(200, false, null, modelResponse));
            if (recipientIsOnline) {
                chatNamespace.sockets.get(recipientSocketId)?.join(chatId);
                socket.to(recipientSocketId).emit('newChat', Handler.responseData(200, false, null, modelResponse));
            }
        } else {

            const messageDto: MessageDto = {
                sender: userId,
                recipient: recipientId,
                content,
                media: [],
                status: recipientIsOnline ? 'pending' : 'sent',
                chat: chatId
            };
            const modelResponse = await messageModel.create(messageDto as any);
            // console.log(modelResponse);
            if (modelResponse.error) {

            }

            // const senderSocket = io.sockets.sockets.get(socketId); // Get socket by ID
            const room = io.sockets.adapter.rooms.get(chatId); // Get room
            const senderIsInRoom = room && room.has(socketId); // Check if socket ID is in room
            const recipientIsInRoom = room && room.has(recipientId);

            if (!senderIsInRoom) chatNamespace.sockets.get(socketId)?.join(chatId);
            if (recipientIsOnline && !recipientIsInRoom) chatNamespace.sockets.get(recipientSocketId)?.join(chatId);

            chatNamespace.to(chatId).emit('receiveMessage', Handler.responseData(200, false, null, modelResponse));
        }
    }
}