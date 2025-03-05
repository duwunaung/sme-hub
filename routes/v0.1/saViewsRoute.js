const express = require('express')
const { login, logout, orgs, restoreOrg, deleteOrg, updateOrg, createUser, detailUser, updateUser, extendLicense, registerOrg, detailOrg, superadmins, deleteUser, restoreUser, createSuperAdmins, detailSuperadmin, restoreSuperadmin, deleteSuperadmin, updateSuperadmin, adminProfile, editAdminProfile } = require("../../controllers/v0.1/viewsController")

const checkSuperAdminSession = require('../../middlewares/viewSuperAdmin');
const tmpSession = require('../../middlewares/tmp');
const router = express.Router();

router.use('/login', login)
router.use('/logout', logout)

router.use('/profile/edit', checkSuperAdminSession, editAdminProfile)
router.use('/profile', checkSuperAdminSession, adminProfile)
router.use('/organizations/restore/:id', checkSuperAdminSession, restoreOrg)
router.use('/organizations/delete/:id', checkSuperAdminSession, deleteOrg)
router.use('/organizations/update/:id/:userId', checkSuperAdminSession, updateUser)
router.use('/organizations/update/:id', checkSuperAdminSession, updateOrg)
router.use('/organizations/license/:id', checkSuperAdminSession, extendLicense)
router.use('/organization/register', checkSuperAdminSession, registerOrg)
router.use('/organizations/detail/:id/:userId', checkSuperAdminSession, detailUser)
router.use('/organizations/detail/:id', checkSuperAdminSession, detailOrg)
router.use('/organizations/adduser/:id', checkSuperAdminSession, createUser)
router.use('/organizations/deleteuser/:id/:userId', checkSuperAdminSession, deleteUser)
router.use('/organizations/restoreuser/:id/:userId', checkSuperAdminSession, restoreUser)
router.use('/organizations', checkSuperAdminSession, orgs)

router.use('/users/update/:id', checkSuperAdminSession, updateSuperadmin)
router.use('/users/restore/:id', checkSuperAdminSession, restoreSuperadmin)
router.use('/users/delete/:id', checkSuperAdminSession, deleteSuperadmin)
router.use('/add-superadmin', checkSuperAdminSession, createSuperAdmins)
router.use('/users/detail/:id', checkSuperAdminSession, detailSuperadmin)
router.use('/users', checkSuperAdminSession, superadmins)

router.use('/dashboard', checkSuperAdminSession, (req, res) => {
    res.render('superadmin/dashboard', { token: req.session.token, user: req.session.user })
})

router.use('/', (req, res) => {
    res.redirect('/superadmin/dashboard');
});

module.exports = router;
