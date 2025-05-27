import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger, redisBull, redisPub, redisSub, redisClient, passport, session } from ".";
import {
    auth,
    listing
} from "./../routes";
import { validateJWT, validateUser, handleMulterErrors, secureApi } from "./../middlewares";
import asyncHandler from "express-async-handler";
import cors from "cors";
import { config } from "dotenv";
import { UserType } from "../types/enums";


config();


function createApp() {
    const app: Application = express();
    const stream = {
        write: (message: string) => logger.http(message.trim()),
    };
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));
    app.use(express.json());

    // Configure session with RedisStore
    app.use(session);
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api/v1/auth", auth);
    app.use("/api/v1/listing", validateJWT([UserType.USER]), listing);

    app.post("/test2", async (req, res) => {
        res.status(200).json({
            'error': false,
            'message': "result"
        });
    });

    app.use(handleMulterErrors);
    app.use((req, res, next) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });
    return app;
}


export default createApp;