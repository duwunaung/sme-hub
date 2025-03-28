const express = require('express')
const { dashboard, barchartDashboard } = require('../../controllers/v0.1/dashboardSubController')

const router = express.Router()

router.get('/barchart', barchartDashboard)
router.get('/', dashboard)


module.exports = router