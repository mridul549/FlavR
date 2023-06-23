const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const checkAuth = require('../middlewares/check-auth');

router.use('/payments', require('./payments'))

// GET Methods
router.get('/getOrder', orderController.getOrder)
router.get('/getorders', checkAuth, orderController.getOrders)
router.get('/getincomporder', checkAuth, orderController.inCompleteOrders)

// POST Methods
router.post('/placeOrder', checkAuth, orderController.placeOrder);
router.post('/checkfb', orderController.checkFB)

// PATCH Methods
router.patch('/deliverOrder', checkAuth, orderController.deliverEntireOrder);
router.patch('/deliveritem', checkAuth, orderController.deliverItem)
router.patch('/orderconfrej', checkAuth, orderController.order_confirm_reject)
router.patch('/orderReady', checkAuth, orderController.orderReady)

// DELETE Methods
router.delete('/deleteall', checkAuth, orderController.deleteAll)

module.exports = router;