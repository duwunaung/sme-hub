const express = require("express")

// controllers
const { listOrg, createOrg, updateOrg, licenseOrg, deleteOrg, getOrg, restoreOrg } = require("../../controllers/v0.1/organizationController")

const router = express.Router()

router.get('/', listOrg)
router.post('/create', createOrg)
router.put('/update/:id', updateOrg)
router.put('/license/:id', licenseOrg)
router.delete('/delete/:id', deleteOrg)
router.get('/:id', getOrg)
router.get('/restore/:id', restoreOrg)

module.exports = router