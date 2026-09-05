import React from 'react';
import { UserPlusIcon } from '../../svgs/UserPlusIcon';

export const UserSwitcherModal = ({
  users,
  activeUserId,
  onSelectUser,
  onAddNewUser,
  onClose,
}) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="user-switcher-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Switch or Add User"
      >
        <div className="modal-header-row">
          <h3 className="modal-title">Switch Active User</h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.84rem', color: '#6b6289', marginBottom: '14px' }}>
          Select who is typing in this chat room or register a 2nd user:
        </p>

        {/* Users List */}
        <div className="users-list">
          {users.map((user) => {
            const isActive = user.id === activeUserId;
            return (
              <div
                key={user.id}
                className={`user-select-item ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  onSelectUser(user.id);
                  onClose();
                }}
              >
                <div className="user-item-meta">
                  <div
                    className="mini-avatar"
                    style={{ background: user.avatar?.gradient || '#7c3aed' }}
                  >
                    <span>{user.avatar?.emoji || '👤'}</span>
                  </div>
                  <div>
                    <div className="user-item-name">{user.name}</div>
                    <div className="user-item-phone">
                      {user.phone || (user.isSystem ? 'System Bot' : 'No phone')}
                    </div>
                  </div>
                </div>

                {isActive && (
                  <span className="active-check-badge">Active</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Add 2nd User Button */}
        <button
          id="btn-modal-add-user"
          className="btn-add-second-user"
          onClick={() => {
            onClose();
            onAddNewUser();
          }}
        >
          <UserPlusIcon size={18} />
          <span>+ Add 2nd User to Room</span>
        </button>
      </div>
    </div>
  );
};
