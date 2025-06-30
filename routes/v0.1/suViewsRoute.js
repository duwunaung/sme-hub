const express = require('express')
const allTrans = require("./../../controllers/v0.1/subscribersController/allTrans")
const dashboard = require("./../../controllers/v0.1/subscribersController/dashboard")
const expCat = require("./../../controllers/v0.1/subscribersController/expCat")
const expTrans = require("./../../controllers/v0.1/subscribersController/expTrans")
const incCat = require("./../../controllers/v0.1/subscribersController/incCat")
const incTrans = require("./../../controllers/v0.1/subscribersController/incTrans")
const loginOut = require("./../../controllers/v0.1/subscribersController/loginOut")
const profile = require("./../../controllers/v0.1/subscribersController/profile")
const report = require("./../../controllers/v0.1/subscribersController/report")
const sales = require("./../../controllers/v0.1/subscribersController/salesperson")
const checkSubscriberSession = require('../../middlewares/viewSubscribers');
const tmpSession = require('../../middlewares/tmp');
const {upload, handleUpload} = require("../../utils/fileupload");
const router = express.Router();

router.use('/login', loginOut.login)
router.use('/logout', loginOut.logout)

router.use('/transaction/income/detail/:id', checkSubscriberSession, incTrans.detailIncomeTrans )
router.use('/transaction/income/update/:id', checkSubscriberSession,handleUpload("receipt"), incTrans.updateIncomeTrans )
router.use('/transaction/income/create', checkSubscriberSession,handleUpload("receipt"), incTrans.createIncomeTrans )
router.use('/transaction/income', checkSubscriberSession, incTrans.listIncomeTrans )

router.use('/transaction/expense/detail/:id', checkSubscriberSession, expTrans.detailExpenseTrans )
router.use('/transaction/expense/update/:id', checkSubscriberSession,handleUpload("receipt"), expTrans.updateExpenseTrans )
router.use('/transaction/expense/create', checkSubscriberSession, handleUpload("receipt"),  expTrans.createExpenseTrans )
router.use('/transaction/expense', checkSubscriberSession, expTrans.listExpenseTrans )

router.use('/transaction/transactions', checkSubscriberSession, allTrans.listAllTransactions )

router.use('/category/transaction/income/detail/:id', checkSubscriberSession, incTrans.detailIncomeTrans )
router.use('/category/transaction/income/update/:id', checkSubscriberSession,handleUpload("receipt"), incTrans.updateIncomeTransCat )
router.use('/category/income/create', checkSubscriberSession, incCat.createIncomeCat )
router.use('/category/income/detail/:id', checkSubscriberSession, incCat.detailIncomeCat )
router.use('/category/income/update/:id', checkSubscriberSession, incCat.updateIncomeCat )
router.use('/category/income/delete/:id', checkSubscriberSession, incCat.deleteIncomeCat )
router.use('/category/income/restore/:id', checkSubscriberSession, incCat.restoreIncomeCat )
router.use('/category/income', checkSubscriberSession, incCat.listIncomeCat )

router.use('/category/transaction/expense/detail/:id', checkSubscriberSession, expTrans.detailExpenseTrans )
router.use('/category/transaction/expense/update/:id', checkSubscriberSession,handleUpload("receipt"), expTrans.updateExpenseTransCat )
router.use('/category/expense/create', checkSubscriberSession, expCat.createExpenseCat )
router.use('/category/expense/detail/:id', checkSubscriberSession, expCat.detailExpenseCat )
router.use('/category/expense/update/:id', checkSubscriberSession, expCat.updateExpenseCat )
router.use('/category/expense/delete/:id', checkSubscriberSession, expCat.deleteExpenseCat )
router.use('/category/expense/restore/:id', checkSubscriberSession, expCat.restoreExpenseCat )
router.use('/category/expense', checkSubscriberSession, expCat.listExpenseCat )

router.use('/salesperson/delete/:id', checkSubscriberSession, sales.deleteSalesperson )
router.use('/salesperson/restore/:id', checkSubscriberSession, sales.restoreSalesperson )
router.use('/salesperson/update/:id', checkSubscriberSession, sales.updateSalesperson )
router.use('/salesperson/create', checkSubscriberSession, sales.createSalesperson )
router.use('/salesperson', checkSubscriberSession, sales.listSalesperson )

router.use('/report/salesperson/trans/:id', checkSubscriberSession, report.reportSalesDetailTransPage )
router.use('/report/salesperson/:id', checkSubscriberSession, report.reportSalesDetailPage )
router.use('/report/salesperson', checkSubscriberSession, report.reportSalesPage )
router.use('/report/date', checkSubscriberSession, report.reportDatePage )
router.use('/report/category/income/:id', checkSubscriberSession, report.reportCatIncDetailPage )
router.use('/report/category/expense/:id', checkSubscriberSession, report.reportCatExpDetailPage )
router.use('/report/category', checkSubscriberSession, report.reportCatPage )
router.use('/report', checkSubscriberSession, report.reportMainPage )

router.use('/user/profile', checkSubscriberSession, profile.editUsrProfile)

router.use('/organization/profile', checkSubscriberSession, handleUpload("logo"), profile.editOrgProfile)

router.use('/home', checkSubscriberSession, dashboard.dashboardSubscriber) 

router.use('/', (req, res) => {
    res.redirect('/subscriber/home');
});

module.exports = router;
