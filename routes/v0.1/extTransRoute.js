const express = require('express')
const { listAllTransactions  } = require('../../controllers/v0.1/extTransController')

const router = express.Router()

router.get('/', listAllTransactions)


module.exports = router