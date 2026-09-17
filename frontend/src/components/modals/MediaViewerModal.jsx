import React from 'react';
import { X, Download } from 'lucide-react';

export const MediaViewerModal = ({ mediaUrl, onClose }) => {
  if (!mediaUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
        title="Close"
      >
        <X size={22} />
      </button>

      {/* Download button */}
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        download="connectx_media"
        className="absolute top-4 right-16 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
        title="Open full size / Download"
      >
        <Download size={22} />
      </a>

      {/* Image container */}
      <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center">
        <img
          src={mediaUrl}
          alt="Expanded media"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl"
        />
      </div>
    </div>
  );
};
