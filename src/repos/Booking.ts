import { BookingDto } from "../types/dtos";
import Repo from "./bases/Repo";

export default class Booking extends Repo {

    public constructor() {
        super('booking');
    }

    public async insertBooking(booking: BookingDto) {
        try {
            const data = await this.prisma.booking.create({
                data: {
                    userId: booking.userId,
                    hostId: booking.hostId,
                    listingId: booking.listingId,
                    totalPrice: booking.totalPrice,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                },
                include: {
                    host: true,
                    user: true
                }
            });
            return super.repoResponse(false, 201, null, data);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async bookings(userId: number, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { userId };
                let items = await tx.booking.findMany({
                    where: where,
                    skip,
                    take,
                    include: {
                        host: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                createdAt: true,
                                updatedAt: true,
                                profilePicture: {
                                    select: {
                                        imageUrl: true
                                    }
                                }
                            }
                        }
                    }
                });

                const totalItems = await tx.booking.count({ where: where })

                return { items: items, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async reserved(hostId: number, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = { hostId };
                let items = await tx.booking.findMany({
                    where: where,
                    skip,
                    take,
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                createdAt: true,
                                updatedAt: true,
                                profilePicture: {
                                    select: {
                                        imageUrl: true
                                    }
                                }
                            }
                        }
                    }
                });

                const totalItems = await tx.booking.count({ where: where })

                return { items: items, totalItems };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}