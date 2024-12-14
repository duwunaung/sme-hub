const express = require('express')

const { register } = require("../../controllers/v0.1/utils")


const router = express.Router()

router.post('/register', register)

router.post('/login', function (req, res) {
  res.send({
    status: "success login"
  })
})

router.post('/logout', function (req, res) {
  res.send({
    status: "success logout"
  })
})

module.exports = router;