const express = require('express')

const { register, login } = require("../../controllers/v0.1/utils")


const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.post('/logout', function (req, res) {
  res.send({
    status: "success logout"
  })
})

module.exports = router;