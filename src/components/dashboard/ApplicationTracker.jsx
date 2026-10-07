import { motion } from 'framer-motion';
import Badge from '../ui/Badge.jsx';
import { IconCheck } from '../ui/Icons.jsx';

const FLOW_LABELS = {
  submitted: 'Submitted',
  kyc_verified: 'KYC verified',
  under_review: 'Under review',
  approved: 'Approved',
  disbursed: 'Disbursed',
};

/**
 * Application status tracker: horizontal rail of pipeline stages with the
 * current stage highlighted and completed stages ticked.
 */
export default function ApplicationTracker({ application, flow }) {
  const currentIndex = flow.indexOf(application.status);

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-navy-950">Application status</h2>
        <Badge status={application.status} />
      </div>
      <p className="mt-1 text-xs text-navy-500">
        Reference <span className="font-mono">{application.id}</span> · submitted{' '}
        {new Date(application.submittedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>

      <ol className="mt-6 flex items-start" aria-label="Application progress">
        {flow.map((stage, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
          return (
            <li key={stage} className="relative flex flex-1 flex-col items-center text-center last:flex-none">
              {i > 0 && (
                <span
                  className={`absolute right-1/2 top-4 -z-0 h-0.5 w-full ${
                    i <= currentIndex ? 'bg-emerald-500' : 'bg-navy-100'
                  }`}
                  aria-hidden="true"
                />
              )}
              <motion.span
                initial={false}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  state === 'done'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : state === 'current'
                      ? 'border-emerald-500 bg-white text-emerald-600 ring-4 ring-emerald-100'
                      : 'border-navy-200 bg-white text-navy-400'
                }`}
              >
                {state === 'done' ? <IconCheck size={14} /> : i + 1}
              </motion.span>
              <span
                className={`mt-2 px-1 text-[11px] font-semibold leading-tight ${
                  state === 'todo' ? 'text-navy-400' : 'text-navy-800'
                }`}
              >
                {FLOW_LABELS[stage]}
              </span>
            </li>
          );
        })}
      </ol>

      {application.status === 'approved' && (
        <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          🎉 Approved! Funds are being transferred to your account — usually within 24 hours.
        </p>
      )}
    </div>
  );
}
