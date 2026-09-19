'use strict';

const { errorResponse } = require('../utils/response.util');

/**
 * Role-based access control middleware.
 * Must be used AFTER protectAdmin (which sets req.user.role).
 *
 * @param {...string} roles - allowed roles, e.g. 'superadmin'
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return errorResponse(res, 'Insufficient permissions', 403);
  }
  return next();
};

module.exports = { requireRole };
