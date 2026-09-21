const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-sync any existing store users to MongoDB so both modes remain in sync
    try {
      const User = require('../models/User');
      const store = require('./store');
      const storeUsers = store.getUsers();
      for (const u of storeUsers) {
        if (!u || !u.email) continue;
        const cleanEmail = u.email.trim().toLowerCase();
        const exists = await User.findOne({ email: cleanEmail });
        if (!exists) {
          const created = await User.create({
            name: u.name || 'User',
            phone: u.phone || '+92 0000000000',
            email: cleanEmail,
            bio: u.bio || 'ConnectX user',
            avatar: u.avatar || null,
            customPhoto: u.customPhoto || null,
            isOnline: true,
          });
          console.log(`📥 Synced offline user to MongoDB: ${created.name} (${created.email})`);
        }
      }
    } catch (syncErr) {
      console.warn('⚠️ User sync warning:', syncErr.message);
    }

    return true;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log(`ℹ️ Running with in-memory fallback mode. Set MONGO_URI in .env to enable persistent database storage.`);
    return false;
  }
};

module.exports = connectDB;
