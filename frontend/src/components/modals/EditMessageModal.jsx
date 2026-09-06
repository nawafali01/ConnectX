import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../../functions/formatters';

export const EditMessageModal = ({ message, onSave, onClose }) => {
  const [text, setText] = useState(message?.text || '');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(message?.text || '');
    setError('');
    // Auto-focus and place cursor at end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
  }, [message]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, message]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Message cannot be empty');
      return;
    }
    if (trimmed === message.text) {
      onClose();
      return;
    }
    onSave(message.id || message._id, trimmed);
    onClose();
  };

  if (!message) return null;

  return (
    <div className="edit-modal-backdrop" onClick={onClose}>
      <div
        className="edit-modal-panel edit-msg-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Edit Message"
      >
        {/* Header */}
        <div className="edit-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="edit-msg-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h3 className="edit-modal-title">Edit Message</h3>
              <p className="edit-msg-modal-sub">Modify your sent message</p>
            </div>
          </div>
          <button
            type="button"
            className="edit-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="edit-modal-body edit-msg-modal-body">
          {/* Original Preview Info */}
          <div className="edit-msg-preview-bar">
            <span className="edit-msg-preview-label">Original:</span>
            <span className="edit-msg-preview-time">
              {formatTime(message.createdAt || message.timestamp || new Date())}
            </span>
          </div>

          <div className="edit-msg-input-wrapper">
            <textarea
              ref={textareaRef}
              className="edit-msg-textarea"
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Type your updated message..."
              maxLength={2000}
            />
            <div className="edit-msg-meta-row">
              <span className="edit-msg-hint">Tip: Press <strong>Ctrl + Enter</strong> to save</span>
              <span className="edit-msg-counter">{text.length}/2000</span>
            </div>
          </div>

          {error && <p className="form-error-msg" style={{ marginTop: '8px' }}>{error}</p>}
        </div>

        {/* Modal Footer */}
        <div className="edit-modal-footer edit-msg-modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-modal-save"
            onClick={handleSave}
            disabled={!text.trim() || text.trim() === message.text}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
