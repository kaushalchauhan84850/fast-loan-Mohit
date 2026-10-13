import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import * as loanService from '../services/loanService.js';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton.jsx';
import ApplicationTracker from '../components/dashboard/ApplicationTracker.jsx';
import LoanSummaryCard from '../components/dashboard/LoanSummaryCard.jsx';
import LateFeeBreakdown from '../components/dashboard/LateFeeBreakdown.jsx';
import RepaymentSummary from '../components/dashboard/RepaymentSummary.jsx';
import PaymentHistory from '../components/dashboard/PaymentHistory.jsx';
import PayNowModal from '../components/dashboard/PayNowModal.jsx';
import Button from '../components/ui/Button.jsx';
import { IconArrowRight } from '../components/ui/Icons.jsx';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const dashboard = await loanService.getDashboard(user.id);
      setData(dashboard);
    } catch (err) {
      toast.error({ title: 'Could not load dashboard', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [user.id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePay = async (method) => {
    setPaying(true);
    try {
      const result = await loanService.payDue(user.id, method);
      setPayOpen(false);
      if (result.daysOverdue > 0) {
        toast.success({
          title: 'Loan repaid in full',
          message: `Payment received, including the accrued late penalty (${result.daysOverdue} days overdue).`,
        });
      } else {
        toast.success({ title: 'Loan repaid in full', message: 'Paid on time — no penalty charged.' });
      }
      await load();
    } catch (err) {
      toast.error({ title: 'Payment failed', message: err.message });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-navy-50/50 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">
            Hello, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-navy-600">Your loans and applications, all in one place.</p>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <CardSkeleton lines={5} />
            <CardSkeleton lines={5} />
            <TableSkeleton rows={6} className="lg:col-span-2" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* application in progress */}
            {data.application && (
              <ApplicationTracker application={data.application} flow={data.flow} />
            )}

            {/* active loan */}
            {data.loan && data.dues ? (
              <div className="grid items-start gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <LoanSummaryCard loan={data.loan} dues={data.dues} onPayNow={() => setPayOpen(true)} />
                  <LateFeeBreakdown loan={data.loan} dues={data.dues} />
                </div>
                <div className="space-y-6">
                  <RepaymentSummary loan={data.loan} dues={data.dues} />
                  <PaymentHistory payments={data.payments} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
                  <p className="text-base font-bold text-navy-950">No active loan</p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-navy-600">
                    {data.application
                      ? 'Your application is being processed — details will appear here as soon as it is disbursed.'
                      : 'Ready when you are. Apply in five quick steps and get funds within 24 hours of approval.'}
                  </p>
                  {!data.application && (
                    <Button to="/apply" size="lg" className="mt-6">
                      Apply for a loan <IconArrowRight size={17} />
                    </Button>
                  )}
                </div>
                {data.payments.length > 0 && <PaymentHistory payments={data.payments} />}
              </div>
            )}

            <p className="text-center text-xs text-navy-400">
              Questions about a charge? Call us before it becomes overdue —{' '}
              <Link to="/faq" className="font-semibold text-navy-600 underline underline-offset-2">
                see the FAQ
              </Link>
              .
            </p>
          </motion.div>
        )}
      </div>

      <PayNowModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        dues={data?.dues}
        onConfirm={handlePay}
        paying={paying}
      />
    </div>
  );
}
