const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const checkAuth = require('../middlewares/check-auth');

router.use('/payments', require('./payments'))

// POST Methods
router.post('/placeOrder', checkAuth, orderController.placeOrder);
router.post('/deliverOrder', checkAuth, orderController.deliverEntireOrder);

// PATCH Methods
router.patch('/deliveritem', checkAuth, orderController.deliverItem)

// DELETE Methods
router.delete('/deleteall', checkAuth, orderController.deleteAll)

module.exports = router;