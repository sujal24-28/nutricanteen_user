'use strict';

const router = require('express').Router();
const { body, param } = require('express-validator');

const ctrl              = require('../controllers/menu.controller');
const { protectAdmin }  = require('../middlewares/auth.middleware');
const { validate }      = require('../middlewares/validate.middleware');
const { upload }        = require('../middlewares/upload.middleware');

// Public routes
router.get('/', ctrl.listItems);
router.get('/:id', [param('id').isInt().withMessage('Invalid ID')], validate, ctrl.getItem);

// Admin-only routes
router.post(
  '/',
  protectAdmin,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional({ checkFalsy: true }).trim(),
    body('daily_limit').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Daily limit must be a positive integer'),
  ],
  validate,
  ctrl.createItem
);

router.put(
  '/:id',
  protectAdmin,
  upload.single('image'),
  [
    param('id').isInt().withMessage('Invalid ID'),
    body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }),
    body('daily_limit').optional({ checkFalsy: true }).isInt({ min: 1 }),
  ],
  validate,
  ctrl.updateItem
);

router.delete(
  '/:id',
  protectAdmin,
  [param('id').isInt().withMessage('Invalid ID')],
  validate,
  ctrl.deleteItem
);

module.exports = router;
