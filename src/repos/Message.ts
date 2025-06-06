import MongoDB from "./bases/MongoDB";

export default class Message extends MongoDB {

    public constructor() {
        super('message');
    }

    public async insertMessage(messageData: any) {
        try {
            const result = await this.prisma.message.create({
                data: {
                    sender: messageData.sender,
                    recipient: messageData.recipient,
                    content: messageData.content,
                    status: messageData.status,
                    chatId: messageData.chatId
                }
            });

            return this.repoResponse(false, 201, null, result);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async messages(chatId: string, skip: number, take: number) {
        try {

            const where = { chatId };

            const data = await this.prisma.message.findMany({
                where: where,
                skip,
                take,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const totalItems = await this.prisma.message.count({ where: where });

            return this.repoResponse(false, 200, null, { items: data, totalItems });
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}