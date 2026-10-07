/**
 * Interest & penalty engine for TrustLend.
 *
 * Business rules (private lending):
 *  - Monthly interest rate: 2% per month (reducing balance) by default.
 *  - Grace period: 3 days after the due date with no penalty.
 *  - Late penalty: 0.1% of the overdue amount per day, accruing daily
 *    from the day after the grace period ends, until the amount is paid.
 *
 * This module is pure and framework-free on purpose: it is unit-tested
 * (see src/utils/__tests__/interest.test.js) and can be shared with the
 * backend implementation to guarantee identical numbers.
 */

export const LOAN_CONFIG = {
  monthlyInterestRate: 0.02, // 2% per month
  gracePeriodDays: 3,
  dailyPenaltyRate: 0.001, // 0.1% per day
  minAmount: 10000,
  maxAmount: 500000,
  minTenureMonths: 3,
  maxTenureMonths: 36,
};

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
  const MS_PER_DAY = 86400000;
  return Math.round((dateOnly(currentDate).getTime() - dateOnly(dueDate).getTime()) / MS_PER_DAY);
}

/** Add months, clamping to end-of-month (Jan 31 + 1mo = Feb 28/29). */
export function addMonths(input, months) {
  const d = dateOnly(input);
  const targetDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(targetDay, daysInTargetMonth));
  return d;
}

/** 'YYYY-MM-DD' string for a date, built from LOCAL parts (UTC-safe). */
export function isoDate(input) {
  const d = dateOnly(input);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Standard reducing-balance EMI:
 *   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function calculateEmi(principal, monthlyInterestRate = LOAN_CONFIG.monthlyInterestRate, tenureMonths) {
  if (!(principal > 0) || !(tenureMonths > 0)) return 0;
  if (monthlyInterestRate === 0) return round2(principal / tenureMonths);
  const factor = Math.pow(1 + monthlyInterestRate, tenureMonths);
  return round2((principal * monthlyInterestRate * factor) / (factor - 1));
}

/** Total interest over the life of the loan (reducing balance). */
export function calculateTotalInterest(principal, monthlyInterestRate, tenureMonths) {
  const emi = calculateEmi(principal, monthlyInterestRate, tenureMonths);
  return round2(emi * tenureMonths - principal);
}

/**
 * Dues for a single payment cycle, with late penalty.
 *
 * @param {object} args
 * @param {number} args.principal            Outstanding principal the interest applies to.
 * @param {number} [args.monthlyInterestRate]
 * @param {Date|string} args.dueDate         Due date of the current cycle.
 * @param {Date|string} [args.currentDate]   Defaults to today.
 * @param {number} [args.gracePeriodDays]
 * @param {number} [args.dailyPenaltyRate]
 * @param {number} [args.principalDue=0]     Principal component due this cycle (EMI scenario).
 * @param {number} [args.overdueAmount]      Base the daily penalty applies to.
 *                                           Defaults to interest + principal due (the full EMI).
 * @returns {{interestDue:number, principalDue:number, daysLate:number, graceRemaining:number,
 *            daysOverdue:number, penaltyAccrued:number, overdueAmount:number, totalPayable:number}}
 */
export function calculateDues({
  principal,
  monthlyInterestRate = LOAN_CONFIG.monthlyInterestRate,
  dueDate,
  currentDate = new Date(),
  gracePeriodDays = LOAN_CONFIG.gracePeriodDays,
  dailyPenaltyRate = LOAN_CONFIG.dailyPenaltyRate,
  principalDue = 0,
  overdueAmount,
}) {
  const interestDue = round2(principal * monthlyInterestRate);
  const principalComponent = round2(principalDue);
  const overdueBase = overdueAmount != null ? round2(overdueAmount) : round2(interestDue + principalComponent);

  const late = Math.max(0, daysLate(dueDate, currentDate));
  const daysOverdue = Math.max(0, late - gracePeriodDays);
  const penaltyAccrued = round2(overdueBase * dailyPenaltyRate * daysOverdue);

  return {
    interestDue,
    principalDue: principalComponent,
    daysLate: late,
    graceRemaining: Math.max(0, gracePeriodDays - late),
    daysOverdue,
    penaltyAccrued,
    overdueAmount: overdueBase,
    totalPayable: round2(interestDue + principalComponent + penaltyAccrued),
  };
}

/**
 * Full amortisation schedule (reducing balance).
 * Rows: {no, dueDate('YYYY-MM-DD'), emi, principal, interest, balanceBefore, balance, status}
 */
export function buildEmiSchedule(
  principal,
  monthlyInterestRate = LOAN_CONFIG.monthlyInterestRate,
  tenureMonths,
  startDate = new Date()
) {
  const emi = calculateEmi(principal, monthlyInterestRate, tenureMonths);
  const rows = [];
  let balance = round2(principal);

  for (let i = 1; i <= tenureMonths; i += 1) {
    const interest = round2(balance * monthlyInterestRate);
    const balanceBefore = balance;
    const isFinal = i === tenureMonths;
    const principalPart = isFinal ? balance : round2(emi - interest);
    balance = round2(balance - principalPart);
    const rowEmi = isFinal ? round2(principalPart + interest) : emi;

    rows.push({
      no: i,
      dueDate: isoDate(addMonths(startDate, i)),
      emi: rowEmi,
      principal: principalPart,
      interest,
      balanceBefore,
      balance,
      status: 'upcoming', // caller marks paid/overdue/due based on payments & today
    });
  }
  return rows;
}
