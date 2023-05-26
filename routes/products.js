const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const checkAuth = require('../middlewares/check-auth');

router.get('/getProductsOfOutlet', productController.getProductsOfOutlet); // U
router.get('/getProductsByCategory', productController.getProductsByCategory);
router.get('/getSingleProduct', productController.getSingleProduct);
router.get('/getAllCategories', productController.getAllCategories);

router.post('/addProduct', checkAuth, productController.addProduct);

router.patch('/updateProduct/:productid', checkAuth, productController.updateProduct);
router.patch('/updateImage', checkAuth, productController.updateProductImage);

router.delete('/deleteProduct', checkAuth, productController.deleteProduct);

module.exports = router;