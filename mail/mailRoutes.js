const express = require('express');
const router = express.Router();
const mailController = require('./mailController')

router.post('/resendotp', mailController.reSendOTP)
router.post('/verifyotp', mailController.verifyOTP)
router.post('/passwordreset', mailController.sendPasswordResetMail)

module.exports = router;