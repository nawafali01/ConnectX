const mongoose = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const store = require('../config/store');

const normalizeEmail = (val) => String(val || '').trim().toLowerCase();
const normalizeName = (val) => String(val || '').trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * POST /api/chats/add-user
 * Request Body: { currentUserId, name, email }
 */
const addUserAndCreateRoom = async (req, res) => {
  try {
    const { currentUserId, name, email } = req.body;

    // 1. Basic validation
    if (!currentUserId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'currentUserId, name, and email are required.',
      });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanName = normalizeName(name);
    const senderId = String(currentUserId).trim();

    const isDbConnected = mongoose.connection.readyState === 1;

    // 2. Prevent adding own email / self check (Look up current user by senderId ONLY)
    let currentUser = null;
    if (isDbConnected) {
      if (mongoose.Types.ObjectId.isValid(senderId)) {
        currentUser = await User.findById(senderId).catch(() => null);
      }
      if (!currentUser) {
        currentUser = await User.findOne({
          $or: [{ _id: senderId }, { id: senderId }],
        }).catch(() => null);
      }
    }
    if (!currentUser) {
      currentUser = store.getUserById(senderId);
    }

    // Check if sender is adding their own email
    if (currentUser && currentUser.email && normalizeEmail(currentUser.email) === cleanEmail) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add your own email as a contact.',
      });
    }

    // 3. Find target user by exact email (case-insensitive)
    let targetUser = null;
    if (isDbConnected) {
      const escaped = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      targetUser = await User.findOne({
        email: { $regex: new RegExp(`^${escaped}$`, 'i') },
      });
    }

    // Fallback search in store.js (if not found in MongoDB or offline)
    if (!targetUser) {
      targetUser = store.getUserByEmail(cleanEmail);

      // If found in store and MongoDB is active, sync to MongoDB for future queries
      if (targetUser && isDbConnected) {
        try {
          const synced = await User.create({
            name: targetUser.name,
            phone: targetUser.phone || '+92 0000000000',
            email: cleanEmail,
            bio: targetUser.bio || 'ConnectX user',
            avatar: targetUser.avatar || null,
            customPhoto: targetUser.customPhoto || null,
            isOnline: targetUser.isOnline || true,
          });
          targetUser = synced;
        } catch (e) {
          // If already created in race condition, fetch it
          targetUser = await User.findOne({ email: cleanEmail }).catch(() => targetUser);
        }
      }
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User with this name/email not found or unverified',
      });
    }

    const targetId = String(targetUser._id || targetUser.id);

    // Prevent adding self by ID
    if (targetId === senderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a contact.',
      });
    }

    // 4. Verify provided name matches registered user's name (case-insensitive & whitespace tolerant)
    const registeredName = normalizeName(targetUser.name);
    if (registeredName !== cleanName) {
      return res.status(404).json({
        success: false,
        message: 'User with this name/email not found or unverified',
      });
    }

    // 5. Check if conversation already exists (Bidirectional query with $all & store.findConversation)
    let existingConversation = null;

    if (isDbConnected) {
      const p1 = mongoose.Types.ObjectId.isValid(senderId)
        ? new mongoose.Types.ObjectId(senderId)
        : senderId;
      const p2 = mongoose.Types.ObjectId.isValid(targetId)
        ? new mongoose.Types.ObjectId(targetId)
        : targetId;

      existingConversation = await Conversation.findOne({
        $or: [
          { participants: { $all: [p1, p2] } },
          { participants: { $all: [senderId, targetId] } },
        ],
      });
    } else {
      // Offline fallback: sorts IDs before lookup
      existingConversation = store.findConversation(senderId, targetId);
    }

    // Prepare clean target user payload
    const sanitizedUser = {
      id: targetId,
      _id: targetId,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      bio: targetUser.bio,
      avatar: targetUser.avatar,
      customPhoto: targetUser.customPhoto,
      isOnline: targetUser.isOnline || false,
    };

    if (existingConversation) {
      const conversationId = (existingConversation._id || existingConversation.id).toString();
      return res.status(200).json({
        success: true,
        conversationId,
        user: sanitizedUser,
        conversation: existingConversation,
        isExisting: true,
        message: 'Existing conversation found.',
      });
    }

    // 6. Create new conversation document
    let newConversation = null;
    if (isDbConnected) {
      const p1 = mongoose.Types.ObjectId.isValid(senderId)
        ? new mongoose.Types.ObjectId(senderId)
        : senderId;
      const p2 = mongoose.Types.ObjectId.isValid(targetId)
        ? new mongoose.Types.ObjectId(targetId)
        : targetId;

      newConversation = await Conversation.create({
        participants: [p1, p2],
      });
    } else {
      // Offline fallback: sorts IDs before creation
      newConversation = store.createConversation(senderId, targetId);
    }

    const conversationId = (newConversation._id || newConversation.id).toString();

    return res.status(201).json({
      success: true,
      conversationId,
      user: sanitizedUser,
      conversation: newConversation,
      isExisting: false,
      message: 'Room created successfully.',
    });
  } catch (error) {
    console.error('Error in addUserAndCreateRoom:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding user to chat.',
      error: error.message,
    });
  }
};

module.exports = {
  addUserAndCreateRoom,
};
