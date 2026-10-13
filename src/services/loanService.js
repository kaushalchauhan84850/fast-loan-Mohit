/**
 * Loan service: applications, dashboard data, single-cycle repayment.
 * All money math comes from utils/interest.js so UI and (future) backend
 * share one definition of due dates, daily interest, grace and penalty.
 */
import { request, randomId } from './mockApi.js';
import { calculateLoanTerms, calculateDues, LOAN_CONFIG } from '../utils/interest.js';

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
    if (!payload?.personal?.permanentAddress || !payload?.personal?.currentAddress) {
      throw new Error('KYC addresses (permanent and current) are required.');
    }
    if (!payload?.consents?.kyc || !payload?.consents?.data || !payload?.consents?.terms) {
      throw new Error('All consents are required before submission.');
    }
    const application = {
      id: randomId('a'),
      userId,
      personal: payload.personal,
      loan: payload.loan, // { amount, purpose } — single cycle, no tenure
      kyc: {
        ...payload.kyc, // masked Aadhaar (last4) + doc refs
        permanentAddress: payload.personal.permanentAddress,
        currentAddress: payload.personal.currentAddress,
      },
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
    const payments = db.payments
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    let repayment = null;
    let dues = null;

    if (loan) {
      const terms = calculateLoanTerms({
        principal: loan.principal,
        disbursementDate: loan.disbursementDate,
      });
      dues = calculateDues({
        principal: loan.principal,
        disbursementDate: loan.disbursementDate,
      });
      repayment = {
        ...terms,
        status: dues.daysLate > 0 ? 'overdue' : 'due',
      };
    }

    const application =
      db.applications.find((a) => a.userId === userId && a.status !== 'disbursed' && a.status !== 'rejected') || null;

    return {
      application: application ? { ...application, status: effectiveApplicationStatus(application) } : null,
      loan,
      repayment,
      dues,
      outstanding: dues ? dues.totalPayable : 0,
      payments,
      flow: APPLICATION_FLOW,
    };
  });
}

/** Repay the active loan in full: principal + interest + any accrued penalty. */
export async function payDue(userId, method = 'upi') {
  return request((db) => {
    const loan = db.loans.find((l) => l.userId === userId && l.status === 'active');
    if (!loan) throw new Error('No active loan found.');

    const dues = calculateDues({
      principal: loan.principal,
      disbursementDate: loan.disbursementDate,
    });

    const payment = {
      id: randomId('p'),
      userId,
      loanId: loan.id,
      amount: dues.totalPayable,
      principal: loan.principal,
      interest: dues.interest,
      penalty: dues.penaltyAccrued,
      method,
      paidAt: new Date().toISOString(),
    };
    db.payments.push(payment);

    loan.status = 'closed';
    loan.closedAt = new Date().toISOString();

    return { payment, daysOverdue: dues.daysOverdue, dueDate: dues.dueDate };
  });
}

/** Indicative terms shown on the calculator / apply step 2. */
export function previewLoan(amount, disbursementDate = new Date()) {
  // synchronous on purpose: pure math, no backend needed
  return calculateLoanTerms({ principal: amount, disbursementDate });
}

export { LOAN_CONFIG };
