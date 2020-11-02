import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/securebin_dev_tests", {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    connectTimeoutMS: 3000
}, async (error) => {
    if (error) throw error;

    console.log("Connected to database");
});