import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { Booking as Service } from "../services";
import { BookingDto } from "../types/dtos";

export default class Booking {

    private static service: Service = new Service();

    public static async book(req: Request, res: Response) {
        console.log("Hello");

        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userId = res.locals.data.id;
        const data: BookingDto = {
            ...req.body,
            userId
        };

        const result = await Booking.service.book(data);
        Controller.response(res, result);
    }

}