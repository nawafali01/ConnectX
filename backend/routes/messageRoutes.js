const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, editMessage, deleteMessage, clearAllMessages } = require('../controllers/messageController');

router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.delete('/', clearAllMessages);

module.exports = router;
