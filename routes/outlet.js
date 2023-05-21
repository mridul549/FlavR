const outletController = require('../controllers/outletController');
const express          = require('express');
const outlet = require('../models/outlet');
const router           = express.Router();

router.post('/addOutlet', outletController.addOutlet);

module.exports = router;