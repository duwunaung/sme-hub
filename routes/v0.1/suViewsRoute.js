const express = require('express')
const { updateExpenseTransCat, updateIncomeTransCat, dashboardSubscriber, deleteSalesperson, restoreSalesperson, updateSalesperson, createSalesperson, listSalesperson, editUsrProfile, editOrgProfile, login, logout, listExpenseCat, createExpenseCat, createIncomeCat, listIncomeCat , deleteIncomeCat, restoreIncomeCat , deleteExpenseCat, restoreExpenseCat , updateIncomeCat, updateExpenseCat, listIncomeTrans, listExpenseTrans , createIncomeTrans, createExpenseTrans , updateIncomeTrans, updateExpenseTrans , detailIncomeTrans, detailExpenseTrans, detailIncomeCat, detailExpenseCat, listAllTransactions} = require("../../controllers/v0.1/subscribersController")

const checkSubscriberSession = require('../../middlewares/viewSubscribers');
const tmpSession = require('../../middlewares/tmp');
const {upload, handleUpload} = require("../../utils/fileupload");
const router = express.Router();

router.use('/login', login)
router.use('/logout', logout)

router.use('/transaction/income/detail/:id', checkSubscriberSession, detailIncomeTrans )
router.use('/transaction/income/update/:id', checkSubscriberSession,handleUpload("receipt"), updateIncomeTrans )
router.use('/transaction/income/create', checkSubscriberSession,handleUpload("receipt"), createIncomeTrans )
router.use('/transaction/income', checkSubscriberSession, listIncomeTrans )

router.use('/transaction/expense/detail/:id', checkSubscriberSession, detailExpenseTrans )
router.use('/transaction/expense/update/:id', checkSubscriberSession,handleUpload("receipt"), updateExpenseTrans )
router.use('/transaction/expense/create', checkSubscriberSession, handleUpload("receipt"),  createExpenseTrans )
router.use('/transaction/expense', checkSubscriberSession, listExpenseTrans )

router.use('/transaction/transactions', checkSubscriberSession, listAllTransactions )

router.use('/category/transaction/income/detail/:id', checkSubscriberSession, detailIncomeTrans )
router.use('/category/transaction/income/update/:id', checkSubscriberSession,handleUpload("receipt"), updateIncomeTransCat )
router.use('/category/income/create', checkSubscriberSession, createIncomeCat )
router.use('/category/income/detail/:id', checkSubscriberSession, detailIncomeCat )
router.use('/category/income/update/:id', checkSubscriberSession, updateIncomeCat )
router.use('/category/income/delete/:id', checkSubscriberSession, deleteIncomeCat )
router.use('/category/income/restore/:id', checkSubscriberSession, restoreIncomeCat )
router.use('/category/income', checkSubscriberSession, listIncomeCat )

router.use('/category/transaction/expense/detail/:id', checkSubscriberSession, detailExpenseTrans )
router.use('/category/transaction/expense/update/:id', checkSubscriberSession,handleUpload("receipt"), updateExpenseTransCat )
router.use('/category/expense/create', checkSubscriberSession, createExpenseCat )
router.use('/category/expense/detail/:id', checkSubscriberSession, detailExpenseCat )
router.use('/category/expense/update/:id', checkSubscriberSession, updateExpenseCat )
router.use('/category/expense/delete/:id', checkSubscriberSession, deleteExpenseCat )
router.use('/category/expense/restore/:id', checkSubscriberSession, restoreExpenseCat )
router.use('/category/expense', checkSubscriberSession, listExpenseCat )

router.use('/salesperson/delete/:id', checkSubscriberSession, deleteSalesperson )
router.use('/salesperson/restore/:id', checkSubscriberSession, restoreSalesperson )
router.use('/salesperson/update/:id', checkSubscriberSession, updateSalesperson )
router.use('/salesperson/create', checkSubscriberSession, createSalesperson )
router.use('/salesperson', checkSubscriberSession, listSalesperson )

router.use('/user/profile', checkSubscriberSession, editUsrProfile)

router.use('/organization/profile', checkSubscriberSession, handleUpload("logo"), editOrgProfile)

router.use('/home', checkSubscriberSession, dashboardSubscriber) 

router.use('/', (req, res) => {
    res.redirect('/subscriber/home');
});

module.exports = router;
