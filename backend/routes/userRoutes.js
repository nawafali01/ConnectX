const express = require('express');
const router = express.Router();
const { registerUser, getAllUsers, getUserById, updateUser } = require('../controllers/userController');

router.post('/register', registerUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);

module.exports = router;
