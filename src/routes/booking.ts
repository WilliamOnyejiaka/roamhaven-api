import { Router } from "express";
import asyncHandler from "express-async-handler";
import { Booking } from "../controllers";
import { create, pagination, idIsValid } from "./../middlewares/routes/booking";

const booking = Router();

booking.post("/", create, asyncHandler(Booking.book));

export default booking;