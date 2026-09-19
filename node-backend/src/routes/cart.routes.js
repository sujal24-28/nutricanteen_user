'use strict';

const router = require('express').Router();
const { body, param } = require('express-validator');

const ctrl         = require('../controllers/cart.controller');
const { protect }  = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');

router.use(protect);

router.get('/', ctrl.getCart);

router.post(
  '/',
  [
    body('item_id').isInt({ min: 1 }).withMessage('Valid item_id required'),
    body('quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20'),
  ],
  validate,
  ctrl.upsertItem
);

router.delete(
  '/:itemId',
  [param('itemId').isInt().withMessage('Invalid item ID')],
  validate,
  ctrl.removeItem
);

router.delete('/', ctrl.clearCart);

module.exports = router;
