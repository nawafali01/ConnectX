import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Trash2,
} from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const nextIdRef = useRef(1);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title = '', message = '', duration = 3500 }) => {
      const id = nextIdRef.current++;
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };

  const confirm = useCallback(
    ({
      title = 'Are you sure?',
      message = '',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'danger', // 'danger' | 'primary'
      onConfirm,
    }) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: async () => {
          setConfirmDialog(null);
          if (onConfirm) await onConfirm();
        },
        onCancel: () => setConfirmDialog(null),
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Floating Toaster Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 select-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isInfo = t.type === 'info';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-200 animate-in slide-in-from-top-4 flex items-start gap-3 ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/30'
                  : isError
                  ? 'bg-slate-900/95 border-rose-500/50 text-slate-100 shadow-rose-950/30'
                  : isWarning
                  ? 'bg-slate-900/95 border-amber-500/50 text-slate-100 shadow-amber-950/30'
                  : 'bg-slate-900/95 border-violet-500/40 text-slate-100 shadow-violet-950/30'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
                {isError && <AlertCircle size={18} className="text-rose-400" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-400" />}
                {isInfo && <Info size={18} className="text-violet-400" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <h4 className="text-xs font-bold leading-tight text-white mb-0.5">
                    {t.title}
                  </h4>
                )}
                {t.message && (
                  <p className="text-[11px] text-slate-300 leading-snug break-words">
                    {t.message}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal (Clean replacement for browser window.confirm) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5 mb-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                }`}
              >
                {confirmDialog.type === 'danger' ? (
                  <Trash2 size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {confirmDialog.title}
                </h3>
              </div>
            </div>

            {confirmDialog.message && (
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                {confirmDialog.message}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40 border border-rose-500/40'
                    : 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/40 border border-violet-500/40'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
