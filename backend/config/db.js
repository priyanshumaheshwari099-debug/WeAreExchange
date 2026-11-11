const mongoose = require("mongoose");

const connectDB = async() => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB Connected Successfully!");
};

module.exports = connectDB;