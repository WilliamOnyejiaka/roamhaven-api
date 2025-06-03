import mongoose from "mongoose";
import { PrismaClient } from "@prisma/client";
import retry from 'async-retry';
import { MongoClient, Db } from 'mongodb';
import { env, logger } from ".";

const prisma: PrismaClient = new PrismaClient();

async function connectMongo() {
    mongoose.set('strictQuery', false);

    return retry(
        async () => {
            await mongoose.connect(env('mongodbURI')!, { maxPoolSize: 2 }); // TODO: - note this - Limit connections per worker
            logger.info(`Worker ${process.pid} connected to MongoDB`);
        },
        {
            retries: 5,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000,
        }
    ).catch((error) => {
        logger.error(`Worker ${process.pid} failed to connect to MongoDB:`, error);
        throw error; // Rethrow to handle in caller
    });
}

async function connectPrisma() {
    return retry(
        async () => {
            await prisma.$connect();
            logger.info(`Worker ${process.pid} connected to Prisma database`);
        },
        {
            retries: 5,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000,
        }
    ).catch((error: any) => {
        logger.error(`Worker ${process.pid} failed to connect to Prisma database:`, error);
        throw error; // Rethrow to handle in caller
    });
}

const mongoDbClient = new MongoClient(env('mongodbURI')!);

let db: Db | null = null;

async function connectMongoDB() {
    return retry(
        async () => {
            if (!db) {
                await mongoDbClient.connect();
                db = mongoDbClient.db('sockets_db');
                logger.info(`Worker ${process.pid} connected to Mongodb database`);
            }
        },
        {
            retries: 5,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000,
        }
    ).catch((error: any) => {
        logger.error(`Worker ${process.pid} failed to connect to Mongodb database:`, error);
        throw error; // Rethrow to handle in caller
    });
}


// export async function connectMongoDB() {
//     if (!db) {
//         try {
//             await client.connect();
//             db = client.db('sockets_db');
//             console.log('Connected to MongoDB');
//         } catch (error) {
//             console.error('Failed to connect to MongoDB:', error);
//         }
//     }
// }

const getDb = () => {
    // if (!db) await connectMongoDB();
    return db!;
};

export { prisma, connectMongo, connectMongoDB, getDb, connectPrisma, mongoose, mongoDbClient };