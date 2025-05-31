import { mongoose } from "../config";
import { IMessage, messageSchema } from "./Message";

export interface IChat extends mongoose.Document {
    participants: Number[];
    lastMessage: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

const chatSchema: mongoose.Schema<IChat> = new mongoose.Schema({
    participants: [{
        type: Number,
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message', // Reference to the last message in the chat
    }
}, { timestamps: true });

chatSchema.index({ participants: 1 });
chatSchema.index({ messages: 1 });

export const ChatModel = mongoose.model<IChat>('Chat', chatSchema);

