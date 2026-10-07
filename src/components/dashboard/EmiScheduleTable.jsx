import { useState } from 'react';
import Badge from '../ui/Badge.jsx';
import { formatINR, formatDate } from '../../utils/format.js';
import { IconChevronDown, IconCheck } from '../ui/Icons.jsx';

/** Full EMI schedule with paid/upcoming/overdue states. Rows collapse on mobile. */
export default function EmiScheduleTable({ schedule }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? schedule : schedule.slice(0, 6);

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft">
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-base font-bold text-navy-950">EMI schedule</h3>
        <span className="text-xs text-navy-500">{schedule.length} months</span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-navy-100 bg-navy-50/60 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">
              <th scope="col" className="px-6 py-2.5">#</th>
              <th scope="col" className="px-4 py-2.5">Due date</th>
              <th scope="col" className="px-4 py-2.5 text-right">EMI</th>
              <th scope="col" className="px-4 py-2.5 text-right">Principal</th>
              <th scope="col" className="px-4 py-2.5 text-right">Interest</th>
              <th scope="col" className="px-4 py-2.5 text-right">Balance</th>
              <th scope="col" className="px-6 py-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {visible.map((row) => (
              <tr key={row.no} className="text-navy-800 transition-colors hover:bg-navy-50/40">
                <td className="px-6 py-3 font-semibold">{row.no}</td>
                <td className="px-4 py-3">{formatDate(row.dueDate)}</td>
                <td className="px-4 py-3 text-right font-bold">{formatINR(row.emi)}</td>
                <td className="px-4 py-3 text-right text-navy-600">{formatINR(row.principal)}</td>
                <td className="px-4 py-3 text-right text-navy-600">{formatINR(row.interest)}</td>
                <td className="px-4 py-3 text-right text-navy-600">{formatINR(row.balance)}</td>
                <td className="px-6 py-3 text-right">
                  <Badge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-navy-50 sm:hidden">
        {visible.map((row) => (
          <li key={row.no} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-navy-900">
                EMI {row.no} · {formatINR(row.emi)}
              </p>
              <p className="text-xs text-navy-500">Due {formatDate(row.dueDate)}</p>
            </div>
            {row.status === 'paid' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <IconCheck size={13} /> Paid
              </span>
            ) : (
              <Badge status={row.status} />
            )}
          </li>
        ))}
      </ul>

      {schedule.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-navy-100 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-navy-50/60"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : `Show all ${schedule.length} EMIs`}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
            <IconChevronDown size={16} />
          </motion.span>
        </button>
      )}
    </div>
  );
}
