import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { env, logger } from "./../../config";

interface Pet {
    type: string
};

export default class MongoDBRepo<T extends Pet> {
    protected client: MongoClient;
    protected collection: Collection<T>;
    protected dbName: string = 'sockets_db';
    protected collectionName: string;
    private db: Db;

    public constructor(collectionName: string) {
        this.client = new MongoClient(env('mongodbURI')!);
        this.collectionName = collectionName;
        this.db = this.client.db(this.dbName);
        this.collection = this.db.collection<T>(this.collectionName);
    }

    // Connect to MongoDB
    async connect() {
        try {
            await this.client.connect();
            console.log("Connected")
        } catch (error) {
            logger.error("Failed to connect to mongodb");
        }
    }


    // Close connection
    protected async close() {
        try {
            await this.client.close();
        } catch (error) {
            logger.error("Failed to close mongodb connection");
        }
    }

    // READ: Find one document by ID
    async findById(id: string) {
        try {
            await this.connect();
            return await this.collection.findOne({ _id: new ObjectId(id) } as any);
        } finally {
            await this.close();
        }
    }

    // // Get a collection with type safety
    // getUsersCollection(): Collection<User> {
    //     return this.db.collection<User>('users');
    // }

    // // Example: Insert a user
    // async insertUser(user: User) {
    //     const collection = this.getUsersCollection();
    //     const result = await collection.insertOne(user);
    //     return result;
    // }

    // // Example: Find a user by email
    // async findUserByEmail(email: string) {
    //     const collection = this.getUsersCollection();
    //     return await collection.findOne({ email });
    // }

    // // Example: Update a user
    // async updateUser(email: string, update: Partial<User>) {
    //     const collection = this.getUsersCollection();
    //     const result = await collection.updateOne({ email }, { $set: update });
    //     return result;
    // }

    // // Example: Delete a user
    // async deleteUser(email: string) {
    //     const collection = this.getUsersCollection();
    //     const result = await collection.deleteOne({ email });
    //     return result;
    // }

}