import BaseService from "./bases/BaseService";
import { Booking as BookingRepo, Listing } from "../repos";
import { BookingDto } from "../types/dtos";

export default class Booking extends BaseService<BookingRepo> {

    private readonly listingRepo = new Listing();

    public constructor() {
        super(new BookingRepo());
    }

    public async book(bookingDto: BookingDto) {
        const listingExists = await this.listingRepo.getWithId(bookingDto.listingId);
        const listingExistsError = this.handleRepoError(listingExists);

        if (listingExistsError) return listingExistsError;
        if (!listingExists.data) return super.responseData(404, true, "Listing was not found");

        const hostId = listingExists.data.userId;
        if (bookingDto.userId == hostId) return super.responseData(400, true, "User cannot book their listing");

        bookingDto.hostId = hostId;
        const repoResult = await this.repo!.insertBooking(bookingDto);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(201, false, "Booking was successful", repoResult.data);
    }

    public async bookings(userId: number, page: number, limit: number) {
        const { skip, take } = super.skipTake(page, limit);
        const repoResult = await this.repo!.bookings(userId, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = this.getPagination(page, limit, totalRecords);
        return super.responseData(200, false, "Items were retrieved successfully", { items: data.items, pagination });
    }

    public async reserved(hostId: number, page: number, limit: number) {
        const { skip, take } = super.skipTake(page, limit);
        const repoResult = await this.repo!.reserved(hostId, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = this.getPagination(page, limit, totalRecords);
        return super.responseData(200, false, "Items were retrieved successfully", { items: data.items, pagination });
    }
}