# TrustLend — Digital Lending Platform (Frontend)

A production-quality **frontend** for a private lending business: customers apply for loans at **2% monthly interest (reducing balance)**; late EMIs accrue a **0.1%-per-day penalty** after a **3-day grace period**, with every rupee disclosed before the user commits.

Built with **React 18 (JavaScript)**, **React Router 6**, **Tailwind CSS**, **Framer Motion**, **React Hook Form + Zod**, and **Vite**.

---

## 1. Folder structure

```
trustlend/
├── index.html                      # Entry HTML (Inter font, meta, favicon)
├── package.json
├── vite.config.js                  # Vite + vitest config
├── tailwind.config.js              # Navy/emerald design tokens, shadows
├── postcss.config.js
└── src/
    ├── main.jsx                    # Providers: Router > Language > Auth > Toast
    ├── App.jsx                     # Route table (public / auth / protected)
    ├── index.css                   # Tailwind layers, focus-visible ring, utilities
    │
    ├── components/
    │   ├── layout/
    │   │   ├── TopBar.jsx          # Phone, email, hours, EN/हिन्दी selector
    │   │   ├── Navbar.jsx          # Sticky nav, hamburger, auth-aware actions
    │   │   ├── Footer.jsx          # Links + lender registration disclaimer
    │   │   ├── Layout.jsx          # Shell + skip-link + scroll restore
    │   │   └── ProtectedRoute.jsx  # Login redirect that remembers ?next
    │   ├── home/
    │   │   ├── Hero.jsx            # Headline, CTAs, animated loan card, trust strip
    │   │   ├── LoanTypes.jsx       # 4 loan products
    │   │   ├── HowItWorks.jsx      # Sign up → KYC → Apply → Funds
    │   │   ├── Testimonials.jsx
    │   │   └── FaqSection.jsx
    │   ├── calculator/
    │   │   └── EmiCalculator.jsx   # Live sliders → EMI/interest/total + split bar
    │   ├── apply/
    │   │   ├── StepPersonal.jsx    # Step 1: personal details (RHF + Zod)
    │   │   ├── StepLoan.jsx        # Step 2: amount/tenure + live disclosure
    │   │   ├── StepKyc.jsx         # Step 3: PAN/Aadhaar + uploads + masking
    │   │   ├── StepFace.jsx        # Step 4: webcam + liveness prompts
    │   │   ├── StepReview.jsx      # Step 5: disclosure + consent checkboxes
    │   │   └── FileUploadCard.jsx  # Drop zone: type/size validation, preview
    │   ├── dashboard/
    │   │   ├── ApplicationTracker.jsx  # Submitted → … → Disbursed rail
    │   │   ├── LoanSummaryCard.jsx     # Outstanding, EMI, next due, Pay now
    │   │   ├── LateFeeBreakdown.jsx    # Principal / interest / days overdue / penalty
    │   │   ├── EmiScheduleTable.jsx    # Full amortisation schedule
    │   │   ├── PaymentHistory.jsx      # Receipts with penalty split
    │   │   └── PayNowModal.jsx         # Method picker (UPI/NB/card) — mocked
    │   └── ui/                     # Button, Input/Select/Checkbox, Card, Badge,
    │                               # Skeleton, Accordion, Modal, OtpInput,
    │                               # StepsProgress, Icons (24 inline SVGs)
    ├── pages/                      # Home, Loans, EmiCalculatorPage, HowItWorksPage,
    │                               # FaqPage, Login, Signup, VerifyOtp, Apply,
    │                               # Dashboard, PrivacyPage, TermsPage, NotFound
    ├── context/
    │   ├── AuthContext.jsx         # Session (token in localStorage), all auth actions
    │   ├── LanguageContext.jsx     # EN/HI with t() and fallback
    │   ├── ToastContext.jsx        # Animated, aria-live toasts
    │   └── translations.js         # Dictionary for both locales
    ├── hooks/
    │   ├── useCamera.js            # getUserMedia lifecycle + capture
    │   ├── useCountdown.js         # OTP resend timer
    │   └── useDocumentTitle.js
    ├── services/                   # ← the ONLY mock-API boundary
    │   ├── mockApi.js              # localStorage "db", latency, seed data
    │   ├── authService.js          # signup / OTP / password login / sessions
    │   ├── loanService.js          # apply, dashboard, payDue
    │   └── kycService.js           # doc validation + faceVerificationProvider
    ├── data/
    │   └── faq.js
    └── utils/
        ├── interest.js             # ★ Pure money math (EMI, dues, penalty, schedule)
        ├── validators.js           # ★ PAN regex, Aadhaar Verhoeff, masking
        ├── schemas.js              # Zod schemas shared by all forms
        ├── format.js               # INR / date formatting
        ├── storage.js              # Safe localStorage wrappers
        └── __tests__/              # 32 unit tests (vitest)
```

## 2. Setup & run

```bash
cd trustlend
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm test           # run the 32 unit tests once
npm run test:watch # watch mode
npm run build      # production build → dist/
npm run preview    # serve the production build
```

### Docker

A multi-stage `Dockerfile` (Node 20 build → Nginx 1.27 serve) plus `nginx.conf`
(SPA fallback, gzip, asset caching), `.dockerignore` and `docker-compose.yml` are included.

```bash
docker build -t trustlend-frontend .     # build the image
docker run -d --name trustlend-frontend -p 8080:80 trustlend-frontend
# → open http://localhost:8080

# or with compose:
docker compose up -d --build
docker compose down                      # stop
```

Notes:

- The Nginx config falls back to `index.html` on unknown paths so React Router
  deep links (`/dashboard`, `/apply?amount=…`) work on refresh.
- Static assets are served with `immutable` one-year caching; the HTML shell is
  never cached, so deploys appear instantly.
- Camera-based face verification requires a **secure context**: it works when
  you browse via `http://localhost:8080`. To serve the container from a LAN IP
  or a domain, put it behind HTTPS (e.g. Caddy/Traefik or a cloud LB).

### Demo account (seeded automatically)

| | |
|---|---|
| Login | `demo@trustlend.in` (or mobile `9876543210`) |
| Password | `Demo@1234` |
| Seeded data | Active ₹2,00,000 loan with EMI 2 **overdue 6 days** (so the penalty breakdown is visible), plus an application under review |

New sign-ups work end-to-end: the mock "SMS gateway" surfaces the OTP on the verify screen (and in the console) instead of sending a real SMS.

### Camera note

Face verification needs `https://` or `localhost` for `getUserMedia`. Chrome/Edge will prompt for camera permission; deny it once to see the error state, which is handled.

## 3. Key engineering decisions

- **Money math is one pure module** (`utils/interest.js`) — EMI (reducing balance), dues with grace + daily penalty, and the full amortisation schedule are unit-tested and shared by the calculator, application wizard, dashboard and mock backend. Plug the same file into your real backend to guarantee identical numbers.
- **Aadhaar is never stored**: the KYC input is *uncontrolled* (ref-based), validated + sent once, then cleared from the DOM. Only `aadhaarLast4` and provider doc references reach React state. Storage util holds only session token and language.
- **KYC is provider-shaped**: `kycService.faceVerificationProvider` is the single seam — swap `verify()` for HyperVerge/Onfido/IDfy/DigiLocker without touching UI.
- **Auth redirect loop closed**: `ProtectedRoute` passes the attempted location through router state; login/calculator CTAs also pass `?next=`, so users land where they intended.
- **Compliance UI**: three explicit consent checkboxes, full rate/penalty disclosure on step 2 and step 5, late-fee breakdown card on the dashboard, lender registration disclaimer + illustrative-registration warning in the footer.

## 4. What the backend must provide

1. **Database** — users, sessions, applications, loans, EMI schedules, payments, KYC records (encrypted vault for documents; full Aadhaar only server-side).
2. **OTP service** — SMS gateway (MSG91/Twilio) with rate limits, expiry, attempt caps; never return the code to the client.
3. **KYC provider integration** — PAN/Aadhaar verification (e.g. Karza/IDfy/DigiLocker) + face match/liveness; webhooks to update application status.
4. **Payment gateway** — Razorpay/Cashfree order creation, webhook-verified payment confirmation, then mark EMI paid and record penalty split.
5. **Scheduled job** — daily penalty accrual per overdue EMI (same formulas as `utils/interest.js`), plus status pipeline advancement and reminders/escalations.
6. **Auth API** — bcrypt/argon2 password hashing, httpOnly-cookie sessions, account lockout, audit logging.

## 5. Suggested next steps

1. **Code-split the bundle** (`React.lazy` per route) — the current single chunk is ~515 kB (framer-motion is the bulk).
2. **Wire `services/` to a real API** — signatures are already async and typed by usage; add an API base URL + error envelope handling in `mockApi.js`'s place.
3. **Replace the face-verification provider** and add a DigiLocker flow for paperless Aadhaar.
4. **Add E2E tests** (Playwright) for the five application steps and the pay-overdue-EMI flow.
5. **Harden a11y with an axe audit**, add per-locale content review for Hindi beyond the nav/hero strings, and consider `i18next` if more locales are coming.
6. **Legal review** of the footer registration block, privacy policy and terms before going live (they are clearly marked as demo content).
