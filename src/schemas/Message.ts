import { mongoose } from "../config";

export interface IMessage extends mongoose.Document {
    sender: number;
    content: string;
    recipient: number;
    media: [{
        url: string;
        type: 'image' | 'video' | 'audio' | 'file';
        fileName: string;
        fileSize: number;
        uploadedAt: Date;
    }];
    chat: mongoose.Types.ObjectId;
    status: 'read' | 'pending' | 'sent' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

export const messageSchema: mongoose.Schema<IMessage> = new mongoose.Schema({
    sender: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    recipient: {
        type: Number,
        required: true,
    },
    media: [{
        url: {
            type: String,
            trim: true
        },
        type: {
            type: String,
            enum: ['image', 'video', 'audio', 'file'],
            required: true
        },
        fileName: {
            type: String,
            trim: true
        },
        fileSize: {
            type: Number
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    status: {
        type: String, // Corrected from ObjectId to String
        enum: ['read', 'pending', 'sent', 'failed'],
        default: 'pending' // Consider adding a default status
    }
}, {
    timestamps: true // Automatically manages createdAt and updatedAt
});

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema);