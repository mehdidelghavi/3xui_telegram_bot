const prisma = require('../helpers/prisma');

/**
 * دریافت کاربر بر اساس Chat ID تلگرام
 *
 * @async
 * @param {number|string} chatID شناسه چت تلگرام
 * @returns {Promise<Object|null>} اطلاعات کاربر یا null
 */
exports.returnUser = async (chatID) => {
    const findUser = await prisma.user.findFirst({
        where: {
            chat_id: chatID
        }
    });
    return findUser;
}

/**
 * ایجاد سرور جدید
 *
 * @async
 * @param {Object} data تنظیمات سرور
 * @returns {Promise<Object>} اطلاعات سرور ایجاد شده
 */
exports.createServer = async (data) => {
    const CreateServer = await prisma.servers.create({
        data: {
            settings: data
        }
    });
    return CreateServer;
}

/**
 * ایجاد یا ثبت State برای کاربر
 *
 * @async
 * @param {number} user_id شناسه کاربر
 * @param {string} step مرحله فعلی
 * @param {number} stepLevel سطح مرحله
 * @param {Object} data اطلاعات اضافی مرحله
 * @returns {Promise<Object|undefined>}
 */
exports.setUserState = async (user_id, step, stepLevel, data) => {
    try {
        const createUserState = await prisma.user_state.create({
            data: {
                step: step,
                level: stepLevel,
                data: data,
                user_id: user_id
            }
        });
        return createUserState;
    } catch (e) {
        console.log(e);
    }
}

/**
 * دریافت آخرین وضعیت (State) ثبت شده برای کاربر
 *
 * @async
 * @param {number} user_id شناسه کاربر
 * @returns {Promise<Object|null>} آخرین وضعیت کاربر
 */
exports.getUserState = async (user_id) => {
    try {
        const userState = await prisma.user_state.findFirst({
            where: {
                user_id: user_id
            },
            orderBy: {
                id: "desc"
            }
        })
        return userState;
    } catch (e) {
        console.log(e);
    }
}

/**
 * بروزرسانی وضعیت فعلی کاربر
 *
 * @async
 * @param {number} user_id شناسه کاربر
 * @param {string} userStep مرحله جدید
 * @param {number} stepLevel سطح مرحله
 * @param {Object} data2 اطلاعات تکمیلی مرحله
 * @returns {Promise<Object>}
 */
exports.updateUserState = async (user_id, userStep, stepLevel, data2) => {
    try {
        const updateUserState = await prisma.user_state.updateMany({
            data: {
                step: userStep,
                level: stepLevel,
                data: data2
            },
            where: {
                user_id: user_id,
            }
        });
        return updateUserState;
    } catch (e) {
        console.log(e);
    }
}

/**
 * حذف تمامی وضعیت‌های ذخیره شده برای کاربر
 *
 * @async
 * @param {number} user_id شناسه کاربر
 * @returns {Promise<boolean>}
 */
exports.deleteUserState = async (user_id) => {
    try {
        const deleteUserState = await prisma.user_state.deleteMany({
            where: {
                user_id: user_id
            }
        });
        return true;
    } catch (e) {
        console.log(e);
    }
}

/**
 * دریافت لیست تمام سرورهای ثبت شده
 *
 * @async
 * @returns {Promise<Array<Object>>}
 */
exports.getServers = async () => {
    const servers = await prisma.servers.findMany();
    return servers;
}

/**
 * دریافت اطلاعات سرور بر اساس شناسه
 *
 * @async
 * @param {number|string} serverID شناسه سرور
 * @returns {Promise<Object|null>}
 */
exports.getServerById = async (serverID) => {
    const server = await prisma.servers.findFirst({
        where: {
            id: Number(serverID)
        },
        select: {
            settings: true,
            id: true
        }
    });
    return server;
}

/**
 * بروزرسانی یکی از تنظیمات سرور
 *
 * @async
 * @param {number|string} serverID شناسه سرور
 * @param {Object} serverData اطلاعات تنظیمات
 * @param {string} serverData.key نام فیلد تنظیمات
 * @param {string} serverData.value مقدار جدید
 * @returns {Promise<Object>}
 */
exports.updateServer = async (serverID, serverData) => {
    const settingKey = serverData.key;
    const settingValue = serverData.value;
    const getServer = await this.getServerById(serverID);
    let serverInfo = getServer.settings;
    serverInfo[settingKey] = settingValue != "null" ? settingValue : "";
    const updateServer = await prisma.servers.update({
        data: {
            settings: serverInfo
        },
        where: {
            id: Number(serverID)
        }
    });
    return updateServer;
}

/**
 * دریافت تمامی سرویس‌ها به همراه اطلاعات سرور
 *
 * @async
 * @returns {Promise<Array<Object>>}
 */
exports.getServices = async () => {
    const getServices = await prisma.service.findMany({
        include: {
            server: true
        }
    });
    return getServices;
}

/**
 * دریافت اطلاعات سرویس بر اساس شناسه
 *
 * @async
 * @param {number} serviceID شناسه سرویس
 * @returns {Promise<Object|null>}
 */
exports.getServiceById = async (serviceID) => {
    const getService = await prisma.service.findFirst({
        where: {
            id: serviceID
        },
        include: {
            server: true,
            _count: {
                select: {
                    plans: true
                }
            }
        }
    });
    return getService;
}

/**
 * دریافت سرویس‌های متعلق به یک سرور
 *
 * @async
 * @param {number} serverID شناسه سرور
 * @returns {Promise<Array<Object>>}
 */
exports.getServicesByServerID = async (serverID) => {
    const getServices = await prisma.service.findMany({
        where: {
            server_id: serverID
        }
    });
    return getServices;
}

/**
 * حذف سرویس بر اساس شناسه
 *
 * @async
 * @param {number} serviceID شناسه سرویس
 * @returns {Promise<{
*  success:boolean,
*  message:string
* }>}
*/
exports.deleteServiceById = async (serviceID) => {
    try {
        const deleteService = await prisma.service.delete({
            where: {
                id: serviceID
            }
        });
        return {
            success: true,
            message: "سرویس با موفقیت حذف شد"
        };
    } catch (e) {
        return {
            success: false,
            message: "سرویس یافت نشد یا قبلا حذف شده است"
        }
    }
}

/**
 * اتصال Inbound ها به سرویس
 *
 * @async
 * @param {number} serviceID شناسه سرویس
 * @param {Array<number>} inboundIDS لیست شناسه Inbound ها
 * @returns {Promise<Object>}
 */
exports.attachInboundToService = async (serviceID, inboundIDS) => {
    const attachInboundToService = await prisma.service.update({
        data: {
            inboundIDS: inboundIDS
        },
        where: {
            id: serviceID
        }
    });
    return attachInboundToService;
}

/**
 * همگام‌سازی لیست Inbound های سرویس
 *
 * @async
 * @param {number} serviceID شناسه سرویس
 * @param {Array<number>} inbounds لیست Inbound ها
 * @returns {Promise<Object|undefined>}
 */
exports.syncServiceInbounds = async (serviceID, inbounds) => {
    try {
        const syncService = await prisma.service.update({
            data: {
                inboundIDS: inbounds
            },
            where: {
                id: serviceID
            }
        });
        return syncService;
    } catch (e) {
        console.log(e);
    }
}

/**
 * ایجاد سرویس جدید
 *
 * @async
 * @param {Object} data اطلاعات سرویس
 * @param {string} data.title عنوان سرویس
 * @param {number} data.server_id شناسه سرور
 * @returns {Promise<Object>}
 */
exports.creatService = async (data) => {
    const createService = await prisma.service.create({
        data: {
            title: data.title,
            server_id: data.server_id
        }
    });
    return createService;
}

/**
 * ایجاد کلاینت جدید و اتصال سرویس‌های انتخاب شده
 *
 * @async
 * @param {Object} data اطلاعات کلاینت
 * @param {string} data.email ایمیل یا نام کاربری کلاینت
 * @param {number} data.days تعداد روز اعتبار
 * @param {number} data.price مبلغ پرداختی
 * @param {number} data.traffic حجم سرویس
 * @param {number[]} data.services شناسه سرویس‌های انتخاب شده
 * @param {Object} data.server اطلاعات سرور
 * @param {number} data.server.id شناسه سرور
 *
 * @returns {Promise<Object>} کلاینت ایجاد شده
 *
 * @example
 * await createClient({
 *   email: "user123",
 *   days: 30,
 *   price: 150000,
 *   traffic: 100,
 *   services: [1, 2, 3],
 *   server: {
 *     id: 1
 *   }
 * });
 */
exports.createClient = async (data) => {
    const services = data.services.map(Number);
    const createClient = await prisma.client.create({
        data: {
            email: data.email,
            status: "CREATED",
            days: data.days,
            price: data.price,
            server_id: data.server.id,
            traffic: data.traffic,
        }
    });
    const createRelation = await prisma.ServicesOnClients.createMany({
        data: services.map(serviceId => ({
            clientId: createClient.id,
            serviceId: serviceId
        }))
    });
    return createClient;
}

/**
 * بروزرسانی وضعیت کلاینت
 *
 * @async
 * @param {number} clientID شناسه کلاینت
 * @param {string} status وضعیت جدید
 * @returns {Promise<void>}
 */
exports.updateClientStatus = async (clientID, status) => {
    const update = await prisma.client.update({
        data: {
            status: status
        },
        where: {
            id: clientID
        }
    });
}

/**
 * ایجاد یادداشت جدید برای کلاینت
 *
 * @async
 * @param {Object} data اطلاعات یادداشت
 * @param {number} data.message_id شناسه پیام تلگرام
 * @param {number} data.client_id شناسه کلاینت
 * @param {string} data.text متن یادداشت
 * @returns {Promise<Object>}
 */
exports.createNotebook = async (data) => {
    const createNotebook = await prisma.notebook.create({
        data: {
            message_id: data.message_id,
            client_id: data.client_id,
            text: data.text
        }
    });
    return createNotebook;
}

/**
 * دریافت یادداشت بر اساس شناسه پیام تلگرام
 *
 * @async
 * @param {number} messageID شناسه پیام
 * @returns {Promise<Object|null>}
 */
exports.getNotebookByMessageId = async (messageID) => {
    const getNotebook = await prisma.notebook.findFirst({
        where: {
            message_id: messageID
        },
        include: {
            client: true
        }
    });
    return getNotebook;
}

/**
 * دریافت یادداشت بر اساس شناسه
 *
 * @async
 * @param {number} notebookID شناسه یادداشت
 * @returns {Promise<Object|null>}
 */
exports.getNotebook = async (notebookID) => {
    const getNotebook = await prisma.notebook.findFirst({
        where: {
            id: notebookID
        },
        include: {
            client: true
        }
    });
    return getNotebook;
}

/**
 * حذف یادداشت
 *
 * @async
 * @param {number} notebookID شناسه یادداشت
 * @returns {Promise<Object>}
 */
exports.deleteNotebook = async (notebookID) => {
    const deleteNotebook = await prisma.notebook.delete({
        where: {
            id: notebookID
        }
    });
    return deleteNotebook;
}

/**
 * بروزرسانی شناسه پیام متصل به یادداشت
 *
 * @async
 * @param {number} notebookID شناسه یادداشت
 * @param {number} messageID شناسه جدید پیام
 * @returns {Promise<void>}
 */
exports.updateNotebookMessageId = async (notebookID, messageID) => {
    const update = await prisma.notebook.update({
        data: {
            message_id: messageID
        },
        where: {
            id: notebookID
        }
    });
}