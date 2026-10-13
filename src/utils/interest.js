/**
 * Interest & due-date engine for TrustLend (single-cycle loans).
 *
 * Business rules (private lending):
 *  - Loan tenure is ONE billing cycle: a single repayment, no EMIs.
 *  - Due date rule:
 *      disbursed on the 1st–15th   → repayment due on the 28th of the SAME month
 *      disbursed on the 16th–EOM   → repayment due on the 28th of the FOLLOWING month
 *  - Interest: 0.8% per day on the principal, from the disbursement date up to
 *    the due date. Interest stops accruing on the due date.
 *        Interest = Principal × 0.8% × Days
 *        Total repayable = Principal + Interest
 *  - Grace period: 3 days after the due date with no penalty.
 *  - Late penalty: 0.1% of the overdue amount (the full repayable) per day,
 *    accruing daily after the grace period until paid.
 *
 * This module is pure and framework-free on purpose: it is unit-tested
 * (see src/utils/__tests__/interest.test.js) and can be shared with the
 * backend implementation to guarantee identical numbers.
 */

export const LOAN_CONFIG = {
  dailyInterestRate: 0.008, // 0.8% per day
  gracePeriodDays: 3,
  dailyPenaltyRate: 0.001, // 0.1% per day
  minAmount: 10000,
  maxAmount: 500000,
  dueDayOfMonth: 28, // repayment is always due on the 28th
  firstHalfCutoffDay: 15, // disbursement day 1–15 → same month, 16+ → next month
  /**
   * Whether the due date itself counts as an interest day.
   * false → days = [disbursement, dueDate)  (money returned on the 28th,
   *          no interest for that day). Set to true for inclusive counting.
   */
  countDueDateInInterestDays: false,
};

const MS_PER_DAY = 86400000;

/** Round to 2 decimals (paise) without floating point drift. */
export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/** Copy a Date truncated to midnight, so day arithmetic is time-safe. */
export function dateOnly(input) {
  const d = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${input}`);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole days from dueDate to currentDate; positive when overdue, negative when early. */
export function daysLate(dueDate, currentDate = new Date()) {
  return Math.round((dateOnly(currentDate).getTime() - dateOnly(dueDate).getTime()) / MS_PER_DAY);
}

/** Whole days from a to b (both positive when b is after a). */
export function daysBetween(from, to) {
  return Math.round((dateOnly(to).getTime() - dateOnly(from).getTime()) / MS_PER_DAY);
}

/** 'YYYY-MM-DD' string for a date, built from LOCAL parts (UTC-safe). */
export function isoDate(input) {
  const d = dateOnly(input);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * The repayment due date for a loan disbursed on `disbursementDate`.
 *
 *  - Day 1–15  → 28th of the same month
 *  - Day 16–EOM → 28th of the following month (December rolls into January)
 */
export function calculateDueDate(disbursementDate) {
  const d = dateOnly(disbursementDate);
  const { dueDayOfMonth, firstHalfCutoffDay } = LOAN_CONFIG;
  if (d.getDate() <= firstHalfCutoffDay) {
    return new Date(d.getFullYear(), d.getMonth(), dueDayOfMonth);
  }
  return new Date(d.getFullYear(), d.getMonth() + 1, dueDayOfMonth);
}

/**
 * Core loan math for a single-cycle loan.
 *
 * @param {object} args
 * @param {number} args.principal
 * @param {Date|string} args.disbursementDate
 * @param {Date|string} [args.dueDate]  Overrides the derived due date (tests/edge cases).
 * @param {number} [args.dailyInterestRate]
 * @returns {{dueDate:string, interestDays:number, interest:number, totalRepayable:number}}
 */
export function calculateLoanTerms({
  principal,
  disbursementDate,
  dueDate,
  dailyInterestRate = LOAN_CONFIG.dailyInterestRate,
}) {
  const due = dueDate ? dateOnly(dueDate) : calculateDueDate(disbursementDate);
  const rawDays = daysBetween(disbursementDate, due);
  const interestDays = Math.max(0, rawDays) + (LOAN_CONFIG.countDueDateInInterestDays ? 1 : 0);
  const interest = round2(principal * dailyInterestRate * interestDays);
  return {
    dueDate: isoDate(due),
    interestDays,
    interest,
    totalRepayable: round2(principal + interest),
  };
}

/**
 * Everything owed right now for a single-cycle loan: interest to the due
 * date, plus any late penalty accrued after the grace period.
 *
 * @param {object} args
 * @param {number} args.principal
 * @param {Date|string} args.disbursementDate
 * @param {Date|string} [args.dueDate]
 * @param {Date|string} [args.currentDate]  Defaults to today.
 * @param {number} [args.gracePeriodDays]
 * @param {number} [args.dailyPenaltyRate]
 * @param {number} [args.dailyInterestRate]
 * @returns {{dueDate:string, interestDays:number, interest:number, totalRepayable:number,
 *            daysLate:number, graceRemaining:number, daysOverdue:number,
 *            penaltyAccrued:number, overdueAmount:number, totalPayable:number}}
 */
export function calculateDues({
  principal,
  disbursementDate,
  dueDate,
  currentDate = new Date(),
  gracePeriodDays = LOAN_CONFIG.gracePeriodDays,
  dailyPenaltyRate = LOAN_CONFIG.dailyPenaltyRate,
  dailyInterestRate = LOAN_CONFIG.dailyInterestRate,
}) {
  const terms = calculateLoanTerms({ principal, disbursementDate, dueDate, dailyInterestRate });

  const late = Math.max(0, daysLate(terms.dueDate, currentDate));
  const daysOverdue = Math.max(0, late - gracePeriodDays);
  const overdueAmount = terms.totalRepayable; // the full repayment is the overdue base
  const penaltyAccrued = round2(overdueAmount * dailyPenaltyRate * daysOverdue);

  return {
    ...terms,
    daysLate: late,
    graceRemaining: Math.max(0, gracePeriodDays - late),
    daysOverdue,
    penaltyAccrued,
    overdueAmount,
    totalPayable: round2(terms.totalRepayable + penaltyAccrued),
  };
}
