'use strict';

const { validationResult } = require('express-validator');
const { errorResponse }    = require('../utils/response.util');

/**
 * Run express-validator checks and short-circuit if any fail.
 * Usage: router.post('/', [...validatorArray], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field:   e.path || e.param,
      message: e.msg,
    }));
    return errorResponse(res, 'Validation failed', 422, formatted);
  }
  return next();
};

module.exports = { validate };
