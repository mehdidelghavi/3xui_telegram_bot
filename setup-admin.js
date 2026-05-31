const prisma = require("./helpers/prisma");

async function main() {
    const chatId = process.argv[2];

    if (!chatId) {
        console.log('❌ Chat ID is required');
        process.exit(1);
    }

    const user = await prisma.user.upsert({
        where: {
            chat_id: chatId,
        },
        update: {
            role: 'ADMIN',
        },
        create: {
            chat_id: chatId,
            role: 'ADMIN',
        },
    });

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