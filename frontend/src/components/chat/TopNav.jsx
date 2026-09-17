import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../common/Avatar';
import { LogoIcon } from '../../svgs/LogoIcon';
import { ChevronDown, Users, Plus, Check, Eye } from 'lucide-react';

export const TopNav = ({
  users = [],
  activeUser,
  onSwitchUser,
  onAddNewUser,
  onlineUsers = [],
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="h-14 w-full bg-slate-900/95 text-slate-100 border-b border-slate-800/80 px-4 flex items-center justify-between z-30 select-none backdrop-blur-md">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white font-black text-base">
            CX
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              ConnectX
              <span className="text-[10px] uppercase font-bold tracking-widest bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/30">
                PRO
              </span>
            </span>
          </div>
        </div>

        {/* Live Socket Status Dot */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-[11px] font-medium text-emerald-400">Live Real-Time</span>
        </div>
      </div>

      {/* Center: Perspective Preview Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200">
        <Eye size={13} className="text-violet-400" />
        <span>
          Perspective Mode:{' '}
          <strong className="text-white font-semibold">{activeUser?.name || 'Active User'}</strong>
        </span>
      </div>

      {/* Right: Multi-User Switching Dropdown */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            id="multi-user-switch-btn"
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-violet-500/30 hover:border-violet-400 transition-all text-sm font-medium shadow-sm active:scale-95"
            title="Switch user perspective to preview different views"
          >
            <span className="text-xs text-slate-400 hidden sm:inline">Viewing as:</span>
            <Avatar user={activeUser} size="xs" />
            <span className="font-semibold text-xs sm:text-sm text-slate-100 max-w-[110px] truncate">
              {activeUser?.name || 'Select User'}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Switcher Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Switch Perspective
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Preview chat as different users
                  </div>
                </div>
                <Users size={14} className="text-slate-400" />
              </div>

              <div className="max-h-64 overflow-y-auto py-1 px-1 divide-y divide-slate-800/40">
                {users.map((user) => {
                  const isCurrent = user.id === activeUser?.id;
                  const isUserOnline =
                    onlineUsers.some((ou) => String(ou.userId) === String(user.id)) ||
                    user.isOnline;

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-sm group ${
                        isCurrent
                          ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30'
                          : 'text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          user={user}
                          size="sm"
                          showOnlineStatus
                          isOnline={isUserOnline}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-100 group-hover:text-white truncate">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {user.role || (isUserOnline ? 'Online' : 'Offline')}
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <Check size={16} className="text-violet-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-800 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onAddNewUser?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all active:scale-95"
                >
                  <Plus size={14} />
                  <span>Create / Add New User</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
