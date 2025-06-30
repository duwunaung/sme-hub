const express = require('express')
const exp = require("./../../controllers/v0.1/extTransController/expTrans")

const router = express.Router()

router.get('/:id', exp.getExpense)

router.get('/', exp.listExpenses)

router.post('/create', exp.createExpense)

router.put('/update/:id', exp.updateExpense)

router.delete('/delete/:id', exp.deleteExpense)

router.get('/monthly', exp.getMonthlyExpenses)

module.exports = router