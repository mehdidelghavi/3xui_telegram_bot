const walletService = require("../services/wallet");

exports.getWalletTransactions = async (req, res) => {
    res.render("wallet/index", {
        title: "تراکنشات کیف پول"
    });
}

exports.getWalletTransactionsData = async (req, res) => {
    const walletDt = await walletService.getDataTable(req);
    res.json({
        ...walletDt
    });
}