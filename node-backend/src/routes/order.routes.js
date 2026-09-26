'use strict';

const router = require('express').Router();
const { body, param } = require('express-validator');

const ctrl             = require('../controllers/order.controller');
const { protect, protectAdmin, protectAny } = require('../middlewares/auth.middleware');
const { validate }     = require('../middlewares/validate.middleware');

// Place order (student)
router.post(
  '/',
  protect,
  [
    body('pickupTime').optional().isISO8601().withMessage('pickupTime must be a valid ISO date'),
    body('note').optional().trim().isLength({ max: 300 }),
    body('items').optional().isArray({ min: 1, max: 50 }).withMessage('items must be a non-empty array'),
    body('items.*.menu_item_id').optional().isInt({ min: 1 }).withMessage('Invalid menu item ID'),
    body('items.*.quantity').optional().isInt({ min: 1, max: 20 }).withMessage('Invalid quantity'),
  ],
  validate,
  ctrl.placeOrder
);

// List orders - student sees own, admin sees all
router.get('/', protectAny, ctrl.listOrders);

// Get single order
router.get(
  '/:id',
  protect,
  [param('id').isInt().withMessage('Invalid order ID')],
  validate,
  ctrl.getOrder
);

// Update status (admin)
router.patch(
  '/:id/status',
  protectAdmin,
  [
    param('id').isInt().withMessage('Invalid order ID'),
    body('status')
      .isIn(['accepted', 'confirmed', 'ready', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validate,
  ctrl.updateStatus
);

// Cancel order (student only)
router.post(
  '/:id/cancel',
  protect,
  [param('id').isInt().withMessage('Invalid order ID')],
  validate,
  ctrl.cancelOrder
);

module.exports = router;
