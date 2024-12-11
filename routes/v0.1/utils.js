const express = require('express')

const router = express.Router()

router.post('/login', function(req,res){
  res.send({
    status: "success login"
  })
})

router.post('/logout', function(req,res){
  res.send({
    status: "success logout"
  })
})

module.exports = router;