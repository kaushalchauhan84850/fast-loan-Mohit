import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCamera } from '../../hooks/useCamera.js';
import { useToast } from '../../context/ToastContext.jsx';
import * as kycService from '../../services/kycService.js';
import Button from '../ui/Button.jsx';
import { IconCamera, IconRefresh, IconCheckCircle, IconAlertTriangle, IconSmile } from '../ui/Icons.jsx';

const LIVENESS_PROMPTS = ['Blink twice', 'Slowly turn your head left', 'Slowly turn your head right', 'Give a small smile'];
const PROMPT_DURATION_MS = 2600;

/**
 * Step 4 — face verification via webcam with liveness prompts.
 * The actual match runs through kycService.faceVerificationProvider so a
 * real vendor (HyperVerge / Onfido / IDfy) can replace the mock without
 * any UI change. In the mock, liveness is "simulated" by requiring the
 * user to complete the on-screen prompts before auto-capture.
 */
export default function StepFace({ face, onVerified, onBack }) {
  const toast = useToast();
  const { videoRef, ready, error, start, stop, capture } = useCamera();
  const [phase, setPhase] = useState(face.verified ? 'verified' : 'idle'); // idle | camera | liveness | verifying | verified
  const [promptIndex, setPromptIndex] = useState(-1);
  const [activePrompts, setActivePrompts] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const runLiveness = () => {
    // pick two random prompts for this session and pin them in state
    const shuffled = [...LIVENESS_PROMPTS].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 2);
    setActivePrompts(chosen);
    setPhase('liveness');
    setPromptIndex(0);

    chosen.forEach((_, i) => {
      timersRef.current.push(
        window.setTimeout(() => {
          setPromptIndex(i + 1);
        }, (i + 1) * PROMPT_DURATION_MS)
      );
    });

    timersRef.current.push(
      window.setTimeout(async () => {
        setPromptIndex(-1);
        setPhase('verifying');
        const image = capture();
        setCapturedImage(image);
        stop();
        try {
          const result = await kycService.verifyFace(image);
          setPhase('verified');
          onVerified({ verified: true, selfieRef: `SELFIE-${result.provider}-${Date.now()}` });
          toast.success({ title: 'Face verification complete', message: 'Liveness check passed.' });
        } catch (err) {
          setPhase('camera');
          toast.error({ title: 'Face verification failed', message: err.message });
        }
      }, chosen.length * PROMPT_DURATION_MS + 400)
    );
  };

  const reset = () => {
    clearTimers();
    setPhase('idle');
    setPromptIndex(-1);
    setActivePrompts([]);
    setCapturedImage(null);
    stop();
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-md">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-navy-200 bg-navy-950">
          {/* live video */}
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className={`h-full w-full scale-x-[-1] object-cover ${phase === 'verified' || phase === 'idle' ? 'hidden' : ''}`}
          />

          {/* idle state */}
          {phase === 'idle' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-800 text-emerald-400">
                <IconCamera size={28} />
              </span>
              <div>
                <p className="font-bold text-white">Face verification</p>
                <p className="mt-1 text-sm text-navy-300">
                  We'll match your selfie with your Aadhaar photo and run a liveness check. Your
                  camera feed never leaves this page unencrypted.
                </p>
              </div>
              <Button onClick={() => { setPhase('camera'); start(); }}>
                <IconCamera size={17} /> Start camera
              </Button>
            </div>
          )}

          {/* liveness overlay */}
          {phase === 'liveness' && (
            <>
              <div
                className="pointer-events-none absolute inset-0 rounded-[999px] border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(11,27,51,0.55)]"
                style={{ width: '55%', height: '70%', top: '15%', left: '22.5%' }}
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 to-transparent p-4 text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={promptIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-center gap-2 text-base font-bold text-white"
                  >
                    <IconSmile size={18} className="text-emerald-400" aria-hidden="true" />
                    {activePrompts[Math.min(promptIndex, activePrompts.length - 1)] ?? 'Hold still…'}
                  </motion.p>
                </AnimatePresence>
                <div className="mx-auto mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    key={`bar-${promptIndex}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: PROMPT_DURATION_MS / 1000, ease: 'linear' }}
                    className="h-full bg-emerald-400"
                  />
                </div>
                <p className="mt-2 text-xs text-navy-300">Keep your face inside the oval</p>
              </div>
            </>
          )}

          {/* verifying */}
          {phase === 'verifying' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <svg className="h-10 w-10 animate-spin text-emerald-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
              </svg>
              <p className="font-bold text-white">Analysing liveness…</p>
              <p className="text-sm text-navy-300">This takes just a moment</p>
            </div>
          )}

          {/* verified: show captured frame */}
          {phase === 'verified' && capturedImage && (
            <div className="relative h-full w-full">
              <img src={capturedImage} alt="Your verified selfie" className="h-full w-full scale-x-[-1] object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-navy-950/30">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-glow"
                >
                  <IconCheckCircle size={40} />
                </motion.span>
              </div>
            </div>
          )}

          {/* camera error */}
          {error && phase !== 'idle' && (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <IconAlertTriangle size={32} className="text-amber-400" />
              <p className="text-sm font-semibold text-white">{error}</p>
              <Button variant="outline" size="sm" onClick={reset}>
                Try again
              </Button>
            </div>
          )}
        </div>

        {/* controls */}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={phase === 'verifying'}>
            Back
          </Button>
          <div className="flex gap-2">
            {phase === 'camera' && (
              <Button size="lg" onClick={runLiveness}>
                <IconCamera size={17} /> Start liveness check
              </Button>
            )}
            {(phase === 'verified' || phase === 'liveness') && (
              <Button variant="outline" size="lg" onClick={reset}>
                <IconRefresh size={16} /> Retake
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-navy-100 bg-navy-50/70 p-3.5">
          <IconAlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-navy-600">
            Camera not working? Make sure browser permissions allow camera access for this site, no
            other app is using the webcam, and you are on a secure (https/localhost) connection.
          </p>
        </div>
      </div>
    </div>
  );
}
