const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController')

router.get('/getCategory', categoryController.getCategory)
router.post('/addCategory', categoryController.addCategory)
router.patch('/updateCategory', categoryController.updateCategory)

module.exports = router;