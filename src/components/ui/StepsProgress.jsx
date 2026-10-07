import { motion } from 'framer-motion';
import { IconCheck } from './Icons.jsx';

/**
 * Horizontal step progress for the loan application wizard.
 * Mobile: collapsed into "Step X of N" + progress bar.
 */
export default function StepsProgress({ steps, current }) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}>
      {/* Mobile summary */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-navy-600">
          <span>
            Step {current + 1} of {steps.length}
          </span>
          <span className="text-emerald-700">{steps[current]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-navy-100">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          />
        </div>
      </div>

      {/* Desktop stepper */}
      <ol className="hidden items-center sm:flex" aria-hidden="true">
        {steps.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={false}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    state === 'done'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : state === 'current'
                        ? 'border-emerald-500 bg-white text-emerald-600'
                        : 'border-navy-200 bg-white text-navy-400'
                  }`}
                >
                  {state === 'done' ? <IconCheck size={16} /> : i + 1}
                </motion.div>
                <span
                  className={`whitespace-nowrap text-xs font-semibold ${
                    state === 'todo' ? 'text-navy-400' : 'text-navy-800'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="relative mx-2 -mt-5 h-0.5 flex-1 rounded bg-navy-100">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded bg-emerald-500"
                    initial={false}
                    animate={{ width: i < current ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
