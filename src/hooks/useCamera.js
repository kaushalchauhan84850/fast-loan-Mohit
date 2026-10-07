import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Thin wrapper around getUserMedia for the face-verification step.
 * Keeps stream lifecycle cleanup airtight (StrictMode-safe via ref guard).
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (streamRef.current) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch (err) {
      const message =
        err?.name === 'NotAllowedError'
          ? 'Camera access was denied. Allow camera permission in your browser and try again.'
          : err?.name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : err?.message || 'Unable to start the camera.';
      setError(message);
      setReady(false);
    }
  }, []);

  /** Capture the current frame as a JPEG data URL (or null if not ready). */
  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  useEffect(() => stop, [stop]);

  return { videoRef, ready, error, start, stop, capture };
}
