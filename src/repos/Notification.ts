import MongoDB from "./bases/MongoDB";

export default class Notification extends MongoDB {

    public constructor() {
        super('notification');
    }

    public async insertNotification(data: any) {
        try {
            const result = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    channel: data.channel,
                    content: data.content,
                    status: data.status,
                    priority: data.priority
                }
            });

            return this.repoResponse(false, 201, null, result);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }
}