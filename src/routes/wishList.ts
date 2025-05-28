import { Router } from "express";
import asyncHandler from "express-async-handler";
import { WishList } from "../controllers";
import { create, pagination, idIsValid } from "./../middlewares/routes/wishList";

const wishList = Router();

wishList.post("/", create, asyncHandler(WishList.add));
wishList.get("/", pagination, asyncHandler(WishList.wishList));

export default wishList;