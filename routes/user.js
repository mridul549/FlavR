const express         = require('express');
const router          = express.Router();
const userController  = require('../controllers/userController');
const checkAuth       = require('../middlewares/check-auth') 

// Auth
router.get('/getnewtoken', checkAuth, userController.getNewToken)
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/googleAuth', userController.google_Login_Signup)

// GET methods
router.get('/getCartItems', checkAuth, userController.getCartItems);
router.get('/getCartSize', checkAuth, userController.getCartSize);
router.get('/userprofile', checkAuth, userController.getUserProfile);

// POST methods
router.post('/addOneProductToCart', checkAuth, userController.addOneProductToCart);
router.post('/addProductsToCart', checkAuth, userController.addProductsToCart);

// PATCH methods
router.patch('/updateQuantity', checkAuth, userController.updateQuantity);
router.patch('/clearCart', checkAuth, userController.clearCart);
router.patch('/removeProductCart', checkAuth, userController.removeProductCart);
router.patch('/updateImage', checkAuth, userController.updateImage);
router.patch('/updatefcm', checkAuth, userController.updateFcmToken)

// DELETE methods

module.exports = router;