const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const checkAuth = require('../middlewares/check-auth');

router.get('/getProductsOfOutlet', productController.getProductsOfOutlet);
router.get('/getProductsByCategory', productController.getProductsByCategory);
router.get('/getSingleProduct', productController.getSingleProduct);
router.get('/getAllCategories', productController.getAllCategories)

router.post('/addProduct', checkAuth, productController.addProduct)


module.exports = router;