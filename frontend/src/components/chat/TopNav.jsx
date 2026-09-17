import React from 'react';

export const TopNav = ({
  activeUser,
  onOpenProfile,
}) => {
  return (
    <header className="h-13 w-full bg-slate-900/95 text-slate-100 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none backdrop-blur-md">
      {/* Left spacer for symmetry */}
      <div className="w-24 sm:w-32 flex items-center" />

      {/* Main Logo CENTERED */}
      <div className="flex items-center justify-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 text-white font-black text-sm select-none">
          CX
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-white select-none">
            ConnectX
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/30">
            PRO
          </span>
        </div>
      </div>

      {/* Right spacer / minimal profile access */}
      <div className="w-24 sm:w-32 flex items-center justify-end">
        {activeUser && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            title={activeUser.name}
          >
            <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[100px]">
              {activeUser.name}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
