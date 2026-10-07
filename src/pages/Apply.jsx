import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { LOAN_CONFIG, calculateEmi } from '../utils/interest.js';
import { formatINR } from '../utils/format.js';
import { storageGet, storageSet, storageRemove } from '../utils/storage.js';
import StepsProgress from '../components/ui/StepsProgress.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StepPersonal from '../components/apply/StepPersonal.jsx';
import StepLoan from '../components/apply/StepLoan.jsx';
import StepKyc from '../components/apply/StepKyc.jsx';
import StepFace from '../components/apply/StepFace.jsx';
import StepReview from '../components/apply/StepReview.jsx';
import { IconCheckCircle, IconArrowRight } from '../components/ui/Icons.jsx';

const STEPS = ['Personal details', 'Loan & EMI', 'KYC documents', 'Face verification', 'Review & submit'];
const DRAFT_KEY = 'tl_apply_draft'; // personal + loan only — no KYC or biometric data

const EMPTY_STATE = {
  personal: null,
  loan: null,
  kyc: { pan: '', aadhaarLast4: '', panDocRef: '', aadhaarDocRef: '' },
  face: { verified: false, selfieRef: '' },
};

export default function Apply() {
  useDocumentTitle('Apply for a loan');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [state, setState] = useState(() => {
    const draft = storageGet(DRAFT_KEY, {});
    return {
      ...EMPTY_STATE,
      ...draft,
      kyc: { ...EMPTY_STATE.kyc, ...(draft.kyc ?? {}) },
      face: { ...EMPTY_STATE.face, ...(draft.face ?? {}) },
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  // Prefill amount/tenure when arriving from the calculator (?amount=&tenure=)
  useEffect(() => {
    const amount = Number(searchParams.get('amount'));
    const tenure = Number(searchParams.get('tenure'));
    if (amount || tenure) {
      setState((s) => ({
        ...s,
        loan: {
          amount: amount || s.loan?.amount || 100000,
          tenure: tenure || s.loan?.tenure || 12,
          purpose: s.loan?.purpose || 'personal',
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist only non-sensitive draft parts (personal + loan)
  useEffect(() => {
    storageSet(DRAFT_KEY, { personal: state.personal, loan: state.loan });
  }, [state.personal, state.loan]);

  useEffect(() => {
    storageRemove(DRAFT_KEY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedId]);

  const maxReachableStep = useMemo(() => {
    if (state.personal && state.loan && state.kyc.aadhaarLast4 && state.face.verified) return 4;
    if (state.personal && state.loan && state.kyc.aadhaarLast4) return 3;
    if (state.personal && state.loan) return 2;
    if (state.personal) return 1;
    return 0;
  }, [state]);

  const goTo = (s) => {
    if (s <= maxReachableStep) setStep(s);
  };

  const handleSubmit = async (consents) => {
    setSubmitting(true);
    try {
      const application = await import('../services/loanService.js').then((m) =>
        m.submitApplication(user.id, {
          personal: state.personal,
          loan: state.loan,
          kyc: state.kyc,
          face: state.face,
          consents,
        })
      );
      setSubmittedId(application.id);
      toast.success({
        title: 'Application submitted!',
        message: 'We usually respond within a few hours. Track it on your dashboard.',
      });
    } catch (err) {
      toast.error({ title: 'Could not submit', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------ success screen ------------------------------ */
  if (submittedId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-navy-100 bg-white p-10 text-center shadow-soft-lg"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
          >
            <IconCheckCircle size={44} />
          </motion.span>
          <h1 className="mt-6 text-2xl font-extrabold text-navy-950">Application received</h1>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            Reference <strong className="font-mono">{submittedId}</strong>. Your KYC is verified, so
            approval usually takes a few hours. We'll SMS you at every status change.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/dashboard" size="lg">
              Track on dashboard <IconArrowRight size={17} />
            </Button>
            <Button to="/" variant="outline" size="lg">
              Back to home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-navy-50/50 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">
              Loan application
            </h1>
            <p className="mt-1 text-sm text-navy-600">
              {formatINR(LOAN_CONFIG.minAmount)}–{formatINR(LOAN_CONFIG.maxAmount)} ·{' '}
              {LOAN_CONFIG.monthlyInterestRate * 100}% monthly (reducing) · 5 quick steps
            </p>
          </div>
          <p className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-600 shadow-soft">
            Signed in as {user?.fullName}
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <StepsProgress steps={STEPS} current={step} />

          {/* step navigation for completed steps */}
          <nav aria-label="Application steps" className="mt-5 hidden gap-1.5 sm:flex">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => goTo(i)}
                disabled={i > maxReachableStep}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  i === step ? 'bg-emerald-100 text-emerald-800' : 'text-navy-500 hover:bg-navy-50'
                }`}
              >
                {i + 1}. {label}
              </button>
            ))}
          </nav>

          <div className="mt-8">
            {step === 0 && (
              <StepPersonal
                defaultValues={state.personal ?? { fullName: user?.fullName ?? '' }}
                onNext={(personal) => {
                  setState((s) => ({ ...s, personal }));
                  setStep(1);
                }}
              />
            )}
            {step === 1 && (
              <StepLoan
                defaultValues={state.loan ?? { amount: 100000, tenure: 12, purpose: 'personal' }}
                onBack={() => setStep(0)}
                onNext={(loan) => {
                  setState((s) => ({ ...s, loan }));
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <StepKyc
                kyc={state.kyc}
                onBack={() => setStep(1)}
                onVerified={(kyc) => {
                  setState((s) => ({ ...s, kyc: { ...s.kyc, ...kyc } }));
                  setStep(3);
                }}
              />
            )}
            {step === 3 && (
              <StepFace
                face={state.face}
                onBack={() => setStep(2)}
                onVerified={(face) => {
                  setState((s) => ({ ...s, face: { ...s.face, ...face } }));
                  setStep(4);
                }}
              />
            )}
            {step === 4 && (
              <StepReview
                personal={state.personal}
                loan={state.loan}
                kyc={state.kyc}
                face={state.face}
                submitting={submitting}
                onBack={() => setStep(3)}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-navy-500">
          Draft progress (personal & loan details only) is saved on this device. KYC data and selfie
          are never stored in your browser. EMI today:{' '}
          {formatINR(calculateEmi(state.loan?.amount || 100000, LOAN_CONFIG.monthlyInterestRate, state.loan?.tenure || 12))}
          {' · '}
          <Link to="/terms" className="font-semibold text-navy-700 underline underline-offset-2">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
