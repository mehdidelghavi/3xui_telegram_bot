const fetchHelper = require("../helpers/fetch");
const prisma = require("../helpers/prisma");

/**
 * ثبت سرور جدید در دیتابیس
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
 * دریافت لیست Inbound های پنل XUI
 *
 * @async
 * @param {Object} data
 * @param {string} data.url آدرس پنل XUI
 * @param {string} data.token توکن دسترسی
 *
 * @returns {Promise<Object>} پاسخ API پنل
 */
exports.getInbounds = async (data) => {
    data.url = data.url + "/panel/api/inbounds/list";
    console.log(data.url);
    const response = await fetchHelper.getXui(data);
    return response;
}

/**
 * ایجاد کلاینت جدید در پنل XUI
 *
 * پس از ساخت کلاینت:
 * - لینک‌های اتصال را دریافت می‌کند
 * - SubId کاربر را دریافت می‌کند
 *
 * @async
 * @param {Object} data
 * @param {string} data.url آدرس پنل XUI
 * @param {string} data.token توکن دسترسی
 * @param {Object} data.body اطلاعات کلاینت
 * @param {Object} data.body.client اطلاعات کاربر
 * @param {string} data.body.client.email ایمیل یا شناسه کلاینت
 *
 * @returns {Promise<{
*   links:Array,
*   subId:string
* }|undefined>}
*/
exports.createClient = async (data) => {
    const originUrl = data.url;
    data.url = data.url + "/panel/api/clients/add";
    try {
        const createClientApi = await fetchHelper.postXui(data);
        data.url = originUrl + `/panel/api/clients/links/${data.body.client.email}`;
        const clientLinks = await fetchHelper.getXui(data);
        data.url = originUrl + `/panel/api/clients/get/${data.body.client.email}`;
        const clientSubId = await fetchHelper.getXui({ url: data.url, token: data.token });
        return {
            links: clientLinks.obj,
            subId: clientSubId.obj.client.subId
        };
    } catch (e) {
        console.log(e.message);
    }
}

/**
 * بروزرسانی اطلاعات کلاینت در پنل XUI
 *
 * عملیات:
 * - ویرایش کلاینت
 * - دریافت لینک‌های جدید
 * - دریافت SubId
 * - ریست حجم مصرفی
 *
 * @async
 * @param {Object} data
 * @param {string} data.url آدرس پنل
 * @param {string} data.token توکن دسترسی
 * @param {Object} data.body اطلاعات کلاینت
 * @param {string} data.body.email شناسه کلاینت
 *
 * @returns {Promise<{
*   links:Array,
*   subId:string
* }|undefined>}
*/
exports.updateClient = async (data) => {
    const originUrl = data.url;
    data.url = data.url + `/panel/api/clients/update/${data.body.email}`;
    try {
        const createClientApi = await fetchHelper.postXui(data);
        data.url = originUrl + `/panel/api/clients/links/${data.body.email}`;
        const clientLinks = await fetchHelper.getXui(data);
        data.url = originUrl + `/panel/api/clients/get/${data.body.email}`;
        const clientSubId = await fetchHelper.getXui({ url: data.url, token: data.token });
        data.url = originUrl + `/panel/api/clients/resetTraffic/${data.body.email}`;
        data.body = { email: data.body.email }
        const resetTraffic = await this.resetClientTraffic(data);
        return {
            links: clientLinks.obj,
            subId: clientSubId.obj.client.subId,
        };
    } catch (e) {
        console.log(e.message);
    }
}

/**
 * دریافت اطلاعات کلاینت از پنل XUI
 *
 * @async
 * @param {Object} data
 * @param {string} data.url آدرس API
 * @param {string} data.token توکن دسترسی
 *
 * @returns {Promise<Object>}
 */
exports.getClient = async (data) => {
    const createClientApi = await fetchHelper.getXui(data);
    return createClientApi;
}

/**
 * حذف کلاینت از پنل XUI
 *
 * @async
 * @param {Object} data
 * @param {string} data.url آدرس API
 * @param {string} data.token توکن دسترسی
 * @param {Object} data.body اطلاعات درخواست
 *
 * @returns {Promise<Object>}
 */
exports.deleteClient = async (data) => {
    const deleteClientApi = await fetchHelper.postXui(data);
    return deleteClientApi;
}

/**
 * ریست حجم مصرفی کلاینت
 *
 * @async
 * @param {Object} data
 * @param {string} data.url آدرس API
 * @param {string} data.token توکن دسترسی
 * @param {Object} data.body اطلاعات کلاینت
 *
 * @returns {Promise<Object>}
 */
exports.resetClientTraffic = async (data) => {
    const resetClientTrafficApi = await fetchHelper.postXui(data);
    return resetClientTrafficApi;
}

/**
 * اتصال Inbound ها به کلاینت
 *
 * @async
 * @param {Object} data
 * @param {string} data.url آدرس API
 * @param {string} data.token توکن دسترسی
 * @param {Object} data.body اطلاعات اتصال Inbound
 *
 * @returns {Promise<Object>}
 */
exports.attachInbounds = async (data) => {
    const attachInbounds = await fetchHelper.postXui(data);
    return attachInbounds;
}