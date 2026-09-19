'use strict';

const router = require('express').Router();
const { body } = require('express-validator');

const ctrl           = require('../controllers/wallet.controller');
const { protect }    = require('../middlewares/auth.middleware');
const { validate }   = require('../middlewares/validate.middleware');
const { otpLimiter } = require('../middlewares/rateLimiter.middleware');

router.use(protect);

router.get('/', ctrl.getWallet);

router.post(
  '/topup/order',
  [
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be a positive number'),
  ],
  validate,
  ctrl.createOrder
);

router.post(
  '/topup/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount is required'),
  ],
  validate,
  ctrl.verifyPayment
);

module.exports = router;
