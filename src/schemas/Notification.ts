import { mongoose } from "../config";

export interface INotification extends mongoose.Document {
    userId: number;
    type: 'transactional' | 'marketing' | 'listing' | 'chat'; 
    channel: string; // e.g., 'email', 'push'
    content: string;
    status: 'pending' | 'sent' | 'failed';
    priority: number;
    createdAt?: Date;
    updatedAt?: Date;
};

const notificationSchema = new mongoose.Schema<INotification>({
    userId: { type: Number, required: true },
    type: { type: String, enum: ['transactional', 'marketing', 'listing', 'chat'], required: true },
    channel: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    priority: { type: Number, default: 1 },
}, { timestamps: true });

export const NotificationModel = mongoose.model<INotification>('notification', notificationSchema);