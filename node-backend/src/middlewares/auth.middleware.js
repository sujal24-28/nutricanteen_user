'use strict';

const { verifyToken }   = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');

/**
 * Middleware: protect student routes.
 * Validates JWT access token; role must be 'student'.
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

    // Re-validate student in DB to catch deactivated/deleted students immediately
    const { Student } = require('../models');
    const student = await Student.findByPk(decoded.id, {
      attributes: ['id', 'is_active', 'name', 'phone', 'class', 'section', 'roll', 'school_id'],
    });

    if (!student || !student.is_active) {
      return errorResponse(res, 'Account not found or deactivated', 401);
    }

    req.user = {
      id: student.id,
      role: 'student',
      name: student.name,
      phone: student.phone,
      class: student.class,
      section: student.section,
      roll: student.roll,
      school_id: student.school_id,
    };
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
 * Validates JWT AND re-checks the database to detect:
 *   - deactivated admins (is_active = false)
 *   - demoted roles (token says superadmin but DB now says staff, or vice-versa)
 *
 * The DB lookup is intentionally lightweight: SELECT only id, role, is_active.
 * Access tokens are short-lived (15 min) so the extra query is infrequent.
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

    // Re-validate against the database to catch deactivated/demoted admins
    // Import lazily to avoid circular-dependency issues at startup
    const { Admin } = require('../models');
    const admin = await Admin.findByPk(decoded.id, {
      attributes: ['id', 'role', 'is_active', 'name', 'email', 'phone'],
    });

    if (!admin || !admin.is_active) {
      return errorResponse(res, 'Account not found or deactivated', 401);
    }

    // Always use the live DB role, not the (potentially stale) JWT role
    if (!['superadmin', 'staff'].includes(admin.role)) {
      return errorResponse(res, 'Admin access required', 403);
    }

    req.user = {
      id: admin.id,
      role: admin.role,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
    };
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
 * Re-validates active account against DB.
 */
const protectAny = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const decoded = verifyToken(authHeader.slice(7), 'access');
    if (!['student', 'superadmin', 'staff'].includes(decoded.role)) {
      return errorResponse(res, 'Access denied', 403);
    }

    if (decoded.role === 'student') {
      const { Student } = require('../models');
      const student = await Student.findByPk(decoded.id, {
        attributes: ['id', 'is_active', 'name', 'phone', 'class', 'section', 'roll', 'school_id'],
      });
      if (!student || !student.is_active) {
        return errorResponse(res, 'Account not found or deactivated', 401);
      }
      req.user = {
        id: student.id,
        role: 'student',
        name: student.name,
        phone: student.phone,
        class: student.class,
        section: student.section,
        roll: student.roll,
        school_id: student.school_id,
      };
    } else {
      const { Admin } = require('../models');
      const admin = await Admin.findByPk(decoded.id, {
        attributes: ['id', 'role', 'is_active', 'name', 'email', 'phone'],
      });
      if (!admin || !admin.is_active || !['superadmin', 'staff'].includes(admin.role)) {
        return errorResponse(res, 'Account not found or deactivated', 401);
      }
      req.user = {
        id: admin.id,
        role: admin.role,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      };
    }

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

module.exports = { protect, protectAdmin, protectAny };
