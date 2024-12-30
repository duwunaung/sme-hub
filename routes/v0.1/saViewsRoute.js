const express = require('express')
const { login, logout, orgs, restoreOrg, deleteOrg, updateOrg, extendLicense, registerOrg, detailUser, detailOrg, superadmins, editUser , registerUser } = require("../../controllers/v0.1/viewsController")

const checkSuperAdminSession = require('../../middlewares/viewSuperAdmin');
const tmpSession = require('../../middlewares/tmp');
const router = express.Router();

router.use('/login', login)
router.use('/logout', logout)

// router.use('/organizations/users/:id', checkSuperAdminSession, listUsers)

router.use('/organizations/restore/:id', checkSuperAdminSession, restoreOrg)
router.use('/organizations/delete/:id', checkSuperAdminSession, deleteOrg)
router.use('/organizations/update/:id', checkSuperAdminSession, updateOrg)
router.use('/organizations/license/:id', checkSuperAdminSession, extendLicense)
router.use('/organization/register', checkSuperAdminSession, registerOrg)
router.use('/organizations/detail/:orgId/:userId/edit', checkSuperAdminSession, editUser)
router.use('/organizations/detail/:orgId/:userId', checkSuperAdminSession, detailUser)
router.use('/organization/user/register/:id', checkSuperAdminSession, registerUser)
router.use('/organizations/detail/:id', checkSuperAdminSession, detailOrg)
router.use('/organizations', checkSuperAdminSession, orgs)



router.use('/users', checkSuperAdminSession, superadmins)
router.use('/dashboard', checkSuperAdminSession, (req, res) => {
    res.render('superadmin/dashboard', { token: req.session.token, user: req.session.user })
})


module.exports = router;
