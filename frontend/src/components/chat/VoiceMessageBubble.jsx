import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Format seconds → M:SS
 */
const formatDuration = (secs) => {
  if (!secs && secs !== 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * VoiceMessageBubble
 *
 * Custom audio player rendered inside MessageBubble when mediaType === 'audio'.
 * Features: play/pause, progress bar (scrubable), current/total time, error state.
 *
 * @param {string}  audioUrl      Cloudinary audio URL
 * @param {number}  duration      Stored duration in seconds (shown before load)
 * @param {boolean} isOutgoing    Affects color scheme
 */
export const VoiceMessageBubble = ({ audioUrl, duration, isOutgoing }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isReady, setIsReady] = useState(false);

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
      setIsReady(true);
      setIsLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const onError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const onCanPlay = () => {
      setIsReady(true);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('canplay', onCanPlay);

    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplay', onCanPlay);
      audio.src = '';
    };
  }, [audioUrl]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Audio play error:', err);
          setHasError(true);
          setIsLoading(false);
        });
    }
  }, [isPlaying, hasError]);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio || !isReady || !audioDuration) return;

    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = ratio * audioDuration;
    setCurrentTime(audio.currentTime);
  }, [isReady, audioDuration]);

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;
  const displayTime = isPlaying || currentTime > 0 ? currentTime : audioDuration;

  // Animated waveform bars — purely CSS, no canvas
  const bars = [3, 6, 9, 7, 4, 8, 5, 10, 6, 3, 7, 9, 5, 8, 4];

  const barBase = isOutgoing ? 'bg-violet-200/60' : 'bg-slate-400/60';
  const barActive = isOutgoing ? 'bg-white' : 'bg-violet-400';
  const btnBg = isOutgoing
    ? 'bg-white/20 hover:bg-white/30 text-white'
    : 'bg-violet-600/20 hover:bg-violet-600/30 text-violet-400';
  const timeColor = isOutgoing ? 'text-violet-200' : 'text-slate-400';

  if (!audioUrl) {
    return (
      <div className="flex items-center gap-2 py-1 px-1 text-xs opacity-60">
        <AlertCircle size={14} />
        <span>Audio unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 py-0.5 min-w-[200px] max-w-[260px]">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={handlePlayPause}
        disabled={hasError}
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-all active:scale-95 ${btnBg} ${hasError ? 'opacity-40 cursor-not-allowed' : ''}`}
        title={hasError ? 'Audio unavailable' : isPlaying ? 'Pause' : 'Play voice message'}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : hasError ? (
          <AlertCircle size={16} />
        ) : isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </button>

      {/* Waveform + Progress */}
      <div className="flex-1 flex flex-col gap-1.5">
        {/* Waveform bars — clicking them seeks */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="flex items-center gap-[2px] h-7 cursor-pointer group"
          title="Seek"
        >
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isPast = barProgress <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${isPast ? barActive : barBase} group-hover:opacity-90`}
                style={{
                  height: `${(height / 10) * 100}%`,
                  animation: isPlaying ? `voice-bar-bounce 0.8s ease-in-out infinite` : 'none',
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className={`text-[10px] font-medium tabular-nums ${timeColor}`}>
          {formatDuration(displayTime)}
        </div>
      </div>
    </div>
  );
};
