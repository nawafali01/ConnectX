const fs = require('fs');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const store = require('../config/store');
const cloudinary = require('../config/cloudinary');

// GET /api/messages?room=general&limit=50
const getMessages = async (req, res) => {
  try {
    const { room = 'general', limit = 50, before } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { room, deletedAt: null };
      if (before) query.createdAt = { $lt: new Date(before) };

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      const formatted = messages.reverse().map((m) => ({
        ...m,
        id: (m._id || m.id).toString(),
      }));

      return res.json({ success: true, messages: formatted });
    }

    // In-memory persistent fallback
    const filtered = store
      .getMessages(room)
      .slice(-Number(limit));

    res.json({ success: true, messages: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/messages/upload
const uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const filePath = req.file.path;

  try {
    // Upload local temporary file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'connectx_media',
      resource_type: 'auto',
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      mediaType: result.resource_type || 'image',
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload to Cloudinary' });
  } finally {
    // Crucial: always delete the temporary file from local disk to keep project clean!
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`🧹 Deleted temp file: ${filePath}`);
      }
    } catch (cleanupErr) {
      console.warn(`⚠️ Warning: could not delete temp file ${filePath}:`, cleanupErr.message);
    }
  }
};

// POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { senderId, senderName, senderAvatar, senderCustomPhoto, text, mediaUrl, mediaType, room } = req.body;

    if (mongoose.connection.readyState === 1) {
      const message = await Message.create({
        senderId,
        senderName,
        senderAvatar,
        senderCustomPhoto,
        text: text || '',
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || (mediaUrl ? 'image' : null),
        room: room || 'general',
      });
      const obj = message.toObject();
      obj.id = (obj._id || obj.id).toString();
      return res.status(201).json({ success: true, message: obj });
    }

    const memMsg = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      senderId,
      senderName,
      senderAvatar,
      senderCustomPhoto,
      text: text || '',
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || (mediaUrl ? 'image' : null),
      room: room || 'general',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    memMsg.id = memMsg._id;
    store.addMessage(memMsg);

    res.status(201).json({ success: true, message: memMsg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/messages/:id
const editMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const message = await Message.findByIdAndUpdate(
        req.params.id,
        { text, edited: true },
        { new: true, runValidators: true }
      );

      if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
      const obj = message.toObject();
      obj.id = (obj._id || obj.id).toString();
      return res.json({ success: true, message: obj });
    }

    const updated = store.updateMessage(req.params.id, { text, edited: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/messages/:id (soft delete)
const deleteMessage = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const message = await Message.findByIdAndUpdate(
        req.params.id,
        { deletedAt: new Date() },
        { new: true }
      );

      if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
      return res.json({ success: true, message: 'Message deleted' });
    }

    const success = store.deleteMessage(req.params.id);
    if (!success) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/messages (clear all messages in room)
const clearAllMessages = async (req, res) => {
  try {
    const { room = 'general' } = req.query;
    if (mongoose.connection.readyState === 1) {
      await Message.updateMany({ room, deletedAt: null }, { deletedAt: new Date() });
    }
    store.clearMessages(room);
    res.json({ success: true, message: 'All messages cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMessages, uploadMedia, sendMessage, editMessage, deleteMessage, clearAllMessages };


