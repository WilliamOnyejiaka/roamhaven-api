import { IChat, ChatModel } from "../schemas/Chat";
import { IMessage, MessageModel } from "../schemas/Message";
import Model from "./bases/Model";

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

export default class Chat extends Model<IChat> {

    public constructor() {
        super(ChatModel);
    }

    // async createWithMessages(chatDto: ChatDto, messageDto: MessageDto) {
    //     const session = await mongoose.startSession();
    //     session.startTransaction();
    //     try {
    //         const chat = new ChatModel({
    //             participants: [chatDto.senderId, chatDto.recipientId],
    //             messages: [],
    //         });
    //         await chat.save({ session });

    //         const message = new MessageModel({
    //             sender: messageDto.sender,
    //             recipient: messageDto.recipient,
    //             content: messageDto.content,
    //             media: messageDto.media,
    //             chat: chat._id,
    //             status: messageDto.status || "sent",
    //         });
    //         await message.save({ session });

    //         chat.messages = chat.messages || [];
    //         chat.messages.push(message._id);
    //         chat.lastMessage = message._id;
    //         await chat.save({ session });

    //         await session.commitTransaction();
    //         return {
    //             error: false,
    //             data: { chat, message },
    //         };
    //     } catch (error: any) {
    //         await session.abortTransaction();
    //         console.error(`Error creating chat with message: ${error.message}`);
    //         return {
    //             error: true,
    //             data: null,
    //         };
    //     } finally {
    //         session.endSession();
    //     }
    // }

    public async createWithMessages(chatDto: ChatDto, messageDto: MessageDto) {
        try {
            const chat = new ChatModel({
                participants: [chatDto.senderId, chatDto.recipientId],
                messages: [],
            });
            await chat.save();

            // Create message
            const message = new MessageModel({
                sender: messageDto.sender,
                recipient: messageDto.recipient,
                content: messageDto.content,
                media: messageDto.media,
                chat: chat._id,
                status: "sent",
            });
            await message.save();

            // Update chat
            chat.lastMessage = (message as any)._id;
            await chat.save();

            return {
                error: false,
                data: { chat, message }
            };
        } catch (error) {
            console.error("Something went wrong: ", error);
            return {
                error: true,
                data: null
            };
        }
    }
}