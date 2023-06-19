const express = require('express');
const router = express.Router();
const mailController = require('./mailController')

router.post('/sendMail', mailController.sendMail)


module.exports = router;