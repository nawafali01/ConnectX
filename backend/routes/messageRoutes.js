const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, editMessage, deleteMessage } = require('../controllers/messageController');

router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
