import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { Listing as ListingRepo } from "../repos";
import { Cloudinary } from "../services";
import { CdnFolders, ResourceType } from "../types/enums";
import { ListingDto } from "../types/dtos";
import { Listing as Service } from "./../services";

export default class Listing {

    private static service = new Service();

    static async create(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {

            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const listingPhotos: Express.Multer.File[] | any = req.files;
        if (!listingPhotos) {
            res.status(400).json({
                'error': true,
                'message': "No images found"
            });
            return;
        }

        req.body['guestCount'] = Number(req.body['guestCount']);
        req.body['bedroomCount'] = Number(req.body['bedroomCount']);
        req.body['bedCount'] = Number(req.body['bedCount']);
        req.body['bathroomCount'] = Number(req.body['bathroomCount']);
        req.body['price'] = Number(req.body['price']);
        req.body['amenities'] = JSON.parse(req.body['amenities']);


        const data: ListingDto = {
            ...req.body,
            userId: res.locals.data.id
        };

        const result = await Listing.service.createListing(data, listingPhotos);
        Controller.response(res, result);
    }

    public static async listings(req: Request, res: Response) {
        const category = req.query.category;
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);

        const result = category ? await Listing.service.paginateByCategory(category as string, page, limit) : await Listing.service.paginateListings(page, limit);
        Controller.response(res, result);
    }

    public static async searchTitle(req: Request, res: Response) {
        const search = req.query.search as string;
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);

        const result = await Listing.service.searchTitle(search, page, limit);
        Controller.response(res, result);
    }


    public static async listing(req: Request, res: Response) {
        const id = Number(req.params.id);
        const result = await Listing.service.getWithId(id);
        Controller.response(res, result);
    }
}
