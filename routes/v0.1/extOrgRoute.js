const express = require('express')
const { getOrgProfile , updateOrgProfile } = require('../../controllers/v0.1/subOrgController')

const router = express.Router()

router.put('/profile/update', updateOrgProfile)
router.get('/profile', getOrgProfile)


module.exports = router