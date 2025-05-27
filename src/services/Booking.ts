import BaseService from "./bases/BaseService";
import { Booking as BookingRepo } from "../repos";

export default class Booking extends BaseService<BookingRepo> {

    public constructor(){
        super(new BookingRepo());
    }

    public async book(){
        
    }
}