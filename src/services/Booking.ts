import BaseService from "./bases/BaseService";
import { Booking as BookingRepo } from "../repos";
import { BookingDto } from "../types/dtos";

export default class Booking extends BaseService<BookingRepo> {

    public constructor(){
        super(new BookingRepo());
    }

    public async book(bookingDto: BookingDto){
        const repoResult = await this.repo!.insertBooking(bookingDto);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(201, false, "Booking was successful", repoResult.data);
    }
}