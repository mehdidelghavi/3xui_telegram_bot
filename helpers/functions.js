const QRCode = require('qrcode');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

exports.generateRandomString = () => {
    const time = Date.now().toString(36); // زمان
    const rand = crypto.randomBytes(2).toString("hex"); // تصادفی
    return (time + rand).slice(-8);
}

exports.GBtoByte = (GB) => {
    return GB * 1024 * 1024 * 1024;
}

exports.BytetoGB = (byte) => {
    const number = byte / 1024 / 1024 / 1024
    return number.toFixed(2);
}

exports.dateToTimestamps = (days) => {
    return - (days * 24 * 60 * 60 * 1000);
}

exports.timeStampToRemainingDays = (input) => {
    const now = Date.now();
    let expireTime;
    let remainingMs;

    // حالت 1: اگر منفی بود → یعنی مدت زمان
    if (input < 0) {
        expireTime = now + input; // چون input منفی هست
    }
    // حالت 2: اگر مثبت بود → یعنی timestamp
    else {
        expireTime = input;
    }

    remainingMs = expireTime - now;

    let remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));

    return remainingDays;
}

exports.sendMessageWithQr = async (ctx, text, link) => {
    // ساخت پوشه temp
    const tempDir = path.join(__dirname, 'temp');

    await fs.mkdir(tempDir, { recursive: true });

    // اسم فایل
    const fileName = `qr_${crypto.randomUUID()}.png`;

    // مسیر کامل
    const filePath = path.join(tempDir, fileName);

    try {

        // ساخت QR
        await QRCode.toFile(filePath, link, {
            width: 700,
            margin: 2,
            errorCorrectionLevel: 'H'
        });

        // ارسال
        const message = await ctx.editMessageMedia(
            {
                type: "photo",
                media: { source: filePath },
                caption: text,
                parse_mode: 'HTML'
            },
        );
        return message;

    } catch (error) {

        console.log(error);

    } finally {

        // حذف فایل
        try {
            await fs.unlink(filePath);
        } catch { }

    }
}

exports.priceFormatte = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
}

exports.generateURLForXui = (domain, port, path) => {
    return `http://${domain}:${port}/${path}`;
}

exports.generateSubLinkForXui = (domain, port, subPath, subId) => {
    return `http://${domain}:${port}/${subPath}/${subId}`;
}