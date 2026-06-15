const userService = require("../services/users");

exports.getUsers = async (req, res) => {

    res.render("users/index", {
        title: "کاربران"
    });
}

exports.getUsersData = async (req, res) => {
    const userDt = await userService.getDataTable(req);
    res.json({
        ...userDt
    });
}

exports.edit = async (req, res) => {
    const userId = req.params.userId;
    const old = req.session.old || {};
    req.session.old = null; // پاک کردن بعد از استفاده
    const user = await userService.getUserById(userId);
    return res.render("users/edit", {
        title: "ویرایش کاربر",
        old: old,
        errors: {},
        user: user.obj
    });
}

exports.update = async (req, res) => {
    const userId = req.params.userId;
    const data = {
        role: req.body.role
    }
    const updateUser = await userService.updateUserById(userId, data);
    if (updateUser.success) {
        req.flash("success", updateUser.message);
        return res.redirect("/users");
    } else {
        req.flash("failed", updateUser.message);
        return res.redirect(`/users/edit/${userId}`);
    }
}