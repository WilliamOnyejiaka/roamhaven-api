import { mongoose } from "../config";

export interface INotification extends mongoose.Document {
    userId: string;
    type: string; // e.g., 'transactional', 'marketing'
    channel: string; // e.g., 'email', 'push'
    content: string;
    status: string; // e.g., 'pending', 'sent', 'failed'
    priority: number;
    sendAt?: Date;
}

const notificationSchema = new mongoose.Schema<INotification>({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    channel: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, default: 'pending' },
    priority: { type: Number, default: 1 },
    sendAt: { type: Date },
});

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);