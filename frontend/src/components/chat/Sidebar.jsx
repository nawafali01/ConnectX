import React, { useState, useMemo } from 'react';
import { Avatar } from '../common/Avatar';
import {
  Search,
  Users,
  MessageSquare,
  UserPlus,
  Settings,
  X,
  Check,
  CheckCheck,
} from 'lucide-react';

export const Sidebar = ({
  activeUser,
  users = [],
  groups = [],
  messages = [],
  activeConversationId,
  onSelectConversation,
  unreadCounts = {},
  onOpenGroupModal,
  onOpenSettings,
  onlineUsers = [],
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'groups'
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to get deterministic DM room ID
  const getDmRoomId = (userIdA, userIdB) => {
    return `dm_${[userIdA, userIdB].sort().join('_')}`;
  };

  // Helper to format timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Direct message contacts (all human users except current active user)
  const dmContacts = useMemo(() => {
    if (!activeUser) return [];
    const activeUserId = String(activeUser.id || activeUser._id || '');
    const activeUserName = activeUser.name?.trim().toLowerCase();

    return users
      .filter((u) => {
        const uId = String(u.id || u._id || '');
        const uName = u.name?.trim().toLowerCase();
        if (uId === activeUserId || (activeUserName && uName === activeUserName)) return false;
        if (u.isSystem) return false;
        return true;
      })
      .map((u) => {
        const roomId = getDmRoomId(activeUser.id, u.id);
        const roomMessages = messages.filter((m) => (m.room || 'general') === roomId);
        const lastMsg = roomMessages[roomMessages.length - 1] || null;
        const unread = unreadCounts[roomId] || 0;
        const isOnline =
          onlineUsers.some((ou) => String(ou.userId) === String(u.id)) || u.isOnline;

        return {
          id: roomId,
          targetUser: u,
          name: u.name,
          avatar: u.avatar,
          customPhoto: u.customPhoto,
          lastMessage: lastMsg,
          unread,
          isOnline,
          isGroup: false,
        };
      });
  }, [users, activeUser, messages, unreadCounts, onlineUsers]);

  // Group chats list
  const groupChats = useMemo(() => {
    return groups.map((g) => {
      const roomMessages = messages.filter((m) => (m.room || 'general') === g.id);
      const lastMsg = roomMessages[roomMessages.length - 1] || null;
      const unread = unreadCounts[g.id] || 0;

      return {
        id: g.id,
        name: g.name,
        description: g.description,
        avatar: g.avatar,
        lastMessage: lastMsg,
        unread,
        isGroup: true,
        memberCount: g.members?.length || 0,
      };
    });
  }, [groups, messages, unreadCounts]);

  // Filtered lists based on search query
  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceList = activeTab === 'direct' ? dmContacts : groupChats;

    if (!query) return sourceList;

    return sourceList.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query);
      const msgMatch = item.lastMessage?.text?.toLowerCase().includes(query);
      return nameMatch || msgMatch;
    });
  }, [activeTab, dmContacts, groupChats, searchQuery]);

  return (
    <aside
      className={`h-full flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 select-none ${className}`}
    >
      {/* 1. Profile Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            user={activeUser}
            size="md"
            showOnlineStatus
            isOnline={true}
          />
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-slate-100 truncate leading-tight flex items-center gap-1.5">
              {activeUser?.name || 'My Profile'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">Online</span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400 truncate">
                {activeUser?.role || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Profile Settings"
            aria-label="Profile Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts & chats..."
            style={{ paddingLeft: '42px', paddingRight: '34px' }}
            className="w-full h-10 bg-slate-800/90 border border-slate-700/90 focus:border-violet-500 rounded-xl text-xs text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 flex items-center text-slate-400 hover:text-slate-200 p-1 z-10"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Segmented Tabs & Action Button */}
      <div className="px-3 pb-2 flex items-center gap-2 justify-between">
        <div className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs font-semibold flex-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'direct'
                ? 'bg-violet-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={14} />
            <span>Direct</span>
            {dmContacts.some((c) => c.unread > 0) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'groups'
                ? 'bg-violet-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            <span>Groups</span>
            {groupChats.some((g) => g.unread > 0) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Action Button: New Group / Add Contact */}
        <button
          id="btn-sidebar-new-group"
          type="button"
          onClick={onOpenGroupModal}
          className="h-9 w-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/40 transition-all flex items-center justify-center shadow-md shadow-violet-600/30 flex-shrink-0 active:scale-95"
          title="Create New Group / Add User"
          aria-label="New Group"
        >
          <UserPlus size={16} />
        </button>
      </div>

      {/* 4. Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 divide-y divide-slate-800/40">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-2">
              {activeTab === 'direct' ? <MessageSquare size={18} /> : <Users size={18} />}
            </div>
            <p className="text-xs font-semibold text-slate-400">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activeTab === 'direct'
                ? 'Select a contact to start chatting'
                : 'Create a group to chat with multiple team members'}
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isSelected = activeConversationId === item.id;
            const lastMsg = item.lastMessage;
            const isSentByMe =
              lastMsg && String(lastMsg.senderId) === String(activeUser?.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectConversation(item.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 my-0.5 group relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600/25 to-indigo-600/15 border border-violet-500/40 shadow-sm'
                    : 'hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                {/* Avatar with status indicator */}
                <div className="relative flex-shrink-0">
                  {item.isGroup ? (
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-violet-500/20"
                      style={{
                        background:
                          item.avatar?.gradient ||
                          'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
                      }}
                    >
                      {item.avatar?.emoji || '👥'}
                    </div>
                  ) : (
                    <Avatar
                      user={item.targetUser}
                      avatar={item.avatar}
                      customPhoto={item.customPhoto}
                      name={item.name}
                      size="md"
                      showOnlineStatus
                      isOnline={item.isOnline}
                    />
                  )}
                </div>

                {/* Conversation Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-white font-bold' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                      {formatTime(lastMsg?.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      {isSentByMe && (
                        <span className="text-violet-400 flex-shrink-0">
                          {lastMsg?.status === 'read' ? (
                            <CheckCheck size={12} className="text-indigo-400" />
                          ) : (
                            <Check size={12} className="text-slate-400" />
                          )}
                        </span>
                      )}
                      <span className="truncate">
                        {lastMsg
                          ? lastMsg.mediaUrl
                            ? '📷 Image'
                            : lastMsg.text
                          : item.description || 'Start the conversation...'}
                      </span>
                    </p>

                    {/* Unread Badge */}
                    {item.unread > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-violet-600 text-white font-bold text-[10px] min-w-[18px] text-center shadow-sm">
                        {item.unread}
                      </span>
                    )}
                  </div>
                </div>

                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-violet-500" />
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
