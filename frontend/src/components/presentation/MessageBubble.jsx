import React from 'react';
import { formatTime } from '../../functions/formatters';
import { CheckCheckIcon } from '../../svgs/CheckCheckIcon';

export const MessageBubble = ({ message, isOutgoing }) => {
  return (
    <div
      className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`}
      data-testid="message-bubble"
    >
      {/* Sender Avatar for incoming messages */}
      {!isOutgoing && (
        <div
          className="msg-sender-avatar"
          style={{ background: message.senderAvatar?.bg || '#ede9fe' }}
          title={message.senderName}
        >
          {message.senderAvatar?.url ? (
            <img
              src={message.senderAvatar.url}
              alt={message.senderName}
              width="34"
              height="34"
              style={{ borderRadius: '10px', display: 'block' }}
            />
          ) : (
            <span>👤</span>
          )}
        </div>
      )}

      <div className="msg-content-wrapper">
        {/* Name label if incoming */}
        {!isOutgoing && (
          <span className="msg-sender-header">{message.senderName}</span>
        )}

        <div className="msg-bubble">
          <p>{message.text}</p>
          <div className="msg-footer">
            <span>{formatTime(message.timestamp)}</span>
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
  );
};
