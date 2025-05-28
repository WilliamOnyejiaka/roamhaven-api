import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { WishList as Service } from "../services";
import { WishListDto } from "../types/dtos";

export default class WishList {

    private static readonly service = new Service();

    public static async add(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {

            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const data: WishListDto = {
            ...req.body,
            userId: res.locals.data.id
        }

        const result = await WishList.service.add(data);
        Controller.response(res, result);
    }

    public static async wishList(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {

            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const userId = res.locals.data.id;
        const result = await WishList.service.wishList(userId, page, limit);
        Controller.response(res, result);
    }
}