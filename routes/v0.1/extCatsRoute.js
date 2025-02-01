const express = require('express')

const { createExpenseCategory, listExpenseCategory, updateExpenseCategory, deleteExpenseCategory, createIncomeCategory, updateIncomeCategory, deleteIncomeCategory, listIncomeCategory, restoreIncomeCategory , restoreExpenseCategory , getIncomeCategory , getExpenseCategory , detailExpenseCategory, detailIncomeCategory} = require('../../controllers/v0.1/extCatsController')

const router = express.Router();

router.post('/expense/create', createExpenseCategory);
router.get('/expense/list', listExpenseCategory);
router.get('/expense/detail/:id', detailExpenseCategory);
router.get('/expense/:id', getExpenseCategory);
router.put('/expense/:id', updateExpenseCategory);
router.delete('/expense/:id', deleteExpenseCategory);
router.put('/expense/restore/:id', restoreExpenseCategory);



router.post('/income/create', createIncomeCategory);
router.get('/income/list', listIncomeCategory);
router.get('/income/detail/:id', detailIncomeCategory);
router.get('/income/:id', getIncomeCategory);
router.put('/income/:id', updateIncomeCategory);
router.delete('/income/:id', deleteIncomeCategory);
router.put('/income/restore/:id', restoreIncomeCategory);

module.exports = router;