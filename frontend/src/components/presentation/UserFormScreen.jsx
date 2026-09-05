import React, { useState } from 'react';
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '../../constants/avatars';
import { UserIcon } from '../../svgs/UserIcon';
import { PhoneIcon } from '../../svgs/PhoneIcon';
import { ArrowRightIcon } from '../../svgs/ArrowRightIcon';

export const UserFormScreen = ({ onSubmit, onBack, initialValues = null, isSecondUser = false }) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [phone, setPhone] = useState(initialValues?.phone || '');
  const [bio, setBio] = useState(initialValues?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    initialValues?.avatar || (isSecondUser ? AVATAR_OPTIONS[1] : DEFAULT_AVATAR)
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Please enter your name';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      errs.phone = 'Please enter your phone number';
    } else if (!/^[0-9+() -]{6,20}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      bio: bio.trim() || 'Excited to chat on ConnectX!',
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="onboarding-card form-screen-view">
      <div className="form-header">
        <h2 className="screen-title">
          {isSecondUser ? 'Add Second User' : 'Set Up Your Profile'}
        </h2>
        <p className="screen-subtitle">
          {isSecondUser
            ? 'Enter details for the 2nd user joining the room'
            : 'Enter your details to generate your ConnectX profile'}
        </p>
      </div>

      <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
        {/* Avatar Picker */}
        <div className="input-group">
          <label className="input-label">Select Avatar</label>
          <div className="avatar-selection-grid">
            {AVATAR_OPTIONS.map((avatar) => {
              const isSelected = selectedAvatar.id === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  className={`avatar-choice-btn ${isSelected ? 'selected' : ''}`}
                  style={{ background: avatar.bg }}
                  onClick={() => setSelectedAvatar(avatar)}
                  title={avatar.name}
                  aria-label={avatar.name}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    width="36"
                    height="36"
                    style={{ borderRadius: '50%', display: 'block' }}
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Name Field */}
        <div className="input-group">
          <label htmlFor="user-fullname" className="input-label">
            Full Name <span style={{ color: '#7c3aed' }}>*</span>
          </label>
          <div className="input-field-wrapper">
            <span className="input-icon">
              <UserIcon size={18} />
            </span>
            <input
              id="user-fullname"
              type="text"
              className="form-input"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              required
            />
          </div>
          {errors.name && <span className="error-hint">{errors.name}</span>}
        </div>

        {/* Phone Number Field */}
        <div className="input-group">
          <label htmlFor="user-phone" className="input-label">
            Phone Number <span style={{ color: '#7c3aed' }}>*</span>
          </label>
          <div className="input-field-wrapper">
            <span className="input-icon">
              <PhoneIcon size={18} />
            </span>
            <input
              id="user-phone"
              type="tel"
              className="form-input"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
              required
            />
          </div>
          {errors.phone && <span className="error-hint">{errors.phone}</span>}
        </div>

        {/* Bio / Status Detail */}
        <div className="input-group">
          <label htmlFor="user-bio" className="input-label">
            About / Status
          </label>
          <textarea
            id="user-bio"
            className="form-textarea"
            placeholder="Available for chats & collaborations..."
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            id="btn-submit-profile"
            type="submit"
            className="btn-primary-purple"
          >
            <span>{isSecondUser ? 'Add & Join Room' : 'Generate Profile'}</span>
            <ArrowRightIcon size={18} />
          </button>

          {onBack && (
            <button
              type="button"
              className="btn-secondary-ghost"
              onClick={onBack}
            >
              Back
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
