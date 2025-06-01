import cluster from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env, connectMongoDB, connectPrisma, logger, prisma, mongoose } from "./config";

const environmentType = env("envType");
const PORT = env("port");

async function startServer() {
    const app = await createApp();
    const numCPUs = os.cpus().length - 1; // Number of workers

    if (cluster.isPrimary) {
        try {
            // Primary process connects to MongoDB
            await connectMongoDB();
            console.log(`Primary ${process.pid} has connected to the MongoDB database`);

            // Only the primary process binds to the port
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });

            // Fork workers
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            // Handle worker exit
            cluster.on("exit", (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died`);
                console.log("Starting a new worker");
                cluster.fork();
            });

            // Log when workers come online
            cluster.on("online", (worker) => {
                console.log(`Worker ${worker.process.pid} is online`);
            });

            // Handle graceful shutdown for primary
            process.on("SIGTERM", async () => {
                logger.info(`Primary ${process.pid} shutting down`);
                await mongoose.connection.close();
                process.exit(0);
            });
        } catch (error) {
            console.error("Primary failed to connect to MongoDB:", error);
            process.exit(1);
        }
    } else {
        try {
            // Workers connect to Prisma (PostgreSQL)
            await connectPrisma();
            console.log(`Worker ${process.pid} has connected to the PostgreSQL database`);

            // Workers do NOT call app.listen() - they share the primary's server socket

            // Handle graceful shutdown for workers
            process.on("SIGTERM", async () => {
                logger.info(`Worker ${process.pid} shutting down`);
                await prisma.$disconnect();
                process.exit(0);
            });
        } catch (error) {
            console.error(`Worker ${process.pid} failed to connect to PostgreSQL:`, error);
            process.exit(1);
        }
    }
}

(async () => {
    if (environmentType === "dev") {
        try {
            // In dev mode, run a single process with both connections
            await Promise.all([connectMongoDB(), connectPrisma()]);
            const app = await createApp();
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        } catch (error) {
            console.error("Failed to connect to the database:", error);
            process.exit(1);
        }
    } else {
        // In production mode, use clustering
        await startServer();
    }
})();