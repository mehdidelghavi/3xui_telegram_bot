const paymentsService = require('../services/payments');

exports.getPayments = async (req, res) => {
    res.render("payments/index", {
        title: "پرداخت ها"
    });
}

exports.getPaymentsData = async (req, res) => {
    const paymentsDT = await paymentsService.getDataTable(req);
    res.json({
        ...paymentsDT
    });
}