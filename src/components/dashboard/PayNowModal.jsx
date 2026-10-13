import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { formatINR, formatDate } from '../../utils/format.js';
import { IconLock, IconInfo } from '../ui/Icons.jsx';

const METHODS = [
  { value: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', hint: 'Instant · recommended' },
  { value: 'netbanking', label: 'Net banking', hint: 'All major banks' },
  { value: 'card', label: 'Debit card', hint: 'RuPay, Visa, Mastercard' },
];

/**
 * Pay-now modal: pick a method, confirm, repay the loan in full.
 * In production this hands off to a payment gateway (Razorpay/Cashfree)
 * order session — mocked here.
 */
export default function PayNowModal({ open, onClose, dues, onConfirm, paying }) {
  const [method, setMethod] = useState('upi');
  if (!dues) return null;

  return (
    <Modal open={open} onClose={onClose} title="Repay your loan">
      <div className="rounded-xl bg-navy-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-navy-600">Total payable (incl. penalty)</span>
          <span className="text-lg font-extrabold text-navy-950">
            {formatINR(dues.totalPayable, { decimals: true })}
          </span>
        </div>
        <p className="mt-1 text-xs text-navy-500">Due by {formatDate(dues.dueDate)}</p>
        {dues.penaltyAccrued > 0 && (
          <p className="mt-1 text-xs font-semibold text-amber-700">
            includes {formatINR(dues.penaltyAccrued)} late penalty ({dues.daysOverdue} day
            {dues.daysOverdue === 1 ? '' : 's'} overdue)
          </p>
        )}
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold text-navy-800">Payment method</legend>
        <div className="space-y-2">
          {METHODS.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                method === m.value
                  ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                  : 'border-navy-200 hover:border-navy-300'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="pay-method"
                  value={m.value}
                  checked={method === m.value}
                  onChange={() => setMethod(m.value)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{m.label}</span>
                  <span className="block text-xs text-navy-500">{m.hint}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="mt-4 flex items-start gap-2 text-xs text-navy-500">
        <IconInfo size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Demo checkout — no real money moves. In production this opens a secure payment-gateway
        session and your loan is closed on confirmation.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={paying}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(method)} isLoading={paying}>
          <IconLock size={16} /> Pay {formatINR(dues.totalPayable)}
        </Button>
      </div>
    </Modal>
  );
}
