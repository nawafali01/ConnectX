import { useState, useEffect, useCallback } from 'react';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredActiveUserId,
  saveStoredActiveUserId,
} from '../functions/storage';
import { generateId } from '../functions/idGenerator';
import { INITIAL_BOT_USER, INITIAL_GROUPS } from '../constants/initialData';
import { DEFAULT_AVATAR } from '../constants/avatars';
import { api } from '../services/api';

const GROUPS_STORAGE_KEY = 'connectx_groups';

export const useUserManagement = () => {
  const [users, setUsers] = useState(() => {
    const saved = getStoredUsers();
    if (saved && saved.length > 0) {
      // Filter out any leftover fake demo users
      const cleanUsers = saved.filter(
        (u) => !['user-alice', 'user-bob', 'user-charlie', 'user-diana'].includes(u.id)
      );
      if (cleanUsers.length > 0) return cleanUsers;
    }
    return [INITIAL_BOT_USER];
  });

  const [activeUserId, setActiveUserId] = useState(() => {
    const savedId = getStoredActiveUserId();
    if (savedId && !['user-alice', 'user-bob', 'user-charlie', 'user-diana'].includes(savedId)) {
      return savedId;
    }
    return null;
  });

  // Groups state
  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(
            (g) =>
              g.id !== 'group_design' &&
              g.id !== 'group_eng' &&
              !g.name?.includes('Design & UI') &&
              !g.name?.includes('Frontend & Backend')
          );
          if (clean.length > 0) return clean;
        }
      }
    } catch (e) {}
    return INITIAL_GROUPS;
  });

  // Persist groups
  useEffect(() => {
    try {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {}
  }, [groups]);

  // Sync users list from backend on mount
  useEffect(() => {
    api.getAllUsers()
      .then((res) => {
        if (res && res.success && Array.isArray(res.users) && res.users.length > 0) {
          setUsers((prev) => {
            const map = new Map();
            prev.forEach((u) => map.set(u.id, u));
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

  const activeUser = users.find((u) => u.id === activeUserId) || users[0] || null;

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

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === localUser.id);
      if (exists) return prev;
      return [...prev, localUser];
    });
    setActiveUserId(localUser.id);

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

    try {
      await api.updateUser(userId, updateData);
    } catch (err) {
      console.warn('Backend updateUserProfile error:', err);
    }
  }, []);

  /**
   * Switch the current active user perspective
   */
  const switchActiveUser = useCallback((userId) => {
    if (userId) {
      setActiveUserId(userId);
    }
  }, []);

  /**
   * Create a new group
   */
  const createGroup = useCallback(({ name, description, avatar, memberIds = [] }) => {
    const newGroupId = 'group_' + Date.now().toString(36);
    const allMembers = Array.from(new Set([activeUserId, ...memberIds].filter(Boolean)));
    const newGroup = {
      id: newGroupId,
      name: name.trim(),
      description: description?.trim() || 'Team group chat on ConnectX',
      isGroup: true,
      avatar: avatar || {
        emoji: '💬',
        bg: '#ede9fe',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      },
      members: allMembers,
      admins: [activeUserId],
      createdAt: new Date().toISOString(),
    };

    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  }, [activeUserId]);

  /**
   * Leave or delete group
   */
  const leaveGroup = useCallback((groupId) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const humanUsers = users.filter((u) => !u.isSystem);

  return {
    users,
    humanUsers,
    activeUser,
    activeUserId,
    groups,
    registerUser,
    updateUserProfile,
    switchActiveUser,
    createGroup,
    leaveGroup,
  };
};
