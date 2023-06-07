const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController')
const checkAuth = require('../middlewares/check-auth');

// Webhooks
router.post('/process', paymentController.processPayment)

module.exports = router;