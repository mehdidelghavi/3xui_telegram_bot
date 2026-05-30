const logger = require("./logger");

/**
 * هندل خطاهای Telegraf
 */
function botErrorHandler(err, ctx) {
    logger.error("BOT ERROR", {
        message: err.message,
        stack: err.stack,
        update: ctx?.update,
        user: ctx?.from?.id,
        chat: ctx?.chat?.id
    });

    console.error("🔥 BOT ERROR:", err.message);
}

/**
 * هندل خطاهای global Node.js
 */
function globalErrorHandler() {
    process.on("unhandledRejection", (err) => {
        logger.error("UNHANDLED REJECTION", err);
        console.error("⚠️ UNHANDLED REJECTION:", err.message);
    });

    process.on("uncaughtException", (err) => {
        logger.error("UNCAUGHT EXCEPTION", err);
        console.error("💥 UNCAUGHT EXCEPTION:", err.message);
    });
}

module.exports = {
    botErrorHandler,
    globalErrorHandler
};