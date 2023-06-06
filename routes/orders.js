const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const checkAuth = require('../middlewares/check-auth');

router.post('/placeOrder', checkAuth, orderController.placeOrder);
router.delete('/deleteall', checkAuth, orderController.deleteAll)

// Webhooks
router.post('/catchreq', orderController.catchRequest)
module.exports = router;