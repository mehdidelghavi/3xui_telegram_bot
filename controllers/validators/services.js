const { body } = require('express-validator');

exports.createServiceValidator = [
    body('title')
        .notEmpty().withMessage('نام الزامی است')
        .isLength({ min: 3 }).withMessage('نام باید حداقل 3 کاراکتر باشد'),

    body('server_id')
        .notEmpty().withMessage('سرور الزامی است')
        .isNumeric().withMessage('حداقل باید یک سرور انتخاب کنید'),
];
