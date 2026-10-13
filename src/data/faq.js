/** FAQ content, shared by the home page section and the /faq page. */
export const FAQ_ITEMS = [
  {
    q: 'What interest rate do you charge?',
    a: 'A flat 0.8% per day on the principal, from the day the loan is disbursed until the repayment due date. Interest = Principal × 0.8% × Days, and Total Repayable = Principal + Interest. Every rupee is shown to you — in the calculator, on the application review screen, and on your dashboard — before you owe anything.',
  },
  {
    q: 'When is my loan due?',
    a: 'Every loan runs for one billing cycle and is due on the 28th. If your loan is disbursed between the 1st and the 15th of a month, it is due on the 28th of that same month. If it is disbursed on the 16th or later, it is due on the 28th of the following month. The same daily rate applies to both windows.',
  },
  {
    q: 'What happens if I repay late?',
    a: 'Every repayment gets a 3-day grace period after its due date with no charge. From day 4, a penalty of 0.1% per day accrues on the overdue amount (principal + interest) until it is paid. Importantly, interest stops accruing on the due date itself — only the penalty grows after that. The dashboard shows the exact penalty live, day by day.',
  },
  {
    q: 'How do I complete KYC?',
    a: 'Provide your permanent address and current/destination address (tick "same as permanent address" if they match), upload a photo or PDF of your Aadhaar and PAN, then take a quick selfie with a liveness check (you may be asked to blink or turn your head). Verification usually completes in minutes. Your documents are encrypted in transit and at rest; we never display or store your full Aadhaar number in the browser.',
  },
  {
    q: 'How fast is disbursal?',
    a: 'Once your application is approved, funds are transferred to your verified bank account within 24 working hours. You can track every stage — submitted, KYC verified, under review, approved, disbursed — on your dashboard.',
  },
  {
    q: 'Who is eligible?',
    a: 'Indian residents aged 18–65 with a monthly income, valid Aadhaar and PAN, and a permanent + current address. Your Aadhaar and PAN are validated against official formats (including the Aadhaar checksum) at entry, and against government records during verification.',
  },
  {
    q: 'Can I repay early?',
    a: 'Yes — any time, at zero extra charge. You pay interest only for the days between disbursement and repayment.',
  },
  {
    q: 'Is my data safe?',
    a: 'All traffic is encrypted with TLS, documents are stored in encrypted vaults, and we follow data-minimisation: the browser never keeps your full Aadhaar number. You can withdraw consent for data usage at any time from your dashboard.',
  },
  {
    q: 'What documents do I need?',
    a: 'Just three things: your Aadhaar, your PAN, and a working camera for the selfie liveness check. No salary slips or bank statements for standard loans.',
  },
];
