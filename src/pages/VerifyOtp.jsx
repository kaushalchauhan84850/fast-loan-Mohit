import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useCountdown } from '../hooks/useCountdown.js';
import OtpInput from '../components/ui/OtpInput.jsx';
import Button from '../components/ui/Button.jsx';
import { maskMobile } from '../utils/validators.js';
import { IconShieldCheck, IconRefresh, IconArrowRight } from '../components/ui/Icons.jsx';

/**
 * OTP verification for both flows:
 *  - signup: state { mobile, purpose: 'signup' }
 *  - login:  state { identifier, purpose: 'login', returnTo }
 */
export default function VerifyOtp() {
  useDocumentTitle('Verify OTP');
  const { verifySignupOtp, verifyLoginOtp, sendOtp, sendLoginOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { secondsLeft, start } = useCountdown();

  const state = location.state ?? {};
  const { purpose = 'signup', returnTo = '/dashboard' } = state;
  const [mobile, setMobile] = useState(state.mobile ?? '');
  const [identifier, setIdentifier] = useState(state.identifier ?? '');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState(state.devOtp ?? null);

  // If someone lands here directly, bounce to signup/login.
  useEffect(() => {
    if (!state.mobile && !state.identifier) {
      navigate('/signup', { replace: true });
    } else {
      start(30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error({ title: 'Enter the full 6-digit OTP' });
      return;
    }
    setVerifying(true);
    try {
      if (purpose === 'signup') {
        await verifySignupOtp(mobile, otp);
      } else {
        await verifyLoginOtp(identifier, otp);
      }
      toast.success({ title: 'Verified!', message: 'Welcome to TrustLend.' });
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error({ title: 'Verification failed', message: err.message });
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      const result = purpose === 'signup' ? await sendOtp(mobile, 'signup') : await sendLoginOtp(identifier);
      if (result?.devOtp) setDevOtp(result.devOtp);
      setOtp('');
      start(30);
      toast.info({ title: 'OTP resent', message: 'A new 6-digit code is on its way.' });
    } catch (err) {
      toast.error({ title: 'Could not resend', message: err.message });
    }
  };

  return (
    <div className="bg-navy-50/50 py-14">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-soft-lg">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <IconShieldCheck size={30} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-navy-950">Verify your mobile</h1>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            {state.notice ??
              (purpose === 'signup'
                ? `We sent a 6-digit code to +91 ${maskMobile(mobile)}.`
                : `We sent a 6-digit code to the mobile linked with ${identifier}.`)}
          </p>

          {devOtp && (
            <p className="mx-auto mt-4 w-fit rounded-lg bg-navy-950 px-4 py-2 text-xs font-semibold text-navy-200">
              Demo OTP: <span className="tracking-widest text-emerald-400">{devOtp}</span>
            </p>
          )}

          <div className="mt-7 flex justify-center">
            <OtpInput value={otp} onChange={setOtp} disabled={verifying} />
          </div>

          <Button
            size="lg"
            fullWidth
            className="mt-7"
            onClick={handleVerify}
            isLoading={verifying}
            disabled={otp.length !== 6 || verifying}
          >
            Verify & continue <IconArrowRight size={17} />
          </Button>

          <div className="mt-5 text-sm">
            {secondsLeft > 0 ? (
              <p className="text-navy-500">
                Resend code in <span className="font-bold text-navy-800">{secondsLeft}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 underline-offset-2 hover:underline"
              >
                <IconRefresh size={15} /> Resend OTP
              </button>
            )}
          </div>

          <p className="mt-6 border-t border-navy-100 pt-4 text-xs text-navy-500">
            Wrong number?{' '}
            <Link to={purpose === 'signup' ? '/signup' : '/login'} className="font-bold text-navy-700 underline underline-offset-2">
              Go back and edit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
