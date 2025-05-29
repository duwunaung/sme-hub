const express = require('express')
const {getDetailsReportTrans, getDetailsReport, getDetailReport, getSalesListAll, getSalespersonListAll,deleteSalesperson, restoreSalesperson, getSalespersonName, getSalesperson, getSalespersonList, createSalesperson , updateSalesperson } = require('../../controllers/v0.1/subOrgController')

const router = express.Router()

router.get('/detailreporttrans/:id', getDetailsReportTrans)
router.get('/detailreports/:id', getDetailsReport)
router.get('/detailreport/:id', getDetailReport)
router.get('/list/:name', getSalespersonName)
router.get('/all', getSalespersonListAll)
router.get('/listall', getSalesListAll)
router.get('/list', getSalespersonList)
router.put('/update/:id', updateSalesperson)
router.post('/create', createSalesperson)
router.delete('/delete/:id', deleteSalesperson)
router.put('/restore/:id', restoreSalesperson)
router.get('/:id', getSalesperson)


module.exports = router