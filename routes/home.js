const express = require('express');
const router = express.Router();

router.use('/owner', require('./owner'));
router.use('/outlet', require('./outlet'));
router.use('/user', require('./user'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/seq', require('./sequence'))

module.exports = router;