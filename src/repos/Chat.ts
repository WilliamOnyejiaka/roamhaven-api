import MongoDB from "./bases/MongoDB";

export default class Chat extends MongoDB {

    public constructor() {
        super('chat');
    }

    public async insertChat(data: any, messageData: any) {
        try {
            const result = await this.prisma.chat.create({
                data: {
                    participants: data.participants,
                    Message: {
                        create: {
                            sender: messageData.sender,
                            recipient: messageData.recipient,
                            content: messageData.content,
                            status: messageData.status
                        }
                    }
                },
                include: {
                    Message: {
                        select: {
                            sender: true,
                            recipient: true,
                            content: true,
                            status: true
                        }
                    }
                }
            });

            return this.repoResponse(false, 201, null, result);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }
}