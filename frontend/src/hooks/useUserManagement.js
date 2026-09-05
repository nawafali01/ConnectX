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
   * Registers a new user with info from the form
   */
  const registerUser = useCallback((userData) => {
    const newUser = {
      id: generateId('user'),
      name: userData.name?.trim() || 'Anonymous User',
      phone: userData.phone?.trim() || '',
      bio: userData.bio?.trim() || 'Hey there! I am using ConnectX.',
      avatar: userData.avatar || DEFAULT_AVATAR,
      joinedAt: new Date().toISOString(),
      isOnline: true,
      isSystem: false,
    };

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id);
      if (exists) return prev;
      return [...prev, newUser];
    });

    setActiveUserId(newUser.id);
    return newUser;
  }, []);

  /**
   * Updates an existing user's profile
   */
  const updateUserProfile = useCallback((userId, updateData) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            ...updateData,
          };
        }
        return user;
      })
    );
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
