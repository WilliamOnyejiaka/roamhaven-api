import { mongoose } from "../../config";

export default class Model<T extends mongoose.Document> {
    private model: mongoose.Model<T>;

    constructor(model: mongoose.Model<T>) {
        this.model = model;
    }

    // Create a new document
    async create(data: Partial<T>): Promise<T> {
        try {
            const document = new this.model(data);
            return await document.save();
        } catch (error: any) {
            throw new Error(`Error creating document: ${error.message}`);
        }
    }

    // Find all documents
    async findAll(): Promise<T[]> {
        try {
            return await this.model.find().exec();
        } catch (error: any) {
            throw new Error(`Error fetching documents: ${error.message}`);
        }
    }

    // Find a document by ID
    async findById(id: string): Promise<T | null> {
        try {
            return await this.model.findById(id).exec();
        } catch (error: any) {
            throw new Error(`Error fetching document by ID: ${error.message}`);
        }
    }

    // Update a document by ID
    async update(id: string, data: Partial<T>): Promise<T | null> {
        try {
            return await this.model
                .findByIdAndUpdate(id, data, { new: true, runValidators: true })
                .exec();
        } catch (error: any) {
            throw new Error(`Error updating document: ${error.message}`);
        }
    }

    // Delete a document by ID
    async delete(id: string): Promise<void> {
        try {
            const result = await this.model.findByIdAndDelete(id).exec();
            if (!result) {
                throw new Error('Document not found');
            }
        } catch (error: any) {
            throw new Error(`Error deleting document: ${error.message}`);
        }
    }

    // Find documents by query
    // async findByQuery(query: Partial<T>): Promise<T[]> {
    //     try {
    //         return await this.model.find(query).exec();
    //     } catch (error: any) {
    //         throw new Error(`Error querying documents: ${error.message}`);
    //     }
    // }
}