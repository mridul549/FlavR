const express         = require('express');
const router          = express.Router();
const userController  = require('../controllers/userController');
const checkAuth       = require('../middlewares/check-auth') 

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/addOneProductToCart', checkAuth, userController.addOneProductToCart);

module.exports = router;