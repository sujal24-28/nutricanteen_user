'use strict';

const router = require('express').Router();

router.use('/auth',    require('./auth.routes'));
router.use('/student', require('./student.routes'));
router.use('/wallet',  require('./wallet.routes'));
router.use('/menu',    require('./menu.routes'));
router.use('/cart',    require('./cart.routes'));
router.use('/orders',  require('./order.routes'));
router.use('/admin',   require('./admin.routes'));
router.use('/schools', require('./schools.routes'));

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

module.exports = router;
