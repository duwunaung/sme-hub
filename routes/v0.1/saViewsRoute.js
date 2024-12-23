const express = require('express')
const { login, logout } = require("../../controllers/v0.1/viewsController")

const checkSuperAdminSession = require('../../middlewares/viewSuperAdmin')

const router = express.Router();

router.use('/login', login)
router.use('/logout', logout)

router.use('/dashboard', checkSuperAdminSession, (req, res) => {
    res.render('superadmin/index', { token: req.session.token, user: req.session.user })
})

module.exports = router;
