import cluster from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env, connectMongoDB, connectPrisma, logger, prisma, mongoose } from "./config";

let environmentType = env('envType');
const PORT = env('port');

// Server Logic
async function startServer() {
    const app = await createApp();
    const numCpu = (os.cpus().length) - 1; // TODO: note this

    // if (cluster.isPrimary) {
    //     try {
    //         await connectMongoDB();
    //     } catch (error) {
    //         console.error('Failed to connect to mongodb database:', error);
    //     }
    // }

    if (cluster.isPrimary) {
        for (let i = 0; i < numCpu; i++) cluster.fork();

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            console.log('Starting a new worker');
            cluster.fork();
        });

        cluster.on('online', (worker) => console.log(`Worker ${worker.process.pid} is online`));
    } else {
        try {
            await Promise.all([connectPrisma(), connectMongoDB()]);
            console.log(`Worker ${process.pid} has connected to the database`);
            mongoose.connection.once('open', () => {
                app.listen(PORT, () => console.log(`Server running on port - ${PORT}\n`));

            });
            process.on('SIGTERM', async () => {
                logger.info(`Worker ${process.pid} shutting down`);
                await Promise.all([
                    mongoose.connection.close(),
                    prisma.$disconnect(),
                ]);
                process.exit(0);
            });
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1); // Exit if connection fails
        }
    }
}

(async () => {
    if (environmentType === "dev") {
        try {
            await Promise.all([connectMongoDB(), connectPrisma()]);
            (await createApp()).listen(PORT, () => console.log(`Server running on port - ${PORT}`));
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1); // Exit if connection fails
        }
    } else {
        await startServer();
    }
})();