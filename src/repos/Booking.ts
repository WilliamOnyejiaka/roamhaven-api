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
}