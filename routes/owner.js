const express         = require('express');
const router          = express.Router();
const ownerController = require('../controllers/ownerController');
const checkAuth = require('../middlewares/check-auth');

router.get('/getOutlets', checkAuth, ownerController.getOutlets);
router.get('/ownerprofile', ownerController.getOwnerProfile);

router.patch('/addOutlet', checkAuth, ownerController.addOutlet);
router.patch('/updateImage', checkAuth, ownerController.updateImage);
router.patch('/updateowner', checkAuth, ownerController.updateOwner)
router.patch('/resetpassword', checkAuth, ownerController.resetPassword)
router.patch('/verifyowner', ownerController.verifyOwner)

// AUTH routes
router.post('/signup', ownerController.signup);
router.post('/login', ownerController.login);
router.post('/googleAuth', ownerController.google_Login_Signup)
router.get('/getnewtoken', checkAuth, ownerController.getNewToken)

module.exports = router;