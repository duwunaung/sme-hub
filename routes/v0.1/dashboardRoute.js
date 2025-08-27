const express = require("express")

// controllers
const { dashboard } = require("../../controllers/v0.1/dashboardController")

const router = express.Router()

router.get('/', dashboard)

module.exports = router