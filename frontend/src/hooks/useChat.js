import { useState, useEffect, useCallback } from 'react';
import { getStoredMessages, saveStoredMessages } from '../functions/storage';
import { generateId } from '../functions/idGenerator';
import { INITIAL_MESSAGES } from '../constants/initialData';

export const useChat = (activeUser) => {
  const [messages, setMessages] = useState(() => {
    const saved = getStoredMessages();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_MESSAGES;
  });

  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');

  // Persist messages whenever they update
  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  /**
   * Send a new message from the current active user
   */
  const sendMessage = useCallback(
    (text) => {
      if (!text || !text.trim() || !activeUser) return null;

      const trimmed = text.trim();
      const newMsg = {
        id: generateId('msg'),
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        text: trimmed,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, newMsg]);

      // Update status to delivered after 400ms, then read after 900ms
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
        );
      }, 400);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
        );
      }, 1000);

      return newMsg;
    },
    [activeUser]
  );

  /**
   * Trigger simulated typing indicator
   */
  const simulateTyping = useCallback((userName, durationMs = 2500) => {
    setTypingUserName(userName);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setTypingUserName('');
    }, durationMs);
  }, []);

  /**
   * Reset messages back to initial state
   */
  const resetChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  return {
    messages,
    sendMessage,
    isTyping,
    typingUserName,
    simulateTyping,
    resetChat,
  };
};
