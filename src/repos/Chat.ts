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

    // public async chats(userId: number, skip: number, take: number) {
    //     try {
    //         const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
    //             const where = {
    //                 participants: {
    //                     has: userId
    //                 }
    //             };
    //             let items = await tx.chat.findMany({
    //                 where,
    //                 skip,
    //                 take,
    //                 orderBy: {
    //                     createdAt: 'desc'
    //                 },
    //                 include: {
    //                     Message: {
    //                         orderBy: {
    //                             createdAt: 'desc'
    //                         },
    //                         take: 1
    //                     }
    //                 },

    //             });

    //             const totalItems = await tx.chat.count({ where: where })

    //             return { items: items, totalItems };
    //         });
    //         return this.repoResponse(false, 200, null, data);
    //     } catch (error) {
    //         return this.handleDatabaseError(error);
    //     }
    // }

    public async chats(userId: number, skip: number, take: number) {
        try {

            const where = {
                participants: {
                    has: userId
                }
            };

            const data = await this.prisma.chat.findMany({
                where,
                skip,
                take,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    Message: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1
                    }
                },
            });

            const totalItems = await this.prisma.chat.count({ where: where });

            return this.repoResponse(false, 200, null, { items: data, totalItems });
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}