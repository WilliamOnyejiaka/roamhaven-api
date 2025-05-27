import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { Authentication } from "../services";
import { UserDto } from "../types/dtos";
import { OTPType, UserType } from "../types/enums";

export default class Auth {

    private static readonly service = new Authentication();

    public static async signUp(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userDto: UserDto = req.body;

        const serviceResult = await Auth.service.signUp(userDto, req.file);
        Controller.response(res, serviceResult);
    }

    public static async login(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const logInDetails = req.body;
        const serviceResult = await Auth.service.login(logInDetails);
        Controller.response(res, serviceResult);
    }

    public static sendOTP(otpType: OTPType, userType: UserType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Auth.service.sendUserOTP(req.params.email, otpType, userType);
            Controller.response(res, serviceResult);
        };
    }

    public static emailVerification(userType: UserType) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Auth.service.emailVerification(req.params.email, req.params.otpCode, userType);
            Controller.response(res, serviceResult);
        };
    }

    public static passwordReset(userType: UserType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const { otp, password, email } = req.body;
            const serviceResult = await Auth.service.passwordReset(email, password, otp, userType);
            Controller.response(res, serviceResult);
        };
    }

    public static async logOut(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const token = req.headers.authorization!.split(' ')[1];
        const serviceResult = await Auth.service.logOut(token);
        Controller.response(res, serviceResult);
    }
}