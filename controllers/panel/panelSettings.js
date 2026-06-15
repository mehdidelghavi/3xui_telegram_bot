const panelSettingsService = require("../services/panelSettings");
const bcrypt = require("bcrypt");

exports.edit = async (req, res) => {
    const old = req.session.old || {};
    req.session.old = null;
    const panelSettings = await panelSettingsService.editPanelSettings();
    res.render("panelSettings/edit", {
        title: "ویرایش تنظیمات",
        old: old,
        errors: {},
        panelSettings: panelSettings
    });
}

exports.update = async (req, res) => {
    const settingId = req.params.settingId;

    const username = req.body.username;
    const password = req.body.password;
    const data = {
        ...(username?.trim() && { username }),
        ...(password?.trim() && { password: await bcrypt.hash(password, 10) })
    };

    if (!Object.keys(data).length) {
        return res.status(400).send("No data to update");
    }
    const update = await panelSettingsService.update(settingId, data);
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }

        res.clearCookie('connect.sid');

        res.redirect('/login');
    });
}