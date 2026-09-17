import React, { useRef, useEffect, useMemo } from 'react';
import { Avatar } from '../common/Avatar';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import {
  ChevronLeft,
  Search,
  Phone,
  Video,
  Info,
  MoreVertical,
  Users,
} from 'lucide-react';

export const ChatArea = ({
  conversation,
  activeUser,
  messages = [],
  isTyping = false,
  typingUserName = '',
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onDeleteMessage,
  onEditMessage,
  onToggleReaction,
  onViewMedia,
  onBackToList,
  onToggleDetails,
  onlineUsers = [],
}) => {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom whenever messages or typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Format date helper
  const getDateLabel = (isoDate) => {
    if (!isoDate) return 'Today';
    const msgDate = new Date(isoDate);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: msgDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Group messages by calendar date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDateLabel = null;

    messages.forEach((msg) => {
      const dateLabel = getDateLabel(msg.createdAt);
      if (dateLabel !== currentDateLabel) {
        currentDateLabel = dateLabel;
        groups.push({ type: 'date', label: dateLabel });
      }
      groups.push({ type: 'message', data: msg });
    });

    return groups;
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 text-slate-400 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-violet-400 mb-4 shadow-xl shadow-violet-500/5">
          <Users size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-200">ConnectX Real-time Messenger</h2>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Select a chat or start a new group from the sidebar to begin messaging in real time.
        </p>
      </div>
    );
  }

  const isGroup = Boolean(conversation.isGroup);
  const isTargetOnline =
    !isGroup &&
    (onlineUsers.some((ou) => String(ou.userId) === String(conversation.targetUser?.id)) ||
      conversation.isOnline);

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 relative overflow-hidden">
      {/* 1. Conversation Header (WhatsApp Style with Mobile Back Button) */}
      <header className="h-16 px-3 sm:px-4 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between z-20 backdrop-blur-md select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Back Button (WhatsApp Return Arrow) */}
          <button
            type="button"
            onClick={onBackToList}
            className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to conversations"
            aria-label="Back to chat list"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Avatar & Info (clickable to open details drawer) */}
          <div
            onClick={onToggleDetails}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
            title="Click to view details"
          >
            {isGroup ? (
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-violet-500/30 flex-shrink-0"
                style={{
                  background:
                    conversation.avatar?.gradient ||
                    'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
                }}
              >
                {conversation.avatar?.emoji || '👥'}
              </div>
            ) : (
              <Avatar
                user={conversation.targetUser}
                avatar={conversation.avatar}
                customPhoto={conversation.customPhoto}
                name={conversation.name}
                size="md"
                showOnlineStatus
                isOnline={isTargetOnline}
              />
            )}

            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors truncate leading-tight">
                {conversation.name}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                {isGroup ? (
                  <span>{conversation.memberCount || conversation.members?.length || 4} participants</span>
                ) : isTargetOnline ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span>Offline</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-0.5 sm:gap-1 text-slate-400">
          <button
            type="button"
            onClick={() => alert(`Starting voice call with ${conversation.name}...`)}
            className="p-2 rounded-xl hover:text-slate-100 hover:bg-slate-800 transition-colors hidden sm:inline-flex"
            title="Voice call"
          >
            <Phone size={17} />
          </button>

          <button
            type="button"
            onClick={() => alert(`Starting video call with ${conversation.name}...`)}
            className="p-2 rounded-xl hover:text-slate-100 hover:bg-slate-800 transition-colors hidden sm:inline-flex"
            title="Video call"
          >
            <Video size={17} />
          </button>

          <button
            id="btn-toggle-chat-details"
            type="button"
            onClick={onToggleDetails}
            className="p-2 rounded-xl hover:text-violet-300 hover:bg-slate-800 transition-colors"
            title="Chat info & shared media"
            aria-label="Toggle Details Drawer"
          >
            <Info size={18} />
          </button>
        </div>
      </header>

      {/* 2. Message Feed Area */}
      <div
        className="flex-1 overflow-y-auto px-1 sm:px-2 py-3 space-y-1 relative"
        style={{
          backgroundImage:
            'radial-gradient(rgba(124, 58, 237, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {groupedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 select-none">
            <p className="text-xs">No messages yet.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Send a greeting to start the conversation! 👋
            </p>
          </div>
        ) : (
          groupedMessages.map((item, idx) => {
            if (item.type === 'date') {
              return (
                <div
                  key={`date-${item.label}-${idx}`}
                  className="flex items-center justify-center my-3 select-none"
                >
                  <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] font-semibold text-slate-400 shadow-sm backdrop-blur-sm">
                    {item.label}
                  </span>
                </div>
              );
            }

            const msg = item.data;
            const isOutgoing = String(msg.senderId) === String(activeUser?.id);

            return (
              <MessageBubble
                key={msg.id || msg._id || idx}
                message={msg}
                isOutgoing={isOutgoing}
                activeUser={activeUser}
                showSenderHeader={isGroup}
                onDelete={onDeleteMessage}
                onOpenEdit={onEditMessage}
                onToggleReaction={onToggleReaction}
                onViewMedia={onViewMedia}
              />
            );
          })
        )}

        {/* Real-time Typing Indicator Bar */}
        {isTyping && (
          <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-violet-400 select-none animate-in fade-in duration-200">
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
              <span className="text-[11px] text-slate-300 ml-1.5 font-medium">
                {typingUserName || 'Someone'} is typing...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Footer Bar */}
      <ChatInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        placeholder={`Message ${conversation.name}...`}
      />
    </div>
  );
};
