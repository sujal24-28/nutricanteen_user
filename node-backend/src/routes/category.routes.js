'use strict';

const router = require('express').Router();
const { body, param } = require('express-validator');

const ctrl             = require('../controllers/category.controller');
const { protectAdmin } = require('../middlewares/auth.middleware');
const { validate }     = require('../middlewares/validate.middleware');

// Public route to list categories for student app and admin
router.get('/', ctrl.listCategories);

// Admin-only routes
router.post(
  '/',
  protectAdmin,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').optional().trim(),
  ],
  validate,
  ctrl.createCategory
);

router.delete(
  '/:id',
  protectAdmin,
  [param('id').isInt().withMessage('Invalid Category ID')],
  validate,
  ctrl.deleteCategory
);

module.exports = router;
