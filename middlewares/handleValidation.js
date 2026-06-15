const { validationResult } = require('express-validator');

exports.handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.validationErrors = errors.mapped();
        return next();
    }

    next();
};