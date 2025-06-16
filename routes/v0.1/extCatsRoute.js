const express = require('express')

const { detailExpCatReport, detailIncCatReport, listAllCatsData, listIncCatUpdate,listExpCatUpdate, getIncCat, getExpCat, createExpenseCategory, listExpenseCategory, updateExpenseCategory, deleteExpenseCategory, createIncomeCategory, updateIncomeCategory, deleteIncomeCategory, listIncomeCategory, restoreIncomeCategory , restoreExpenseCategory , getIncomeCategory , getExpenseCategory , detailExpenseCategory, detailIncomeCategory, listIncCat, listExpCat, listAllCategories} = require('../../controllers/v0.1/extCatsController')

const router = express.Router();

router.post('/expense/create', createExpenseCategory);
router.get('/expense/list', listExpenseCategory);
router.get('/expense/detail/report/:id', detailExpCatReport);
router.get('/expense/detail/:id', detailExpenseCategory);
router.get('/expense/category/:name', getExpCat);
router.get('/expense/:id', getExpenseCategory);
router.put('/expense/:id', updateExpenseCategory);
router.delete('/expense/:id', deleteExpenseCategory);
router.put('/expense/restore/:id', restoreExpenseCategory);
router.get('/expense/update/:parentId', listExpCatUpdate);
router.get('/expense', listExpCat);


router.post('/income/create', createIncomeCategory);
router.get('/income/list', listIncomeCategory);
router.get('/income/detail/report/:id', detailIncCatReport);
router.get('/income/detail/:id', detailIncomeCategory);
router.put('/income/restore/:id', restoreIncomeCategory);
router.get('/income/category/:name', getIncCat);
router.get('/income/:id', getIncomeCategory);
router.put('/income/:id', updateIncomeCategory);
router.delete('/income/:id', deleteIncomeCategory);
router.get('/income/update/:parentId', listIncCatUpdate);
router.get('/income', listIncCat);

router.get('/listall', listAllCatsData)
router.get('/', listAllCategories);

module.exports = router;