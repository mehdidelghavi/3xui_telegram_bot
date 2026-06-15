const bcrypt = require('bcrypt');
const prisma = require('../../../helpers/prisma');
const functionHelpers = require("../../../helpers/functions");

exports.postLogin = async (data) => {
    try {
        const user = await prisma.panel_settings.findFirst({
            where: {
                username: data.username
            }
        });
        if (!user) {
            return {
                success: false,
                message: "نام کاربری یا رمز عبور اشتباه است"
            }
        }
        const validPassword = await bcrypt.compare(data.password, user.password);
        if (!validPassword) {
            return {
                success: false,
                message: "نام کاربری یا رمز عبور اشتباه است"
            }
        }
        return {
            success: true,
            message: "کاربری با موفقیت یافت شد",
            obj: user
        }
    } catch (e) {
        return {
            success: false,
            message: e.message
        }
    }
}