const express = require("express")
const { dashboard } = require("../../controllers/v0.1/dashboard")

const router = express.Router()

router.get('/', dashboard)

module.exports = router