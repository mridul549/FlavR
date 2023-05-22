const express = require('express');
const router = express.Router();

router.use('/owner', require('./owner'));
router.use('/outlet', require('./outlet'));
router.use('/user', require('./user'));
router.use('/products', require('./products'));

module.exports = router;