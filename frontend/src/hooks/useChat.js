import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getSocket } from '../services/socket';
import { api } from '../services/api';
import { getStoredMessages, saveStoredMessages, isFakeUser } from '../functions/storage';
import { INITIAL_MESSAGES } from '../constants/initialData';

const ACTIVE_CONV_STORAGE_KEY = 'connectx_active_conv';

export const useChat = (activeUser, users = []) => {
  const [messages, setMessages] = useState(() => {
    const saved = getStoredMessages();
    if (Array.isArray(saved) && saved.length > 0) {
      return saved.filter((m) => {
        const id = String(m.id || m._id || '');
        return !id.startsWith('msg_gen_') && !id.startsWith('msg_des_') && !id.startsWith('msg_dm_');
      });
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_CONV_STORAGE_KEY);
      if (saved && saved !== 'general') return saved;
    } catch (e) {}
    return null;
  });

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingMap, setTypingMap] = useState({}); // { [roomId]: { isTyping: bool, name: string } }
  const [unreadCounts, setUnreadCounts] = useState({});

  const socketRef = useRef(null);
  const activeUserRef = useRef(activeUser);
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  // Compute first direct contact user if available
  const otherUser = useMemo(() => {
    if (!activeUser || !Array.isArray(users)) return null;
    const activeId = String(activeUser.id || activeUser._id || '');
    const activeName = activeUser.name?.trim().toLowerCase();
    return users.find((u) => {
      if (!u || isFakeUser(u) || u.isSystem) return false;
      const uId = String(u.id || u._id || '');
      const uName = u.name?.trim().toLowerCase();
      return uId !== activeId && (!activeName || uName !== activeName);
    });
  }, [activeUser, users]);

  const defaultDmRoomId = useMemo(() => {
    if (!activeUser || !otherUser) return null;
    const myId = String(activeUser.id || activeUser._id || '');
    const theirId = String(otherUser.id || otherUser._id || '');
    return `dm_${[myId, theirId].sort().join('_')}`;
  }, [activeUser, otherUser]);

  // Auto-select DM with the user if activeConversationId is not set or defaulted to general
  useEffect(() => {
    if (!activeConversationId || activeConversationId === 'general') {
      if (defaultDmRoomId) {
        setActiveConversationId(defaultDmRoomId);
        try {
          localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, defaultDmRoomId);
        } catch (e) {}
      } else if (!activeConversationId) {
        setActiveConversationId('general');
      }
    }
  }, [defaultDmRoomId, activeConversationId]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    if (socketRef.current && activeConversationId) {
      socketRef.current.emit('room:join', { room: activeConversationId });
    }
    // Clear unread badge for active conversation
    if (activeConversationId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [activeConversationId]: 0,
      }));
    }
  }, [activeConversationId]);

  // Persist messages whenever updated
  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  // Load message history from backend whenever active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    api.getMessages(activeConversationId)
      .then((res) => {
        if (res && res.success && Array.isArray(res.messages)) {
          const formatted = res.messages.map((m) => ({
            ...m,
            id: (m.id || m._id).toString(),
            status: m.status || 'sent',
          }));
          setMessages((prev) => {
            const map = new Map();
            prev.forEach((m) => map.set(m.id, m));
            formatted.forEach((m) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.warn('Failed to load message history from backend:', err));
  }, [activeConversationId]);

  // Initialize socket and listeners
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const emitJoin = () => {
      if (activeUserRef.current?.id) {
        socket.emit('user:join', {
          userId: activeUserRef.current.id,
          name: activeUserRef.current.name,
          avatar: activeUserRef.current.avatar,
          customPhoto: activeUserRef.current.customPhoto || null,
        });
      }
      if (activeConversationIdRef.current) {
        socket.emit('room:join', { room: activeConversationIdRef.current });
        socket.emit('join_conversation', activeConversationIdRef.current);
      }
    };

    socket.on('connect', emitJoin);

    if (socket.connected) {
      emitJoin();
    }

    // Handle incoming messages from broadcast
    const handleNewMessage = (newMsg) => {
      const formatted = {
        ...newMsg,
        id: (newMsg.id || newMsg._id).toString(),
        room: newMsg.room || 'general',
      };

      setMessages((prev) => {
        const existsById = prev.some((m) => (m.id || m._id)?.toString() === formatted.id);
        if (existsById) {
          return prev.map((m) => ((m.id || m._id)?.toString() === formatted.id ? formatted : m));
        }

        const optimisticIdx = prev.findIndex(
          (m) =>
            m.isOptimistic &&
            String(m.senderId) === String(formatted.senderId) &&
            ((formatted.text && m.text === formatted.text) || (formatted.mediaUrl && m.mediaUrl === formatted.mediaUrl))
        );
        if (optimisticIdx !== -1) {
          const updated = [...prev];
          updated[optimisticIdx] = formatted;
          return updated;
        }

        return [...prev, formatted];
      });

      // Update unread count if message is not in currently active conversation and not sent by me
      const currentActive = activeConversationIdRef.current;
      const myId = activeUserRef.current?.id;
      if (formatted.room !== currentActive && formatted.senderId !== myId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [formatted.room]: (prev[formatted.room] || 0) + 1,
        }));
      }
    };

    // Handle message status updates (delivered, read)
    const handleMessageStatus = ({ messageId, status }) => {
      const targetId = messageId?.toString();
      setMessages((prev) =>
        prev.map((m) =>
          (m.id || m._id)?.toString() === targetId ? { ...m, status } : m
        )
      );
    };

    // Handle message edit
    const handleMessageEdited = (editedMsg) => {
      const targetId = (editedMsg.id || editedMsg._id)?.toString();
      setMessages((prev) =>
        prev.map((m) =>
          (m.id || m._id)?.toString() === targetId
            ? { ...m, ...editedMsg, id: targetId, edited: true }
            : m
        )
      );
    };

    // Handle message delete
    const handleMessageDeleted = ({ messageId }) => {
      const targetId = messageId?.toString();
      setMessages((prev) =>
        prev.filter((m) => (m.id || m._id)?.toString() !== targetId)
      );
    };

    // Handle typing events with room awareness
    const handleTypingShow = ({ name, room = 'general' }) => {
      setTypingMap((prev) => ({
        ...prev,
        [room]: { isTyping: true, name: name || 'Someone' },
      }));
    };

    const handleTypingHide = ({ room = 'general' } = {}) => {
      setTypingMap((prev) => ({
        ...prev,
        [room]: { isTyping: false, name: '' },
      }));
    };

    // Handle online users
    const handleOnlineUsers = (usersList) => {
      if (Array.isArray(usersList)) {
        setOnlineUsers(usersList);
      }
    };

    const handleMessagesCleared = () => {
      setMessages([]);
      saveStoredMessages([]);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleMessageStatus);
    socket.on('message:edited', handleMessageEdited);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('messages:cleared', handleMessagesCleared);
    socket.on('typing:show', handleTypingShow);
    socket.on('typing:hide', handleTypingHide);
    socket.on('users:online', handleOnlineUsers);

    return () => {
      socket.off('connect', emitJoin);
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleMessageStatus);
      socket.off('message:edited', handleMessageEdited);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('messages:cleared', handleMessagesCleared);
      socket.off('typing:show', handleTypingShow);
      socket.off('typing:hide', handleTypingHide);
      socket.off('users:online', handleOnlineUsers);
    };
  }, []);

  // When activeUser changes, emit user:join
  useEffect(() => {
    if (activeUser?.id && socketRef.current) {
      socketRef.current.emit('user:join', {
        userId: activeUser.id,
        name: activeUser.name,
        avatar: activeUser.avatar,
        customPhoto: activeUser.customPhoto || null,
      });
    }
  }, [activeUser?.id, activeUser?.name, activeUser?.avatar, activeUser?.customPhoto]);

  // When conversation changes, join the room on socket
  const selectConversation = useCallback((convId) => {
    if (!convId) return;
    setActiveConversationId(convId);
    try {
      localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, convId);
    } catch (e) {}
    if (socketRef.current) {
      socketRef.current.emit('room:join', { room: convId });
      socketRef.current.emit('join_conversation', convId);
    }
  }, []);

  /**
   * Send a new message with optimistic UI display
   */
  const sendMessage = useCallback(
    (text, media = null, targetRoom = null) => {
      const trimmed = typeof text === 'string' ? text.trim() : '';
      const mediaUrl = media?.mediaUrl || media?.url || null;
      const mediaType = media?.mediaType || (mediaUrl ? 'image' : null);
      const audioDuration = media?.audioDuration || null;
      const room = targetRoom || activeConversationIdRef.current || 'general';

      if ((!trimmed && !mediaUrl) || !activeUserRef.current) return null;

      const localId = 'opt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const messageData = {
        id: localId,
        senderId: activeUserRef.current.id,
        senderName: activeUserRef.current.name,
        senderAvatar: activeUserRef.current.avatar,
        senderCustomPhoto: activeUserRef.current.customPhoto || null,
        text: trimmed,
        mediaUrl,
        mediaType,
        audioDuration,
        room,
        status: 'sent',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      // 1. Immediately show message in UI
      setMessages((prev) => [...prev, messageData]);

      // 2. Emit over Socket.IO
      const socket = socketRef.current || getSocket();
      socket.emit('message:send', {
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar,
        senderCustomPhoto: messageData.senderCustomPhoto,
        text: messageData.text,
        mediaUrl: messageData.mediaUrl,
        mediaType: messageData.mediaType,
        audioDuration: messageData.audioDuration,
        room: messageData.room,
      });

      // Also simulate read receipt tick progression for preview
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId && m.status === 'sent' ? { ...m, status: 'delivered' } : m))
        );
      }, 500);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId && m.status === 'delivered' ? { ...m, status: 'read' } : m))
        );
      }, 1500);

      return messageData;
    },
    []
  );

  /**
   * Delete a message via Socket.IO
   */
  const deleteMessage = useCallback((msgId) => {
    if (!msgId) return;
    const targetId = msgId.toString();

    setMessages((prev) =>
      prev.filter((m) => (m.id || m._id)?.toString() !== targetId)
    );

    const socket = socketRef.current || getSocket();
    socket.emit('message:delete', { messageId: targetId, room: activeConversationIdRef.current });
  }, []);

  /**
   * Edit a message via Socket.IO
   */
  const editMessage = useCallback((msgId, newText) => {
    if (!msgId || !newText?.trim()) return;
    const trimmed = newText.trim();
    const targetId = msgId.toString();

    setMessages((prev) =>
      prev.map((m) =>
        (m.id || m._id)?.toString() === targetId
          ? { ...m, text: trimmed, edited: true }
          : m
      )
    );

    const socket = socketRef.current || getSocket();
    socket.emit('message:edit', {
      messageId: targetId,
      text: trimmed,
      room: activeConversationIdRef.current,
    });
  }, []);

  /**
   * Add / toggle a reaction on a message
   */
  const toggleReaction = useCallback((msgId, emoji) => {
    if (!msgId || !emoji || !activeUserRef.current) return;
    const userId = activeUserRef.current.id;
    setMessages((prev) =>
      prev.map((m) => {
        if ((m.id || m._id)?.toString() !== msgId.toString()) return m;
        const reactions = m.reactions ? { ...m.reactions } : {};
        const existingList = reactions[emoji] || [];
        if (existingList.includes(userId)) {
          reactions[emoji] = existingList.filter((uid) => uid !== userId);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...existingList, userId];
        }
        return { ...m, reactions };
      })
    );
  }, []);

  /**
   * Typing indicators
   */
  const sendTypingStart = useCallback(() => {
    if (!activeUserRef.current) return;
    const socket = socketRef.current || getSocket();
    socket.emit('typing:start', {
      name: activeUserRef.current.name,
      room: activeConversationIdRef.current,
    });
  }, []);

  const sendTypingStop = useCallback(() => {
    const socket = socketRef.current || getSocket();
    socket.emit('typing:stop', { room: activeConversationIdRef.current });
  }, []);

  /**
   * Clear all messages in current room
   */
  const clearChat = useCallback(() => {
    const currentRoom = activeConversationIdRef.current;
    setMessages((prev) => prev.filter((m) => (m.room || 'general') !== currentRoom));
    const socket = socketRef.current || getSocket();
    socket.emit('messages:clear', { room: currentRoom });
  }, []);

  // Filtered active conversation messages
  const activeMessages = useMemo(() => {
    return messages.filter((m) => (m.room || 'general') === activeConversationId);
  }, [messages, activeConversationId]);

  // Current room typing status
  const currentTyping = typingMap[activeConversationId] || { isTyping: false, name: '' };

  return {
    messages,
    activeMessages,
    activeConversationId,
    selectConversation,
    onlineUsers,
    unreadCounts,
    sendMessage,
    deleteMessage,
    editMessage,
    toggleReaction,
    clearChat,
    isTyping: currentTyping.isTyping,
    typingUserName: currentTyping.name,
    sendTypingStart,
    sendTypingStop,
  };
};
