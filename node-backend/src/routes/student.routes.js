'use strict';

const router = require('express').Router();
const { body } = require('express-validator');

const ctrl             = require('../controllers/student.controller');
const { protect }      = require('../middlewares/auth.middleware');
const { validate }     = require('../middlewares/validate.middleware');

const { upload } = require('../middlewares/upload.middleware');

router.use(protect);

router.get('/profile', ctrl.getProfile);

router.put(
  '/profile',
  [
    body('phone')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
  ],
  validate,
  ctrl.updateProfile
);

module.exports = router;
