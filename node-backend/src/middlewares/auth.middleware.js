'use strict';

const { verifyToken }   = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');
const { RefreshToken }  = require('../models');

/**
 * Middleware: protect student routes.
 * Expects: Authorization: Bearer <accessToken>
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token   = authHeader.split(' ')[1];
    const decoded = verifyToken(token, 'access');

    if (decoded.role !== 'student') {
      return errorResponse(res, 'Access denied', 403);
    }

    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

/**
 * Middleware: protect admin routes.
 * Expects: Authorization: Bearer <accessToken>
 */
const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token   = authHeader.split(' ')[1];
    const decoded = verifyToken(token, 'access');

    if (!['superadmin', 'staff'].includes(decoded.role)) {
      return errorResponse(res, 'Admin access required', 403);
    }

    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};



/**
 * Protect either student or admin endpoints while keeping one token parser.
 */
const protectAny = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const decoded = verifyToken(authHeader.slice(7), 'access');
    if (!['student', 'superadmin', 'staff'].includes(decoded.role)) {
      return errorResponse(res, 'Access denied', 403);
    }

    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

module.exports = { protect, protectAdmin, protectAny };
