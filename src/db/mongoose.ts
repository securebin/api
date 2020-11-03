import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    connectTimeoutMS: 3000
}, async (error) => {
    if (error) throw error;

    console.log("Connected to database");
});