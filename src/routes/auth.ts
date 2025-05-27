import { Router } from "express";
import { passport } from "./../config";
import { Auth } from "./../controllers";
import asyncHandler from "express-async-handler";
import { signUp, login, resetPassword } from "./../middlewares/routes/auth";
import { UserType, OTPType } from "../types/enums";

const auth = Router();

auth.post("/sign-up", signUp, asyncHandler(Auth.signUp));
auth.post("/login", login, asyncHandler(Auth.login));

auth.get("/otp/:email", asyncHandler(Auth.sendOTP(OTPType.VERIFICATION, UserType.USER)));
auth.get("/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.USER)));

auth.get("/forgot-password/:email", asyncHandler(Auth.sendOTP(OTPType.RESET, UserType.USER)));
auth.patch(
    "/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.USER))
);
auth.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

export default auth;