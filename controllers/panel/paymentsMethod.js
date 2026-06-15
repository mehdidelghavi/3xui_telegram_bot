const paymentMethodService = require("../services/paymentsMethod");

exports.getPaymentMethods = async (req, res) => {
    res.render("paymentMethods/index", {
        title: "روش های پرداخت"
    });
}

exports.getPaymentMethodsData = async (req, res) => {
    const paymentMethodsDt = await paymentMethodService.getDataTable(req);
    res.json({
        ...paymentMethodsDt
    });
}

exports.getDetails = async (req, res) => {
    const paymentMethodId = req.params.paymentMethodId;
    const getPaymentMethod = await paymentMethodService.getPaymentMethodById(paymentMethodId);
    return res.render("paymentMethods/details", {
        title: "نمایش جزییات",
        old: {},
        errors: {},
        paymentMethod: getPaymentMethod.obj,
        details: getPaymentMethod.obj.details
    });
}

exports.deleteDetail = async (req, res) => {
    const paymentMethodId = req.params.paymentMethodId;
    const detailId = req.params.detailId;
    const deleteDetail = await paymentMethodService.deleteDetailById(detailId);
    if (deleteDetail.success) {
        req.flash("success", deleteDetail.message);
        return res.redirect(`/paymentMethods/details/${paymentMethodId}`);
    } else {
        req.flash("failed", deleteDetail.message);
        return res.redirect(`/paymentMethods/details/${paymentMethodId}`);
    }
}

exports.createDetail = async (req, res) => {
    const paymentMethodId = req.params.paymentMethodId;
    const data = {
        cardHolder: req.body.cardHolder,
        cardNumber: req.body.cardNumber,
        bankName: req.body.bankName,
        isActive: Boolean(req.body.isActive)
    }
    const createCardDetail = await paymentMethodService.createDetailCardToCard(paymentMethodId, data);
    if (createCardDetail.success) {
        req.flash("success", createCardDetail.message);
        return res.redirect(`/paymentMethods/details/${paymentMethodId}`);
    } else {
        req.flash("failed", createCardDetail.message);
        return res.redirect(`/paymentMethods/details/${paymentMethodId}`);
    }
}