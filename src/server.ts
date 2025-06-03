import cluster from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env, logger } from "./config";

let environmentType = env('envType');
const PORT = env('port');

// Server Logic
async function startServer() {
    const app = await createApp();
    const numCpu = (os.cpus().length) - 1; // TODO: note this

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
            app.listen(PORT, () => console.log(`Server running on port - ${PORT}\n`));
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1); // Exit if connection fails
        }
    }
}

(async () => {
    if (environmentType === "dev") {
        (await createApp()).listen(PORT, () => console.log(`Server running on port - ${PORT}`));
    } else {
        await startServer();
    }
})();