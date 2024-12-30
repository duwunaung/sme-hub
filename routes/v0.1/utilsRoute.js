const express = require('express')

// controllers
const { register, login, getSuperAdmins } = require("../../controllers/v0.1/utilsController")


// middlewares
const authenticateToken = require('../../middlewares/authenticateToken')
const authorizeRole = require('../../middlewares/authorizeRole')

const router = express.Router()

router.post('/register', authenticateToken, authorizeRole(['superadmin']), register)
router.get('/users', authenticateToken, authorizeRole(['superadmin']), getSuperAdmins)

router.post('/login', login)

// router.post('/logout', function (req, res) {
//   res.send({
//     status: "success logout"
//   })
// })

module.exports = router;