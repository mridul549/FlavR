const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController')
const checkAuth = require('../middlewares/check-auth');

// Webhooks
router.post('/process', paymentController.processPayment)

router.post('/createcoupon', checkAuth, paymentController.generateCouponCode)

module.exports = router;