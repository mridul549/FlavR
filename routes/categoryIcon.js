const express = require('express');
const router = express.Router();
const categoryIconController = require('../controllers/categoryIconController')

router.post('/addIcon', categoryIconController.addIcon)

module.exports = router;