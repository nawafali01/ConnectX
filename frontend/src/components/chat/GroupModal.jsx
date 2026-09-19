import React, { useState, useMemo } from 'react';
import { Avatar } from '../common/Avatar';
import { isFakeUser } from '../../functions/storage';
import { useToast } from '../../context/ToastContext';
import { X, Search, Check, Users, Sparkles } from 'lucide-react';

const GROUP_EMOJIS = ['🚀', '🎨', '⚡', '💻', '🔥', '🎉', '🧠', '🌟', '🏆', '💎', '🎯', '📢'];

export const GroupModal = ({
  users = [],
  activeUser,
  onCreateGroup,
  onClose,
}) => {
  const { toast } = useToast();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Available users (all human users except current active user and fake users)
  const availableUsers = useMemo(() => {
    return users.filter((u) => u.id !== activeUser?.id && !u.isSystem && !isFakeUser(u));
  }, [users, activeUser]);

  // Filtered users based on search
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [availableUsers, searchQuery]);

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = (e) => {
    e?.preventDefault();
    if (!groupName.trim()) {
      toast.warning('Group Name Required', 'Please provide a name for your new group.');
      return;
    }

    const newGroup = onCreateGroup?.({
      name: groupName.trim(),
      description: description.trim() || 'Team group chat on ConnectX',
      avatar: {
        emoji: selectedEmoji,
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      },
      memberIds: selectedUserIds,
    });

    toast.success('Group Created!', `"${groupName.trim()}" is now ready for conversations.`);
    onClose?.(newGroup);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-violet-950/30 overflow-hidden flex flex-col max-h-[90dvh] transition-all">
        {/* 1. Header (Fixed) */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shadow-inner">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 leading-tight">
                Create New Group
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set icon, name, and choose group members
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Scrollable Body Form */}
        <form id="create-group-form" onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Group Icon & Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Group Icon & Name *
            </label>
            <div className="flex items-center gap-3">
              {/* Selected Emoji display */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-violet-400/30 flex-shrink-0 transition-transform active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
                }}
              >
                {selectedEmoji}
              </div>

              <input
                id="group-name-input"
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Design & Marketing Hub"
                className="flex-1 h-12 bg-slate-800/90 border border-slate-700/90 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Quick Emoji Selector */}
            <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 pt-0.5">
              {GROUP_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all flex-shrink-0 ${
                    selectedEmoji === emoji
                      ? 'bg-violet-600 ring-2 ring-violet-400 scale-110 shadow-md shadow-violet-600/40'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                  title={`Choose ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              className="w-full h-11 bg-slate-800/90 border border-slate-700/90 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Searchable Member Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Members ({selectedUserIds.length} selected)
              </label>
              <span className="text-xs text-violet-400 font-semibold px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/30">
                {availableUsers.length} available
              </span>
            </div>

            {/* Search filter input with proper padding */}
            <div className="relative mb-2.5 flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members by name..."
                style={{ paddingLeft: '40px', paddingRight: searchQuery ? '36px' : '14px' }}
                className="w-full h-10 bg-slate-800/90 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 flex items-center text-slate-400 hover:text-slate-200 p-1 z-10"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Checkbox List */}
            <div className="max-h-44 sm:max-h-48 overflow-y-auto divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-800/40 p-1 shadow-inner">
              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-1.5">
                    <Search size={16} />
                  </div>
                  <span>No members found matching "{searchQuery}"</span>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-violet-600/15 border border-violet-500/30'
                          : 'hover:bg-slate-800/70 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          user={user}
                          avatar={user.avatar}
                          customPhoto={user.customPhoto}
                          name={user.name}
                          size="sm"
                          showOnlineStatus
                          isOnline={user.isOnline}
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isChecked ? 'text-violet-200 font-bold' : 'text-slate-200'
                            }`}
                          >
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {user.role || user.phone || 'Team Member'}
                          </p>
                        </div>
                      </div>

                      {/* Custom Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/50'
                            : 'border border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </form>

        {/* 3. Sticky Footer (Always Visible, Never Cut Off) */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/95 backdrop-blur flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-400 font-medium">
            {selectedUserIds.length > 0 ? (
              <span className="text-violet-300 font-semibold">
                {selectedUserIds.length} member{selectedUserIds.length > 1 ? 's' : ''} chosen
              </span>
            ) : (
              <span>0 members chosen</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-create-group-submit"
              type="submit"
              form="create-group-form"
              disabled={!groupName.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Create Group</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
