const express         = require('express');
const router          = express.Router();
const ownerController = require('../controllers/ownerController');
const checkAuth = require('../middlewares/check-auth');

router.get('/getOutlets', checkAuth, ownerController.getOutlets);

router.post('/signup', ownerController.signup);
router.post('/login', ownerController.login);

router.patch('/addOutlet', checkAuth, ownerController.addOutlet);

module.exports = router;