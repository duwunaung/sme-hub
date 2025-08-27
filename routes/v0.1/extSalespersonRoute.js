const express = require('express')
const sales = require("./../../controllers/v0.1/subOrgController/salesperson")
const report = require("./../../controllers/v0.1/subOrgController/report")
const router = express.Router()

router.get('/detailreporttrans/:id', report.getDetailsReportTrans)
router.get('/detailreports/:id', report.getDetailsReport)
router.get('/detailreport/:id', report.getDetailReport)
router.get('/list/:name', sales.getSalespersonName)
router.get('/all', sales.getSalespersonListAll)
router.get('/listall', sales.getSalesListAll)
router.get('/list', sales.getSalespersonList)
router.put('/update/:id', sales.updateSalesperson)
router.post('/create', sales.createSalesperson)
router.delete('/delete/:id', sales.deleteSalesperson)
router.put('/restore/:id', sales.restoreSalesperson)
router.get('/:id', sales.getSalesperson)


module.exports = router