const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const checkAuth = require('../middlewares/check-auth');

router.get('/getProductsOfOutlet', productController.getProductsOfOutlet);
router.post('/addProduct', checkAuth, productController.addProduct);

module.exports = router;