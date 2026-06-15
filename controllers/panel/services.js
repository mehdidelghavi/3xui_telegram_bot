const servicesService = require("../services/services");
const serversService = require("../services/servers");
const xuiController = require("../xui");
const functionHelpers = require("../../helpers/functions");

exports.getServices = async (req, res) => {
    res.render("services/index", {
        title: "سرویس ها"
    });
}

exports.getServicesData = async (req, res) => {
    const serverDt = await servicesService.getDataTable(req);
    res.json({
        ...serverDt
    });
}

exports.create = async (req, res) => {
    const old = req.session.old || {};
    req.session.old = null; // پاک کردن بعد از استفاده
    let servers = await serversService.getServers();
    if (servers.success) {
        res.render("services/create", {
            title: "ساخت سرویس",
            errors: {},
            old: old,
            servers: servers.obj
        });
    } else {
        req.flash("failed", servers.message);
        return res.redirect("/servers");
    }
}

exports.store = async (req, res) => {
    const { title, server_id } = req.body;
    const servers = await serversService.getServers();
    if (req.validationErrors) {
        return res.status(422).render('services/create', {
            title: "ساخت سرویس",
            errors: req.validationErrors,
            old: req.body,
            servers: servers.obj
        });
    }
    const data = { title, server_id };
    const createService = await servicesService.saveToDb(data);
    if (createService.success) {
        req.flash("success", createService.message);
        return res.redirect("/services");
    } else {
        req.flash("failed", createService.message);
        req.session.old = data;
        return res.redirect("/services/create");
    }
}

exports.edit = async (req, res) => {
    const old = req.session.old || {};
    req.session.old = null; // پاک کردن بعد از استفاده
    const serviceId = req.params.serviceId;
    let getService = await servicesService.getServiceById(serviceId);
    let inboundIDS = getService.obj.inboundIDS || [];
    const server = getService.obj.server;
    let servers = await serversService.getServers();
    let url = functionHelpers.generateURLForXui(server.settings.domain, server.settings.port, server.settings.path);
    let getInbounds = await xuiController.getInbounds({ url: url, token: server.settings.token });
    if (getInbounds.success) {
        getInbounds = getInbounds.obj;
        res.render("services/edit", {
            title: "ویرایش سرویس",
            errors: {},
            old: old,
            servers: servers.obj,
            service: getService.obj,
            inbounds: getInbounds,
            inboundIDS: inboundIDS
        });
    } else {
        req.flash("failed", "خطا در برقراری ارتباط با پنل");
        return res.redirect("/services");
    }
}

exports.update = async (req, res) => {
    const serviceId = req.params.serviceId;
    let title = req.body.title;
    let server_id = req.body.server_id;
    let inboundIDS = req.body.inboundIDS;
    if (Array.isArray(inboundIDS)) {
        inboundIDS = inboundIDS.map(u => Number(u));
    } else {
        inboundIDS = [Number(inboundIDS)];
    }
    const updateService = await servicesService.updateService({ title: title, server_id: server_id, inboundIDS: inboundIDS, id: serviceId });
    if (updateService.success) {
        req.flash("success", updateService.message);
        return res.redirect("/services");
    } else {
        req.flash("failed", updateService.message);
        return res.redirect(`/services/edit/${serviceId}`);
    }
}

exports.delete = async (req, res) => {
    const serviceId = req.params.serviceId;
    const deleteService = await servicesService.deleteServiceById(serviceId);
    if (deleteService.success) {
        req.flash("success", "سرویس با موفقیت حذف شد");
        return res.redirect("/services");
    } else {
        req.flash("failed", e.message);
        return res.redirect("/services");
    }
}