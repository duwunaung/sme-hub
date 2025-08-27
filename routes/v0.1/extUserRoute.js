const express = require('express');
const { loginUser, getUserProfile, updateUserProfile , checkPass } = require('../../controllers/v0.1/extUserController');

const router = express.Router();

// User login
router.post('/login', loginUser);
router.put('/profile/update', updateUserProfile);
router.get('/profile/check', checkPass);
router.get('/profile', getUserProfile);

module.exports = router;
