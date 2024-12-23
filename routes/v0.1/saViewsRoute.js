const express = require('express')
const { login, logout, orgs, restoreOrg, deleteOrg, updateOrg } = require("../../controllers/v0.1/viewsController")

const checkSuperAdminSession = require('../../middlewares/viewSuperAdmin');
const tmpSession = require('../../middlewares/tmp');
const router = express.Router();

router.use('/login', login)
router.use('/logout', logout)

router.use('/organizations/restore/:id', checkSuperAdminSession, restoreOrg)
router.use('/organizations/delete/:id', checkSuperAdminSession, deleteOrg)
router.use('/organizations/update/:id', checkSuperAdminSession, updateOrg)
router.use('/organizations', checkSuperAdminSession, orgs)


router.use('/dashboard', checkSuperAdminSession, (req, res) => {
    res.render('superadmin/dashboard', { token: req.session.token, user: req.session.user })
})


module.exports = router;
