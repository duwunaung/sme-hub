const express = require("express")

// controllers
const { listOrg, createOrg, updateOrg, deleteOrg } = require("../../controllers/v0.1/organization")

const router = express.Router()

router.get('/', listOrg)
router.post('/create', createOrg)
router.put('/update/:id', updateOrg)
router.delete('/delete/:id', deleteOrg)

module.exports = router