const express = require('express')
const { getSalespersonListAll,deleteSalesperson, restoreSalesperson, getSalespersonName, getSalesperson, getSalespersonList, createSalesperson , updateSalesperson } = require('../../controllers/v0.1/subOrgController')

const router = express.Router()

router.get('/list/:name', getSalespersonName)
router.get('/all', getSalespersonListAll)
router.get('/list', getSalespersonList)
router.put('/update/:id', updateSalesperson)
router.post('/create', createSalesperson)
router.delete('/delete/:id', deleteSalesperson)
router.put('/restore/:id', restoreSalesperson)
router.get('/:id', getSalesperson)


module.exports = router