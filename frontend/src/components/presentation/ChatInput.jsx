import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function ChatInput({
  message,
  setMessage,
  onSend,
  placeholder = 'Message as...',
  disabled = false,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => (typeof prev === 'string' ? prev + emojiData.emoji : emojiData.emoji));
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPicker]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
  };

  return (
    <div className="relative chat-input-container" style={{ position: 'relative', width: '100%' }}>
      {/* Emoji Picker Popup */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-14 left-0 z-50 shadow-2xl emoji-picker-popup"
          style={{
            position: 'absolute',
            bottom: '56px',
            left: '0',
            zIndex: 999,
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="light"
            width={320}
            height={400}
            searchDisabled={false}
          />
        </div>
      )}

      {/* Input Box */}
      <div
        className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border chat-input-box"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          borderRadius: '999px',
          padding: '6px 14px',
          border: '1.5px solid rgba(124, 58, 237, 0.25)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className="text-gray-500 hover:text-gray-700 btn-emoji-trigger"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '2px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Toggle emojis"
          aria-label="Toggle emojis"
        >
          😊
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full outline-none chat-input-element"
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '0.95rem',
            color: '#1e1b4b',
          }}
        />
      </div>
    </div>
  );
}
