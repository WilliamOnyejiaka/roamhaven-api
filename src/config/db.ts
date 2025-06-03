import { PrismaClient as PostgresClient } from "@prisma-postgres/client";
import { PrismaClient as MongoDBClient } from "@prisma-mongo/client";

const postgresClient: PostgresClient = new PostgresClient();
const mongodbClient: MongoDBClient = new MongoDBClient();


export { postgresClient, mongodbClient };