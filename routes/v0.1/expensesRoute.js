const express = require('express')

const router = express.Router()

router.get('/', function(req,res){
  res.send({
    status: "success expenses"
  })
})

router.post('/', function(req,res){
  res.send({
    status: "success expenses"
  })
})

router.get('/categories', function(req,res){
  res.send({
    status: "success expenses categories"
  })
})

router.post('/categories/add', function(req,res){
  res.send({
    status: "success category add"
  })
})

router.post('/categories/edit', function(req,res){
  res.send({
    status: "success category edit"
  })
})

router.delete('/categories/delete', function(req,res){
  res.send({
    status: "success categories delete"
  })
})

router.post('/add', function(req,res){
  res.send({
    status: "success expense add"
  })
})

router.post('/edit', function(req,res){
  res.send({
    status: "success expense edit"
  })
})

router.delete('/delete', function(req,res){
  res.send({
    status: "success expense delete"
  })
})

module.exports = router