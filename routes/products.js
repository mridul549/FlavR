const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const checkAuth = require('../middlewares/check-auth');

router.get('/getProductsOfOutlet', productController.getProductsOfOutlet); // U
router.get('/getProductsByCategory', productController.getProductsByCategory); // U
router.get('/getSingleProduct', productController.getSingleProduct); // U
router.get('/getAllCategories', productController.getAllCategories); // U
router.get('/getVariants', productController.getAllVariants)
router.get('/getAllProdsAllCats', productController.getAllProductsCategoryAccording)

router.post('/addProduct', checkAuth, productController.addProduct);

router.patch('/updateProduct/:productid', checkAuth, productController.updateProduct);
router.patch('/updateImage', checkAuth, productController.updateProductImage);
router.patch('/updateVariants', checkAuth, productController.updateVariants)

router.delete('/deleteProduct', checkAuth, productController.deleteProduct);

module.exports = router;