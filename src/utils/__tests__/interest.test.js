import { describe, it, expect } from 'vitest';
import {
  LOAN_CONFIG,
  calculateDues,
  calculateEmi,
  calculateTotalInterest,
  buildEmiSchedule,
  daysLate,
  addMonths,
} from '../interest.js';

const { monthlyInterestRate: RATE, gracePeriodDays: GRACE, dailyPenaltyRate: PENALTY } = LOAN_CONFIG;

/** Date `offsetDays` from today, normalised to midnight. */
function day(offsetDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

describe('daysLate', () => {
  it('is positive when overdue and negative when paid early', () => {
    expect(daysLate(day(-10), day(0))).toBe(10);
    expect(daysLate(day(5), day(0))).toBe(-5);
    expect(daysLate(day(0), day(0))).toBe(0);
  });

  it('ignores time-of-day (due 11:59 pm yesterday, paid 6 am today = 1 day late)', () => {
    const due = day(-1);
    due.setHours(23, 59, 0, 0);
    const now = day(0);
    now.setHours(6, 0, 0, 0);
    expect(daysLate(due, now)).toBe(1);
  });
});

describe('addMonths', () => {
  it('clamps to end of month', () => {
    const jan31 = new Date(2026, 0, 31);
    const feb = addMonths(jan31, 1);
    expect(feb.getMonth()).toBe(1);
    expect(feb.getDate()).toBe(28); // 2026 is not a leap year
    const leap = addMonths(new Date(2024, 0, 31), 1);
    expect(leap.getDate()).toBe(29); // 2024 is a leap year
  });
});

describe('calculateDues', () => {
  const principal = 100000;
  const interestDue = 2000; // 2% of 1,00,000

  it('paid on time (5 days before due): no penalty, only interest', () => {
    const r = calculateDues({ principal, dueDate: day(5), currentDate: day(0) });
    expect(r.interestDue).toBe(interestDue);
    expect(r.daysLate).toBe(0);
    expect(r.daysOverdue).toBe(0);
    expect(r.penaltyAccrued).toBe(0);
    expect(r.totalPayable).toBe(interestDue);
  });

  it('paid exactly on the due date: no penalty', () => {
    const r = calculateDues({ principal, dueDate: day(0), currentDate: day(0) });
    expect(r.penaltyAccrued).toBe(0);
    expect(r.totalPayable).toBe(interestDue);
  });

  it('1 day late: still inside the 3-day grace period, no penalty', () => {
    const r = calculateDues({ principal, dueDate: day(-1), currentDate: day(0) });
    expect(r.daysLate).toBe(1);
    expect(r.graceRemaining).toBe(2);
    expect(r.daysOverdue).toBe(0);
    expect(r.penaltyAccrued).toBe(0);
    expect(r.totalPayable).toBe(interestDue);
  });

  it('3 days late: last day of grace, still no penalty', () => {
    const r = calculateDues({ principal, dueDate: day(-3), currentDate: day(0) });
    expect(r.daysOverdue).toBe(0);
    expect(r.penaltyAccrued).toBe(0);
  });

  it('4 days late: first penalty day (1 day past grace)', () => {
    const r = calculateDues({ principal, dueDate: day(-4), currentDate: day(0) });
    expect(r.daysOverdue).toBe(1);
    expect(r.penaltyAccrued).toBe(2); // 2000 * 0.1% * 1
    expect(r.totalPayable).toBe(2002);
  });

  it('30 days late: penalty accrues daily on the overdue amount', () => {
    const r = calculateDues({ principal, dueDate: day(-30), currentDate: day(0) });
    expect(r.daysLate).toBe(30);
    expect(r.daysOverdue).toBe(27); // 30 - 3 grace days
    expect(r.penaltyAccrued).toBe(54); // 2000 * 0.1% * 27
    expect(r.totalPayable).toBe(2054);
  });

  it('applies penalty to the full EMI when overdueAmount is provided', () => {
    const r = calculateDues({
      principal,
      dueDate: day(-4),
      currentDate: day(0),
      principalDue: 8000,
      overdueAmount: 10000, // interest 2000 + principal 8000
    });
    expect(r.overdueAmount).toBe(10000);
    expect(r.penaltyAccrued).toBe(10); // 10000 * 0.1% * 1
    expect(r.totalPayable).toBe(10010);
  });

  it('includes principalDue in the total when given', () => {
    const r = calculateDues({
      principal,
      dueDate: day(0),
      currentDate: day(0),
      principalDue: 8000,
    });
    expect(r.totalPayable).toBe(10000); // 2000 interest + 8000 principal, no penalty
  });

  it('honours custom rate configuration', () => {
    const r = calculateDues({
      principal,
      monthlyInterestRate: 0.03,
      dueDate: day(-10),
      currentDate: day(0),
      gracePeriodDays: 0,
      dailyPenaltyRate: 0.002,
    });
    expect(r.interestDue).toBe(3000);
    expect(r.daysOverdue).toBe(10);
    expect(r.penaltyAccrued).toBe(60); // 3000 * 0.2% * 10
  });
});

describe('calculateEmi', () => {
  it('returns 0 for non-positive inputs', () => {
    expect(calculateEmi(0, RATE, 12)).toBe(0);
    expect(calculateEmi(100000, RATE, 0)).toBe(0);
  });

  it('splits the principal evenly at 0% interest', () => {
    expect(calculateEmi(120000, 0, 12)).toBe(10000);
  });

  it('reducing-balance EMI: total payments exceed principal and repay the loan', () => {
    const principal = 200000;
    const tenure = 12;
    const emi = calculateEmi(principal, RATE, tenure);
    expect(emi).toBeGreaterThan(principal / tenure); // interest pushes EMI up
    const totalInterest = calculateTotalInterest(principal, RATE, tenure);
    expect(totalInterest).toBeCloseTo(emi * tenure - principal, 1);
    expect(emi * tenure).toBeGreaterThan(principal);
  });
});

describe('buildEmiSchedule', () => {
  const principal = 200000;
  const tenure = 12;
  const schedule = buildEmiSchedule(principal, RATE, tenure, new Date(2026, 0, 5));

  it('creates one row per month with correct due dates', () => {
    expect(schedule).toHaveLength(tenure);
    expect(schedule[0].dueDate).toBe('2026-02-05');
    expect(schedule[11].dueDate).toBe('2027-01-05');
  });

  it('principal portions sum exactly to the loan amount', () => {
    const sum = schedule.reduce((acc, r) => acc + r.principal, 0);
    expect(Math.abs(sum - principal)).toBeLessThan(0.05);
  });

  it('ends with a zero outstanding balance', () => {
    expect(schedule[tenure - 1].balance).toBeLessThan(0.05);
  });

  it('keeps EMI constant (final row may differ by paise due to rounding)', () => {
    const emis = schedule.map((r) => r.emi);
    for (let i = 0; i < tenure - 2; i += 1) {
      expect(emis[i]).toBe(emis[i + 1]);
    }
    expect(Math.abs(emis[tenure - 1] - emis[0])).toBeLessThan(1);
  });

  it('interest component decreases as balance reduces', () => {
    expect(schedule[5].interest).toBeLessThan(schedule[0].interest);
  });
});
