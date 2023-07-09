const express = require('express')
const router = express.Router()
const chartController = require('../controllers/chartController')
const checkAuth = require('../middlewares/check-auth')

router.get('/testing', chartController.testing)

router.get('/revenue/day', chartController.getRevenueByDay)
router.get('/revenue/month', chartController.getRevenueByMonth)
router.get('/revenue/year', chartController.getRevenueByYear)
router.get('/compareOutlets', checkAuth, chartController.compareOwnerOutlets)

module.exports = router