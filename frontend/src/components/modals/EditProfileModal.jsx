import React, { useState, useRef } from 'react';
import { AVATAR_OPTIONS } from '../../constants/avatars';
import { UserIcon } from '../../svgs/UserIcon';
import { ArrowRightIcon } from '../../svgs/ArrowRightIcon';

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

/** Splits a stored phone string like "+92 3153181236" into code + number */
const splitPhone = (raw = '') => {
  const found = COUNTRY_CODES.find((c) => raw.startsWith(c.code));
  if (found) return { code: found.code, number: raw.slice(found.code.length).trim() };
  return { code: '+92', number: raw };
};

export const EditProfileModal = ({ user, onSave, onClose }) => {
  const split = splitPhone(user?.phone || '');

  const [name, setName] = useState(user?.name || '');
  const [countryCode, setCountryCode] = useState(split.code);
  const [phone, setPhone] = useState(split.number);
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [customPhoto, setCustomPhoto] = useState(user?.customPhoto || null);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const displaySrc = customPhoto || selectedAvatar?.url;

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

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Please enter your name';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!phone.trim()) errs.phone = 'Please enter your phone number';
    else if (!/^[0-9() -]{4,15}$/.test(phone.trim())) errs.phone = 'Please enter a valid phone number';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: name.trim(),
      phone: `${countryCode} ${phone.trim()}`,
      email: email.trim().toLowerCase(),
      bio: bio.trim() || user?.bio || 'Excited to chat on ConnectX!',
      avatar: selectedAvatar,
      customPhoto: customPhoto || null,
    });
  };

  return (
    <div className="edit-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="edit-modal-panel" role="dialog" aria-modal="true" aria-label="Edit Profile">

        {/* Modal Header */}
        <div className="edit-modal-header">
          <h3 className="edit-modal-title">Edit Profile</h3>
          <button className="edit-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="edit-modal-body" onSubmit={handleSubmit} noValidate>

          {/* DP Picker */}
          <div className="dp-picker-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
              id="edit-dp-input"
            />
            <div
              className="dp-circle-wrapper"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload photo"
            >
              {displaySrc ? (
                <img src={displaySrc} alt="Profile" className="dp-circle-img" />
              ) : (
                <div className="dp-circle-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              <div className="dp-camera-overlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" fill="none" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="dp-active-badge" />
            </div>

            <div className="dp-action-row">
              <button type="button" className="dp-action-btn dp-gallery-btn" onClick={() => fileInputRef.current?.click()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Gallery
              </button>
              <button
                type="button"
                className={`dp-action-btn dp-avatar-btn ${showAvatarGrid ? 'active' : ''}`}
                onClick={() => setShowAvatarGrid((p) => !p)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Avatar
              </button>
              {customPhoto && (
                <button type="button" className="dp-action-btn dp-remove-btn" onClick={() => setCustomPhoto(null)}>
                  ✕ Remove
                </button>
              )}
            </div>

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
                      onClick={() => { setSelectedAvatar(avatar); setCustomPhoto(null); setShowAvatarGrid(false); }}
                      title={avatar.name}
                    >
                      <img src={avatar.url} alt={avatar.name} width="32" height="32" style={{ borderRadius: '50%', display: 'block' }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Name */}
          <div className="input-group">
            <label htmlFor="edit-fullname" className="input-label">
              Full Name <span style={{ color: '#7c3aed' }}>*</span>
            </label>
            <div className="input-field-wrapper">
              <span className="input-icon"><UserIcon size={18} /></span>
              <input
                id="edit-fullname"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: null })); }}
                required
              />
            </div>
            {errors.name && <span className="error-hint">{errors.name}</span>}
          </div>

          {/* Phone */}
          <div className="input-group">
            <label htmlFor="edit-phone" className="input-label">
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
                  <option key={c.code + c.name} value={c.code}>{c.name} {c.code}</option>
                ))}
              </select>
              <input
                id="edit-phone"
                type="tel"
                className="form-input phone-number-input"
                placeholder="Please enter your number"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: null })); }}
                required
              />
            </div>
            {errors.phone && <span className="error-hint">{errors.phone}</span>}
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="edit-email" className="input-label">
              Email Address
            </label>
            <div className="input-field-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                id="edit-email"
                type="email"
                className="form-input"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: null })); }}
              />
            </div>
            {errors.email && <span className="error-hint">{errors.email}</span>}
          </div>

          {/* About */}
          <div className="input-group">
            <label htmlFor="edit-bio" className="input-label">About</label>
            <textarea
              id="edit-bio"
              className="form-textarea"
              placeholder="Your about"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="edit-modal-footer">
            <button type="button" className="btn-secondary-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-purple" style={{ flex: 1 }}>
              <span>Save Changes</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
