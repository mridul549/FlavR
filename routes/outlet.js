const outletController = require('../controllers/outletController');
const express          = require('express');
const checkAuth        = require('../middlewares/check-auth');
const router           = express.Router();

router.get('/getMenuSize', checkAuth, outletController.getMenuSize)

router.post('/addOutlet', checkAuth, outletController.addOutlet);

router.delete('/deleteOutlet', checkAuth, outletController.deleteOutlet);

router.patch('/updateOutlet/:outletid', checkAuth, outletController.updateOutlet);

module.exports = router;