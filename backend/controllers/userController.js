const mongoose = require('mongoose');
const User = require('../models/User');
const store = require('../config/store');

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, bio, avatar, customPhoto } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.create({ name, phone, bio, avatar, customPhoto });
      return res.status(201).json({ success: true, user });
    }

    // In-memory persistent fallback
    const memUser = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name || 'Anonymous User',
      phone: phone || '',
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
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().select('-__v').sort({ createdAt: -1 });
      return res.json({ success: true, users });
    }
    res.json({ success: true, users: store.getUsers() });
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
    const { name, phone, bio, avatar, customPhoto } = req.body;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, phone, bio, avatar, customPhoto },
        { new: true, runValidators: true }
      ).select('-__v');

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
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

module.exports = { registerUser, getAllUsers, getUserById, updateUser };

