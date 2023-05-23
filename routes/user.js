const express         = require('express');
const router          = express.Router();
const userController  = require('../controllers/userController');
const checkAuth       = require('../middlewares/check-auth') 

// Auth
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// GET methods
router.get('/getCartItems', checkAuth, userController.getCartItems);
router.get('/getCartSize', checkAuth, userController.getCartSize);

// POST methods
router.post('/addOneProductToCart', checkAuth, userController.addOneProductToCart);
router.post('/addManyProductsToCart', checkAuth, userController.addProductsToCart);

// PATCH methods
router.patch('/updateQuantity', checkAuth, userController.updateQuantity);

// DELETE methods
router.patch('/clearCart', checkAuth, userController.clearCart);

module.exports = router;