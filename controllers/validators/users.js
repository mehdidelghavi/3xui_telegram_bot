const { body } = require('express-validator');

exports.createPlanValidator = [
    body('role')
        .notEmpty().withMessage('لطفا یک نفش برای کاربر انتخاب کنید')
];
