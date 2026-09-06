import React from 'react';
import { PhoneIcon } from '../../svgs/PhoneIcon';
import { ArrowRightIcon } from '../../svgs/ArrowRightIcon';
import { EditIcon } from '../../svgs/EditIcon';
import { SparklesIcon } from '../../svgs/SparklesIcon';
import { formatRelativeDate } from '../../functions/formatters';

export const ProfileScreen = ({ user, onEnterChat, onEditProfile }) => {
  if (!user) return null;

  return (
    <div className="onboarding-card profile-screen-view">
      <div className="form-header" style={{ textAlign: 'center' }}>
        <h2 className="screen-title">
          Profile Ready! <SparklesIcon size={20} color="#7c3aed" />
        </h2>
        <p className="screen-subtitle">Your ConnectX identity has been created</p>
      </div>

      {/* Main Profile Showcase Card */}
      <div className="profile-card-display">
        <div
          className="profile-avatar-large"
          style={{ background: user.avatar?.bg || '#ede9fe' }}
        >
          {/* Inner clip container — keeps image round without cutting the badge */}
          <div style={{ width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden', position: 'absolute', inset: 0 }}>
            {(user.customPhoto || user.avatar?.url) ? (
              <img
                src={user.customPhoto || user.avatar.url}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <span style={{ fontSize: '2.8rem' }}>👤</span>
            )}
          </div>
          <span className="profile-online-badge" />
        </div>

        <h3 className="profile-name">{user.name}</h3>

        <div className="profile-phone-tag">
          <PhoneIcon size={14} />
          <span>{user.phone || 'No phone set'}</span>
        </div>

        <p className="profile-bio-box">
          "{user.bio || 'Hey there! I am using ConnectX.'}"
        </p>

        {/* Profile Stats */}
        <div className="profile-meta-row">
          <div className="meta-stat">
            <span className="meta-stat-label">Joined</span>
            <span className="meta-stat-val">
              {formatRelativeDate(user.joinedAt) || 'Today'}
            </span>
          </div>
          <div className="meta-stat">
            <span className="meta-stat-label">Status</span>
            <span className="meta-stat-val" style={{ color: '#10b981' }}>
              Active Now
            </span>
          </div>
          <div className="meta-stat">
            <span className="meta-stat-label">Room</span>
            <span className="meta-stat-val">General</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="profile-actions">
        <button
          id="btn-enter-chatroom"
          className="btn-primary-purple"
          onClick={onEnterChat}
        >
          <span>Enter Chat Room</span>
          <ArrowRightIcon size={18} />
        </button>

        <button
          type="button"
          className="btn-secondary-ghost"
          onClick={onEditProfile}
        >
          <EditIcon size={16} />
          <span>Edit Details</span>
        </button>
      </div>
    </div>
  );
};
