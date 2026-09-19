const mongoose = require('mongoose');
const User = require('../models/User');
const store = require('../config/store');

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, email, bio, avatar, customPhoto } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.create({
        name,
        phone,
        email: email ? email.trim().toLowerCase() : '',
        bio,
        avatar,
        customPhoto,
      });
      return res.status(201).json({ success: true, user });
    }

    // In-memory persistent fallback
    const memUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name || 'Anonymous User',
      phone: phone || '',
      email: email ? email.trim().toLowerCase() : '',
      bio: bio || 'Hey there! I am using ConnectX.',
      avatar: avatar || null,
      customPhoto: customPhoto || null,
      isOnline: true,
      createdAt: new Date().toISOString(),
    };
    memUser.id = memUser._id;
    store.addUser(memUser);

    res.status(201).json({
      success: true,
      user: memUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const isFakeName = (name) => {
      const n = (name || '').trim().toLowerCase();
      return ['alice johnson', 'bob smith', 'charlie brown', 'diana prince', 'alice', 'bob', 'charlie', 'diana'].includes(n);
    };

    if (mongoose.connection.readyState === 1) {
      const users = await User.find({
        name: { $nin: [/alice/i, /bob smith/i, /charlie brown/i, /diana prince/i] }
      }).select('-__v').sort({ createdAt: -1 });
      return res.json({ success: true, users });
    }
    const memUsers = store.getUsers().filter((u) => !isFakeName(u.name));
    res.json({ success: true, users: memUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const user = await User.findById(req.params.id).select('-__v');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    }
    const memUser = store.getUsers().find((u) => u._id === req.params.id || u.id === req.params.id);
    if (!memUser) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: memUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, phone, email, bio, avatar, customPhoto } = req.body;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const updateFields = { name, phone, bio, avatar, customPhoto };
      if (email !== undefined) updateFields.email = email ? email.trim().toLowerCase() : '';
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      ).select('-__v');

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email ? email.trim().toLowerCase() : '';
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (customPhoto !== undefined) updates.customPhoto = customPhoto;

    const updated = store.updateUser(req.params.id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      const deleted = await User.findByIdAndDelete(userId);
      if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, message: 'User deleted successfully' });
    }
    const success = store.deleteUser(userId);
    if (!success) {
      store.users = (store.users || []).filter((u) => u.id !== userId && u._id !== userId);
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, getAllUsers, getUserById, updateUser, deleteUser };

