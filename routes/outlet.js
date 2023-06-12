const outletController = require('../controllers/outletController');
const express          = require('express');
const checkAuth        = require('../middlewares/check-auth');
const router           = express.Router();

// GET Methods
router.get('/getMenuSize', checkAuth, outletController.getMenuSize)
router.get('/getOutlet', checkAuth, outletController.getOutlet)
router.get('/getAllOutlets', outletController.getAllOutlets)

// POST Methods
router.post('/addOutlet', checkAuth, outletController.addOutlet);

// DELETE Methods
router.delete('/deleteOutlet', checkAuth, outletController.deleteOutlet);

// PATCH Methods
router.patch('/updateOutlet/:outletid', checkAuth, outletController.updateOutlet);
router.patch('/updateImage/:outletid', checkAuth, outletController.updateImage)

module.exports = router;