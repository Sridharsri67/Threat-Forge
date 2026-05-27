const logger = require("../utils/logger");

exports.errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`, {
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
        path: req.originalUrl,
        method: req.method
    });

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};

exports.notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
