import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { Booking as Service } from "../services";

export default class Booking {

    private static service: Service = new Service();

    public static book(req: Request, res: Response) {
        
    }

}