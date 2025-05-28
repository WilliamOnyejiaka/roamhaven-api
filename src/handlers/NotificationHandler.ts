import { Server } from "socket.io";
import { ISocket } from "../types";

export default class NotificationHandler {

    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);
    }
}