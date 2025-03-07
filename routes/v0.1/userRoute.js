const express = require('express')
const { createUser, listUsers, updateUser, deleteUser, getUser, restoreUser, getProfile, updateProfile, deleteAccount } = require('../../controllers/v0.1/userController')

const router = express.Router();

// Create user
router.post('/create', createUser);
router.get('/', listUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/restore/:id', restoreUser);

router.get('/profile/get', getProfile);
router.put('/profile/update', updateProfile);
router.delete('/profile/delete', deleteAccount);

module.exports = router;
