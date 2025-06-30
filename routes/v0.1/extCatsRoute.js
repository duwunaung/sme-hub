const express = require('express')
const cats = require("./../../controllers/v0.1/extCatsController/categories")
const exp = require("./../../controllers/v0.1/extCatsController/expcat")
const inc = require("./../../controllers/v0.1/extCatsController/inccat")
const rep = require("./../../controllers/v0.1/extCatsController/reportcat")
const router = express.Router();

router.post('/expense/create', exp.createExpenseCategory);
router.get('/expense/list', exp.listExpenseCategory);
router.get('/expense/detail/report/:id', rep.detailExpCatReport);
router.get('/expense/detail/:id', exp.detailExpenseCategory);
router.get('/expense/category/:name', exp.getExpCat);
router.get('/expense/:id', exp.getExpenseCategory);
router.put('/expense/:id', exp.updateExpenseCategory);
router.delete('/expense/:id', exp.deleteExpenseCategory);
router.put('/expense/restore/:id', exp.restoreExpenseCategory);
router.get('/expense/update/:parentId', exp.listExpCatUpdate);
router.get('/expense', exp.listExpCat);


router.post('/income/create', inc.createIncomeCategory);
router.get('/income/list', inc.listIncomeCategory);
router.get('/income/detail/report/:id', rep.detailIncCatReport);
router.get('/income/detail/:id', inc.detailIncomeCategory);
router.put('/income/restore/:id', inc.restoreIncomeCategory);
router.get('/income/category/:name', inc.getIncCat);
router.get('/income/:id', inc.getIncomeCategory);
router.put('/income/:id', inc.updateIncomeCategory);
router.delete('/income/:id', inc.deleteIncomeCategory);
router.get('/income/update/:parentId', inc.listIncCatUpdate);
router.get('/income', inc.listIncCat);

router.get('/listall', cats.listAllCatsData)
router.get('/', cats.listAllCategories);

module.exports = router;