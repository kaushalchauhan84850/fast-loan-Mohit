import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../utils/schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Input } from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { IconLock, IconMail, IconEye } from '../components/ui/Icons.jsx';

/** Login with mobile/email + password; falls into OTP flow if mobile unverified. */
export default function Login() {
  useDocumentTitle('Log in');
  const { loginWithPassword, sendLoginOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from ?? { pathname: '/dashboard' };
  const returnTo = `${from.pathname}${from.search ?? ''}`;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async ({ identifier, password }) => {
    try {
      await loginWithPassword(identifier, password);
      toast.success({ title: 'Welcome back!', message: 'You are now logged in.' });
      navigate(returnTo, { replace: true });
    } catch (err) {
      if (err.message === 'MOBILE_UNVERIFIED') {
        try {
          await sendLoginOtp(identifier);
          navigate('/verify-otp', {
            state: { identifier, purpose: 'login', returnTo, notice: 'Your mobile number is not verified yet. We sent you an OTP.' },
          });
        } catch (otpErr) {
          toast.error({ title: 'Could not send OTP', message: otpErr.message });
        }
        return;
      }
      toast.error({ title: 'Login failed', message: err.message });
    }
  };

  const startOtpLogin = async () => {
    const identifier = getValues('identifier');
    if (!identifier) {
      toast.error({ title: 'Enter your mobile or email first', message: 'Then tap "Login with OTP".' });
      return;
    }
    try {
      await sendLoginOtp(identifier);
      navigate('/verify-otp', {
        state: { identifier, purpose: 'login', returnTo, notice: 'Enter the OTP we sent to your registered mobile.' },
      });
    } catch (err) {
      toast.error({ title: 'Could not send OTP', message: err.message });
    }
  };

  return (
    <div className="bg-navy-50/50 py-14">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-soft-lg">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950">Welcome back</h1>
          <p className="mt-1.5 text-sm text-navy-600">
            Log in with your mobile number or email address.
          </p>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
            <Input
              label="Mobile number or email"
              required
              autoComplete="username"
              placeholder="9876543210 or you@example.com"
              icon={IconMail}
              error={errors.identifier?.message}
              {...register('identifier')}
            />
            <Input
              label="Password"
              required
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              icon={IconLock}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="rounded-md p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                >
                  <IconEye size={18} />
                </button>
              }
              {...register('password')}
            />

            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              Log in
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-navy-100" />
            <span className="text-xs font-semibold text-navy-400">OR</span>
            <span className="h-px flex-1 bg-navy-100" />
          </div>

          <Button variant="outline" size="lg" fullWidth onClick={startOtpLogin}>
            Login with OTP instead
          </Button>

          <p className="mt-6 text-center text-sm text-navy-600">
            New to TrustLend?{' '}
            <Link to="/signup" className="font-bold text-emerald-700 underline-offset-2 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 rounded-xl bg-navy-950 px-4 py-3 text-center text-xs text-navy-300">
          Demo account → <strong className="text-emerald-400">demo@trustlend.in</strong> /{' '}
          <strong className="text-emerald-400">Demo@1234</strong>
        </p>
      </div>
    </div>
  );
}
