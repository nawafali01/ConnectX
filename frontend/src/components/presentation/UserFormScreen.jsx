import React, { useState, useRef } from 'react';
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '../../constants/avatars';
import { UserIcon } from '../../svgs/UserIcon';
import { ArrowRightIcon } from '../../svgs/ArrowRightIcon';

// Country code options
const COUNTRY_CODES = [
  { code: '+92', name: 'PK' },
  { code: '+1',  name: 'US' },
  { code: '+44', name: 'GB' },
  { code: '+91', name: 'IN' },
  { code: '+971', name: 'AE' },
  { code: '+966', name: 'SA' },
  { code: '+49', name: 'DE' },
  { code: '+33', name: 'FR' },
  { code: '+86', name: 'CN' },
  { code: '+81', name: 'JP' },
  { code: '+7',  name: 'RU' },
  { code: '+55', name: 'BR' },
  { code: '+61', name: 'AU' },
];

export const UserFormScreen = ({ onSubmit, onBack, initialValues = null, isSecondUser = false }) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [countryCode, setCountryCode] = useState('+92');
  const [phone, setPhone] = useState(() => {
    if (!initialValues?.phone) return '';
    const raw = initialValues.phone;
    const found = COUNTRY_CODES.find(c => raw.startsWith(c.code));
    return found ? raw.slice(found.code.length).trim() : raw;
  });
  const [email, setEmail] = useState(initialValues?.email || '');
  const [bio, setBio] = useState(initialValues?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    initialValues?.avatar || (isSecondUser ? AVATAR_OPTIONS[1] : DEFAULT_AVATAR)
  );
  const [errors, setErrors] = useState({});
  const [customPhoto, setCustomPhoto] = useState(initialValues?.customPhoto || null);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomPhoto(ev.target.result);
      setShowAvatarGrid(false);
    };
    reader.readAsDataURL(file);
  };

  // Current display image: custom photo > selected avatar
  const displaySrc = customPhoto || selectedAvatar?.url;

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Please enter your name';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      errs.phone = 'Please enter your phone number';
    } else if (!/^[0-9() -]{4,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      phone: `${countryCode} ${phone.trim()}`,
      email: email.trim().toLowerCase(),
      bio: bio.trim() || 'Excited to chat on ConnectX!',
      avatar: selectedAvatar,
      customPhoto: customPhoto || null,
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
        {/* DP / Avatar Picker */}
        <div className="dp-picker-section">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
            id="dp-file-input"
          />

          {/* DP Circle */}
          <div className="dp-circle-wrapper" onClick={() => fileInputRef.current?.click()} title="Click to upload photo">
            {displaySrc ? (
              <img src={displaySrc} alt="Profile" className="dp-circle-img" />
            ) : (
              <div className="dp-circle-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            {/* Camera overlay */}
            <div className="dp-camera-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4" fill="none" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            {/* Green active badge */}
            <span className="dp-active-badge" />
          </div>

          {/* Action buttons row */}
          <div className="dp-action-row">
            <button
              type="button"
              className="dp-action-btn dp-gallery-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Gallery
            </button>
            <button
              type="button"
              className={`dp-action-btn dp-avatar-btn ${showAvatarGrid ? 'active' : ''}`}
              onClick={() => setShowAvatarGrid(p => !p)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Avatar
            </button>
            {customPhoto && (
              <button
                type="button"
                className="dp-action-btn dp-remove-btn"
                onClick={() => setCustomPhoto(null)}
              >
                ✕ Remove
              </button>
            )}
          </div>

          {/* Avatar Grid (toggle) */}
          {showAvatarGrid && (
            <div className="dp-avatar-grid">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = !customPhoto && selectedAvatar.id === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar-choice-btn ${isSelected ? 'selected' : ''}`}
                    style={{ background: avatar.bg }}
                    onClick={() => {
                      setSelectedAvatar(avatar);
                      setCustomPhoto(null);
                      setShowAvatarGrid(false);
                    }}
                    title={avatar.name}
                  >
                    <img src={avatar.url} alt={avatar.name} width="32" height="32" style={{ borderRadius: '50%', display: 'block' }} />
                  </button>
                );
              })}
            </div>
          )}
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
              placeholder="Enter your full name"
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

        {/* Phone Number Field with Country Dropdown */}
        <div className="input-group">
          <label htmlFor="user-phone" className="input-label">
            Phone Number <span style={{ color: '#7c3aed' }}>*</span>
          </label>
          <div className="phone-field-wrapper">
            <select
              className="country-code-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              aria-label="Country code"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code + c.name} value={c.code}>
                  {c.flag} {c.name} {c.code}
                </option>
              ))}
            </select>
            <input
              id="user-phone"
              type="tel"
              className="form-input phone-number-input"
              placeholder="Please enter your number"
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

        {/* Email Address Field */}
        <div className="input-group">
          <label htmlFor="user-email" className="input-label">
            Email Address <span style={{ color: '#7c3aed' }}>*</span>
          </label>
          <div className="input-field-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </span>
            <input
              id="user-email"
              type="email"
              className="form-input"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              required
            />
          </div>
          {errors.email && <span className="error-hint">{errors.email}</span>}
        </div>

        {/* About Field */}
        <div className="input-group">
          <label htmlFor="user-bio" className="input-label">
            About
          </label>
          <textarea
            id="user-bio"
            className="form-textarea"
            placeholder="Your about"
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
