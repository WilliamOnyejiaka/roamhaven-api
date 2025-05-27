import { Router } from "express";
import asyncHandler from "express-async-handler";
import { Listing } from "../controllers";
import { create, pagination, idIsValid } from "./../middlewares/routes/listing";

const listing = Router();

listing.post("/create", create, asyncHandler(Listing.create));
listing.get("/search", pagination, asyncHandler(Listing.searchTitle));
listing.get("/:id", idIsValid, asyncHandler(Listing.listing));
listing.get("/", pagination, asyncHandler(Listing.listings));
listing.get("/search", pagination, asyncHandler(Listing.listings));


export default listing;