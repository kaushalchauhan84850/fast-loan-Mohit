const TONES = {
  // generic
  neutral: 'bg-navy-100 text-navy-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-800',
  navy: 'bg-navy-900 text-white',
};

const STATUS_MAP = {
  // EMI schedule
  paid: 'success',
  upcoming: 'neutral',
  due: 'info',
  overdue: 'danger',
  // applications
  submitted: 'info',
  kyc_verified: 'info',
  under_review: 'warning',
  approved: 'success',
  disbursed: 'success',
  rejected: 'danger',
  active: 'success',
  closed: 'neutral',
};

const STATUS_LABELS = {
  paid: 'Paid',
  upcoming: 'Upcoming',
  due: 'Due soon',
  overdue: 'Overdue',
  submitted: 'Submitted',
  kyc_verified: 'KYC verified',
  under_review: 'Under review',
  approved: 'Approved',
  disbursed: 'Disbursed',
  rejected: 'Rejected',
  active: 'Active',
  closed: 'Closed',
};

/** Pill status badge: <Badge status="overdue" /> or <Badge tone="success">Custom</Badge> */
export default function Badge({ status, tone, children, className = '' }) {
  const resolvedTone = tone ?? (status ? TONES[STATUS_MAP[status]] ?? 'neutral' : 'neutral');
  const label = children ?? (status ? STATUS_LABELS[status] ?? status : '');
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TONES[resolvedTone] ?? TONES.neutral} ${className}`}
    >
      {label}
    </span>
  );
}
