const express = require('express')

const { createExpenseCategory, listExpenseCategory, updateExpenseCategory, deleteExpenseCategory } = require('../../controllers/v0.1/extCatsController')

const router = express.Router();

router.post('/expense/create', createExpenseCategory);
router.get('/expense/list', listExpenseCategory);
router.put('/expense/:id', updateExpenseCategory);
router.delete('/expense/:id', deleteExpenseCategory);

module.exports = router;