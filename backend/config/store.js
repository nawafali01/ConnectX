const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'chat_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state
let store = {
  users: [],
  messages: [],
  conversations: [],
};

// Load existing data from file if present
try {
  if (fs.existsSync(STORE_FILE)) {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    store = JSON.parse(raw);
    if (!Array.isArray(store.users)) store.users = [];
    if (!Array.isArray(store.messages)) store.messages = [];
    if (!Array.isArray(store.conversations)) store.conversations = [];
  }
} catch (err) {
  console.error('Error reading chat store file:', err.message);
}

// Save store to disk synchronously/safely
const persist = () => {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving chat store file:', err.message);
  }
};

module.exports = {
  getMessages: (room = 'general') => {
    return store.messages.filter((m) => (!room || m.room === room) && !m.deletedAt);
  },

  addMessage: (msg) => {
    const existingIdx = store.messages.findIndex((m) => m.id === msg.id || m._id === msg.id);
    if (existingIdx !== -1) {
      store.messages[existingIdx] = msg;
    } else {
      store.messages.push(msg);
    }
    persist();
    return msg;
  },

  updateMessage: (messageId, updates) => {
    const found = store.messages.find((m) => m.id === messageId || m._id === messageId);
    if (found) {
      Object.assign(found, updates);
      persist();
      return found;
    }
    return null;
  },

  deleteMessage: (messageId) => {
    const found = store.messages.find((m) => m.id === messageId || m._id === messageId);
    if (found) {
      found.deletedAt = new Date().toISOString();
      persist();
      return true;
    }
    return false;
  },

  clearMessages: (room) => {
    if (room) {
      store.messages = store.messages.filter((m) => m.room !== room);
    } else {
      store.messages = [];
    }
    persist();
    return true;
  },

  getUsers: () => store.users,

  getUserById: (userId) => {
    const strId = String(userId);
    return store.users.find((u) => String(u.id || u._id) === strId) || null;
  },

  getUserByEmail: (email) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    return store.users.find((u) => u.email && u.email.trim().toLowerCase() === cleanEmail) || null;
  },

  addUser: (user) => {
    const existingIdx = store.users.findIndex((u) => u.id === user.id || u._id === user.id);
    if (existingIdx !== -1) {
      store.users[existingIdx] = user;
    } else {
      store.users.push(user);
    }
    persist();
    return user;
  },

  updateUser: (userId, updates) => {
    const found = store.users.find((u) => u.id === userId || u._id === userId);
    if (found) {
      Object.assign(found, updates);
      persist();
      return found;
    }
    return null;
  },

  deleteUser: (userId) => {
    const prevLen = store.users.length;
    store.users = store.users.filter((u) => u.id !== userId && u._id !== userId);
    persist();
    return store.users.length < prevLen;
  },

  // ─── Conversation helpers with sorted ID lookup ───
  findConversation: (userId1, userId2) => {
    if (!userId1 || !userId2) return null;
    const targetSorted = [String(userId1), String(userId2)].sort();
    return (
      store.conversations.find((c) => {
        if (!Array.isArray(c.participants) || c.participants.length !== 2) return false;
        const sortedP = c.participants.map(String).sort();
        return sortedP[0] === targetSorted[0] && sortedP[1] === targetSorted[1];
      }) || null
    );
  },

  createConversation: (userId1, userId2) => {
    const sortedP = [String(userId1), String(userId2)].sort();
    const newConv = {
      _id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      participants: sortedP,
      lastMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.conversations.push(newConv);
    persist();
    return newConv;
  },

  getConversations: () => store.conversations,
};
