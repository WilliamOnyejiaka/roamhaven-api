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
}