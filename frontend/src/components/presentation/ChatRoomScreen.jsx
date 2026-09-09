import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { LogoIcon } from '../../svgs/LogoIcon';
import { SendIcon } from '../../svgs/SendIcon';
import { UserPlusIcon } from '../../svgs/UserPlusIcon';
import { SmileIcon } from '../../svgs/SmileIcon';
import { PlusIcon } from '../../svgs/PlusIcon';
import { MessageBubble } from './MessageBubble';
import { UserSwitcherModal } from './UserSwitcherModal';
import { EditProfileModal } from '../modals/EditProfileModal';
import { EditMessageModal } from '../modals/EditMessageModal';
import { APP_CONFIG } from '../../constants/appConfig';
import { api } from '../../services/api';

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
  const [editingMessage, setEditingMessage] = useState(null);

  // Media Attachment State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showEmojiPicker]);

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, GIF, SVG).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleClearAttachment = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (isUploading) return;
    if (!inputText.trim() && !selectedFile) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTypingStop?.();

    const textToSend = inputText.trim();

    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadRes = await api.uploadMedia(selectedFile);
        if (uploadRes && uploadRes.success && uploadRes.url) {
          onSendMessage(textToSend, {
            mediaUrl: uploadRes.url,
            mediaType: uploadRes.mediaType || 'image',
          });
          handleClearAttachment();
          setInputText('');
          setShowEmojiPicker(false);
        } else {
          alert(uploadRes?.message || 'Failed to upload image. Please try again.');
        }
      } catch (err) {
        console.error('Error sending media message:', err);
        alert('Failed to upload image.');
      } finally {
        setIsUploading(false);
      }
    } else {
      onSendMessage(textToSend);
      setInputText('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emojiChar = typeof emojiData === 'string' ? emojiData : emojiData?.emoji;
    if (emojiChar) {
      setInputText((prev) => prev + emojiChar);
    }
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
              activeUser={activeUser}
              onDelete={onDeleteMessage}
              onOpenEdit={(messageToEdit) => setEditingMessage(messageToEdit)}
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

      {/* Floating Emoji Picker Popup */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="emoji-picker-popup">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="auto"
            width={320}
            height={390}
            searchDisabled={false}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Attachment Preview Banner */}
      {filePreview && (
        <div className="attachment-preview-bar">
          <div className="attachment-preview-thumb-box">
            <img src={filePreview} alt="Selected asset" className="attachment-preview-thumb" />
            {isUploading && (
              <div className="attachment-uploading-overlay">
                <div className="attachment-spinner" />
              </div>
            )}
          </div>
          <div className="attachment-preview-info">
            <span className="attachment-filename">{selectedFile?.name}</span>
            <span className="attachment-filesize">
              {isUploading ? 'Uploading to Cloudinary...' : `${(selectedFile.size / 1024).toFixed(1)} KB`}
            </span>
          </div>
          {!isUploading && (
            <button
              type="button"
              className="attachment-btn-remove"
              onClick={handleClearAttachment}
              aria-label="Remove attachment"
              title="Remove attachment"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Message Input Toolbar */}
      <form className="chat-toolbar" onSubmit={handleSend}>
        <div className="chat-input-pill">
          {/* Plus button for attachments */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button
            type="button"
            className="btn-attach-toggle"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Attach asset or image"
            title="Attach image"
          >
            <PlusIcon size={19} />
          </button>

          <button
            ref={emojiButtonRef}
            type="button"
            className={`btn-emoji-toggle ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Toggle emojis"
            title="Choose emojis"
          >
            <SmileIcon size={20} />
          </button>

          <input
            id="chat-input-field"
            type="text"
            className="chat-text-input"
            placeholder={
              selectedFile
                ? 'Add a caption...'
                : activeUser
                ? `Message as ${activeUser.name}...`
                : 'Type your message...'
            }
            value={inputText}
            onChange={handleInputChange}
            disabled={isUploading}
            autoComplete="off"
          />
        </div>

        <button
          id="btn-send-message"
          type="submit"
          className="btn-send-message"
          disabled={isUploading || (!inputText.trim() && !selectedFile)}
          aria-label="Send message"
          title={isUploading ? 'Uploading...' : 'Send message'}
        >
          {isUploading ? (
            <div className="btn-send-spinner" />
          ) : (
            <SendIcon size={18} color="#ffffff" />
          )}
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

      {/* Edit Message Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={(msgId, newText) => {
            onEditMessage?.(msgId, newText);
          }}
          onClose={() => setEditingMessage(null)}
        />
      )}
    </div>
  );
};
