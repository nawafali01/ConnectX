const express = require('express');
const router = express.Router();
const { addUserAndCreateRoom } = require('../controllers/chatController');

// POST /api/chats/add-user
router.post('/add-user', addUserAndCreateRoom);

module.exports = router;
