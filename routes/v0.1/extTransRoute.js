const express = require('express')
const { listAllTrans, listAllTransactions  } = require('../../controllers/v0.1/extTransController/allTrans')

const router = express.Router()

router.get('/all', listAllTrans)
router.get('/', listAllTransactions)


module.exports = router