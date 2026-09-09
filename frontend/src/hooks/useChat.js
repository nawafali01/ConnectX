import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../services/socket';
import { api } from '../services/api';
import { getStoredMessages, saveStoredMessages } from '../functions/storage';

export const useChat = (activeUser) => {
  const [messages, setMessages] = useState(() => {
    const saved = getStoredMessages();
    return Array.isArray(saved) && saved.length > 0 ? saved : [];
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');
  const socketRef = useRef(null);
  const activeUserRef = useRef(activeUser);

  // Keep activeUserRef in sync
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  // Persist messages whenever updated
  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  // Initialize socket and listeners
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // Load initial message history from backend
    api.getMessages('general')
      .then((res) => {
        if (res && res.success && Array.isArray(res.messages)) {
          const formatted = res.messages.map((m) => ({
            ...m,
            id: (m.id || m._id).toString(),
            status: m.status || 'sent',
          }));
          setMessages(formatted);
          saveStoredMessages(formatted);
        }
      })
      .catch((err) => console.warn('Failed to load message history:', err));

    const emitJoin = () => {
      if (activeUserRef.current?.id) {
        socket.emit('user:join', {
          userId: activeUserRef.current.id,
          name: activeUserRef.current.name,
          avatar: activeUserRef.current.avatar,
          customPhoto: activeUserRef.current.customPhoto || null,
        });
      }
    };

    socket.on('connect', emitJoin);

    // If already connected, join immediately
    if (socket.connected) {
      emitJoin();
    }

    // Handle incoming messages from broadcast
    const handleNewMessage = (newMsg) => {
      const formatted = {
        ...newMsg,
        id: (newMsg.id || newMsg._id).toString(),
      };

      setMessages((prev) => {
        // 1. If exact ID already exists, replace/update it
        const existsById = prev.some((m) => (m.id || m._id)?.toString() === formatted.id);
        if (existsById) {
          return prev.map((m) => ((m.id || m._id)?.toString() === formatted.id ? formatted : m));
        }

        // 2. If it matches an optimistic local message from same sender
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

    // Handle typing events
    const handleTypingShow = ({ name }) => {
      setTypingUserName(name || 'Someone');
      setIsTyping(true);
    };

    const handleTypingHide = () => {
      setIsTyping(false);
      setTypingUserName('');
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

  /**
   * Send a new message with optimistic UI display
   */
  const sendMessage = useCallback(
    (text, media = null) => {
      const trimmed = typeof text === 'string' ? text.trim() : '';
      const mediaUrl = media?.mediaUrl || media?.url || null;
      const mediaType = media?.mediaType || (mediaUrl ? 'image' : null);

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
        room: 'general',
        status: 'sent',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      // 1. Immediately show message in sender's UI (instant feedback)
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
        room: messageData.room,
      });

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

    // Optimistically remove from UI
    setMessages((prev) =>
      prev.filter((m) => (m.id || m._id)?.toString() !== targetId)
    );

    const socket = socketRef.current || getSocket();
    socket.emit('message:delete', { messageId: targetId, room: 'general' });
  }, []);

  /**
   * Edit a message via Socket.IO
   */
  const editMessage = useCallback((msgId, newText) => {
    if (!msgId || !newText?.trim()) return;
    const trimmed = newText.trim();
    const targetId = msgId.toString();

    // Optimistically update in UI
    setMessages((prev) =>
      prev.map((m) =>
        (m.id || m._id)?.toString() === targetId
          ? { ...m, text: trimmed, edited: true }
          : m
      )
    );

    const socket = socketRef.current || getSocket();
    socket.emit('message:edit', { messageId: targetId, text: trimmed, room: 'general' });
  }, []);

  /**
   * Typing indicator triggers
   */
  const sendTypingStart = useCallback(() => {
    if (!activeUserRef.current) return;
    const socket = socketRef.current || getSocket();
    socket.emit('typing:start', {
      name: activeUserRef.current.name,
      room: 'general',
    });
  }, []);

  const sendTypingStop = useCallback(() => {
    const socket = socketRef.current || getSocket();
    socket.emit('typing:stop', { room: 'general' });
  }, []);

  /**
   * Clear all messages in the chat
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    saveStoredMessages([]);
    const socket = socketRef.current || getSocket();
    socket.emit('messages:clear', { room: 'general' });
  }, []);

  return {
    messages,
    onlineUsers,
    sendMessage,
    deleteMessage,
    editMessage,
    clearChat,
    isTyping,
    typingUserName,
    sendTypingStart,
    sendTypingStop,
  };
};
