const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Threat-Forge", {
            serverSelectionTimeoutMS: 3000 // Fast timeout
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        isConnected = true;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn("MongoDB not running. Platform starting in Demo Mode (In-Memory Database).");
        isConnected = false;
    }
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };
