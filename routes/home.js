const express = require('express');
const router = express.Router();

router.use('/owner', require('./owner'));
router.use('/outlet', require('./outlet'));

module.exports = router;