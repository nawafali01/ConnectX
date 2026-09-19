import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Send, Smile, Paperclip, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ChatInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  placeholder = 'Type a message...',
  disabled = false,
}) => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [text]);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  // Outside click for emoji picker
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showEmojiPicker]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (val.trim()) {
      onTypingStart?.();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTypingStop?.();
      }, 1500);
    } else {
      onTypingStop?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Invalid File', 'Please select an image file (PNG, JPG, WebP, GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File Too Large', 'Image exceeds the 15MB limit.');
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleClearAttachment = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (isUploading || (!trimmed && !selectedFile)) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTypingStop?.();

    if (selectedFile) {
      setIsUploading(true);
      try {
        const res = await api.uploadMedia(selectedFile);
        if (res && res.success && res.url) {
          onSendMessage(trimmed, { mediaUrl: res.url, mediaType: res.mediaType || 'image' });
          handleClearAttachment();
          setText('');
          setShowEmojiPicker(false);
        } else {
          // Fallback if local without cloudinary credentials: create data preview
          onSendMessage(trimmed, { mediaUrl: filePreview, mediaType: 'image' });
          handleClearAttachment();
          setText('');
          setShowEmojiPicker(false);
        }
      } catch (err) {
        console.warn('Upload error, using preview data:', err);
        onSendMessage(trimmed, { mediaUrl: filePreview, mediaType: 'image' });
        handleClearAttachment();
        setText('');
      } finally {
        setIsUploading(false);
      }
    } else {
      onSendMessage(trimmed);
      setText('');
      setShowEmojiPicker(false);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = typeof emojiData === 'string' ? emojiData : emojiData?.emoji;
    if (emoji) {
      setText((prev) => prev + emoji);
    }
  };

  return (
    <footer className="relative bg-slate-900/90 border-t border-slate-800 p-2 sm:p-3 select-none backdrop-blur-md">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-16 left-3 sm:left-6 z-40 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-150"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width={310}
            height={360}
            searchDisabled={false}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Attachment Preview Banner */}
      {filePreview && (
        <div className="mb-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700">
              <img
                src={filePreview}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 size={16} className="text-violet-400 animate-spin" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {selectedFile?.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {isUploading
                  ? 'Uploading image...'
                  : `${(selectedFile.size / 1024).toFixed(1)} KB`}
              </p>
            </div>
          </div>

          {!isUploading && (
            <button
              type="button"
              onClick={handleClearAttachment}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
              title="Remove attachment"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Input Control Pill */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/70 focus-within:border-violet-500 rounded-2xl px-2.5 py-1.5 transition-all shadow-inner">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || disabled}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-colors flex-shrink-0"
            title="Attach image"
          >
            <Paperclip size={18} />
          </button>

          {/* Emoji Toggle Button */}
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={disabled}
            className={`p-1.5 rounded-xl transition-colors flex-shrink-0 ${
              showEmojiPicker
                ? 'text-violet-400 bg-violet-600/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/60'
            }`}
            title="Choose emojis"
          >
            <Smile size={18} />
          </button>

          {/* Expandable Text Input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isUploading || disabled}
            rows={1}
            placeholder={selectedFile ? 'Add a caption...' : placeholder}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none resize-none py-1 max-h-32 min-h-[22px] leading-relaxed"
          />
        </div>

        {/* Send Action Button */}
        <button
          id="btn-send-message"
          type="submit"
          disabled={isUploading || disabled || (!text.trim() && !selectedFile)}
          className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-lg shadow-violet-600/30 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
          title="Send message"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} className="ml-0.5" />
          )}
        </button>
      </form>
    </footer>
  );
};
