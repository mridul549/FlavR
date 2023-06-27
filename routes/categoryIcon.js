const express = require('express');
const router = express.Router();
const categoryIconController = require('../controllers/categoryIconController')

router.post('/addIcon', categoryIconController.addIcon)
router.get('/getAllIcons', categoryIconController.getAllIcons)

module.exports = router;