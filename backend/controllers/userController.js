const mongoose = require('mongoose');
const User = require('../models/User');

const memoryUsers = [];

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, bio, avatar, customPhoto } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.create({ name, phone, bio, avatar, customPhoto });
      return res.status(201).json({ success: true, user });
    }

    // In-memory fallback
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
    memoryUsers.push(memUser);

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
    res.json({ success: true, users: memoryUsers });
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
    const memUser = memoryUsers.find((u) => u._id === req.params.id || u.id === req.params.id);
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

    const memUser = memoryUsers.find((u) => u._id === req.params.id || u.id === req.params.id);
    if (!memUser) return res.status(404).json({ success: false, message: 'User not found' });
    if (name) memUser.name = name;
    if (phone !== undefined) memUser.phone = phone;
    if (bio !== undefined) memUser.bio = bio;
    if (avatar !== undefined) memUser.avatar = avatar;
    if (customPhoto !== undefined) memUser.customPhoto = customPhoto;
    res.json({ success: true, user: memUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, getAllUsers, getUserById, updateUser };

