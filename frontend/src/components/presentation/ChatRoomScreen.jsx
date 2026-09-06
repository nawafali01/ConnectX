import React, { useState, useRef, useEffect } from 'react';
import { LogoIcon } from '../../svgs/LogoIcon';
import { SendIcon } from '../../svgs/SendIcon';
import { UserPlusIcon } from '../../svgs/UserPlusIcon';
import { SmileIcon } from '../../svgs/SmileIcon';
import { MessageBubble } from './MessageBubble';
import { UserSwitcherModal } from './UserSwitcherModal';
import { EditProfileModal } from '../modals/EditProfileModal';
import { APP_CONFIG } from '../../constants/appConfig';

const QUICK_EMOJIS = ['👋', '😊', '🔥', '🚀', '💜', '🎉', '👍', '💯'];

export const ChatRoomScreen = ({
  activeUser,
  users,
  messages,
  onlineUsers = [],
  isTyping = false,
  typingUserName = '',
  onTypingStart,
  onTypingStop,
  onSendMessage,
  onSwitchUser,
  onAddNewUser,
  onViewProfile,
  onSaveProfile,
  onDeleteMessage,
  onEditMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (val.trim()) {
      onTypingStart?.();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTypingStop?.();
      }, 1500);
    } else {
      onTypingStop?.();
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTypingStop?.();

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="chat-viewport">
      {/* Header Bar */}
      <header className="chat-header">
        <div className="chat-header-left">
          <LogoIcon size={38} />
          <div className="chat-brand-info">
            <h2 className="chat-room-title">{APP_CONFIG.defaultRoom.name}</h2>
            <span className="chat-room-status">
              <span className="online-dot" />
              {onlineUsers.length > 0 ? `${onlineUsers.length} Online` : 'Connected'}
            </span>
          </div>
        </div>

        {/* User Switcher Controls */}
        <div className="chat-header-actions">
          {activeUser && (
            <button
              id="btn-active-user-badge"
              className="active-user-badge-btn"
              onClick={() => setShowEditProfile(true)}
              title="Click to edit your profile"
            >
              <div
                className="mini-avatar"
                style={{ background: activeUser.avatar?.bg || '#ede9fe', overflow: 'hidden', padding: 0 }}
              >
                {(activeUser.customPhoto || activeUser.avatar?.url) ? (
                  <img
                    src={activeUser.customPhoto || activeUser.avatar.url}
                    alt={activeUser.name}
                    width="26"
                    height="26"
                    style={{ borderRadius: '50%', display: 'block', objectFit: 'cover' }}
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <span className="active-user-name">{activeUser.name}</span>
            </button>
          )}

          <button
            id="btn-add-user-header"
            className="btn-add-user-icon"
            onClick={onAddNewUser}
            title="Add 2nd user to this chat room"
            aria-label="Add 2nd user"
          >
            <UserPlusIcon size={18} />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="chat-messages-container" data-testid="chat-messages-container">
        {messages.map((msg) => {
          const msgSenderId = String(msg.senderId || '');
          const currentUserId = String(activeUser?.id || activeUser?._id || '');
          const isOutgoing = Boolean(currentUserId && msgSenderId === currentUserId);
          return (
            <MessageBubble
              key={msg.id || msg._id}
              message={msg}
              isOutgoing={isOutgoing}
              onDelete={onDeleteMessage}
              onEdit={onEditMessage}
            />
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="typing-indicator-bar">
            <span className="typing-dots">
              <span />
              <span />
              <span />
            </span>
            <span className="typing-text">{typingUserName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis Drawer */}
      {showEmojiPicker && (
        <div className="quick-emojis-bar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="quick-emoji-chip"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Toolbar */}
      <form className="chat-toolbar" onSubmit={handleSend}>
        <div className="chat-input-pill">
          <button
            type="button"
            className="btn-emoji-toggle"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Toggle emojis"
            title="Quick emojis"
          >
            <SmileIcon size={20} />
          </button>

          <input
            id="chat-input-field"
            type="text"
            className="chat-text-input"
            placeholder={
              activeUser
                ? `Message as ${activeUser.name}...`
                : 'Type your message...'
            }
            value={inputText}
            onChange={handleInputChange}
            autoComplete="off"
          />
        </div>

        <button
          id="btn-send-message"
          type="submit"
          className="btn-send-message"
          disabled={!inputText.trim()}
          aria-label="Send message"
        >
          <SendIcon size={18} color="#ffffff" />
        </button>
      </form>

      {/* User Switcher Modal */}
      {showUserModal && (
        <UserSwitcherModal
          users={users}
          activeUserId={activeUser?.id}
          onSelectUser={onSwitchUser}
          onAddNewUser={onAddNewUser}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          user={activeUser}
          onSave={(updatedData) => {
            onSaveProfile?.(updatedData);
            setShowEditProfile(false);
          }}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </div>
  );
};
