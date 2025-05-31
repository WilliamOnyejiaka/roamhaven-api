import { Notification as NotificationModel } from "../models";
import { INotification } from "../schemas/Notification";
import { UserSocket } from "../cache";
import BaseService from "./bases/BaseService";
import { Server } from "socket.io";
import { Namespaces } from "../types/enums";

export default class Notification extends BaseService {

    private readonly userSocketCache = new UserSocket();
    private readonly model = new NotificationModel();

    public async notify(userId: number, type: string, data: any, io: Server) {
        const cache = await this.userSocketCache.get(userId);
        if (cache.error) return false;

        const socketData = cache.data;
        const socketId = socketData.notification;
        const isOnline = socketData && socketId;

        const notificationData: any = {
            userId: userId,
            type: type,
            channel: 'push',
            status: isOnline ? 'pending' : 'sent',
            priority: 1,
            content: JSON.stringify(data)
        };

        const modelResult = await this.model.create(notificationData);
        if (modelResult.error) return false;

        if (isOnline) {
            const notificationNamespace = io.of(Namespaces.NOTIFICATION);
            notificationData.status = "sent";

            notificationNamespace?.to(socketId)?.emit('notification', { data: modelResult.data });
            console.log("notification has been emitted");
        }

        return true;
    }
}