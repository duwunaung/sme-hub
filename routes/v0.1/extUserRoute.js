const express = require('express');
const { loginUser } = require('../../controllers/v0.1/extUserController');

const router = express.Router();

// User login
router.post('/login', loginUser);

module.exports = router;
