const express = require("express")
const inc = require("./../../controllers/v0.1/extTransController/incTrans")
const router = express.Router()

router.post('/create', inc.createIncome)
router.put('/update/:id', inc.updateIncome)
router.delete('/delete/:id', inc.deleteIncome)
router.get('/:id', inc.getIncome)
router.get('/', inc.listIncomes)
router.get('/monthly', inc.getMonthlyIncomes)
module.exports = router