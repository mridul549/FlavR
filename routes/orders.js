const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const checkAuth = require('../middlewares/check-auth');

router.use('/payments', require('./payments'))

// POST Methods
router.post('/placeOrder', checkAuth, orderController.placeOrder);

// PATCH Methods
router.patch('/deliverOrder', checkAuth, orderController.deliverEntireOrder);
router.patch('/deliveritem', checkAuth, orderController.deliverItem)

// DELETE Methods
router.delete('/deleteall', checkAuth, orderController.deleteAll)

module.exports = router;