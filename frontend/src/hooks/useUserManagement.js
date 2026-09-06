import { useState, useEffect, useCallback } from 'react';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredActiveUserId,
  saveStoredActiveUserId,
} from '../functions/storage';
import { generateId } from '../functions/idGenerator';
import { INITIAL_BOT_USER } from '../constants/initialData';
import { DEFAULT_AVATAR } from '../constants/avatars';
import { api } from '../services/api';

export const useUserManagement = () => {
  const [users, setUsers] = useState(() => {
    const saved = getStoredUsers();
    if (saved && saved.length > 0) {
      return saved;
    }
    return [INITIAL_BOT_USER];
  });

  const [activeUserId, setActiveUserId] = useState(() => {
    const savedId = getStoredActiveUserId();
    return savedId || null;
  });

  // Sync users list from backend on mount
  useEffect(() => {
    api.getAllUsers()
      .then((res) => {
        if (res && res.success && Array.isArray(res.users) && res.users.length > 0) {
          setUsers((prev) => {
            const map = new Map();
            // preserve existing local users
            prev.forEach((u) => map.set(u.id, u));
            // merge backend users
            res.users.forEach((bu) => {
              const id = (bu.id || bu._id).toString();
              map.set(id, {
                ...bu,
                id,
                isSystem: false,
              });
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.warn('Could not fetch backend users:', err));
  }, []);

  // Save users whenever changed
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  // Save active user whenever changed
  useEffect(() => {
    saveStoredActiveUserId(activeUserId);
  }, [activeUserId]);

  const activeUser = users.find((u) => u.id === activeUserId) || null;

  /**
   * Registers a new user with info from the form and syncs with backend
   */
  const registerUser = useCallback(async (userData) => {
    const tempId = generateId('user');
    const localUser = {
      id: tempId,
      name: userData.name?.trim() || 'Anonymous User',
      phone: userData.phone?.trim() || '',
      bio: userData.bio?.trim() || 'Hey there! I am using ConnectX.',
      avatar: userData.avatar || DEFAULT_AVATAR,
      customPhoto: userData.customPhoto || null,
      joinedAt: new Date().toISOString(),
      isOnline: true,
      isSystem: false,
    };

    // Instant local state update
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === localUser.id);
      if (exists) return prev;
      return [...prev, localUser];
    });
    setActiveUserId(localUser.id);

    // Call backend API
    try {
      const res = await api.registerUser(userData);
      if (res && res.success && res.user) {
        const backendId = (res.user.id || res.user._id).toString();
        const synchronizedUser = {
          ...localUser,
          ...res.user,
          id: backendId,
        };

        setUsers((prev) =>
          prev.map((u) => (u.id === tempId ? synchronizedUser : u))
        );
        setActiveUserId(backendId);
        return synchronizedUser;
      }
    } catch (err) {
      console.warn('Backend user registration error:', err);
    }

    return localUser;
  }, []);

  /**
   * Updates an existing user's profile both locally and on the backend
   */
  const updateUserProfile = useCallback(async (userId, updateData) => {
    if (!userId) return;

    // Instant local update
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId || user._id === userId) {
          return {
            ...user,
            ...updateData,
          };
        }
        return user;
      })
    );

    // Backend sync
    try {
      await api.updateUser(userId, updateData);
    } catch (err) {
      console.warn('Backend updateUserProfile error:', err);
    }
  }, []);

  /**
   * Switch the current active user chatting in the room
   */
  const switchActiveUser = useCallback((userId) => {
    setActiveUserId(userId);
  }, []);

  // Filter out system bots for user selection lists
  const humanUsers = users.filter((u) => !u.isSystem);

  return {
    users,
    humanUsers,
    activeUser,
    activeUserId,
    registerUser,
    updateUserProfile,
    switchActiveUser,
  };
};
