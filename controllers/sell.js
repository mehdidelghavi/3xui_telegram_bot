require("dotenv").config();
const xuiController = require("./xui");
const reply_keyboards = require("../helpers/sell/reply_keyboards");
const botController = require("./bot");
const { Telegraf, Markup } = require("telegraf");
const functionHelpers = require("../helpers/functions");
const { botErrorHandler } = require("../helpers/errorHandler");
const { ContextRunnerImpl } = require("express-validator/lib/chain");
const { cardToCardReceipt } = require("../helpers/prisma");
const jalaali = require("jalaali-js");
const notebookChannel = process.env.Notebook_Channel_Id;
const bcrypt = require("bcrypt");

exports.sellBot = (bot) => {

    bot.on('edited_channel_post', async (ctx) => {

        const post = ctx.update.edited_channel_post;

        const chatId = post.chat.id;
        const messageId = post.message_id;

    });
    bot.use(async (ctx, next) => {
        if (ctx.update.channel_post) {
            return;
        }
        const getUser = await botController.returnUser(ctx.from.id);

        const data = {
            fullname: `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`,
            chat_id: ctx.from.id,
            username: ctx.from.username || null
        };

        if (getUser) {
            ctx.user = getUser;

            const oneHour = 60 * 60 * 1000;
            const lastUpdate = new Date(getUser.updatedAt || getUser.createdAt).getTime();

            if (Date.now() - lastUpdate >= oneHour) {
                await botController.updateUserInfo(data);
            }

        } else {
            const createUser = await botController.createUser(data);
            ctx.user = createUser;
        }

        return next();
    });

    bot.catch(async (err, ctx) => {
        botErrorHandler(err, ctx);

        try {
            await ctx.reply("⚠️ خطایی رخ داد، لطفاً دوباره امتحان کنید.");
        } catch (e) {
            console.error("❌ Failed to send error message:", e);
        }
    });

    bot.start(async (ctx) => {
        await ctx.reply('سلام ربات هوشمند هستم چه کاری میخوای انجام بدیم؟', Markup.keyboard(reply_keyboards.mainKeyboards).resize());
    });

    bot.hears("🔙 بازگشت به منوی اصلی", async (ctx) => {
        const ResetUserState = await botController.deleteUserState(ctx.user.id);
        ctx.reply('سلام ربات هوشمند هستم چه کاری میخوای انجام بدیم؟', Markup.keyboard(reply_keyboards.mainKeyboards).resize());
    });

    bot.hears("💵 شارژ ولت", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "شارژ ولت", 1, []);
        ctx.reply("لطفا مبلغ مورد نیاز را وارد کنید به تومان (نباید کمتر از 10,000 تومان و بیشتر از 10,000,000 تومان باشد)", Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.hears("🛒 خرید کانفیگ", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "خرید کانفیگ", 1, []);
        const getServers = await botController.getServers();
        let inlineKeyboard = [];
        for (const serverItems of getServers) {
            inlineKeyboard.push([
                Markup.button.callback(serverItems.settings.name, `Config:Buy:Server:${serverItems.id}`)
            ]);
        }
        ctx.reply("لطفا سرور مورد نظر را انتخاب کنید", Markup.inlineKeyboard(inlineKeyboard));
    });

    bot.hears("👓 کانفیگ های من", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "گانفیگ های من", 1, []);
        const getUserClients = await botController.getUserClients(ctx.user.id);
        let inlineKeyboard = [];
        for (const clientItems of getUserClients) {
            if (clientItems.plan != null) {
                inlineKeyboard.push([
                    Markup.button.callback(`${clientItems.email} | ${clientItems.plan.traffic} GB ${clientItems.plan.days} Days | ${functionHelpers.priceFormatte(clientItems.price)} تومان`, `Client:Show:${clientItems.id}`)
                ]);
            }

        }
        ctx.reply("لیست کانفیگ های خریداری شده شما به شرح زیر میباشد", Markup.inlineKeyboard(inlineKeyboard));
    });

    bot.hears("ℹ️ وضعیت کانفیگ", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "وضعیت کانفیگ", 1, []);
        ctx.reply("لطفا ایمیل / نام کاربری کانفیگ خود را ارسال کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize(true));
    });

    bot.hears("👤 نمایش حساب", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "نمایش حساب", 1, []);
        const createdAt = ctx.user.createdAt;
        const jDate = jalaali.toJalaali(
            createdAt.getFullYear(),
            createdAt.getMonth() + 1,
            createdAt.getDate()
        );
        const shamsiDate = `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
        let inlineKeyboard = [
            [
                Markup.button.callback(ctx.user.fullname, "info"),
                Markup.button.callback("نام و نام خانوادگی", "info"),
            ],
            [
                Markup.button.callback(ctx.user.username, "info"),
                Markup.button.callback("نام کاربری", "info"),
            ],
            [
                Markup.button.callback(shamsiDate, "info"),
                Markup.button.callback("تاریخ ثبت نام", "info"),
            ],
            [
                Markup.button.callback(`${functionHelpers.priceFormatte(ctx.user.balance)} تومان`, "info"),
                Markup.button.callback("موجود حساب", "info"),
            ],
        ];
        ctx.reply("اطلاعات حساب کاربری شما", Markup.inlineKeyboard(inlineKeyboard));
    });

    bot.hears("🛒 تمدید کانفیگ", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "تمدید کانفیگ", 2, []);
        const getUserClients = await botController.getUserClients(ctx.user.id);
        let inlineKeyboard = [];
        for (const clientItems of getUserClients) {
            if (clientItems.plan != null) {
                inlineKeyboard.push([
                    Markup.button.callback(`${clientItems.email} | ${clientItems.plan.traffic} GB ${clientItems.plan.days} Days | ${functionHelpers.priceFormatte(clientItems.price)} تومان`, `Config:Renew:Account:${clientItems.id}`)
                ]);
            }
        }
        ctx.reply("یکی از کانفیگ های خریداری شده را انتخاب کنید اگر کانفیک مد نظر شما در این لیست نیست لطفا نام کاربری کانفیگ را ارسال کنید", Markup.inlineKeyboard(inlineKeyboard));
    });

    bot.on("text", async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        if (getUserState.step == "وضعیت کانفیگ" && getUserState.level == 1) {
            let userData = {
                email: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "وضعیت کانفیگ", 2, userData);
            const getServers = await botController.getServers();

            let clientInfo = null;
            let serverInfo = null;

            for (const serverItems of getServers) {
                let url = functionHelpers.generateURLForXui(serverItems.settings.domain, serverItems.settings.port, serverItems.settings.path) + `/panel/api/clients/traffic/${ctx.message.text}`;
                const getClient = await xuiController.getClient({ url: url, token: serverItems.settings.token });
                if (getClient.success) {
                    clientInfo = getClient.obj;
                    serverInfo = serverItems.settings;
                    userData.server = serverItems.settings;
                    break;
                }
            }
            if (clientInfo == null) {
                ctx.reply("متاسفانه کانفیگ شما یافت نشد", Markup.keyboard(reply_keyboards.backkeyboard).resize());
            } else {
                const totalTraffic = functionHelpers.BytetoGB(clientInfo.total);
                const remainingTraffic = functionHelpers.BytetoGB((clientInfo.total - clientInfo.down) - clientInfo.up);
                const remainingDays = functionHelpers.timeStampToRemainingDays(clientInfo.expiryTime);
                let subLink = functionHelpers.generateSubLinkForXui(serverInfo.domain, serverInfo.subPort, serverInfo.subPath, clientInfo.subId);
                let Text = `اطلاعات کلاینت <code>${ctx.message.text}</code> به شرح زیر میباشد \n \n`;
                Text += `آیدی : <code>${clientInfo.id}</code> \n\n`;
                Text += `uuid : <code>${clientInfo.uuid}</code> \n\n`;
                Text += `لینک ساب : <code>${subLink}</code> \n\n`;
                let status = "فعال";
                if (!clientInfo.enable) {
                    status = "غیر فعال";
                } else if (clientInfo.enable && remainingDays < 0) {
                    status = "در انتظار اولین اتصال";
                }
                const myinlinekeyboard = [
                    [
                        Markup.button.callback(`${totalTraffic} گیگابایت`, `info`),
                        Markup.button.callback("حجم خریداری شده", `info`),
                    ],
                    [
                        Markup.button.callback(`${remainingTraffic} گیگابایت`, `info`),
                        Markup.button.callback("حجم باقی مانده", `info`),
                    ],
                    [
                        Markup.button.callback(`${remainingDays} روز`, `info`),
                        Markup.button.callback("زمان باقی مانده", `info`),
                    ],
                    [
                        Markup.button.callback(status, "info"),
                        Markup.button.callback("وضعیت", "info"),
                    ]
                ];
                ctx.replyWithHTML(Text, Markup.inlineKeyboard(myinlinekeyboard), Markup.keyboard(reply_keyboards.backkeyboard).resize());
            }
        }
        if (getUserState.step == "شارژ ولت" && getUserState.level == 1) {
            if (Number(ctx.message.text) > 10000000 || Number(ctx.message.text) < 10000) {
                return await ctx.reply("مبلغ شما معتبر نمیباشد");
            }
            const paymentMethods = await botController.getPaymentMethods();
            let inlineKeyboard = [];
            for (const paymentItems of paymentMethods) {
                inlineKeyboard.push([
                    Markup.button.callback(paymentItems.name, `Wallet:Charge:PaymentMethod:${paymentItems.id}`)
                ]);
            }
            const userData = {
                amount: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "شارژ ولت", 2, userData);
            ctx.reply("لطفا روش پرداخت را انتخاب کنید", Markup.inlineKeyboard(inlineKeyboard));
        }
    });


    bot.on('photo', async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        if (getUserState.step == "شارژ ولت" && getUserState.level == 3) {
            const paymentId = getUserState.data.payment_id;
            const getPayment = await botController.getPaymentById(paymentId);
            const createdAt = new Date(getPayment.createdAt);
            const oneHourPassed = Date.now() - createdAt.getTime() > 60 * 60 * 1000;
            if (oneHourPassed) {
                const updatePaymentStatus = await botController.updatePaymentStatus(paymentId, "EXPIRED");
                return ctx.reply("این سفارش شما منقضی شده است");
            }
            const updatePaymentStatus = await botController.updatePaymentStatus(paymentId, "WAITING_CONFIRMATION");
            const photo = ctx.message.photo.at(-1);
            const photoLink = await ctx.telegram.getFileLink(photo.file_id);
            const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
            const createReceipt = await botController.createCardToCardReceipt({
                payment_id: getPayment.id,
                user_id: ctx.user.id,
                receiptImage: photoLink
            });
            const messageSent = await ctx.replyWithHTML(`✅ رسید شما با موفقیت ارسال شد لطفا منتظر تایید نهایی ادمین باشید بعد از تایید رسید کانفیگ شما از همین قسمت ارسال خواهد شد \n\n شماره سفارش: <code>${getPayment.trackingCode}</code> \n\n مبلف درخواستی: ${functionHelpers.priceFormatte(getUserState.data.amount)} تومان`);
            // Send Receipt To Admin
            let notebookText = `💳 رسید کاربر ( شارژ ولت ) \n\n 💰 مبلغ درخواستی: ${functionHelpers.priceFormatte(getUserState.data.amount)} تومان \n\n روش پرداخت : ${getPayment.method.name} \n\n 🔢 شماره سفارش : ${getPayment.trackingCode}`;
            const createNotebook = await botController.createNotebook({ client_id: null, text: notebookText });
            const notebookSent = await ctx.telegram.sendPhoto(notebookChannel, fileId, {
                caption: notebookText,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "تایید پرداخت",
                                callback_data: `Receipt:APPROVE:${createReceipt.id}:${createNotebook.id}`
                            },
                            {
                                text: "رد پرداخت",
                                callback_data: `Receipt:REJECT:${createReceipt.id}:${createNotebook.id}`
                            }
                        ]
                    ]
                },
                parse_mode: "HTML"
            });
            const updateNotebook = await botController.updateNotebookMessageId(createNotebook.id, notebookSent.message_id);
            const userData = {
                ...getUserState.data,
                receiptId: createReceipt.id
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "شارژ ولت", 4, userData);
        } else {
            await ctx.reply('نا معتبر میباشد');
        }
    });

    bot.action(/^Client:Show:(.+)$/, async (ctx) => {
        const clientId = ctx.match[1];
        const getClientById = await botController.getClientById(clientId);
        const getServer = await botController.getServerById(getClientById.server.id);
        let url = functionHelpers.generateURLForXui(getServer.settings.domain, getServer.settings.port, getServer.settings.path) + `/panel/api/clients/traffic/${getClientById.email}`;
        const getClient = await xuiController.getClient({ url: url, token: getServer.settings.token });
        let clientInfo = null;
        if (getClient.obj != null) {
            clientInfo = getClient.obj;
            const totalTraffic = functionHelpers.BytetoGB(clientInfo.total);
            const remainingTraffic = functionHelpers.BytetoGB((clientInfo.total - clientInfo.down) - clientInfo.up);
            const remainingDays = functionHelpers.timeStampToRemainingDays(clientInfo.expiryTime);
            let subLink = functionHelpers.generateSubLinkForXui(getServer.settings.domain, getServer.settings.subPort, getServer.settings.subPath, clientInfo.subId);
            let Text = "🔗لینک ساب : \n" + `<code> ${subLink}</code>` + "\n\n";
            // Text += "کانفیگ های شما: " + "\n";
            // let trafficForUi = `${getPlan.traffic} گیگابایت`;
            // if (getPlan.traffic <= 0) {
            //     trafficForUi = "نامحدود";
            // }
            // clientInfo.links.forEach((key, value) => {
            //     Text += "<code>" + key + "</code>" + "\n\n";
            // });
            Text += `👤 نام کاربری: <code>${getClientById.email}</code> \n\n`;
            Text += `🌐 سرور: ${getServer.settings.name} \n\n`;
            let status = "فعال";
            if (!clientInfo.enable) {
                status = "غیر فعال";
            } else if (clientInfo.enable && remainingDays < 0) {
                status = "در انتظار اولین اتصال";
            }
            const myinlinekeyboard = [
                [
                    Markup.button.callback(`${totalTraffic} گیگابایت`, `info`),
                    Markup.button.callback("حجم خریداری شده", `info`),
                ],
                [
                    Markup.button.callback(`${remainingTraffic} گیگابایت`, `info`),
                    Markup.button.callback("حجم باقی مانده", `info`),
                ],
                [
                    Markup.button.callback(`${remainingDays} روز`, `info`),
                    Markup.button.callback("زمان باقی مانده", `info`),
                ],
                [
                    Markup.button.callback(status, "info"),
                    Markup.button.callback("وضعیت", "info"),
                ]
            ];
            const messageSent = await functionHelpers.sendMessageWithQr(ctx, Text, subLink, myinlinekeyboard);
        } else {
            return ctx.reply("متاسفانه کلاینت یافت نشد");
        }
        let userData = {
            clientId: clientId
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "کانفیگ های من", 2, userData);
        await ctx.answerCbQuery();
    });

    bot.action(/^Config:Renew:Account:(.+)$/, async (ctx) => {
        const clientId = ctx.match[1];
        const getClient = await botController.getClientById(clientId);
        const getServices = await botController.getServicesByServerID(getClient.server.id);
        let inlineKeyboard = [];
        for (const serviceItems of getServices) {
            inlineKeyboard.push([
                Markup.button.callback(serviceItems.title, `Config:Renew:Service:${serviceItems.id}`)
            ]);
        }
        const userData = {
            serverId: getClient.server.id,
            email: getClient.email
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "تمدید کانفیگ", 3, userData);
        ctx.editMessageText("لطفا سرویس مورد نظر را انتخاب کنید", { ...Markup.inlineKeyboard(inlineKeyboard) });
        await ctx.answerCbQuery();
    });

    bot.action(/^Config:Renew:Service:(.+)$/, async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const serviceId = ctx.match[1];
        const getPlans = await botController.getPlansByServiceId(serviceId);
        let inlineKeyboard = [];
        for (const planItems of getPlans) {
            inlineKeyboard.push([
                Markup.button.callback(`${planItems.traffic} گیگ ${planItems.days} روزه ${functionHelpers.priceFormatte(planItems.price)} تومان`, `Config:Renew:Plan:${planItems.id}`)
            ]);
        }
        const userData = {
            ...getUserState.data,
            serviceId: serviceId
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "خرید کانفیگ", 4, userData);
        ctx.editMessageText("لطفا تعرفه مورد نظر را انتخاب کنید", { ...Markup.inlineKeyboard(inlineKeyboard) });
        await ctx.answerCbQuery();
    });

    bot.action(/^Config:Renew:Plan:(.+)$/, async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const planId = ctx.match[1];
        const getPlan = await botController.getPlanById(planId);
        const getServer = await botController.getServerById(getUserState.data.serverId);
        const getServiceById = await botController.getServiceById(getUserState.data.serviceId);
        const user = await botController.getUserById(ctx.user.id);
        const userBalance = Number(user.balance);
        if (userBalance < getPlan.price) {
            return ctx.reply("❌ متاسفانه موجودی حساب شما کافی نمیباشد لطفا اقدام به افزایش موجودی خود از طریق شارژ ولت بکنید");
        }
        const email = getUserState.data.email;
        const trafficForXui = functionHelpers.GBtoByte(getPlan.traffic);
        const expireTime = functionHelpers.dateToTimestamps(getPlan.days);
        const url = functionHelpers.generateURLForXui(getServer.settings.domain, getServer.settings.port, getServer.settings.path);
        const token = getServer.settings.token;
        const inboundIDS = getServiceById.inboundIDS;
        const data = {
            url: url,
            token: token,
            body: {
                "email": email,
                "totalGB": trafficForXui,
                "expiryTime": expireTime,
                "tgId": 0,
                "limitIp": 0,
                "enable": true
            }
        }
        const buyConfingTransaction = await botController.usersConfigTransaction({
            user_id: user.id,
            plan_id: getPlan.id,
            server_id: getServer.id,
            service_id: getServiceById.id,
            traffic: getPlan.traffic,
            days: getPlan.days,
            price: getPlan.price,
            email: email,
            status: 'تمدید کانفیگ',
            type: "RENEW"
        });
        const userData = {
            ...getUserState.data,
            planId: planId
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "خرید کانفیگ", 5, userData);
        if (buyConfingTransaction.success) {
            const createUser = await xuiController.updateClient(data);
            let subLink = functionHelpers.generateSubLinkForXui(getServer.settings.domain, getServer.settings.subPort, getServer.settings.subPath, createUser.subId);
            let Text = "🔗لینک ساب : \n" + `<code> ${subLink}</code>` + "\n\n";
            Text += "کانفیگ های شما: " + "\n";
            let trafficForUi = `${getPlan.traffic} گیگابایت`;
            if (getPlan.traffic <= 0) {
                trafficForUi = "نامحدود";
            }
            createUser.links.forEach((key, value) => {
                Text += "<code>" + key + "</code>" + "\n\n";
            });
            Text += `👤 نام کاربری: <code>${email}</code> \n\n`;
            Text += `📥 حجم: ${trafficForUi} \n\n`;
            Text += `⌛️ زمان: ${getPlan.days} روزه \n\n`;
            Text += `🌐 سرور: ${getServer.settings.name} \n\n`;
            const messageSent = await functionHelpers.sendMessageWithQr(ctx, Text, subLink);
        } else {
            return ctx.reply("❌ متاسفانه خطایی در دیتابیس به وجود آمد لطفا مجدد امتحان نمایید");
        }
        await ctx.answerCbQuery();
    });

    bot.action(/^Config:Buy:Server:(.+)$/, async (ctx) => {
        const serverId = ctx.match[1];
        const getServices = await botController.getServicesByServerID(serverId);
        let inlineKeyboard = [];
        for (const serviceItems of getServices) {
            inlineKeyboard.push([
                Markup.button.callback(serviceItems.title, `Config:Buy:Service:${serviceItems.id}`)
            ]);
        }
        const userData = {
            serverId: serverId
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "خرید کانفیگ", 2, userData);
        ctx.editMessageText("لطفا سرویس مورد نظر را انتخاب کنید", { ...Markup.inlineKeyboard(inlineKeyboard) });
        await ctx.answerCbQuery();
    });

    bot.action(/^Config:Buy:Service:(.+)$/, async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const serviceId = ctx.match[1];
        const getPlans = await botController.getPlansByServiceId(serviceId);
        let inlineKeyboard = [];
        for (const planItems of getPlans) {
            inlineKeyboard.push([
                Markup.button.callback(`${planItems.traffic} گیگ ${planItems.days} روزه ${functionHelpers.priceFormatte(planItems.price)} تومان`, `Config:Buy:Plan:${planItems.id}`)
            ]);
        }
        const userData = {
            ...getUserState.data,
            serviceId: serviceId
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "خرید کانفیگ", 3, userData);
        ctx.editMessageText("لطفا تعرفه مورد نظر را انتخاب کنید", { ...Markup.inlineKeyboard(inlineKeyboard) });
        await ctx.answerCbQuery();
    });

    bot.action(/^Config:Buy:Plan:(.+)$/, async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const planId = ctx.match[1];
        const getPlan = await botController.getPlanById(planId);
        const getServer = await botController.getServerById(getUserState.data.serverId);
        const getServiceById = await botController.getServiceById(getUserState.data.serviceId);
        const user = await botController.getUserById(ctx.user.id);
        const userBalance = Number(user.balance);
        if (userBalance < getPlan.price) {
            return ctx.reply("❌ متاسفانه موجودی حساب شما کافی نمیباشد لطفا اقدام به افزایش موجودی خود از طریق شارژ ولت بکنید");
        }
        const email = functionHelpers.generateRandomString();
        const trafficForXui = functionHelpers.GBtoByte(getPlan.traffic);
        const expireTime = functionHelpers.dateToTimestamps(getPlan.days);
        const url = functionHelpers.generateURLForXui(getServer.settings.domain, getServer.settings.port, getServer.settings.path);
        const token = getServer.settings.token;
        const inboundIDS = getServiceById.inboundIDS;
        const data = {
            url: url,
            token: token,
            body: {
                client: {
                    "email": email,
                    "totalGB": trafficForXui,
                    "expiryTime": expireTime,
                    "tgId": 0,
                    "limitIp": 0,
                    "enable": true
                },
                inboundIds: inboundIDS
            }
        }
        const createUser = await xuiController.createClient(data);
        if (!createUser.success) {
            return ctx.reply(createUser.message);
        }
        const buyConfingTransaction = await botController.usersConfigTransaction({
            user_id: user.id,
            plan_id: getPlan.id,
            server_id: getServer.id,
            service_id: getServiceById.id,
            traffic: getPlan.traffic,
            days: getPlan.days,
            price: getPlan.price,
            email: email,
            type: "PURCHASE"
        });
        const userData = {
            ...getUserState.data,
            planId: planId
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "خرید کانفیگ", 4, userData);
        if (buyConfingTransaction.success) {
            let subLink = functionHelpers.generateSubLinkForXui(getServer.settings.domain, getServer.settings.subPort, getServer.settings.subPath, createUser.subId);
            let Text = "🔗لینک ساب : \n" + `<code> ${subLink}</code>` + "\n\n";
            Text += "کانفیگ های شما: " + "\n";
            let trafficForUi = `${getPlan.traffic} گیگابایت`;
            if (getPlan.traffic <= 0) {
                trafficForUi = "نامحدود";
            }
            createUser.links.forEach((key, value) => {
                Text += "<code>" + key + "</code>" + "\n\n";
            });
            Text += `👤 نام کاربری: <code>${email}</code> \n\n`;
            Text += `📥 حجم: ${trafficForUi} \n\n`;
            Text += `⌛️ زمان: ${getPlan.days} روزه \n\n`;
            Text += `🌐 سرور: ${getServer.settings.name} \n\n`;
            const messageSent = await functionHelpers.sendMessageWithQr(ctx, Text, subLink);
        } else {
            console.log(buyConfingTransaction.message);
            let url = functionHelpers.generateURLForXui(getServer.settings.domain, getServer.settings.port, getServer.settings.path);
            const data = {
                url: url + `/panel/api/clients/del/${email}`,
                token: getServer.settings.token,
                body: {
                    email: email,
                    keepTraffic: 1
                }
            };
            const deleteConfig = await xuiController.deleteClient(data);
            return ctx.reply("❌ متاسفانه خطایی در دیتابیس به وجود آمد لطفا مجدد امتحان نمایید");
        }
        await ctx.answerCbQuery();
    });

    bot.action(/^Wallet:Charge:PaymentMethod:(.+)$/, async (ctx) => {
        await ctx.answerCbQuery();
        const paymentMethodId = ctx.match[1];
        const paymentMethod = await botController.getPaymentMethodById(paymentMethodId);
        const getPaymentMethodDetail = await botController.getPaymentMethodDetail(paymentMethodId);
        if (getPaymentMethodDetail == null) {
            return ctx.reply("❌ خطا: متاسفانه اطلاعاتی برای این روش پرداخت ثبت نشده است");
        }
        const trackingCode = functionHelpers.generateTrackingCode();
        const getUserState = await botController.getUserState(ctx.user.id);
        let userData = {
            ...getUserState.data,
            method_id: paymentMethodId,
            trackingCode: trackingCode
        }
        let data = {
            user_id: ctx.user.id,
            ...userData
        }
        const createPayment = await botController.createPayment(data);
        if (paymentMethod.type == "CARD_TO_CARD") {
            let text = "با تشکر از خرید شما لطفا هزینه اشتراک را به کارت زیر واریز کنید و رسید تصویری آن را همینجا ارسال کنید.";
            text += `\n\n <b>لطفا دقت کنید که فقط رسید تصویری ارسال کنید رسید های متنی با خطا مواجه میشوند</b>`;
            text += `\n\n جزییات کارت: \n`;
            text += `<code>${getPaymentMethodDetail.cardNumber}</code> به نام  ${getPaymentMethodDetail.cardHolder} ${getPaymentMethodDetail.bankName}`;
            text += `\n\n مبلغ درخواستی: <b>${functionHelpers.priceFormatte(getUserState.data.amount)} تومان</b>`;
            ctx.editMessageText(text, { parse_mode: "HTML", ...Markup.inlineKeyboard([]) });
        }
        userData = {
            ...userData,
            payment_id: createPayment.id
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "شارژ ولت", 3, userData);
    });

    bot.action(/^Receipt:APPROVE:(.+):(.+)$/, async (ctx) => {
        await ctx.answerCbQuery();
        const receiptId = ctx.match[1];
        const noteBookId = ctx.match[2];
        const noteBook = await botController.getNotebook(noteBookId);
        let text = noteBook.text;
        const deleteNotebook = await botController.deleteNotebook(noteBook.id);
        const approveTransaction = await botController.walletTransactionApprove(receiptId);
        const chat_id = approveTransaction.user.chat_id;
        await ctx.telegram.sendMessage(
            Number(chat_id),
            `✅ رسید شما با موفقیت تأیید شد و کیف پول شما شارژ گردید \n\n شماره سفارش: ${approveTransaction.receipt.payment.trackingCode}`
        );
        await ctx.telegram.editMessageCaption(
            notebookChannel,
            noteBook.message_id,
            undefined,
            text + "\n\n <b>تایید شده</b>",
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [] // 👈 حذف کیبورد
                }
            }
        );
    });

    bot.action(/^Receipt:REJECT:(.+):(.+)$/, async (ctx) => {
        const receiptId = ctx.match[1];
        const noteBookId = ctx.match[2];
        const noteBook = await botController.getNotebook(noteBookId);
        let text = noteBook.text;
        const deleteNotebook = await botController.deleteNotebook(noteBook.id);
        const rejectWalletTransaction = await botController.walletTransactionReject(receiptId);
        const user = await botController.getUserById(rejectWalletTransaction.user_id);
        let chat_id = user.chat_id;
        await ctx.telegram.sendMessage(
            Number(chat_id),
            `❌ متاسفانه رسید شما رد شد با پشتیبانی در تماس باشید \n\n شماره سفارش: ${rejectWalletTransaction.payment.trackingCode}`
        );
        await ctx.telegram.editMessageCaption(
            notebookChannel,
            noteBook.message_id,
            undefined,
            text + "\n\n <b>رد شده</b>",
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [] // 👈 حذف کیبورد
                }
            }
        );
        await ctx.answerCbQuery();
    });


    bot.launch();
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}