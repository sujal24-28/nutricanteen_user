'use strict';

const router = require('express').Router();
const { body } = require('express-validator');

const ctrl     = require('../controllers/auth.controller');
const { validate }     = require('../middlewares/validate.middleware');
const { otpLimiter }   = require('../middlewares/rateLimiter.middleware');

/* 📱 Common Auth 📱 */
router.post(
  '/check-user',
  [
    body('phone')
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
  ],
  validate,
  ctrl.checkUser
);

const { upload } = require('../middlewares/upload.middleware');

/* 📚 Student Auth 📚 */

router.post(
  '/student/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('school_id').notEmpty().withMessage('School selection is required').isInt().withMessage('Invalid school'),
    body('class').trim().notEmpty().withMessage('Class is required'),
    body('roll').trim().notEmpty().withMessage('Roll number is required'),
    body('section').trim().notEmpty().withMessage('Section is required'),
    body('phone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
  ],
  validate,
  ctrl.register
);

router.post(
  '/student/send-otp',
  otpLimiter,
  [
    body('phone')
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
  ],
  validate,
  ctrl.sendStudentOtp
);

router.post(
  '/student/verify-otp',
  otpLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  ],
  validate,
  ctrl.verifyStudentOtp
);

router.post(
  '/student/refresh',
  [body('refresh_token').notEmpty().withMessage('refresh_token required')],
  validate,
  ctrl.refreshStudentToken
);

router.post(
  '/student/logout',
  [body('refresh_token').notEmpty().withMessage('refresh_token required')],
  validate,
  ctrl.logoutStudent
);

/* ─── Admin Auth ─── */

router.post(
  '/admin/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or Phone is required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  ctrl.adminLogin
);

router.post(
  '/admin/refresh',
  [body('refresh_token').notEmpty().withMessage('refresh_token required')],
  validate,
  ctrl.refreshAdminToken
);

router.post(
  '/admin/logout',
  [body('refresh_token').notEmpty().withMessage('refresh_token required')],
  validate,
  ctrl.logoutAdmin
);

module.exports = router;
