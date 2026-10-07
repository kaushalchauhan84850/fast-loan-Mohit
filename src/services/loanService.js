/**
 * Loan service: applications, dashboard data, EMI payment.
 * All money math comes from utils/interest.js so UI and (future) backend
 * share one definition of interest, grace and penalty.
 */
import { request, randomId } from './mockApi.js';
import {
  LOAN_CONFIG,
  buildEmiSchedule,
  calculateDues,
  dateOnly,
  isoDate,
} from '../utils/interest.js';

const APPLICATION_FLOW = ['submitted', 'kyc_verified', 'under_review', 'approved', 'disbursed'];

/**
 * Mock pipeline: applications advance on a timer so the tracker moves
 * during a demo. A real backend updates status after vendor checks.
 */
function effectiveApplicationStatus(application) {
  if (!application) return null;
  if (application.status === 'rejected' || application.status === 'disbursed') return application.status;
  const elapsedSec = (Date.now() - new Date(application.submittedAt).getTime()) / 1000;
  if (elapsedSec > 240) return 'approved';
  if (elapsedSec > 120) return 'under_review';
  if (elapsedSec > 45) return 'kyc_verified';
  return 'submitted';
}

export async function submitApplication(userId, payload) {
  return request((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('Please log in again.');
    if (!payload?.kyc?.aadhaarLast4 || !payload?.kyc?.pan) {
      throw new Error('KYC verification is incomplete.');
    }
    if (!payload?.consents?.kyc || !payload?.consents?.data || !payload?.consents?.terms) {
      throw new Error('All consents are required before submission.');
    }
    const application = {
      id: randomId('a'),
      userId,
      personal: payload.personal,
      loan: payload.loan,
      kyc: payload.kyc, // contains only masked Aadhaar (last4) + refs
      consents: payload.consents,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    db.applications.unshift(application);
    return application;
  });
}

/** Everything the dashboard needs, in one call. */
export async function getDashboard(userId) {
  return request((db) => {
    const loan = db.loans.find((l) => l.userId === userId && l.status === 'active') || null;
    let schedule = null;
    let payments = db.payments
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    let nextDue = null;
    let dues = null;

    if (loan) {
      schedule = buildEmiSchedule(
        loan.principal,
        loan.monthlyInterestRate,
        loan.tenure,
        loan.startDate
      );
      const paidByNo = new Map(payments.filter((p) => p.loanId === loan.id).map((p) => [p.emiNo, p]));
      const today = dateOnly(new Date());

      schedule.forEach((row) => {
        const due = dateOnly(row.dueDate);
        if (paidByNo.has(row.no)) {
          row.status = 'paid';
        } else if (due.getTime() < today.getTime()) {
          row.status = 'overdue';
        } else if (due.getTime() - today.getTime() <= 7 * 86400000) {
          row.status = 'due';
        }
      });

      const nextRow = schedule.find((r) => r.status !== 'paid');
      if (nextRow) {
        nextDue = nextRow;
        dues = calculateDues({
          principal: nextRow.balanceBefore,
          monthlyInterestRate: loan.monthlyInterestRate,
          dueDate: nextRow.dueDate,
          principalDue: nextRow.principal,
          overdueAmount: nextRow.emi,
        });
      }
      payments = payments.map((p) => ({ ...p, emi: schedule[p.emiNo - 1]?.emi ?? p.amount }));
    }

    const application =
      db.applications.find((a) => a.userId === userId && a.status !== 'disbursed' && a.status !== 'rejected') || null;

    const outstanding = schedule
      ? schedule.filter((r) => r.status !== 'paid').reduce((acc, r) => acc + r.emi, 0)
      : 0;

    return {
      application: application ? { ...application, status: effectiveApplicationStatus(application) } : null,
      loan,
      schedule,
      payments,
      nextDue,
      dues,
      outstanding: Math.round(outstanding * 100) / 100,
      flow: APPLICATION_FLOW,
    };
  });
}

/** Pay the next unpaid EMI (principal + interest + any accrued penalty). */
export async function payDue(userId, method = 'upi') {
  return request((db) => {
    const loan = db.loans.find((l) => l.userId === userId && l.status === 'active');
    if (!loan) throw new Error('No active loan found.');

    const schedule = buildEmiSchedule(loan.principal, loan.monthlyInterestRate, loan.tenure, loan.startDate);
    const paid = new Set(db.payments.filter((p) => p.loanId === loan.id).map((p) => p.emiNo));
    const row = schedule.find((r) => !paid.has(r.no));
    if (!row) throw new Error('All EMIs are already paid. 🎉');

    const dues = calculateDues({
      principal: row.balanceBefore,
      monthlyInterestRate: loan.monthlyInterestRate,
      dueDate: row.dueDate,
      principalDue: row.principal,
      overdueAmount: row.emi,
    });

    const payment = {
      id: randomId('p'),
      userId,
      loanId: loan.id,
      emiNo: row.no,
      amount: dues.totalPayable,
      principal: dues.principalDue,
      interest: dues.interestDue,
      penalty: dues.penaltyAccrued,
      method,
      paidAt: new Date().toISOString(),
    };
    db.payments.push(payment);

    const remaining = schedule.filter((r) => r.no > row.no && !paid.has(r.no));
    if (remaining.length === 0) {
      loan.status = 'closed';
      loan.closedAt = isoDate(new Date());
    }

    return { payment, daysOverdue: dues.daysOverdue };
  });
}

/** Indicative offer preview used on the calculator / apply step 2. */
export function previewLoan(amount, tenure) {
  // synchronous on purpose: pure math, no backend needed
  return {
    monthlyInterestRate: LOAN_CONFIG.monthlyInterestRate,
    gracePeriodDays: LOAN_CONFIG.gracePeriodDays,
    dailyPenaltyRate: LOAN_CONFIG.dailyPenaltyRate,
  };
}
