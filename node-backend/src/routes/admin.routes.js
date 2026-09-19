'use strict';

const router = require('express').Router();
const { body, param } = require('express-validator');

const ctrl              = require('../controllers/admin.controller');
const { protectAdmin }  = require('../middlewares/auth.middleware');
const { requireRole }   = require('../middlewares/role.middleware');
const { validate }      = require('../middlewares/validate.middleware');

router.use(protectAdmin);

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Student management
router.get('/students', ctrl.listStudents);
router.get(
  '/students/:id',
  [param('id').isInt().withMessage('Invalid student ID')],
  validate,
  ctrl.getStudent
);

// Credit wallet (superadmin or admin)
router.post(
  '/students/:id/credit',
  requireRole('superadmin', 'staff'),
  [
    param('id').isInt().withMessage('Invalid student ID'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be positive'),
    body('description').optional().trim().isLength({ max: 255 }),
  ],
  validate,
  ctrl.creditWallet
);

// Debit wallet (admin or superadmin)
router.post(
  '/students/:id/debit',
  requireRole('superadmin', 'staff'),
  [
    param('id').isInt().withMessage('Invalid student ID'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be positive'),
    body('description').optional().trim().isLength({ max: 255 }),
  ],
  validate,
  ctrl.debitWallet
);

// Toggle student active status (superadmin only)
router.patch(
  '/students/:id/status',
  requireRole('superadmin'),
  [param('id').isInt().withMessage('Invalid student ID')],
  validate,
  ctrl.toggleStudentStatus
);

// Create new admin (superadmin only)
router.post(
  '/admins',
  requireRole('superadmin'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
    body('role').optional().isIn(['superadmin', 'staff']),
  ],
  validate,
  ctrl.createAdmin
);

module.exports = router;
