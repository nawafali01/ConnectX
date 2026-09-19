import React, { useState, useRef } from 'react';
import { UserPlus, User, Mail, Phone, X, Camera, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '../../constants/avatars';
import { useToast } from '../../context/ToastContext';

const COUNTRY_CODES = [
  { code: '+92', name: 'PK', flag: '🇵🇰' },
  { code: '+1',  name: 'US', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+971', name: 'AE', flag: '🇦🇪' },
  { code: '+966', name: 'SA', flag: '🇸🇦' },
  { code: '+91', name: 'IN', flag: '🇮🇳' },
  { code: '+49', name: 'DE', flag: '🇩🇪' },
  { code: '+33', name: 'FR', flag: '🇫🇷' },
  { code: '+61', name: 'AU', flag: '🇦🇺' },
  { code: '+81', name: 'JP', flag: '🇯🇵' },
];

export const AddUserModal = ({
  isOpen = true,
  onClose,
  onAddUser,
  onSelectConversation,
  currentUserId,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('Hey there! I am using ConnectX.');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0] || DEFAULT_AVATAR);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('File too large', 'Please choose an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomPhoto(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    // 1. Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // 2. Phone validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 5 || cleanPhone.length > 15) {
      newErrors.phone = 'Please enter a valid phone number (5-15 digits)';
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fullPhone = `${countryCode} ${phone.trim()}`;
      const payload = {
        name: name.trim(),
        phone: fullPhone,
        email: email.trim().toLowerCase(),
        bio: bio.trim() || 'Hey there! I am using ConnectX.',
        avatar: selectedAvatar,
        customPhoto: customPhoto || null,
      };

      const newUser = await onAddUser(payload, false);

      toast.success(
        'User Created',
        `${name.trim()} has been added successfully!`
      );

      // Optionally automatically open DM with newly created user
      if (newUser && currentUserId && onSelectConversation) {
        const targetId = newUser.id || newUser._id;
        const dmRoomId = [currentUserId, targetId].sort().join('_');
        onSelectConversation(`dm_${dmRoomId}`);
      }

      onClose();
    } catch (err) {
      console.error('Error adding user:', err);
      toast.error('Failed to add user', err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayAvatarSrc = customPhoto || selectedAvatar?.url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92dvh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/30 text-white">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100 leading-tight">
                Add New User
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a new contact with name, phone, and email
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-user-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          {/* Avatar Preview & Selection */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
            {/* Main Avatar Preview */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-violet-500 shadow-md shadow-violet-500/20 bg-slate-800 flex items-center justify-center">
                {displayAvatarSrc ? (
                  <img
                    src={displayAvatarSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={30} className="text-slate-400" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={18} />
              </div>
            </div>

            {/* Avatar Preset Grid & Upload button */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Choose Avatar or Photo</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                >
                  <ImageIcon size={12} />
                  <span>Upload Custom</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {AVATAR_OPTIONS.slice(0, 6).map((av) => {
                  const isSelected = !customPhoto && selectedAvatar?.id === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av);
                        setCustomPhoto(null);
                      }}
                      className={`relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all ${
                        isSelected
                          ? 'border-violet-500 scale-105 shadow-md shadow-violet-500/30'
                          : 'border-slate-700 hover:border-slate-500 opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: av.bg }}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-violet-600/40 flex items-center justify-center">
                          <Check size={12} className="text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <User size={16} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="e.g. John Doe"
                className={`w-full h-11 pl-10 pr-3.5 bg-slate-800/80 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                  errors.name
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              {/* Country Code Select */}
              <div className="w-28 flex-shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full h-11 px-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-all font-mono"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number Input */}
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Phone size={15} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                  }}
                  placeholder="300 1234567"
                  className={`w-full h-11 pl-10 pr-3.5 bg-slate-800/80 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                    errors.phone
                      ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30'
                  }`}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1 font-medium">{errors.phone}</p>
            )}
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="e.g. user@example.com"
                className={`w-full h-11 pl-10 pr-3.5 bg-slate-800/80 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                  errors.email
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Bio / Status Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              About / Status <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Product Specialist at ConnectX"
              maxLength={120}
              className="w-full h-11 px-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-user-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating User...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Add User</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
