const express = require('express');
const router = express.Router();
const categoryIconController = require('../controllers/categoryIconController')

router.get('/allicons', categoryIconController.getAllIcons)
router.post('/addIcon', categoryIconController.addIcon)

module.exports = router;