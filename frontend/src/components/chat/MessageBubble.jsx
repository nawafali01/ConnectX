import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../common/Avatar';
import { Check, CheckCheck, Trash2, Edit2, Smile, Copy } from 'lucide-react';
import { VoiceMessageBubble } from './VoiceMessageBubble';

const EMOJI_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀'];

export const MessageBubble = ({
  message,
  isOutgoing,
  activeUser,
  onDelete,
  onOpenEdit,
  onToggleReaction,
  onViewMedia,
  showSenderHeader = true,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowActions(false);
        setShowReactionPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setShowActions(false);
    }
  };

  const reactions = message.reactions || {};
  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <div
      className={`group relative flex items-start gap-2.5 my-2.5 px-3 sm:px-4 ${
        isOutgoing ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (!showReactionPicker) setShowActions(false);
      }}
    >
      {/* Incoming Message Avatar aligned to top */}
      {!isOutgoing && (
        <Avatar
          user={{
            name: message.senderName,
            avatar: message.senderAvatar,
            customPhoto: message.senderCustomPhoto,
          }}
          size="sm"
          className="mt-0.5 flex-shrink-0"
        />
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] flex flex-col ${
          isOutgoing ? 'items-end' : 'items-start'
        }`}
      >
        {/* Bubble Shell */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-md text-sm break-words transition-all ${
            isOutgoing
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-violet-600/25'
              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/80 shadow-slate-900/50'
          }`}
        >
          {/* Sender Name INSIDE incoming bubble for groups (WhatsApp style) */}
          {!isOutgoing && showSenderHeader && (
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs font-bold text-violet-400 hover:underline cursor-pointer">
                {message.senderName || 'Anonymous'}
              </span>
            </div>
          )}

          {/* Voice Message if audio */}
          {message.mediaType === 'audio' && message.mediaUrl && (
            <VoiceMessageBubble
              audioUrl={message.mediaUrl}
              duration={message.audioDuration}
              isOutgoing={isOutgoing}
            />
          )}

          {/* Media Attachment if image */}
          {message.mediaUrl && message.mediaType !== 'audio' && (
            <div className="my-1.5 rounded-xl overflow-hidden cursor-pointer group/media relative max-w-sm border border-black/20">
              <img
                src={message.mediaUrl}
                alt="Shared attachment"
                className="w-full max-h-72 object-cover rounded-xl transition-transform duration-200 group-hover/media:scale-[1.02]"
                onClick={() => onViewMedia?.(message.mediaUrl)}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover/media:bg-transparent transition-colors" />
            </div>
          )}

          {/* Message Text */}
          {message.text && (
            <p className="whitespace-pre-wrap leading-relaxed text-[13px] sm:text-sm">
              {message.text}
            </p>
          )}

          {/* Footer inside bubble: Time & Read Receipt Ticks */}
          <div
            className={`flex items-center justify-end gap-1 mt-1 select-none text-[10px] ${
              isOutgoing ? 'text-violet-200' : 'text-slate-400'
            }`}
          >
            {message.edited && (
              <span className="italic opacity-80 text-[9px]">edited</span>
            )}
            <span>{formatTimestamp(message.createdAt)}</span>

            {/* Read Receipt Double Ticks for Outgoing */}
            {isOutgoing && (
              <span className="ml-0.5 inline-flex items-center">
                {message.status === 'read' ? (
                  <CheckCheck size={14} className="text-cyan-300" title="Read" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck size={14} className="text-violet-200" title="Delivered" />
                ) : (
                  <Check size={14} className="text-violet-300" title="Sent" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges below bubble */}
        {hasReactions && (
          <div
            className={`flex items-center gap-1 mt-1 px-1 flex-wrap ${
              isOutgoing ? 'justify-end' : 'justify-start'
            }`}
          >
            {Object.entries(reactions).map(([emoji, uids]) => {
              const isReactedByMe = uids.includes(activeUser?.id);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onToggleReaction?.(message.id || message._id, emoji)}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] border transition-all ${
                    isReactedByMe
                      ? 'bg-violet-600/30 border-violet-500/50 text-violet-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold text-[10px]">{uids.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover Action Toolbar */}
      {showActions && (
        <div
          ref={menuRef}
          className={`flex items-center gap-0.5 p-1 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-10 animate-in fade-in duration-100 ${
            isOutgoing ? 'order-first' : 'order-last'
          }`}
        >
          {/* Reaction Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReactionPicker((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title="Add reaction"
            >
              <Smile size={14} />
            </button>

            {/* Quick Emoji Reaction Popup */}
            {showReactionPicker && (
              <div className="absolute bottom-8 left-0 flex items-center gap-1 p-1 bg-slate-900 border border-slate-700 rounded-full shadow-2xl z-20 animate-in zoom-in-90 duration-150">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onToggleReaction?.(message.id || message._id, emoji);
                      setShowReactionPicker(false);
                      setShowActions(false);
                    }}
                    className="p-1 hover:scale-125 transition-transform text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Copy text"
          >
            <Copy size={14} />
          </button>

          {isOutgoing && onOpenEdit && (
            <button
              type="button"
              onClick={() => {
                onOpenEdit(message);
                setShowActions(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-slate-800 transition-colors"
              title="Edit message"
            >
              <Edit2 size={14} />
            </button>
          )}

          {isOutgoing && onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(message.id || message._id);
                setShowActions(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Delete message"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
