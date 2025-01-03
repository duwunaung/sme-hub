const express = require("express")

// controllers
const { listOrg, createOrg, updateOrg, licenseOrg, deleteOrg, getOrg, restoreOrg, listUsers, deleteUser } = require("../../controllers/v0.1/organizationController")

const router = express.Router()

// router.get('/testEmail', sendEmail)
router.post('/create', createOrg)
router.put('/update/:id', updateOrg)
router.put('/license/:id', licenseOrg)
router.delete('/delete/:id', deleteOrg)
router.get('/:id', getOrg)
router.get('/restore/:id', restoreOrg)
router.get('/users/:id', listUsers)
router.delete('/users/delete/:id', deleteUser)
router.get('/', listOrg)

module.exports = router