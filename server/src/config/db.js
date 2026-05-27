const logger = require("../utils/logger");

const connectDB = async () => {
    logger.info("Initializing Threat-Forge in Demo Mode...");
    logger.info("Database: Volatile In-Memory Database (No MongoDB dependency)");
};

const isDbConnected = () => false;

module.exports = { connectDB, isDbConnected };
