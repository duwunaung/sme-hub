const express = require('express')

const { createExpenseCategory, listExpenseCategory, updateExpenseCategory, deleteExpenseCategory, createIncomeCategory, updateIncomeCategory, deleteIncomeCategory, listIncomeCategory } = require('../../controllers/v0.1/extCatsController')

const router = express.Router();

router.post('/expense/create', createExpenseCategory);
router.get('/expense/list', listExpenseCategory);
router.put('/expense/:id', updateExpenseCategory);
router.delete('/expense/:id', deleteExpenseCategory);



router.post('/income/create', createIncomeCategory);
router.get('/income/list', listIncomeCategory);
router.put('/income/:id', updateIncomeCategory);
router.delete('/income/:id', deleteIncomeCategory);

module.exports = router;