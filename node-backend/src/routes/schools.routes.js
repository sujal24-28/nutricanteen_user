'use strict';
const router = require('express').Router();
const { School } = require('../models');

router.get('/', async (req, res, next) => {
  try {
    const schools = await School.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name']
    });
    return res.status(200).json({ success: true, data: schools });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
