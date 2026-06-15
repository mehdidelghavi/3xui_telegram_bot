const { service } = require("../../helpers/prisma");
const plansService = require("../services/plans");
const servicesService = require("../services/services");


exports.getPlans = async (req, res) => {
    res.render("plans/index", {
        title: "تعرفه ها"
    });
}

exports.getPlansData = async (req, res) => {
    const plansDt = await plansService.getDataTable(req);
    res.json({
        ...plansDt
    });
}

exports.create = async (req, res) => {
    const old = req.session.old || {};
    req.session.old = null;
    const services = await servicesService.getServices();
    if (services.success) {
        return res.render("plans/create", {
            title: "افزودن تعرفه",
            old: {},
            errors: {},
            services: services.obj
        });
    } else {
        req.flash("failed", services.message);
        return res.redirect("/services");
    }
}

exports.store = async (req, res) => {
    let data = {
        traffic: req.body.traffic,
        days: req.body.days,
        price: req.body.price,
        services: req.body.services
    };
    const services = await servicesService.getServices();
    if (req.validationErrors) {
        return res.status(422).render('plans/create', {
            title: "ساخت تعرفه",
            errors: req.validationErrors,
            old: data,
            services: services.obj
        });
    }
    data.services = data.services.map(u => Number(u));
    const createPlan = await plansService.saveToDb(data);
    if (createPlan.success) {
        req.flash("success", createPlan.message);
        return res.redirect("/plans/create");
    } else {
        req.flash("failed", createPlan.message);
        return res.redirect("/plans/create");
    }
}

exports.edit = async (req, res) => {
    const old = req.session.old || {};
    req.session.old = null; // پاک کردن بعد از استفاده
    const planId = req.params.planId;
    let getServices = await servicesService.getServices();
    if (!getServices.success) {
        req.flash("failed", getServices.message);
        return res.redirect("/plans");
    }
    getServices = getServices.obj;
    let getPlan = await plansService.getPlanById(planId);
    if (!getPlan.success) {
        req.flash("failed", getPlan.message);
        return res.redirect("/plans");
    }
    getPlan = getPlan.obj;
    let planServices = [];
    for (const serviceItems of getPlan.services) {
        planServices.push(serviceItems.service.id);
    }
    return res.render("plans/edit", {
        title: "ویرایش تعرفه",
        old: old,
        errors: {},
        plan: getPlan,
        services: getServices,
        planServices: planServices
    });
}

exports.update = async (req, res) => {
    const planId = req.params.planId;
    const data = {
        traffic: req.body.traffic,
        days: req.body.days,
        price: req.body.price,
        services: req.body.services
    }
    const updatePlan = await plansService.updatePlanById(planId, data);
    if (updatePlan.success) {
        req.flash("success", "تعرفه با موفقیت ویرایش شد");
        return res.redirect("/plans");
    } else {
        req.flash("failed", updatePlan.message);
        return res.redirect(`/plans/edit/${planId}`);
    }
}

exports.delete = async (req, res) => {
    const planId = req.params.planId;
    console.log(planId);
    const deletePlan = await plansService.deletePlanById(planId);
    if (deletePlan.success) {
        req.flash("success", "تعرفه با موفقیت حذف شد");
        return res.redirect("/plans");
    } else {
        req.flash("failed", deletePlan.message);
        return res.redirect("/plans");
    }
}