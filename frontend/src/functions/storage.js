/**
 * Local storage abstraction layer with safe fallback and automated fake-data sanitization.
 */

const STORAGE_KEYS = {
  USERS: 'connectx_users',
  ACTIVE_USER_ID: 'connectx_active_user_id',
  MESSAGES: 'connectx_messages',
};

// Automatic one-time wipe to ensure all old test profiles are cleared
const WIPE_VERSION_KEY = 'connectx_wipe_users_v3';
try {
  if (typeof window !== 'undefined' && !localStorage.getItem(WIPE_VERSION_KEY)) {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem('connectx_groups');
    localStorage.removeItem('connectx_current_screen');
    localStorage.setItem(WIPE_VERSION_KEY, 'true');
  }
} catch (e) {}

const FAKE_USER_IDS = [
  'user-alice',
  'user-bob',
  'user-charlie',
  'user-diana',
  '6aabf9f770c7b35e0341e59f',
];
const FAKE_USER_NAMES = [
  'alice johnson',
  'bob smith',
  'charlie brown',
  'diana prince',
  'alice',
  'bob',
  'charlie',
  'diana',
];

export const isFakeUser = (u) => {
  if (!u) return true;
  const id = String(u.id || u._id || '').toLowerCase();
  const name = String(u.name || '').trim().toLowerCase();
  if (FAKE_USER_IDS.some((f) => id.includes(f))) return true;
  if (
    FAKE_USER_NAMES.some(
      (f) =>
        name === f ||
        name.startsWith('alice') ||
        name.startsWith('bob smith') ||
        name.startsWith('charlie brown') ||
        name.startsWith('diana prince')
    )
  ) {
    return true;
  }
  return false;
};

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const sanitized = parsed.filter((u) => !isFakeUser(u));
    if (sanitized.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return [];
  }
};

export const saveStoredUsers = (users) => {
  try {
    const clean = (users || []).filter((u) => !isFakeUser(u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(clean));
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
};

export const getStoredActiveUserId = () => {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (id && FAKE_USER_IDS.some((f) => id.toLowerCase().includes(f))) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
      return null;
    }
    return id || null;
  } catch (err) {
    return null;
  }
};

export const saveStoredActiveUserId = (userId) => {
  try {
    if (userId && !FAKE_USER_IDS.some((f) => String(userId).toLowerCase().includes(f))) {
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
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const sanitized = parsed.filter((m) => {
      const id = String(m.id || m._id || '');
      if (id.startsWith('msg_gen_') || id.startsWith('msg_des_') || id.startsWith('msg_dm_')) return false;
      const sId = String(m.senderId || '').toLowerCase();
      if (FAKE_USER_IDS.some((f) => sId.includes(f))) return false;
      const sName = String(m.senderName || '').trim().toLowerCase();
      if (FAKE_USER_NAMES.some((f) => sName === f)) return false;
      return true;
    });
    if (sanitized.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (err) {
    console.error('Error reading messages from storage:', err);
    return null;
  }
};

export const saveStoredMessages = (messages) => {
  try {
    const clean = (messages || []).filter((m) => {
      const id = String(m.id || m._id || '');
      if (id.startsWith('msg_gen_') || id.startsWith('msg_des_') || id.startsWith('msg_dm_')) return false;
      const sId = String(m.senderId || '').toLowerCase();
      if (FAKE_USER_IDS.some((f) => sId.includes(f))) return false;
      const sName = String(m.senderName || '').trim().toLowerCase();
      if (FAKE_USER_NAMES.some((f) => sName === f)) return false;
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(clean));
  } catch (err) {
    console.error('Error saving messages to storage:', err);
  }
};

export const clearAllStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem('connectx_groups');
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
};
