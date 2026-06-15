const { body } = require('express-validator');

exports.createServerValidator = [
    body('name')
        .notEmpty().withMessage('نام الزامی است')
        .isLength({ min: 3 }).withMessage('نام باید حداقل 3 کاراکتر باشد'),

    body('domain')
        .notEmpty().withMessage('دامنه الزامی است')
        .isURL().withMessage('دامنه معتبر نیست'),

    body('port')
        .notEmpty().withMessage('پورت الزامی است')
        .isInt({ min: 1, max: 65535 }).withMessage('پورت معتبر نیست'),

    body('path')
        .notEmpty().withMessage('مسیر پنل الزامی است'),

    body('token')
        .notEmpty().withMessage('توکن الزامی است')
        .isLength({ min: 10 }).withMessage('توکن خیلی کوتاه است'),

    body('subPort')
        .notEmpty().withMessage('پورت ساب الزامی است')
        .isInt({ min: 1, max: 65535 }).withMessage('پورت ساب معتبر نیست'),

    body('subPath')
        .notEmpty().withMessage('مسیر ساب الزامی است'),
];