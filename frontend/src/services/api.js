// Normalize base URL: handles both "http://domain:5000" and "http://domain:5000/api"
const RAW_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

export const api = {
  // Users
  registerUser: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (err) {
      console.error('API registerUser error:', err);
      return { success: false, message: err.message };
    }
  },

  getAllUsers: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      return await res.json();
    } catch (err) {
      console.error('API getAllUsers error:', err);
      return { success: false, users: [] };
    }
  },

  updateUser: async (userId, updateData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      return await res.json();
    } catch (err) {
      console.error('API updateUser error:', err);
      return { success: false, message: err.message };
    }
  },

  deleteUser: async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err) {
      console.error('API deleteUser error:', err);
      return { success: false, message: err.message };
    }
  },

  // Chats & Verified Contacts
  addUserToChat: async ({ currentUserId, name, email }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chats/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId, name, email }),
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, ...data };
    } catch (err) {
      console.error('API addUserToChat error:', err);
      return { ok: false, status: 500, success: false, message: err.message || 'Network error' };
    }
  },

  // Messages
  getMessages: async (room = 'general', limit = 100) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages?room=${encodeURIComponent(room)}&limit=${limit}`);
      return await res.json();
    } catch (err) {
      console.error('API getMessages error:', err);
      return { success: false, messages: [] };
    }
  },

  sendMessage: async (messageData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      return await res.json();
    } catch (err) {
      console.error('API sendMessage error:', err);
      return { success: false, message: err.message };
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return await res.json();
    } catch (err) {
      console.error('API editMessage error:', err);
      return { success: false, message: err.message };
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err) {
      console.error('API deleteMessage error:', err);
      return { success: false, message: err.message };
    }
  },

  uploadMedia: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/messages/upload`, {
        method: 'POST',
        body: formData,
      });
      return await res.json();
    } catch (err) {
      console.error('API uploadMedia error:', err);
      return { success: false, message: err.message };
    }
  },
};

export default api;
