const express = require('express')
const { login, logout, orgs } = require("../../controllers/v0.1/viewsController")

const checkSuperAdminSession = require('../../middlewares/viewSuperAdmin')

const router = express.Router();

router.use('/login', login)
router.use('/logout', logout)

router.use('/organizations', checkSuperAdminSession, orgs)
router.use('/dashboard', checkSuperAdminSession, (req, res) => {
    res.render('superadmin/dashboard', { token: req.session.token, user: req.session.user })
})

module.exports = router;
