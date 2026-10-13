import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../utils/schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Input, Checkbox } from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { IconArrowRight } from '../components/ui/Icons.jsx';
import { Link } from 'react-router-dom';

/** Sign up: full name, mobile, email, password → OTP verification next. */
export default function Signup() {
  useDocumentTitle('Create account');
  const { signup, sendOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', mobile: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
    mode: 'onTouched',
  });

  const onSubmit = async ({ fullName, mobile, email, password }) => {
    try {
      await signup({ fullName, mobile, email, password });
      await sendOtp(mobile, 'signup');
      toast.success({
        title: 'OTP sent',
        message: `We sent a 6-digit code to +91 ${mobile}. (Demo: check the next screen.)`,
      });
      navigate('/verify-otp', {
        state: { mobile, purpose: 'signup', returnTo: '/dashboard' },
      });
    } catch (err) {
      toast.error({ title: 'Could not create account', message: err.message });
    }
  };

  return (
    <div className="bg-navy-50/50 py-14">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-soft-lg">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950">Create your account</h1>
          <p className="mt-1.5 text-sm text-navy-600">
            Takes under a minute. We'll verify your mobile with an OTP.
          </p>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
            <Input
              label="Full name"
              required
              autoComplete="name"
              placeholder="As printed on your Aadhaar"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Mobile number"
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              placeholder="10-digit mobile"
              error={errors.mobile?.message}
              rightElement={
                <span className="pointer-events-none pr-1 text-sm font-semibold text-navy-400">
                  🇮🇳 +91
                </span>
              }
              {...register('mobile')}
            />
            <Input
              label="Email address"
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Password"
                required
                type="password"
                autoComplete="new-password"
                placeholder="Min 8 characters"
                error={errors.password?.message}
                hint="Letters + numbers"
                {...register('password')}
              />
              <Input
                label="Confirm password"
                required
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Checkbox
              error={errors.acceptTerms?.message}
              label={
                <>
                  I agree to the{' '}
                  <Link to="/terms" className="font-semibold text-emerald-700 underline underline-offset-2">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="font-semibold text-emerald-700 underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  , and consent to being contacted about my application.
                </>
              }
              {...register('acceptTerms')}
            />

            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              Send OTP <IconArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-700 underline-offset-2 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
