import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useVoiceRecorder
 *
 * Encapsulates MediaRecorder API for voice message recording.
 * Returns controls and state for start, stop, cancel recording.
 */
export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0); // seconds
  const [permissionError, setPermissionError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const streamRef = useRef(null);
  const resolveRef = useRef(null);
  const rejectRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  const _stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const _stopStream = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };

  const _resetState = () => {
    _stopTimer();
    _stopStream();
    chunksRef.current = [];
    setRecordingDuration(0);
    setIsRecording(false);
    setIsProcessing(false);
    mediaRecorderRef.current = null;
    resolveRef.current = null;
    rejectRef.current = null;
  };

  /** Pick the best audio MIME type the browser supports */
  const _getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/wav',
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  /**
   * startRecording — requests mic permission and starts recording.
   * Returns a Promise that resolves with { blob, duration, mimeType } on stop,
   * or resolves with null when cancelled.
   */
  const startRecording = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      setPermissionError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mimeType = _getSupportedMimeType();
        const options = mimeType ? { mimeType } : {};

        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        resolveRef.current = resolve;
        rejectRef.current = reject;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const elapsed = startTimeRef.current
            ? Math.round((Date.now() - startTimeRef.current) / 1000)
            : 0;

          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });

          const res = resolveRef.current;
          _resetState();
          if (res) res({ blob, duration: elapsed, mimeType: recorder.mimeType || 'audio/webm' });
        };

        recorder.onerror = (err) => {
          console.error('MediaRecorder error:', err);
          const rej = rejectRef.current;
          _resetState();
          if (rej) rej(err);
        };

        recorder.start(250); // collect chunks every 250ms
        startTimeRef.current = Date.now();
        setIsRecording(true);
        setRecordingDuration(0);

        // Live timer – increments every second
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

      } catch (err) {
        console.error('Microphone access error:', err);
        const isPermissionDenied =
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
        setPermissionError(
          isPermissionDenied
            ? 'Microphone permission denied. Please allow mic access in your browser settings.'
            : `Could not access microphone: ${err.message}`
        );
        _stopStream();
        reject(err);
      }
    });
  }, []);

  /**
   * stopRecording — stops the recorder; onstop resolves the Promise from startRecording.
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsProcessing(true);
      _stopTimer();
      mediaRecorderRef.current.stop();
    }
  }, []);

  /**
   * cancelRecording — stops without returning data (resolves with null).
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Override onstop before stopping
      mediaRecorderRef.current.onstop = () => {
        const res = resolveRef.current;
        _resetState();
        if (res) res(null); // null = cancelled
      };
      mediaRecorderRef.current.stop();
    } else {
      _resetState();
    }
  }, []);

  return {
    isRecording,
    recordingDuration,
    permissionError,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
