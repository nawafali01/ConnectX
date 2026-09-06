import React, { useState, useRef, useEffect } from 'react';
import { formatTime } from '../../functions/formatters';
import { CheckCheckIcon } from '../../svgs/CheckCheckIcon';

export const MessageBubble = ({
  message,
  isOutgoing,
  activeUser,
  onDelete,
  onOpenEdit,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Determine if active user is the sender of this message
  const activeUserId = String(activeUser?.id || activeUser?._id || '');
  const senderId = String(message?.senderId || '');
  const isSender = Boolean(isOutgoing || (activeUserId && senderId && activeUserId === senderId));

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(message.text);
    setMenuOpen(false);
  };

  const menuItems = [
    ...(isSender
      ? [
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            ),
            label: 'Edit',
            action: () => {
              setMenuOpen(false);
              onOpenEdit?.(message);
            },
          },
        ]
      : []),
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      ),
      label: 'Copy',
      action: handleCopy,
    },
    ...(isSender
      ? [
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            ),
            label: 'Delete',
            action: () => {
              setMenuOpen(false);
              onDelete?.(message.id || message._id);
            },
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <div className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`} data-testid="message-bubble">

      {/* Incoming avatar */}
      {!isOutgoing && (
        <div
          className="msg-sender-avatar"
          style={{ background: message.senderAvatar?.bg || '#ede9fe' }}
          title={message.senderName}
        >
          {(message.senderCustomPhoto || message.senderAvatar?.url) ? (
            <img
              src={message.senderCustomPhoto || message.senderAvatar.url}
              alt={message.senderName}
              width="34"
              height="34"
              style={{ borderRadius: '10px', display: 'block', objectFit: 'cover' }}
            />
          ) : (
            <span>👤</span>
          )}
        </div>
      )}

      <div className="msg-content-wrapper">
        {!isOutgoing && (
          <span className="msg-sender-header">{message.senderName}</span>
        )}

        {/* Bubble + 3-dot button row */}
        <div className="msg-bubble-row">

          {/* 3-dot menu (left side for outgoing, right for incoming) */}
          <div className="msg-menu-wrapper" ref={menuRef}>
            <button
              className="msg-three-dot-btn"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Message options"
              title="Options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>

            {menuOpen && (
              <div className={`msg-context-menu ${isOutgoing ? 'menu-left' : 'menu-right'}`}>
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className={`msg-menu-item ${item.danger ? 'danger' : ''}`}
                    onClick={item.action}
                  >
                    <span className="msg-menu-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bubble */}
          <div className="msg-bubble">
            <p>{message.text}</p>
            <div className="msg-footer">
              {message.edited && <span className="msg-edited-tag">edited</span>}
              <span className="msg-time">
                {formatTime(message.createdAt || message.timestamp || new Date())}
              </span>
              {isOutgoing && (
                <CheckCheckIcon
                  size={14}
                  color={message.status === 'read' ? '#ddd6fe' : '#a78bfa'}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
