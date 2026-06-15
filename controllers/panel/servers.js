const serverService = require("../services/servers");

exports.getServers = async (req, res) => {
    res.render("servers/index", {
        title: "سرور ها"
    });
}

exports.getServersData = async (req, res) => {
    const serverDt = await serverService.getDataTable(req);
    res.json({
        ...serverDt
    });
}

exports.create = async (req, res) => {
    const old = req.session.old || {};
    req.session.old = null; // پاک کردن بعد از استفاده
    res.render("servers/create", {
        title: "ساخت سرور",
        errors: {},
        old: old
    });
}

exports.store = async (req, res) => {
    try {
        const { name, domain, path, port, token, subPort, subPath } = req.body;
        if (req.validationErrors) {
            return res.status(422).render('servers/create', {
                title: "ساخت سرور",
                errors: req.validationErrors,
                old: req.body
            });
        }
        const data = { name, domain, path, port, token, subPort, subPath };

        const saveToDb = await serverService.saveToDb(data);
        if (saveToDb.success) {
            req.flash('success', 'سرور با موفقیت ایجاد شد');
            return res.redirect('/servers/create');
        } else {
            req.flash('failed', `متاسفانه خطایی رخ داد ${saveToDb.message}`);
            req.session.old = data;
            return res.redirect('/servers/create');
        }

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
}

exports.edit = async (req, res) => {
    const old = req.session.old || {};
    const serverId = req.params.serverId;
    req.session.old = null;
    const getServer = await serverService.getServerById(serverId);
    if (getServer.success) {
        res.render("servers/edit", {
            title: "ویرایش سرور",
            errors: {},
            old: old,
            serverItem: getServer.obj
        });
    } else {
        req.flash("failed", "سرور یافت نشد");
        return res.redirect("/servers");
    }

}

exports.update = async (req, res) => {
    try {
        const serverId = req.params.serverId;
        const { name, domain, path, port, token, subPort, subPath } = req.body;
        if (req.validationErrors) {
            return res.status(422).render('servers/edit', {
                title: "ویرایش سرور",
                errors: req.validationErrors,
                old: req.body,
                serverItem: { id: serverId }
            });
        }
        const data = { name, domain, path, port, token, subPort, subPath };

        const updateServer = await serverService.updateServerById(serverId, data);
        if (updateServer.success) {
            req.flash('success', 'سرور با موفقیت ویرایش شد');
            return res.redirect(`/servers/edit/${serverId}`);
        } else {
            req.flash('failed', `متاسفانه خطایی رخ داد ${updateServer.message}`);
            req.session.old = data;
            return res.redirect(`/servers/edit/${serverId}`);
        }

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
}

exports.delete = async (req, res) => {
    const serverId = req.params.serverId;
    const deleteServer = await serverService.deleteServerById(serverId);
    if (deleteServer.success) {
        req.flash('success', 'سرور با موفقیت حذف شد');
        return res.redirect('/servers');
    } else {
        req.flash('failed', `متاسفانه خطایی رخ داد ${deleteServer.message}`);
        return res.redirect('/servers');
    }
}