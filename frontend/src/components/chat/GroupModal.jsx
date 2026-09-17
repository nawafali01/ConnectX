import React, { useState, useMemo } from 'react';
import { Avatar } from '../common/Avatar';
import { X, Search, Check, Users, Sparkles } from 'lucide-react';

const GROUP_EMOJIS = ['🚀', '🎨', '⚡', '💻', '🔥', '🎉', '🧠', '🌟', '🏆', '💎'];

export const GroupModal = ({
  users = [],
  activeUser,
  onCreateGroup,
  onClose,
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Available users (all human users except current active user)
  const availableUsers = useMemo(() => {
    return users.filter((u) => u.id !== activeUser?.id && !u.isSystem);
  }, [users, activeUser]);

  // Filtered users based on search
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [availableUsers, searchQuery]);

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const newGroup = onCreateGroup?.({
      name: groupName.trim(),
      description: description.trim() || 'Team group chat on ConnectX',
      avatar: {
        emoji: selectedEmoji,
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      },
      memberIds: selectedUserIds,
    });

    onClose?.(newGroup);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Create New Group</h2>
              <p className="text-[11px] text-slate-400">
                Add members and start a group discussion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Emoji & Group Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Group Icon & Name
            </label>
            <div className="flex items-center gap-2.5">
              {/* Selected Emoji display */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                {selectedEmoji}
              </div>

              <input
                id="group-name-input"
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Design & Marketing Hub"
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
            </div>

            {/* Quick Emoji Selector */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
              {GROUP_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all flex-shrink-0 ${
                    selectedEmoji === emoji
                      ? 'bg-violet-600 ring-2 ring-violet-400 scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Searchable Member Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Select Members ({selectedUserIds.length} selected)
              </label>
              <span className="text-[11px] text-violet-400 font-medium">
                {availableUsers.length} available
              </span>
            </div>

            {/* Search filter input */}
            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members by name..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>

            {/* Checkbox List */}
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-800/30">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No members found matching "{searchQuery}"
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className="flex items-center justify-between p-2.5 hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar user={user} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.role || 'Member'}
                          </p>
                        </div>
                      </div>

                      {/* Custom Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-violet-600 text-white'
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

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-create-group-submit"
              type="submit"
              disabled={!groupName.trim()}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all active:scale-95"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
