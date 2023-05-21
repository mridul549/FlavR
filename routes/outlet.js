const outletController = require('../controllers/outletController');
const express          = require('express');
const checkAuth        = require('../middlewares/check-auth');
const router           = express.Router();

router.post('/addOutlet', checkAuth, outletController.addOutlet);

module.exports = router;