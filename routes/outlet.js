const outletController = require('../controllers/outletController');
const express          = require('express');
const checkAuth        = require('../middlewares/check-auth');
const router           = express.Router();

router.get('/getMenuSize', checkAuth, outletController.getMenuSize)
router.get('/getOutlet', checkAuth, outletController.getOutlet)

router.post('/addOutlet', checkAuth, outletController.addOutlet);

router.delete('/deleteOutlet', checkAuth, outletController.deleteOutlet);

router.patch('/updateOutlet/:outletid', checkAuth, outletController.updateOutlet);
router.patch('/updateImage/:outletid', checkAuth, outletController.updateImage)

module.exports = router;