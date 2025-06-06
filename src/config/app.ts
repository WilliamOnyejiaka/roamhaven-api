import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger, redisBull, redisPub, redisSub, redisClient, passport, session, initializeIO } from ".";
import {
    auth,
    listing,
    booking,
    wishList
} from "./../routes";
import { validateJWT, validateUser, handleMulterErrors, secureApi, validateIOJwt } from "./../middlewares";
import asyncHandler from "express-async-handler";
import cors from "cors";
import { Namespaces, UserType } from "../types/enums";
import http from 'http';
import { notification, chat } from "./../events";
import { mongodbClient } from ".";


async function createApp() {
    const app: Application = express();
    const server = http.createServer(app);

    const stream = {
        write: (message: string) => logger.http(message.trim()),
    };
    const io = await initializeIO(server, redisPub, redisSub);

    // await connectMongoDB();

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));
    app.use(express.json());

    app.use(session);
    app.use(passport.initialize());
    app.use(passport.session());

    const notificationNamespace = io.of(Namespaces.NOTIFICATION);
    const chatNamespace = io.of(Namespaces.CHAT);

    function setupEventLoggingMiddleware(io: any) {
        // Apply middleware to the /chat namespace
        const chatNamespace = io.of('/chat');

        // Middleware for incoming events
        chatNamespace.use((socket: any, next: any) => {
            // Log all incoming events
            const originalOn = socket.on.bind(socket);
            socket.on = function (event: string, ...args: any[]) {
                console.log(`📡 [Incoming Event] Socket ID: ${socket.id}, Event: ${event}`);
                return originalOn(event, ...args);
            };

            // Log connection
            console.log(`🔗 [Connection] Socket ID: ${socket.id} connected to /chat namespace`);
            next();
        });

        // Override emit for outgoing events
        chatNamespace.on('connection', (socket: any) => {
            const originalEmit = socket.emit.bind(socket);
            socket.emit = function (event: string, ...args: any[]) {
                console.log(`📤 [Outgoing Event] Socket ID: ${socket.id}, Event: ${event}`);
                return originalEmit(event, ...args);
            };

            // Log disconnection
            socket.on('disconnect', () => {
                console.log(`🔌 [Disconnection] Socket ID: ${socket.id} disconnected from /chat namespace`);
            });
        });
    }

    setupEventLoggingMiddleware(io);

    notificationNamespace.use(validateIOJwt([UserType.ADMIN, UserType.USER]));
    chatNamespace.use(validateIOJwt([UserType.ADMIN, UserType.USER]));

    notification.initialize(notificationNamespace, io);
    chat.initialize(chatNamespace, io);

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.io = io;
        next();
    });

    app.use((req, res, next) => {
        console.log(`Worker ${process.pid} handling request for ${req.url}`);
        next();
    });

    app.use("/api/v1/auth", auth);
    app.use("/api/v1/listing", listing);
    app.use("/api/v1/booking", validateJWT([UserType.USER]), booking);
    app.use("/api/v1/wishlist", validateJWT([UserType.USER]), wishList);


    app.get("/test2", async (req, res) => {

        res.status(200).json({
            'error': false,
            // 'message': await mon.findById("6839fb4039f802ad0d31b9aa")
            // 'data': await mongodbClient.notification.create({
            //     data: {
            //         userId: 1,
            //         status: 'pending',
            //         content: "Testing",
            //         channel: "push".toUpperCase(),
            //         priority: 1,
            //         type: "listing"
            //     }
            // })
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
    return server;
}


export default createApp;