const express = require('express');
const router = express.Router();
const qrcont = require('../controllers/qrcode');

router.use('/owner', require('./owner'));
router.use('/outlet', require('./outlet'));
router.use('/user', require('./user'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));

router.post('/createqr', qrcont.qrgenerate)

module.exports = router;