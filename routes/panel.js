const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/panel/dashboard");
const usersController = require("../controllers/panel/users");
const serversController = require("../controllers/panel/servers");
const servicesController = require("../controllers/panel/services");
const plansController = require("../controllers/panel/plans");
const authController = require("../controllers/panel/auth/auth");
const paymentMethodsController = require("../controllers/panel/paymentsMethod");
const ordersController = require("../controllers/panel/orders");
const paymentsController = require("../controllers/panel/payments");
const walletController = require("../controllers/panel/wallet");
const panelSettingsController = require("../controllers/panel/panelSettings");
const { createServerValidator } = require('../controllers/validators/servers');
const { createServiceValidator } = require('../controllers/validators/services');
const { createPlanValidator } = require('../controllers/validators/plans');
const { createPlanValidator2 } = require('../controllers/validators/details');
const { handleValidation } = require('../middlewares/handleValidation');
const auth = require('../middlewares/auth');

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/dashboard", auth, dashboardController.getDashboard);

// Users Route
router.get("/users", auth, usersController.getUsers);
router.get("/users/api", auth, usersController.getUsersData);
router.get("/users/edit/:userId", auth, usersController.edit);
router.post("/users/edit/:userId", auth, usersController.update);

// Servers Route
router.get("/servers", auth, serversController.getServers);
router.get("/servers/api", auth, serversController.getServersData);
router.get("/servers/create", auth, serversController.create);
router.post("/servers/create", auth, createServerValidator, handleValidation, serversController.store);
router.get("/servers/edit/:serverId", auth, serversController.edit);
router.post("/servers/edit/:serverId", auth, createServerValidator, handleValidation, serversController.update);
router.get("/servers/delete/:serverId", auth, serversController.delete);


// Services Route
router.get("/services", auth, servicesController.getServices);
router.get("/services/api", auth, servicesController.getServicesData);
router.get("/services/create", auth, servicesController.create);
router.post("/services/create", auth, createServiceValidator, handleValidation, servicesController.store);
router.get("/services/edit/:serviceId", auth, servicesController.edit);
router.post("/services/edit/:serviceId", auth, createServiceValidator, handleValidation, servicesController.update);
router.get("/services/delete/:serviceId", auth, servicesController.delete);

// Plans Route
router.get("/plans", auth, plansController.getPlans);
router.get("/plans/api", auth, plansController.getPlansData);
router.get("/plans/create", auth, plansController.create);
router.post("/plans/create", auth, createPlanValidator, handleValidation, plansController.store);
router.get("/plans/edit/:planId", auth, plansController.edit);
router.post("/plans/edit/:planId", auth, createPlanValidator, handleValidation, plansController.update);
router.get("/plans/delete/:planId", auth, plansController.delete);

// Payment Methods 
router.get("/paymentMethods", auth, paymentMethodsController.getPaymentMethods);
router.get("/paymentMethods/api", auth, paymentMethodsController.getPaymentMethodsData);
router.get("/paymentMethods/details/:paymentMethodId", auth, paymentMethodsController.getDetails);
router.get("/paymentMethods/details/:paymentMethodId/delete/:detailId", auth, paymentMethodsController.deleteDetail);
router.post("/paymentMethods/detail/create/:paymentMethodId", auth, paymentMethodsController.createDetail);

router.get("/orders", auth, ordersController.getOrders);
router.get("/orders/api", auth, ordersController.getOrdersData);

router.get("/walletTransactions", auth, walletController.getWalletTransactions);
router.get("/walletTransactions/api", auth, walletController.getWalletTransactionsData);

router.get("/payments", auth, paymentsController.getPayments);
router.get("/payments/api", auth, paymentsController.getPaymentsData);


router.get("/settings", auth, panelSettingsController.edit);
router.post("/settings/edit/:settingId", auth, panelSettingsController.update);



router.get("/logout", (req, res) => {
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
});
module.exports = router;