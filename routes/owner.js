const express         = require('express');
const router          = express.Router();
const ownerController = require('../controllers/ownerController');

router.post('/signup', ownerController.signup);
router.post('/login', ownerController.login);


module.exports = router;