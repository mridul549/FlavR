const express = require('express')
const router = express.Router()
const chartController = require('../controllers/chartController')

router.get('/testing', chartController.testing)

module.exports = router