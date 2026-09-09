const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getMessages, uploadMedia, sendMessage, editMessage, deleteMessage, clearAllMessages } = require('../controllers/messageController');

router.get('/', getMessages);
router.post('/upload', upload.single('file'), uploadMedia);
router.post('/', sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.delete('/', clearAllMessages);

module.exports = router;
