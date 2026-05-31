const prisma = require("./helpers/prisma");

async function main() {
    const chatId = process.argv[2];

    if (!chatId) {
        console.log('❌ Chat ID is required');
        process.exit(1);
    }

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

    console.log('✅ Admin user created/updated:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });