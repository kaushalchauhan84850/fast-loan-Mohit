import { describe, it, expect } from 'vitest';
import {
  LOAN_CONFIG,
  calculateDueDate,
  calculateLoanTerms,
  calculateDues,
  daysLate,
  daysBetween,
  isoDate,
} from '../interest.js';

const RATE = LOAN_CONFIG.dailyInterestRate; // 0.8% per day
const GRACE = LOAN_CONFIG.gracePeriodDays;

const d = (y, m, day) => new Date(y, m - 1, day); // month is 1-based here for readability

describe('calculateDueDate', () => {
  it.each([
    ['loan on the 1st → 28th same month', d(2026, 10, 1), '2026-10-28'],
    ['loan on the 15th → 28th same month', d(2026, 10, 15), '2026-10-28'],
    ['loan on the 16th → 28th next month', d(2026, 10, 16), '2026-11-28'],
    ['loan on the 28th → 28th next month', d(2026, 10, 28), '2026-11-28'],
    ['loan on the last day (Oct 31) → 28th next month', d(2026, 10, 31), '2026-11-28'],
    ['loan Feb 28 (non-leap) → 28th next month', d(2027, 2, 28), '2027-03-28'],
    ['loan on Dec 16 → Jan 28 next YEAR', d(2026, 12, 16), '2027-01-28'],
    ['loan on Dec 31 → Jan 28 next YEAR', d(2026, 12, 31), '2027-01-28'],
  ])('%s', (_label, disbursed, expected) => {
    expect(isoDate(calculateDueDate(disbursed))).toBe(expected);
  });
});

describe('calculateLoanTerms (interest = principal × 0.8% × days)', () => {
  it('loan taken on the 1st: 27 interest days to the 28th', () => {
    const t = calculateLoanTerms({ principal: 100000, disbursementDate: d(2026, 10, 1) });
    expect(t.dueDate).toBe('2026-10-28');
    expect(t.interestDays).toBe(27);
    expect(t.interest).toBe(21600); // 100000 × 0.008 × 27 (₹800/day)
    expect(t.totalRepayable).toBe(121600);
  });

  it('loan taken on the 15th: 13 interest days', () => {
    const t = calculateLoanTerms({ principal: 100000, disbursementDate: d(2026, 10, 15) });
    expect(t.dueDate).toBe('2026-10-28');
    expect(t.interestDays).toBe(13);
    expect(t.interest).toBe(10400);
    expect(t.totalRepayable).toBe(110400);
  });

  it('loan taken on the 16th: 43 interest days across the month boundary', () => {
    const t = calculateLoanTerms({ principal: 100000, disbursementDate: d(2026, 10, 16) });
    expect(t.dueDate).toBe('2026-11-28');
    expect(t.interestDays).toBe(43);
    expect(t.interest).toBe(34400);
    expect(t.totalRepayable).toBe(134400);
  });

  it('loan taken on the last day of October: 28 interest days', () => {
    const t = calculateLoanTerms({ principal: 100000, disbursementDate: d(2026, 10, 31) });
    expect(t.dueDate).toBe('2026-11-28');
    expect(t.interestDays).toBe(28);
    expect(t.interest).toBe(22400);
  });

  it('year-end: Dec 16 → Jan 28 is 43 interest days', () => {
    const t = calculateLoanTerms({ principal: 100000, disbursementDate: d(2026, 12, 16) });
    expect(t.dueDate).toBe('2027-01-28');
    expect(t.interestDays).toBe(43); // 15 days of Dec + 28 days of Jan
    expect(t.interest).toBe(34400);
  });

  it('year-end: Dec 31 → Jan 28 is 28 interest days', () => {
    const t = calculateLoanTerms({ principal: 100000, disbursementDate: d(2026, 12, 31) });
    expect(t.interestDays).toBe(28);
  });

  it('same rate applies to both windows (first-half vs second-half disbursement)', () => {
    const firstHalf = calculateLoanTerms({ principal: 50000, disbursementDate: d(2026, 10, 10) });
    const secondHalf = calculateLoanTerms({ principal: 50000, disbursementDate: d(2026, 10, 20) });
    // rate per day is identical; only the day count differs
    expect(firstHalf.interest / firstHalf.interestDays).toBe(50000 * RATE);
    expect(secondHalf.interest / secondHalf.interestDays).toBe(50000 * RATE);
  });

  it('countDueDateInInterestDays flag adds one day when enabled', () => {
    const before = LOAN_CONFIG.countDueDateInInterestDays;
    try {
      LOAN_CONFIG.countDueDateInInterestDays = true;
      const t = calculateLoanTerms({ principal: 100000, disbursementDate: d(2026, 10, 1) });
      expect(t.interestDays).toBe(28); // 27 + the due date itself
      expect(t.interest).toBe(22400);
    } finally {
      LOAN_CONFIG.countDueDateInInterestDays = before;
    }
  });
});

describe('calculateDues (penalty after grace)', () => {
  // disbursed Oct 1 2026 → due Oct 28, interest 21600 (₹800/day × 27), total 121600
  const loan = { principal: 100000, disbursementDate: d(2026, 10, 1) };

  it('paid on time (before due): no penalty, total = principal + interest', () => {
    const r = calculateDues({ ...loan, currentDate: d(2026, 10, 20) });
    expect(r.totalRepayable).toBe(121600);
    expect(r.daysLate).toBe(0);
    expect(r.penaltyAccrued).toBe(0);
    expect(r.totalPayable).toBe(121600);
  });

  it('paid exactly on the due date: no penalty', () => {
    const r = calculateDues({ ...loan, currentDate: d(2026, 10, 28) });
    expect(r.penaltyAccrued).toBe(0);
    expect(r.totalPayable).toBe(121600);
  });

  it('1 day late: still inside the 3-day grace, no penalty', () => {
    const r = calculateDues({ ...loan, currentDate: d(2026, 10, 29) });
    expect(r.daysLate).toBe(1);
    expect(r.graceRemaining).toBe(2);
    expect(r.penaltyAccrued).toBe(0);
  });

  it('4 days late: first penalty day (1 past grace)', () => {
    const r = calculateDues({ ...loan, currentDate: d(2026, 11, 1) });
    expect(r.daysOverdue).toBe(1);
    expect(r.penaltyAccrued).toBe(121.6); // 121600 × 0.1% × 1
    expect(r.totalPayable).toBe(121721.6);
  });

  it('30 days late: penalty accrues daily on the full repayable', () => {
    const r = calculateDues({ ...loan, currentDate: d(2026, 11, 27) });
    expect(r.daysLate).toBe(30);
    expect(r.daysOverdue).toBe(27);
    expect(r.penaltyAccrued).toBe(3283.2); // 121600 × 0.001 × 27
    expect(r.totalPayable).toBe(124883.2);
  });

  it('interest does NOT keep accruing after the due date — only penalty does', () => {
    const onDue = calculateDues({ ...loan, currentDate: d(2026, 10, 28) });
    const monthLater = calculateDues({ ...loan, currentDate: d(2026, 11, 28) });
    expect(monthLater.interest).toBe(onDue.interest); // frozen at 2160
    expect(monthLater.penaltyAccrued).toBeGreaterThan(onDue.penaltyAccrued);
  });
});

describe('date helpers', () => {
  it('daysLate is positive when overdue, negative early, zero on the day', () => {
    expect(daysLate(d(2026, 10, 28), d(2026, 10, 30))).toBe(2);
    expect(daysLate(d(2026, 10, 28), d(2026, 10, 20))).toBe(-8);
    expect(daysLate(d(2026, 10, 28), d(2026, 10, 28))).toBe(0);
  });

  it('daysBetween crosses month and year boundaries correctly', () => {
    expect(daysBetween(d(2026, 12, 31), d(2027, 1, 28))).toBe(28);
    expect(daysBetween(d(2026, 10, 16), d(2026, 11, 28))).toBe(43);
  });

  it('daysLate ignores time-of-day', () => {
    const due = d(2026, 10, 27);
    due.setHours(23, 59, 0, 0);
    const now = d(2026, 10, 28);
    now.setHours(6, 0, 0, 0);
    expect(daysLate(due, now)).toBe(1);
  });
});
