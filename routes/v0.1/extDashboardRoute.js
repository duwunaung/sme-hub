const express = require('express')
const { overviewDashboard, dashboard, barchartDashboard } = require('../../controllers/v0.1/dashboardSubController')

const router = express.Router()

router.get('/barchart', barchartDashboard)
router.get('/overview', overviewDashboard)
router.get('/', dashboard)


module.exports = router