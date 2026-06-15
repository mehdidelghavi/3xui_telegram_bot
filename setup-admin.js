const prisma = require("./helpers/prisma");
const bcrypt = require("bcrypt");

async function main() {
    const ADMIN_CHAT_ID = process.argv[2];
    const ADMIN_USERNAME = process.argv[3];
    const ADMIN_PASSWORD = process.argv[4];

    const chatId = ADMIN_CHAT_ID;

    if (!chatId) {
        console.log('❌ Chat ID is required');
        process.exit(1);
    }

    const panel_setting = await prisma.panel_settings.create({
        data: {
            username: ADMIN_USERNAME,
            password: await bcrypt.hash(ADMIN_PASSWORD, 10)
        }
    });

    const user = await prisma.user.findFirst({
        where: { chat_id: chatId }
    });

    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
        });
    } else {
        await prisma.user.create({
            data: {
                chat_id: chatId,
                role: "ADMIN"
            }
        });
    }
    const Paymentmethod = await prisma.paymentMethod.create({
        data: {
            name: "کارت به کارت",
            type: "CARD_TO_CARD"
        }
    });

    console.log('✅ Admin User And Panel Setting Created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });