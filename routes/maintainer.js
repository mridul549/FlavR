const express         = require('express');
const router          = express.Router();
const maintainerController  = require('../controllers/maintainerController');
const checkAuth       = require('../middlewares/check-auth') 

// Auth
router.post('/signup', maintainerController.signup);
router.post('/login', maintainerController.login);

// GET methods
router.get('/maintainerprofile', checkAuth, maintainerController.getMaintainerProfile);

// POST methods

// PATCH methods
router.patch('/updateImage', checkAuth, maintainerController.updateImage);
router.patch('/updateMaintainer', checkAuth, maintainerController.updateMaintainer);

// DELETE methods
router.delete('/deleteImage', checkAuth, maintainerController.deleteMaintainerImage)

module.exports = router;