const winston = require("winston");
const path = require("path");

// مسیر فایل‌ها
const logPath = path.join(__dirname, "../logs");

// ساخت logger
const logger = winston.createLogger({
    level: "error",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        // همه error ها
        new winston.transports.File({
            filename: path.join(logPath, "error.log")
        }),

        // همه لاگ‌ها (اگر خواستی توسعه بدی)
        new winston.transports.File({
            filename: path.join(logPath, "combined.log")
        })
    ]
});

// اگر در dev هستی، داخل کنسول هم چاپ کن
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple()
        })
    );
}

module.exports = logger;