import { PrismaClient } from "@prisma/client"; 
import Listing from "./Listing";
import Booking from "./Booking";

const prisma: PrismaClient = new PrismaClient();

export default prisma;

export {
    Listing,
    Booking
};