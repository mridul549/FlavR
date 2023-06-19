const express = require('express');
const router = express.Router();
const mailController = require('./mailController')

router.post('/resendotp', mailController.reSendOTP)

module.exports = router;