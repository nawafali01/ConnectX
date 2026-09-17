import React from 'react';

export const Avatar = ({
  user,
  avatar,
  customPhoto,
  name = '',
  size = 'md',
  isOnline = false,
  showOnlineStatus = false,
  className = '',
}) => {
  const resolvedAvatar = avatar || user?.avatar;
  const photo = customPhoto || user?.customPhoto || resolvedAvatar?.photo || resolvedAvatar?.url;
  const emoji = resolvedAvatar?.emoji;
  const displayName = name || user?.name || 'User';

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }[size] || 'w-10 h-10 text-sm';

  const statusSizeClasses = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2',
    '2xl': 'w-5 h-5 ring-3',
  }[size] || 'w-3 h-3 ring-2';

  const bgGradient =
    resolvedAvatar?.gradient ||
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shadow-sm overflow-hidden`}
        style={{
          background: photo ? 'transparent' : bgGradient,
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt={displayName}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // fallback to initials if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : emoji ? (
          <span className="leading-none">{emoji}</span>
        ) : (
          <span className="leading-none font-semibold tracking-tight">{getInitials(displayName)}</span>
        )}
      </div>

      {showOnlineStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white dark:ring-slate-900 ${statusSizeClasses} ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
