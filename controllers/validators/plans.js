const { body } = require('express-validator');

exports.createPlanValidator = [
    body('traffic')
        .notEmpty().withMessage('ترافیک الزامی است')
        .isNumeric().withMessage('ترافیک باید عدد باشد'),

    body('days')
        .notEmpty().withMessage('مدت زمان الزامی است')
        .isNumeric().withMessage('مدت زمان باید عدد باشد'),
    body('price')
        .notEmpty().withMessage('قیمت الزامی است')
        .isNumeric().withMessage('قیمت باید عدد باشد'),
    body('services')
        .isArray({ min: 1 }).withMessage('یک سرویس حداقل باید انتخاب کنید')
];
