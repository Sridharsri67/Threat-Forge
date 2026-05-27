const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");

const { connectDB } = require("./config/db");
const iocRoutes = require("./routes/iocRoutes");
const socketHandler = require("./sockets/socketHandler");
const { requestLogger } = require("./middleware/loggerMiddleware");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const logger = require("./utils/logger");

// Initialize Database (Demo / Volatile In-Memory Mode)
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Sockets
socketHandler.init(server);

// Middlewares
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for API/development ease
}));
app.use(requestLogger);
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Threat Forge Threat Intelligence API Running"
    });
});

app.use("/api/ioc", iocRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Threat Forge server running on port ${PORT}`);
});

module.exports = app;