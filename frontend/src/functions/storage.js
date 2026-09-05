/**
 * Local storage abstraction layer with safe fallback.
 */

const STORAGE_KEYS = {
  USERS: 'connectx_users',
  ACTIVE_USER_ID: 'connectx_active_user_id',
  MESSAGES: 'connectx_messages',
};

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return [];
  }
};

export const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
};

export const getStoredActiveUserId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || null;
  } catch (err) {
    return null;
  }
};

export const saveStoredActiveUserId = (userId) => {
  try {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
  } catch (err) {
    console.error('Error saving active user id to storage:', err);
  }
};

export const getStoredMessages = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Error reading messages from storage:', err);
    return null;
  }
};

export const saveStoredMessages = (messages) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error('Error saving messages to storage:', err);
  }
};

export const clearAllStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
};
