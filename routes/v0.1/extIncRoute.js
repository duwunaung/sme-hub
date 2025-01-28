const express = require("express")

const { createIncome, updateIncome, deleteIncome, listIncomes, getMonthlyIncomes , getIncome} =  require("../../controllers/v0.1/extTransController")

const router = express.Router()

// router.get('/', function(req,res){
//   res.send({
//     status: "Success income"
//   })
// })

// router.post('/', function(req,res){
//   res.send({
//     status: "Success income"
//   })
// })

// router.get('/categories', function(req,res){
//   res.send({
//     status: "Success income categories"
//   })
// })

// router.post('/categories/add', function(req,res){
//   res.send({
//     status: "success category add"
//   })
// })

// router.post('/categories/edit', function(req,res){
//   res.send({
//     status: "success category edit"
//   })
// })

// router.delete('/categories/delete', function(req,res){
//   res.send({
//     status: "success category delete"
//   })
// })

// router.post('/add', function(req,res){
//   res.send({
//     status: "success income add"
//   })
// })

// router.post('/edit', function(req,res){
//   res.send({
//     status: "success income edit"
//   })
// })

// router.delete('/delete', function(req,res){
//   res.send({
//     status: "success income delete"
//   })
// })

router.post('/create', createIncome)
router.put('/update/:id', updateIncome)
router.delete('/delete/:id', deleteIncome)
router.get('/:id', getIncome)
router.get('/', listIncomes)
router.get('/monthly', getMonthlyIncomes)
module.exports = router