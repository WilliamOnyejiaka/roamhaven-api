import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { Booking as Service } from "../services";
import { BookingDto } from "../types/dtos";
import { Server } from "socket.io";

export default class Booking {

    private static service: Service = new Service();

    public static async book(req: Request, res: Response) {
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

        const io: Server = res.locals.io;
        const result = await Booking.service.book(data, io);
        Controller.response(res, result);
    }

    public static async bookings(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const userId = res.locals.data.id;

        const result = await Booking.service.bookings(userId, page, limit);
        Controller.response(res, result);
    }

    public static async reserved(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const hostId = res.locals.data.id;

        const result = await Booking.service.reserved(hostId, page, limit);
        Controller.response(res, result);
    }
}