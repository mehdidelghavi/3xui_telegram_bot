const botController = require("../bot");
exports.getDashboard = async (req, res) => {
    const getServersCount = await botController.getServersCount();
    const getClientsCount = await botController.getClientsCount();
    const getServicesCount = await botController.getServicesCount();
    res.render("dashboard/index", {
        title: "داشبور",
        data: {
            getServersCount,
            getServicesCount,
            getClientsCount
        }
    });
}