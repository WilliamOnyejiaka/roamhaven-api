import mongoose from "mongoose";
import { PrismaClient } from "@prisma/client";
import retry from 'async-retry';
import { env, logger } from ".";

const prisma: PrismaClient = new PrismaClient();

async function connectMongoDB() {
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

export { prisma, connectMongoDB, connectPrisma, mongoose };