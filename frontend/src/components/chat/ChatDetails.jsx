import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import {
  X,
  Users,
  ShieldCheck,
  User,
  Image as ImageIcon,
  Bell,
  BellOff,
  LogOut,
  Trash2,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

export const ChatDetails = ({
  conversation,
  activeUser,
  users = [],
  messages = [],
  onClose,
  onLeaveGroup,
  onClearChat,
  onViewMedia,
  onlineUsers = [],
  className = '',
}) => {
  const [isMuted, setIsMuted] = useState(false);

  if (!conversation) return null;

  const isGroup = Boolean(conversation.isGroup);

  // Get member details for group
  const groupMembers = isGroup
    ? (conversation.members || []).map((memberId) => {
        const found = users.find((u) => u.id === memberId);
        const isAdmin = (conversation.admins || []).includes(memberId);
        const isOnline =
          onlineUsers.some((ou) => String(ou.userId) === String(memberId)) ||
          found?.isOnline;

        return {
          id: memberId,
          user: found,
          name: found?.name || 'Member',
          role: found?.role || 'Team Member',
          avatar: found?.avatar,
          customPhoto: found?.customPhoto,
          isAdmin,
          isOnline,
        };
      })
    : [];

  // Find shared media in this conversation
  const sharedMedia = messages
    .filter((m) => m.mediaUrl)
    .map((m) => ({
      id: m.id || m._id,
      url: m.mediaUrl,
      senderName: m.senderName,
      createdAt: m.createdAt,
    }));

  return (
    <aside
      className={`h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 select-none overflow-hidden ${className}`}
    >
      {/* 1. Header with Close Button */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          {isGroup ? <Users size={16} className="text-violet-400" /> : <User size={16} className="text-violet-400" />}
          <span>{isGroup ? 'Group Information' : 'Contact Details'}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Close details"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Profile Card / Hero */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
          {isGroup ? (
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl border border-violet-500/30 mb-3"
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
              size="2xl"
              showOnlineStatus
              isOnline={
                onlineUsers.some(
                  (ou) => String(ou.userId) === String(conversation.targetUser?.id)
                ) || conversation.isOnline
              }
              className="mb-3"
            />
          )}

          <h2 className="font-bold text-base text-white">{conversation.name}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
            {conversation.description ||
              conversation.targetUser?.bio ||
              'Active on ConnectX'}
          </p>

          {!isGroup && conversation.targetUser?.phone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <Phone size={12} className="text-slate-500" />
              <span>{conversation.targetUser.phone}</span>
            </div>
          )}
        </div>

        {/* Group Member List with Badges (Admin / Member) */}
        {isGroup && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                Members ({groupMembers.length})
              </span>
            </div>

            <div className="divide-y divide-slate-800/50 bg-slate-800/30 rounded-2xl border border-slate-800/80 overflow-hidden">
              {groupMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      user={member.user}
                      avatar={member.avatar}
                      customPhoto={member.customPhoto}
                      name={member.name}
                      size="sm"
                      showOnlineStatus
                      isOnline={member.isOnline}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-100 truncate flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {member.id === activeUser?.id && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {member.role}
                      </div>
                    </div>
                  </div>

                  {/* Badge: Admin vs Member */}
                  {member.isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-600/25 border border-violet-500/40 text-[10px] font-bold text-violet-300">
                      <ShieldCheck size={11} />
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400">
                      Member
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Media Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ImageIcon size={13} />
              <span>Shared Media ({sharedMedia.length})</span>
            </span>
          </div>

          {sharedMedia.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 text-center text-xs text-slate-500">
              No photos or media shared yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((media) => (
                <div
                  key={media.id}
                  onClick={() => onViewMedia?.(media.url)}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 cursor-pointer group relative shadow-sm"
                >
                  <img
                    src={media.url}
                    alt="Shared media"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings & Options */}
        <div className="space-y-1.5 pt-2">
          {/* Mute toggle */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {isMuted ? <BellOff size={16} className="text-amber-400" /> : <Bell size={16} />}
              <span>Mute Notifications</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {isMuted ? 'Muted' : 'Off'}
            </span>
          </button>

          {/* Leave or Clear Chat */}
          {isGroup ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Leave group "${conversation.name}"?`)) {
                  onLeaveGroup?.(conversation.id);
                  onClose();
                }
              }}
              className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 text-xs font-semibold text-rose-400 transition-colors"
            >
              <LogOut size={16} />
              <span>Leave Group</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear this chat history?')) {
                  onClearChat?.();
                }
              }}
              className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 text-xs font-semibold text-rose-400 transition-colors"
            >
              <Trash2 size={16} />
              <span>Clear Chat History</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
