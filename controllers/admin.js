require("dotenv").config();
const xuiController = require("./xui");
const reply_keyboards = require("../helpers/reply_keyboards");
const botController = require("./bot");
const { Telegraf, Markup } = require("telegraf");
const functionHelpers = require("../helpers/functions");
const { botErrorHandler } = require("../helpers/errorHandler");

const notebookChannel = process.env.Notebook_Channel_Id;

exports.bot = (bot) => {
    bot.use(async (ctx, next) => {
        const getUser = await botController.returnUser(ctx.from.id);
        if (getUser != null) {
            if (getUser.role == "ADMIN") {
                ctx.user = getUser;
                return next();
            } else {
                return ctx.reply("شما مجاز به استفاده از این ربات نیستید");
            }
        } else {
            return ctx.reply("شما مجاز به استفاده از این ربات نیستید");
        }
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
        ctx.reply('سلام ربات هوشمند هستم چه کاری میخوای انجام بدیم؟', Markup.keyboard(reply_keyboards.mainKeyboards).resize());
    });
    bot.hears("🔙 بازگشت به منوی اصلی", async (ctx) => {
        const ResetUserState = await botController.deleteUserState(ctx.user.id);
        ctx.reply('سلام ربات هوشمند هستم چه کاری میخوای انجام بدیم؟', Markup.keyboard(reply_keyboards.mainKeyboards).resize());
    })
    bot.hears("➕ افزودن کلاینت", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "افزودن کلاینت", 1, []);
        ctx.reply("لطفا حجم کاربر را وارد نمایید (GB)", Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.hears("➕ افزودن سرور", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "افزودن سرور", 1, []);
        ctx.reply("لطفا نام سرور را وارد نمایید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.hears("👁‍🗨 نمایش کلاینت", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "نمایش کلاینت", 1, []);
        ctx.reply("لطفا ایمیل / نام کاربری کلاینت را ارسال کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.hears("🗑 حذف کلاینت", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "حذف کلاینت", 1, []);
        ctx.reply("لطفا ایمیل / نام کاربری کلاینت را ارسال کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.hears("✏️ شارژ کلاینت", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "شارژ کلاینت", 1, []);
        ctx.reply("لطفا ایمیل / نام کاربری کلاینت را ارسال کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.hears("👁‍🗨 نمایش سرور ها", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "نمایش سرور ها", 1, []);
        const getServers = await botController.getServers();
        let inlineKeyboard = [];
        for (const serverItem of getServers) {
            inlineKeyboard.push([
                Markup.button.callback(serverItem.settings.name, `Server:Show:${serverItem.id}`)
            ]);
        }
        ctx.reply("برای نمایش جزییات روی سرور بزنید", Markup.inlineKeyboard(inlineKeyboard));
    });

    bot.hears("👁‍🗨 نمایش سرویس ها", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "نمایش سرویس ها", 1, []);
        const services = await botController.getServices();
        let inlineKeyboard = [];
        for (const serviceItems of services) {
            inlineKeyboard.push([
                Markup.button.callback(`${serviceItems.title} | ${serviceItems.server.settings.name}`, `Service:Show:${serviceItems.id}`)
            ]);
        }
        ctx.reply("برای نمایش / ویرایش سرویس مورد نظر را انتخاب کنید", Markup.inlineKeyboard(inlineKeyboard).resize());
    });

    bot.hears("➕ افزودن سرویس", async (ctx) => {
        const createUserState = await botController.setUserState(ctx.user.id, "افزودن سرویس", 1, []);
        ctx.reply("لطفا نام سرویس را وارد کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.on("text", async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        if (getUserState.step == "افزودن سرویس" && getUserState.level == 1) {
            const userData = {
                title: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرویس", 2, userData);
            const getServers = await botController.getServers();
            const inlineKeyboard = [];
            getServers.forEach(serverItem => {
                inlineKeyboard.push([
                    Markup.button.callback(serverItem.settings.name, `Service:Create:Server:${serverItem.id}`)
                ]);
            });
            ctx.reply("لطفا سرور مورد نظر را انتخاب کنید", Markup.inlineKeyboard(inlineKeyboard));
        }
        if (getUserState.step == "ویرایش سرور" && getUserState.level == 1) {
            const settingValue = ctx.message.text;
            const setting = getUserState.data.setting;
            const serverID = getUserState.data.serverId;
            const updateServer = await botController.updateServer(serverID, { key: setting, value: settingValue });
            ctx.reply("سرور با موفقیت ویرایش شد", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "شارژ کلاینت" && getUserState.level == 1) {
            const userData = {
                email: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "شارژ کلاینت", 2, userData);
            ctx.reply("لطفا حجم مورد نظر را وارد کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "شارژ کلاینت" && getUserState.level == 2) {
            const userData = {
                ...getUserState.data,
                traffic: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "شارژ کلاینت", 3, userData);
            ctx.reply("لطفا زمان مورد نظر را وارد نمایید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "شارژ کلاینت" && getUserState.level == 3) {
            const userData = {
                ...getUserState.data,
                days: ctx.message.text
            }
            const email = getUserState.data.email;
            const getServers = await botController.getServers();
            let clientInfo = null;
            let serverInfo = null;
            for (const serverItems of getServers) {
                let url = functionHelpers.generateURLForXui(serverItems.settings.domain, serverItems.settings.port, serverItems.settings.path) + `/panel/api/clients/get/${data.email}`;
                const getClient = await xuiController.getClient({ url: url, token: serverItems.settings.token });
                if (getClient.success) {
                    clientInfo = getClient.obj;
                    serverInfo = serverItems.settings;
                    break;
                }
            }
            if (clientInfo == null) {
                ctx.reply("متاسفانه کلاینت یافت نشد", Markup.keyboard(reply_keyboards.backkeyboard).resize());
            } else {
                const trafficForXui = functionHelpers.GBtoByte(getUserState.data.traffic);
                const expireTime = functionHelpers.dateToTimestamps(ctx.message.text);
                let url = functionHelpers.generateURLForXui(serverInfo.domain, serverInfo.port, serverInfo.path);
                const data = {
                    url: url,
                    token: serverInfo.token,
                    body: {
                        email: email,
                        totalGB: trafficForXui,
                        expiryTime: expireTime,
                        tgId: 0,
                        enable: true
                    }
                };
                const updateClient = await xuiController.updateClient(data);
                let subLink = functionHelpers.generateSubLinkForXui(serverInfo.domain, serverInfo.subPort, serverInfo.subPath, updateClient.subId);
                let Text = "🔗لینک ساب : \n" + `<code> ${subLink}</code> ` + "\n\n";
                Text += "کانفیگ های شما: " + "\n";
                let trafficForUi = `${getUserState.data.traffic} گیگابایت`;
                if (getUserState.data.traffic <= 0) {
                    trafficForUi = "نامحدود";
                }
                updateClient.links.forEach((key, value) => {
                    Text += "<code>" + key + "</code>" + "\n\n";
                });
                Text += `👤 نام کاربری: <code>${getUserState.data.email}</code> \n\n`;
                Text += `📥 حجم: ${trafficForUi} \n\n`;
                Text += `⌛️ زمان: ${ctx.message.text} روزه \n\n`;
                Text += `🌐 سرور: ${serverInfo.name} \n\n`;
                await functionHelpers.sendMessageWithQr(ctx, Text, subLink);
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "شارژ کلاینت", 4, userData);
        }
        if (getUserState.step == "حذف کلاینت" && getUserState.level == 1) {
            const userData = {
                email: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "حذف کلاینت", 2, userData);
            const getServers = await botController.getServers();
            let deletedClient = false;

            for (const serverItems of getServers) {
                let url = functionHelpers.generateURLForXui(serverItems.settings.domain, serverItems.settings.port, serverItems.settings.path);
                const data = {
                    url: url,
                    token: serverItems.settings.token,
                    body: {
                        email: ctx.message.text,
                        keepTraffic: 1
                    }
                };
                const deleteClient = await xuiController.deleteClient(data);
                if (deleteClient.success) {
                    deletedClient = true;
                    break;
                }
            }
            if (!deletedClient) {
                ctx.reply("متاسفانه کلاینت یافت نشد", Markup.keyboard(reply_keyboards.backkeyboard).resize());
            } else {
                ctx.reply("کلاینت با موفقیت حذف شد", Markup.keyboard(reply_keyboards.backkeyboard).resize());
            }
        }
        if (getUserState.step == "افزودن کلاینت" && getUserState.level == 1) {
            const userData = {
                traffic: Number(ctx.message.text)
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن کلاینت", 2, userData);
            ctx.reply("لطفا تاریخ انقظا رو به روز وارد کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن کلاینت" && getUserState.level == 2) {
            const userData = {
                ...getUserState.data,
                days: Number(ctx.message.text)
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن کلاینت", 3, userData);
            ctx.reply("لطفا قیمت را به ( تومان ) وارد کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن کلاینت" && getUserState.level == 3) {
            const userData = {
                ...getUserState.data,
                price: Number(ctx.message.text)
            }
            const servers = await botController.getServers();
            const inlineKeyboard = [];
            servers.forEach(serverItem => {
                inlineKeyboard.push([
                    Markup.button.callback(serverItem.settings.name, `Create:Client:Server:${serverItem.id}`)
                ]);
            });
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن کلاینت", 4, userData);
            ctx.reply("لطفا سرور مورد نظر را انتخاب کنید", Markup.inlineKeyboard(inlineKeyboard), Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن سرور" && getUserState.level == 1) {
            const userData = {
                name: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرور", 2, userData);
            ctx.reply("لطفا دامنه سرور را وارد نمایید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن سرور" && getUserState.level == 2) {
            const userData = {
                ...getUserState.data,
                domain: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرور", 3, userData);
            ctx.reply("لطفا پورت سرور را وارد نمایید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن سرور" && getUserState.level == 3) {
            const userData = {
                ...getUserState.data,
                port: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرور", 4, userData);
            ctx.reply("لطفا API Token سرور را وارد نمایید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن سرور" && getUserState.level == 4) {
            const userData = {
                ...getUserState.data,
                token: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرور", 5, userData);
            ctx.reply("لطفا پورت Sub را وارد نمایید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن سرور" && getUserState.level == 5) {
            const userData = {
                ...getUserState.data,
                subPort: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرور", 6, userData);
            ctx.reply("لطفا sub_path را وارد نمایید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "افزودن سرور" && getUserState.level == 6) {
            const userData = {
                ...getUserState.data,
                subPath: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرور", 7, userData);
            ctx.reply("لطفا path سرور را وارد کنید", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        } if (getUserState.step == "افزودن سرور" && getUserState.level == 7) {
            const userData = {
                ...getUserState.data,
                path: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن سرور", 8, userData);
            const createServer = await botController.createServer(userData);
            ctx.reply("سرور با موفقیت ایجاد شد", Markup.keyboard(reply_keyboards.backkeyboard).resize());
        }
        if (getUserState.step == "نمایش کلاینت" && getUserState.level == 1) {
            let userData = {
                email: ctx.message.text
            }
            const updateUserState = await botController.updateUserState(ctx.user.id, "نمایش کلاینت", 2, userData);
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
                    const updateUserState = await botController.updateUserState(ctx.user.id, "نمایش کلاینت", 2, userData);
                    break;
                }
            }
            if (clientInfo == null) {
                ctx.reply("متاسفانه کلاینت یافت نشد", Markup.keyboard(reply_keyboards.backkeyboard).resize());
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
                    ],
                    [
                        Markup.button.callback('🔁 ریست ترافیک', `Client:Traffic:Reset:${ctx.message.text}`),

                    ]
                ];
                ctx.replyWithHTML(Text, Markup.inlineKeyboard(myinlinekeyboard), Markup.keyboard(reply_keyboards.backkeyboard).resize());
            }
        }
    });

    bot.action(/^Service:Create:Server:(\d+)$/, async (ctx) => {
        const serverID = ctx.match[1];
        const getUserState = await botController.getUserState(ctx.user.id);
        const createService = await botController.creatService({ title: getUserState.data.title, server_id: Number(serverID) });
        ctx.editMessageText("سرویس با موفقیت ایجاد شد");
    });

    bot.action(/^Service:Show:(\d+)$/, async (ctx) => {
        const serviceID = ctx.match[1];
        const getService = await botController.getServiceById(serviceID);
        const userData = {
            service: getService
        }
        let inbounds = 0;
        if (getService.inboundIDS != null) {
            inbounds = getService.inboundIDS.length;
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "نمایش سرویس", 1, userData);
        let text = `جزییات سرویس <code>${getService.title}</code>: \n\n `;
        text += `سرور: <code>${getService.server.settings.name}</code> \n\n`;
        text += `دامنه: <code>${getService.server.settings.domain}</code> \n\n`;
        text += `تعداد اینباند ها: <code>${inbounds}</code> \n\n`;
        text += `تعداد تعرفه ها: <code>${getService._count.plans}</code> \n\n`;
        const inlineKeyboard = [
            [
                Markup.button.callback("👁‍🗨 نمایش اینباندها", `Service:Inbounds:${getService.id}`),
            ],
            [
                Markup.button.callback("👁‍🗨 نمایش تعرفه ها", `Service:Plans:${getService.id}`),
            ],
            [
                Markup.button.callback("🗑 حذف سرویس", `Service:Delete:${getService.id}`),
            ]
        ];
        ctx.editMessageText(text, { parse_mode: "HTML", ...Markup.inlineKeyboard(inlineKeyboard) });
        await ctx.answerCbQuery();
    });

    bot.action(/^Service:Delete:(\d+)$/, async (ctx) => {
        const serviceID = ctx.match[1];
        const deleteService = await botController.deleteServiceById(serviceID);
        await ctx.answerCbQuery(
            deleteService.message,
            {
                show_alert: true
            }
        );
    });

    bot.action(/^Server:Show:(\d+)$/, async (ctx) => {
        const serverID = ctx.match[1];
        const server = await botController.getServerById(serverID);
        const path = server.settings.path == "" ? "تنظیم نشده" : server.settings.path;
        const subPath = server.settings.subPath == "" ? "تنظیم نشده" : server.settings.subPath;
        let inlineKeyboard = [
            [
                Markup.button.callback(server.settings.domain, `Server:Edit:domain:${server.id}`),
                Markup.button.callback("دامنه", `Server:Edit:domain:${server.id}`),
            ],
            [
                Markup.button.callback(server.settings.port, `Server:Edit:port:${server.id}`),
                Markup.button.callback("پورت", `Server:Edit:port:${server.id}`),
            ],
            [
                Markup.button.callback(path, `Server:Edit:path:${server.id}`),
                Markup.button.callback("path", `Server:Edit:path:${server.id}`),
            ],
            [
                Markup.button.callback(server.settings.token, `Server:Edit:token:${server.id}`),
                Markup.button.callback("Token", `Server:Edit:token:${server.id}`),
            ],
            [
                Markup.button.callback(server.settings.subPort, `Server:Edit:subPort:${server.id}`),
                Markup.button.callback("subPort", `Server:Edit:subPort:${server.id}`),
            ],
            [
                Markup.button.callback(subPath, `Server:Edit:subPath:${server.id}`),
                Markup.button.callback("subPath", `Server:Edit:subPath:${server.id}`),
            ],
        ];
        ctx.editMessageText(`جزییات سرور ${server.settings.name}: `, Markup.inlineKeyboard(inlineKeyboard), Markup.keyboard(reply_keyboards.backkeyboard).resize());
        await ctx.answerCbQuery();
    });

    bot.action(/^Service:Sync:(\d+)$/, async (ctx) => {
        const serviceID = ctx.match[1];
        const getService = await botController.getServiceById(serviceID);
        let serviceInbounds = getService.inboundIDS;
        let url = functionHelpers.generateURLForXui(getService.server.settings.domain, getService.server.settings.port, getService.server.settings.path);
        const getInbounds = await xuiController.getInbounds({ url: url, token: getService.server.settings.token });
        let changed = false;
        const serverInbounds = [];
        for (const inboundItems of getInbounds.obj) {
            serverInbounds.push(Number(inboundItems.id));
        }
        for (const serviceInboundItem of serviceInbounds) {
            if (!serverInbounds.includes(serviceInboundItem)) {
                changed = true;

                serviceInbounds = serviceInbounds.filter(
                    id => id !== Number(serviceInboundItem)
                );
            }
        }
        const syncServiceInbounds = await botController.syncServiceInbounds(serviceID, serviceInbounds);
        if (!changed) {
            await ctx.answerCbQuery(
                'همگام سازی انجام شد',
                {
                    show_alert: true
                }
            );
        } else {
            let inlineKeyboard = [];
            for (const getInboundItems of getInbounds.obj) {
                if (serviceInbounds.includes(getInboundItems.id)) {
                    inlineKeyboard.push([
                        Markup.button.callback(`✅ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Detach:${getInboundItems.id}:${getService.id}`)
                    ]);
                } else {
                    inlineKeyboard.push([
                        Markup.button.callback(`❌ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Attach:${getInboundItems.id}:${getService.id}`)
                    ]);
                }
            }
            inlineKeyboard.push([
                Markup.button.callback(`🔁 همگام سازی`, `Service:Sync:${getService.id}`)
            ], [
                Markup.button.callback(`👁‍🗨 نمایش سرویس`, `Service:Show:${getService.id}`)
            ]);
            await ctx.answerCbQuery(
                'همگام سازی انجام شد',
                {
                    show_alert: true
                }
            );
            await ctx.editMessageText(
                "برای حذف / اضافه کردن اینباند روی آن کلیک کنید",
                Markup.inlineKeyboard(inlineKeyboard)
            );
        }
    });

    bot.action(/^Service:Inbounds:(\d+)$/, async (ctx) => {
        const serviceID = ctx.match[1];
        const getService = await botController.getServiceById(serviceID);
        let serviceInbounds = getService.inboundIDS ?? [];
        let url = functionHelpers.generateURLForXui(getService.server.settings.domain, getService.server.settings.port, getService.server.settings.path);
        let getInbounds = await xuiController.getInbounds({ url: url, token: getService.server.settings.token });
        getInbounds = getInbounds.obj;
        let inlineKeyboard = [];
        for (const getInboundItems of getInbounds) {
            if (serviceInbounds.includes(getInboundItems.id)) {
                inlineKeyboard.push([
                    Markup.button.callback(`✅ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Detach:${getInboundItems.id}:${getService.id}`)
                ]);
            } else {
                inlineKeyboard.push([
                    Markup.button.callback(`❌ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Attach:${getInboundItems.id}:${getService.id}`)
                ]);
            }
        }
        inlineKeyboard.push([
            Markup.button.callback(`🔁 همگام سازی`, `Service:Sync:${getService.id}`)
        ], [
            Markup.button.callback(`👁‍🗨 نمایش سرویس`, `Service:Show:${getService.id}`)
        ]);
        ctx.editMessageText("برای حذف / اضافه کردن اینباند روی آن کلیک کنید", Markup.inlineKeyboard(inlineKeyboard));
        await ctx.answerCbQuery();
    });

    bot.action(/^Service:Inbounds:Detach:(.+):(.+)$/, async (ctx) => {
        const serviceID = ctx.match[2];
        const inboundID = ctx.match[1];
        const getService = await botController.getServiceById(serviceID);
        let inboundIDS = getService.inboundIDS ?? [];
        if (inboundIDS.includes(Number(inboundID))) {
            inboundIDS = inboundIDS.filter(id => id !== Number(inboundID));
        }
        const attach = await botController.attachInboundToService(serviceID, inboundIDS);
        let url = functionHelpers.generateURLForXui(getService.server.settings.domain, getService.server.settings.port, getService.server.settings.path);
        let getInbounds = await xuiController.getInbounds({ url: url, token: getService.server.settings.token });
        getInbounds = getInbounds.obj;
        let inlineKeyboard = [];
        for (const getInboundItems of getInbounds) {
            if (inboundIDS.includes(getInboundItems.id)) {
                inlineKeyboard.push([
                    Markup.button.callback(`✅ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Detach:${getInboundItems.id}:${getService.id}`)
                ]);
            } else {
                inlineKeyboard.push([
                    Markup.button.callback(`❌ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Attach:${getInboundItems.id}:${getService.id}`)
                ]);
            }
        }
        inlineKeyboard.push([
            Markup.button.callback(`🔁 همگام سازی`, `Service:Sync:${getService.id}`)
        ], [
            Markup.button.callback(`👁‍🗨 نمایش سرویس`, `Service:Show:${getService.id}`)
        ]);
        await ctx.editMessageText(
            "برای حذف / اضافه کردن اینباند روی آن کلیک کنید",
            Markup.inlineKeyboard(inlineKeyboard)
        );
        await ctx.answerCbQuery();
    });

    bot.action(/^Service:Inbounds:Attach:(.+):(.+)$/, async (ctx) => {
        const serviceID = ctx.match[2];
        const inboundID = ctx.match[1];
        const getService = await botController.getServiceById(serviceID);
        let inboundIDS = getService.inboundIDS ?? [];
        if (!inboundIDS.includes(Number(inboundID))) {
            inboundIDS.push(Number(inboundID));
        }
        const attach = await botController.attachInboundToService(serviceID, inboundIDS);
        let url = functionHelpers.generateURLForXui(getService.server.settings.domain, getService.server.settings.port, getService.server.settings.path);
        let getInbounds = await xuiController.getInbounds({ url: url, token: getService.server.settings.token });
        getInbounds = getInbounds.obj;
        let inlineKeyboard = [];
        for (const getInboundItems of getInbounds) {
            if (inboundIDS.includes(getInboundItems.id)) {
                inlineKeyboard.push([
                    Markup.button.callback(`✅ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Detach:${getInboundItems.id}:${getService.id}`)
                ]);
            } else {
                inlineKeyboard.push([
                    Markup.button.callback(`❌ ${getInboundItems.protocol} - ${getInboundItems.streamSettings.network}:${getInboundItems.port}`, `Service:Inbounds:Attach:${getInboundItems.id}:${getService.id}`)
                ]);
            }
        }
        inlineKeyboard.push([
            Markup.button.callback(`🔁 همگام سازی`, `Service:Sync:${getService.id}`)
        ], [
            Markup.button.callback(`👁‍🗨 نمایش سرویس`, `Service:Show:${getService.id}`)
        ]);
        await ctx.editMessageText(
            "برای حذف / اضافه کردن اینباند روی آن کلیک کنید",
            Markup.inlineKeyboard(inlineKeyboard)
        );
        await ctx.answerCbQuery();
    });

    bot.action(/^Server:Edit:(.*):(\d+)$/, async (ctx) => {
        const setting = ctx.match[1];
        const serverId = ctx.match[2];
        const userData = {
            setting: setting,
            serverId: serverId
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "ویرایش سرور", 1, userData);
        ctx.reply(`مقدار مورد نظر را برای ${setting} وارد کنید (در صورتی که میخواید این فیلد خالی باشه null را ارسال کنید)`, Markup.keyboard(reply_keyboards.backkeyboard).resize());
        await ctx.answerCbQuery();
    });

    bot.action(/^Client:Traffic:Reset:(.+)$/, async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const email = ctx.match[1];
        let url = functionHelpers.generateURLForXui(getUserState.data.server.domain, getUserState.data.server.port, getUserState.data.server.path) + `/panel/api/clients/resetTraffic/${email}`;
        const data = {
            url: url,
            token: getUserState.data.server.token,
            body: {
                email: email
            }
        }
        const resetTraffic = await xuiController.resetClientTraffic(data);
        if (resetTraffic.success) {
            await ctx.answerCbQuery(
                'با موفقیت انجام شد',
                {
                    show_alert: true
                }
            );
        } else {
            await ctx.answerCbQuery(
                'خطایی رخ داد',
                {
                    show_alert: true
                }
            );
        }
        await ctx.answerCbQuery();
    });

    bot.action(/^Create:Client:Server:(\d+)$/, async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const serverId = ctx.match[1];
        const server = await botController.getServerById(serverId);
        const userData = {
            ...getUserState.data,
            server: server
        };
        const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن کلاینت", 4, userData);
        let url = functionHelpers.generateURLForXui(server.settings.domain, server.settings.port, server.settings.path);
        const getServices = await botController.getServicesByServerID(Number(serverId));
        const inlineKeyboard = [];
        getServices.forEach(serviceItem => {
            inlineKeyboard.push([
                Markup.button.callback(serviceItem.title, `Create:Client:Service:${serviceItem.id}`)
            ]);
        });
        inlineKeyboard.push([
            Markup.button.callback("افزودن نهایی کلاینت", `Create:Client:Finally`)
        ]);
        await ctx.answerCbQuery();
        ctx.editMessageText('لطفا سرویس کلاینت را انتخاب کنید', Markup.inlineKeyboard(inlineKeyboard), Markup.keyboard(reply_keyboards.backkeyboard).resize());
    });

    bot.action(/^Create:Client:Service:(\d+)$/, async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const serviceId = ctx.match[1];
        let services = [];
        services.push(Number(serviceId));
        const userData = {
            ...getUserState.data,
            services: services
        }
        const getService = await botController.getServiceById(Number(serviceId));
        userData.inboundIds ??= [];
        for (const serviceInbouds of getService.inboundIDS) {
            if (!userData.inboundIds.includes(serviceInbouds)) {
                userData.inboundIds.push(Number(serviceInbouds));
            } else {
                await ctx.answerCbQuery(
                    'قبلا اضافه کردید',
                    {
                        show_alert: true
                    }
                );
            }
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن کلاینت", 5, userData);
        await ctx.answerCbQuery(
            'با موفقیت اضافه شد',
            {
                show_alert: true
            }
        );
    });

    bot.action('Create:Client:Finally', async (ctx) => {
        const getUserState = await botController.getUserState(ctx.user.id);
        const inboundsIDS = getUserState.data.inboundIds;
        const randomString = functionHelpers.generateRandomString();
        const userData = {
            ...getUserState.data,
            email: randomString
        }
        const updateUserState = await botController.updateUserState(ctx.user.id, "افزودن کلاینت", 5, userData);
        const trafficForXui = functionHelpers.GBtoByte(getUserState.data.traffic);
        const expireTime = functionHelpers.dateToTimestamps(getUserState.data.days);
        let url = functionHelpers.generateURLForXui(getUserState.data.server.settings.domain, getUserState.data.server.settings.port, getUserState.data.server.settings.path);
        const data = {
            url: url,
            token: getUserState.data.server.settings.token,
            body: {
                client: {
                    "email": randomString,
                    "totalGB": trafficForXui,
                    "expiryTime": expireTime,
                    "tgId": 0,
                    "limitIp": 0,
                    "enable": true
                },
                inboundIds: inboundsIDS
            }
        }
        const createClient = await xuiController.createClient(data);
        let subLink = functionHelpers.generateSubLinkForXui(getUserState.data.server.settings.domain, getUserState.data.server.settings.subPort, getUserState.data.server.settings.subPath, createClient.subId);
        let Text = "🔗لینک ساب : \n" + `<code> ${subLink}</code>` + "\n\n";
        Text += "کانفیگ های شما: " + "\n";
        let trafficForUi = `${getUserState.data.traffic} گیگابایت`;
        if (getUserState.data.traffic <= 0) {
            trafficForUi = "نامحدود";
        }
        createClient.links.forEach((key, value) => {
            Text += "<code>" + key + "</code>" + "\n\n";
        });
        Text += `👤 نام کاربری: <code>${randomString}</code> \n\n`;
        Text += `📥 حجم: ${trafficForUi} \n\n`;
        Text += `⌛️ زمان: ${getUserState.data.days} روزه \n\n`;
        Text += `🌐 سرور: ${getUserState.data.server.settings.name} \n\n`;
        const createClientDB = await botController.createClient(userData);

        const messageSent = await functionHelpers.sendMessageWithQr(ctx, Text, subLink);
        let noteBookText = `سفارش جدید \n\n حجم: ${trafficForUi} \n\n  زمان: ${getUserState.data.days} روزه \n\n سرور: ${getUserState.data.server.settings.name} \n\n نام کاربری: <code>${randomString}</code> \n\n مبلغ قابل پرداخت: ${functionHelpers.priceFormatte(userData.price)} تومان`;
        const createNotebook = await botController.createNotebook({ client_id: createClientDB.id, text: noteBookText });
        const notebookSent = await ctx.telegram.sendMessage(
            notebookChannel,
            noteBookText,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "پرداخت",
                                callback_data: `Notebook:Pay:${createNotebook.id}`
                            },
                            {
                                text: "حذف",
                                callback_data: `Notebook:Delete:${createNotebook.id}`
                            }
                        ]
                    ]
                },
                parse_mode: "HTML"
            }
        );
        const updateNotebook = await botController.updateNotebookMessageId(createNotebook.id, notebookSent.message_id);
        await ctx.answerCbQuery();
    });

    bot.action(/^Notebook:Pay:(.+)$/, async (ctx) => {
        const notebookID = ctx.match[1];
        const noteBook = await botController.getNotebook(notebookID);
        const updateClientStatus = await botController.updateClientStatus(noteBook.client.id, "PAIED");
        const deleteNotebook = await botController.deleteNotebook(noteBook.id);
        let text = noteBook.text;
        await ctx.telegram.editMessageText(
            notebookChannel,
            noteBook.message_id,
            null,
            text + "\n\n <b>پرداخت شده</b>",
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [] // 👈 حذف کیبورد
                }
            }
        );
    })

    bot.action(/^Notebook:Delete:(.+)$/, async (ctx) => {
        const notebookID = ctx.match[1];
        const noteBook = await botController.getNotebook(notebookID);
        const deleteNotebook = await botController.deleteNotebook(noteBook.id);
        let text = noteBook.text;
        await ctx.telegram.editMessageText(
            notebookChannel,
            noteBook.message_id,
            null,
            text + "\n\n <b>حذف شده</b>",
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [] // 👈 حذف کیبورد
                }
            }
        );
    });
    bot.launch();
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}