import React, { useState } from 'react';
import {
  UserCheck,
  User,
  Mail,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useToast } from '../../context/ToastContext';

export const AddUserModal = ({
  isOpen = true,
  onClose,
  onContactAdded,
  onSelectConversation,
  currentUserId,
}) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  if (!isOpen) return null;

  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('Please fill in both Full Name and Registered Email.');
      return;
    }

    if (!currentUserId) {
      setErrorMessage('Active user session not found. Please select an active user profile first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.addUserToChat({
        currentUserId,
        name: trimmedName,
        email: trimmedEmail,
      });

      if (!res.ok || !res.success) {
        setErrorMessage(
          res.message || 'User with this name/email not found or unverified'
        );
        return;
      }

      const { user, conversationId, isExisting } = res;

      // 1. Add contact to local & sidebar state
      if (onContactAdded) {
        onContactAdded(user, conversationId);
      }

      // 2. Select the room
      if (onSelectConversation) {
        onSelectConversation(conversationId);
      }

      // 3. Join socket conversation room
      const socket = getSocket();
      if (socket) {
        socket.emit('join_conversation', conversationId);
      }

      // 4. Toast notification
      toast.success(
        isExisting ? 'Chat Opened' : 'Contact Verified',
        isExisting
          ? `Conversation with ${user.name} opened.`
          : `${user.name} has been verified and added to your contacts!`
      );

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Network error while verifying contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-violet-950/40 overflow-hidden text-slate-100 flex flex-col backdrop-blur-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Subtle decorative top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between relative z-10 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 p-[1px] shadow-lg shadow-violet-600/30 flex-shrink-0">
              <div className="w-full h-full bg-slate-900/90 rounded-2xl flex items-center justify-center text-violet-300">
                <UserCheck size={22} className="text-violet-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-title" className="font-bold text-base text-slate-100 leading-tight">
                  Add Contact & Create Room
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify identity to start private messaging
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all active:scale-95"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">
          {/* Security Banner */}
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-400">
              <ShieldCheck size={16} />
            </div>
            <div className="text-[11px] text-slate-300 leading-snug">
              <span className="font-semibold text-violet-300">Two-factor verification:</span> Exact email and matching full name are required to generate a private room.
            </div>
          </div>

          {/* Backend Error Alert Box */}
          {errorMessage && (
            <div
              id="add-user-error-banner"
              className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/60 to-red-950/30 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-shake shadow-lg shadow-rose-950/30"
            >
              <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0 mt-0.5">
                <AlertCircle size={16} />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-rose-100 leading-tight">Verification Failed</div>
                <div className="text-rose-300/90 text-[11px] leading-relaxed">{errorMessage}</div>
                <div className="text-[10px] text-rose-400/80 pt-0.5">
                  • Ensure the contact has registered on ConnectX and the name matches their registered profile.
                </div>
              </div>
            </div>
          )}

          {/* Field 1: Full Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="contact-fullname" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Full Name</span>
                <span className="text-violet-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500">Case-insensitive</span>
            </div>
            <div
              className={`relative flex items-center transition-all rounded-xl border bg-slate-800/60 ${
                focusedField === 'name'
                  ? 'border-violet-500 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/30'
                  : 'border-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div className={`pl-3.5 pr-2.5 flex items-center pointer-events-none transition-colors ${
                focusedField === 'name' ? 'text-violet-400' : 'text-slate-400'
              }`}>
                <User size={16} />
              </div>
              <input
                id="contact-fullname"
                type="text"
                value={name}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. Fahad Ali"
                disabled={isSubmitting}
                className="w-full h-11 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none pr-3.5 font-medium"
                required
              />
              {name.trim() && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="mr-2.5 text-slate-500 hover:text-slate-300 p-1 rounded-md"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Field 2: Registered Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Registered Email</span>
                <span className="text-violet-400">*</span>
              </label>
              {isEmailFormatValid ? (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 size={11} /> Valid format
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">Exact email</span>
              )}
            </div>
            <div
              className={`relative flex items-center transition-all rounded-xl border bg-slate-800/60 ${
                focusedField === 'email'
                  ? 'border-violet-500 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/30'
                  : 'border-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div className={`pl-3.5 pr-2.5 flex items-center pointer-events-none transition-colors ${
                focusedField === 'email' ? 'text-violet-400' : 'text-slate-400'
              }`}>
                <Mail size={16} />
              </div>
              <input
                id="contact-email"
                type="email"
                value={email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. fahadali123@gmail.com"
                disabled={isSubmitting}
                className="w-full h-11 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none pr-3.5 font-medium"
                required
              />
              {email.trim() && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="mr-2.5 text-slate-500 hover:text-slate-300 p-1 rounded-md"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Helpful guidance note */}
          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles size={12} className="text-amber-400 flex-shrink-0" />
            <span>Enter the registered full name & verified email of any ConnectX user.</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !email.trim()}
              className="flex-[1.5] py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin text-white" />
                  <span>Verifying Contact...</span>
                </>
              ) : (
                <>
                  <span>Connect & Start Chat</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
