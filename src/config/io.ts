import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createAdapter } from "@socket.io/redis-adapter";
import cluster from "cluster";
import { RedisClientType } from "redis";
import { setupWorker } from "@socket.io/sticky";
import { createClient } from "redis";
import { env } from ".";

export default async function initializeIO(server: HTTPServer, pubCslient: any, subCslient: any) {
    const io = new Server(server, { cors: { origin: "*" } });
    const pubClient = createClient({ url: env('redisURL')! });
    const subClient = pubClient.duplicate();
    try {
        await Promise.all([pubClient.connect(), subClient.connect()]);

        console.log("Redis clients connected");
        io.adapter(createAdapter(pubClient, subClient));
        console.log(`Worker ${process.pid} initialized Redis adapter`);

        if (cluster.isWorker) setupWorker(io);
    } catch (err) {
        console.error(`Worker ${process.pid} - Redis Connection Error:`, err);
        process.exit(1);
    }
    return io;
}