import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LOAN_CONFIG, calculateEmi } from '../../utils/interest.js';
import { formatINR, formatDate } from '../../utils/format.js';
import { maskPan } from '../../utils/validators.js';
import Button from '../ui/Button.jsx';
import { Checkbox } from '../ui/Input.jsx';
import { IconShieldCheck, IconLock } from '../ui/Icons.jsx';

/**
 * Step 5 — full disclosure review + consent checkboxes, then submit.
 * Shows rate, grace, penalty and total repayment (compliance requirement)
 * before the user commits.
 */
export default function StepReview({ personal, loan, kyc, face, onBack, onSubmit, submitting }) {
  const [consents, setConsents] = useState({ kyc: false, data: false, terms: false });
  const [consentError, setConsentError] = useState(null);

  const emi = calculateEmi(loan.amount, LOAN_CONFIG.monthlyInterestRate, loan.tenure);
  const total = Math.round(emi * loan.tenure * 100) / 100;
  const interest = Math.round((total - loan.amount) * 100) / 100;

  const allConsented = consents.kyc && consents.data && consents.terms;

  const handleSubmit = () => {
    if (!allConsented) {
      setConsentError('All three consents are required before we can process your application.');
      return;
    }
    setConsentError(null);
    onSubmit(consents);
  };

  const rows = [
    ['Full name', personal.fullName],
    ['Date of birth', formatDate(personal.dob)],
    ['Employment', (personal.employmentType || '').replace('-', ' ')],
    ['Monthly income', formatINR(personal.monthlyIncome)],
    ['Address', `${personal.address}, ${personal.city}, ${personal.state} – ${personal.pincode}`],
    ['Loan amount', formatINR(loan.amount)],
    ['Tenure', `${loan.tenure} months`],
    ['Purpose', (loan.purpose || '').replace('-', ' ')],
    ['PAN', maskPan(kyc.pan)],
    ['Aadhaar', `XXXX XXXX ${kyc.aadhaarLast4}`],
    ['Face verification', face.verified ? 'Completed ✓' : 'Pending'],
  ];

  return (
    <div className="space-y-6">
      {/* key terms disclosure */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
          <IconShieldCheck size={18} aria-hidden="true" /> Your loan terms — full disclosure
        </h3>
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between sm:block">
            <dt className="text-emerald-800/80">Monthly EMI</dt>
            <dd className="font-extrabold text-emerald-900 sm:text-lg">{formatINR(emi, { decimals: true })}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-emerald-800/80">Total interest ({LOAN_CONFIG.monthlyInterestRate * 100}%/mo reducing)</dt>
            <dd className="font-extrabold text-emerald-900 sm:text-lg">{formatINR(interest, { decimals: true })}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-emerald-800/80">Total repayment</dt>
            <dd className="font-extrabold text-emerald-900 sm:text-lg">{formatINR(total, { decimals: true })}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-emerald-800/80">Late terms</dt>
            <dd className="font-semibold text-emerald-900 sm:text-sm">
              {LOAN_CONFIG.gracePeriodDays}-day grace, then {LOAN_CONFIG.dailyPenaltyRate * 100}%/day
              penalty on the overdue EMI
            </dd>
          </div>
        </dl>
      </div>

      {/* application summary */}
      <div className="overflow-hidden rounded-2xl border border-navy-100">
        <dl className="divide-y divide-navy-100 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
              <dt className="font-semibold text-navy-500">{label}</dt>
              <dd className="text-navy-900">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* consents */}
      <div className="space-y-3 rounded-2xl border border-navy-100 bg-navy-50/50 p-5">
        <Checkbox
          checked={consents.kyc}
          onChange={(e) => setConsents((c) => ({ ...c, kyc: e.target.checked }))}
          label="I consent to KYC verification of my Aadhaar, PAN and selfie, including matching them with issuing-authority records."
        />
        <Checkbox
          checked={consents.data}
          onChange={(e) => setConsents((c) => ({ ...c, data: e.target.checked }))}
          label={
            <>
              I consent to TrustLend storing and processing my data for evaluating, disbursing and
              servicing this loan, as described in the{' '}
              <Link to="/privacy" className="font-semibold text-emerald-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </>
          }
        />
        <Checkbox
          checked={consents.terms}
          onChange={(e) => setConsents((c) => ({ ...c, terms: e.target.checked }))}
          label={
            <>
              I have read the loan terms above — including the 2% monthly interest, 3-day grace
              period and 0.1%-per-day late penalty — and accept the{' '}
              <Link to="/terms" className="font-semibold text-emerald-700 underline underline-offset-2">
                Terms of Service
              </Link>
              .
            </>
          }
        />
        {consentError && (
          <p role="alert" className="text-xs font-semibold text-red-600">
            {consentError}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button size="lg" onClick={handleSubmit} isLoading={submitting} disabled={!allConsented && submitting}>
          <IconLock size={17} /> Submit application
        </Button>
      </div>
    </div>
  );
}
