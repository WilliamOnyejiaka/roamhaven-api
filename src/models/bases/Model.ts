import { mongoose } from "../../config";

interface ModelResponse<T> {
    error: boolean;
    data: T | T[] | null;
    message?: string;
    errorCode?: string;
}

export default class Model<T extends mongoose.Document> {
    private model: mongoose.Model<T>;
    protected mongoose = mongoose;

    constructor(model: mongoose.Model<T>) {
        this.model = model;
    }

    // Create a new document
    async create(data: Partial<T>): Promise<{ error: boolean, data: T | null }> {
        try {
            const document = new this.model(data);
            return {
                error: false,
                data: await document.save()
            };
        } catch (error: any) {
            console.error(`Error creating document: ${error.message}`);
            return {
                error: true,
                data: null
            };
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

    // private handleError(method: string, error: any): ModelResponse<T> {
    //     let message = `Error in ${method} for model ${this.modelName}`;
    //     let errorCode = "UNKNOWN_ERROR";

    //     if (error instanceof mongoose.Error) {
    //         if (error.name === "ValidationError") {
    //             message = `Validation error in ${method} for ${this.modelName}: ${error.message}`;
    //             errorCode = "VALIDATION_ERROR";
    //         } else if (error.name === "CastError") {
    //             message = `Invalid ID format in ${method} for ${this.modelName}: ${error.message}`;
    //             errorCode = "INVALID_ID";
    //         } else if (error.code === 11000) {
    //             message = `Duplicate key error in ${method} for ${this.modelName}: ${error.message}`;
    //             errorCode = "DUPLICATE_KEY";
    //         }
    //     } else {
    //         message = `${message}: ${error.message || "Unknown error"}`;
    //     }

    //     // Log error (could be configured to use a logging service)
    //     console.error(`[${new Date().toISOString()}] ${message}`);

    //     return {
    //         error: true,
    //         data: null,
    //         message,
    //         errorCode,
    //     };
    // }
}