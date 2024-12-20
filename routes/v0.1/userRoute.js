const express = require('express')
const { createUser, listUsers, updateUser, deleteUser } = require('../../controllers/v0.1/userController')

const router = express.Router();

// Create user
router.post('/create', createUser);
router.get('/', listUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
