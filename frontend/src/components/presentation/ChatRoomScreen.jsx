import React, { useState, useRef, useEffect } from 'react';
import { LogoIcon } from '../../svgs/LogoIcon';
import { SendIcon } from '../../svgs/SendIcon';
import { UserPlusIcon } from '../../svgs/UserPlusIcon';
import { SmileIcon } from '../../svgs/SmileIcon';
import { MessageBubble } from './MessageBubble';
import { UserSwitcherModal } from './UserSwitcherModal';
import { APP_CONFIG } from '../../constants/appConfig';

const QUICK_EMOJIS = ['👋', '😊', '🔥', '🚀', '💜', '🎉', '👍', '💯'];

export const ChatRoomScreen = ({
  activeUser,
  users,
  messages,
  onSendMessage,
  onSwitchUser,
  onAddNewUser,
  onViewProfile,
}) => {
  const [inputText, setInputText] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

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
            <div className="chat-room-status">
              <span className="online-dot" />
              <span>{users.length} participants connected</span>
            </div>
          </div>
        </div>

        {/* User Switcher Controls */}
        <div className="chat-header-actions">
          {activeUser && (
            <button
              id="btn-active-user-badge"
              className="active-user-badge-btn"
              onClick={() => setShowUserModal(true)}
              title="Click to switch typing user"
            >
              <div
                className="mini-avatar"
                style={{ background: activeUser.avatar?.bg || '#ede9fe', overflow: 'hidden', padding: 0 }}
              >
                {activeUser.avatar?.url ? (
                  <img
                    src={activeUser.avatar.url}
                    alt={activeUser.name}
                    width="26"
                    height="26"
                    style={{ borderRadius: '50%', display: 'block' }}
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
        <div className="date-separator">
          <span className="date-separator-pill">ConnectX Live Chat</span>
        </div>

        {messages.map((msg) => {
          const isOutgoing = activeUser && msg.senderId === activeUser.id;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOutgoing={isOutgoing}
            />
          );
        })}

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
            onChange={(e) => setInputText(e.target.value)}
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
    </div>
  );
};
