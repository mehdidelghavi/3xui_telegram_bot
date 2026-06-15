const ordersService = require("../services/orders");

exports.getOrders = async (req, res) => {
    res.render("orders/index", {
        title: "سفارشات"
    });
}

exports.getOrdersData = async (req, res) => {
    const ordersDt = await ordersService.getDataTable(req);
    res.json({
        ...ordersDt
    });
}