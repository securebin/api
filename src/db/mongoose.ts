import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const connectionOptions = {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    connectTimeoutMS: 3000
}

let mongoMemoryServer: MongoMemoryServer;

if (process.env.ENVIRONMENT === "staging") {
    mongoMemoryServer = new MongoMemoryServer();

    mongoMemoryServer.getUri().then((mongoUri) => {
        mongoose.connect(mongoUri, connectionOptions, async (error) => {
            if (error) throw error;

            console.log("Connected to database");
        });
    });
} else {
    mongoose.connect(process.env.MONGODB_URI, connectionOptions, async (error) => {
        if (error) throw error;

        console.log("Connected to database");
    });
}

export { mongoMemoryServer };