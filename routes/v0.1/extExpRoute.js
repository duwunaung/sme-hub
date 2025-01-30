const express = require('express')
const { createExpense, updateExpense, deleteExpense, listExpenses, getMonthlyExpenses, getExpense } = require('../../controllers/v0.1/extTransController')

const router = express.Router()

router.get('/:id', getExpense)

router.get('/', listExpenses)

router.post('/create', createExpense)

router.put('/update/:id', updateExpense)

router.delete('/delete/:id', deleteExpense)

router.get('/monthly', getMonthlyExpenses)

module.exports = router