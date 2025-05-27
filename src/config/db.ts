import mongoose from "mongoose";
import { env } from ".";

const connectDB = async () => {
    mongoose.set("strictQuery", false);
    try {
        await mongoose.connect(env('MONGODB_URI')!);
    } catch (err) {
        console.log(err);
    }
}

export default connectDB;