# FeeLens — Stripe Fee Intelligence Dashboard

> See exactly where your Stripe fees go. Get AI-powered recommendations to lower your effective rate.

FeeLens is a full-stack analytics dashboard built for startups on Stripe. Most companies pay 0.3-0.5% above Stripe's nominal 2.9% rate without knowing it — due to Amex premiums, international surcharges, refund fee retention, and dispute fees. FeeLens surfaces these hidden costs and gives you a clear action plan to reduce them.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-green)

---

## Features

- **True Effective Rate** — Your real blended rate broken down by card brand, payment method, and geography
- **Fee Leakage Detection** — Surfaces refund fee retention, international surcharges, won-dispute fees, and Amex premiums
- **AI Fee Optimizer** — Analyzes your breakdown and provides ranked, actionable recommendations with estimated monthly savings
- **Month-over-Month Comparison** — Track rate changes, fee deltas, and volume trends
- **Dark/Light Mode** — Premium theming with smooth transitions and glassmorphism effects
- **Demo Mode** — Full dashboard experience with sample data at `/demo`, no credentials needed

---

## Tech Stack

| Layer       | Technology                                              |
|-------------|--------------------------------------------------------|
| Framework   | Next.js 16 (App Router, Turbopack)                     |
| Language    | TypeScript 5                                            |
| Styling     | Tailwind CSS 4 + CSS custom properties + shadcn/ui     |
| Database    | Supabase (Postgres + Auth + Row Level Security)         |
| Payments    | Stripe Node SDK (read-only: balance_transactions, charges, disputes) |
| AI          | Anthropic API for fee optimization recommendations      |
| Charts      | Recharts                                                |
| Deployment  | Vercel                                                  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Stripe account (test mode is fine)
- An Anthropic API key (for AI recommendations)

### Installation

```bash
git clone https://github.com/your-username/feelens.git
cd feelens
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (for AI recommendations)
ANTHROPIC_API_KEY=sk-ant-...

# Encryption key for Stripe keys at rest (generate with: openssl rand -hex 32)
STRIPE_KEY_ENCRYPTION_SECRET=your-32-byte-hex-string

# App URL (for API route calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the migration SQL in your Supabase SQL editor:

```bash
# The migration file is at:
supabase/migrations/001_initial.sql
```

This creates the required tables with Row Level Security policies.

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the landing page, or [http://localhost:3000/demo](http://localhost:3000/demo) for the demo dashboard.

---

## Project Structure

```
feelens/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── demo/page.tsx               # Public demo dashboard (no auth)
│   ├── (auth)/login/page.tsx       # Auth page
│   ├── dashboard/
│   │   ├── page.tsx                # Connect Stripe form
│   │   └── overview/page.tsx       # Authenticated dashboard
│   └── api/
│       ├── stripe/connect          # Validate + store Stripe key
│       ├── stripe/sync             # Sync Stripe data
│       ├── analytics/*             # Summary, breakdown, leakage, compare
│       └── ai/recommend            # AI recommendations
├── components/
│   ├── dashboard/                  # SummaryMetrics, FeeBreakdownChart, etc.
│   ├── demo/                       # DemoBanner, DemoNav
│   ├── ui/                         # shadcn/ui primitives
│   ├── ThemeProvider.tsx           # Dark/light mode context
│   ├── ThemeToggle.tsx             # Theme switch button
│   └── Toast.tsx                   # Toast notification system
├── lib/
│   ├── stripe/                     # Stripe client, fetcher, calculator
│   ├── supabase/                   # Supabase client (browser + server)
│   ├── demo/seed.ts                # Static demo dataset
│   ├── crypto.ts                   # AES-256-GCM encryption
│   └── utils.ts                    # Formatters and helpers
└── types/index.ts                  # Shared TypeScript interfaces
```

---

## How It Works

### Stripe Data Pipeline

1. User provides a **restricted Stripe key** (read-only)
2. Key is validated against Stripe's API, then **AES-256-GCM encrypted** and stored
3. The sync pipeline fetches `balance_transactions` (Stripe's authoritative ledger) and enriches each charge with card brand and country data
4. Refund fee leakage and dispute records are computed and stored separately
5. All data is bucketed by month for fast aggregation

### Fee Leakage Logic

| Leakage Type | Calculation |
|---|---|
| Refund fee retention | `(refundAmount / originalAmount) * originalFee` |
| Amex premium | `amexVolume * (3.5% - 2.9%)` |
| International surcharge | `internationalVolume * 1.5%` |
| Won dispute fees | `wonDisputeCount * $15` |

### AI Recommendations

The AI receives your full fee breakdown as structured data and returns ranked, actionable recommendations with conservative savings estimates. Results are cached by a SHA-256 hash of the input data to avoid redundant API calls.

---

## UAT Checklist

### Demo Flow (no auth required)
- [ ] Visit `/demo` — full dashboard loads with sample data
- [ ] All 4 summary metric cards display correctly
- [ ] Fee Breakdown chart tabs work (By Brand, By Method, By Geo)
- [ ] Card Brand table shows 4 brands sorted by fee impact
- [ ] Fee Leakage section shows 4 items, expandable on click
- [ ] AI Recommendations shows 3 cards, "Show 2 more" expands
- [ ] Month Comparison delta pills and rate arrow render
- [ ] Theme toggle switches between light and dark mode
- [ ] Dark mode renders correctly across all components
- [ ] Mobile responsive — cards stack vertically on small screens

### Auth Flow
- [ ] Visit `/login` — sign up form works
- [ ] Email confirmation flow completes
- [ ] Sign in redirects to `/dashboard`
- [ ] Without Stripe connection — shows Connect form
- [ ] Invalid Stripe key — shows error message
- [ ] Valid `sk_test_*` key — syncs data and redirects to overview

### Authenticated Dashboard
- [ ] `/dashboard/overview` shows real Stripe data
- [ ] Summary metrics match Stripe's own reporting
- [ ] Sign out clears session and redirects to login
- [ ] RLS: cannot access another user's data

### Landing Page
- [ ] `/` renders hero, stats, features, CTA
- [ ] "See live demo" links to `/demo`
- [ ] "Connect Stripe" links to `/login`
- [ ] Dark mode toggle works on landing page

---

## Security

- Stripe keys are **AES-256-GCM encrypted** at the application layer before storage
- Only **restricted keys** with read-only permissions are accepted
- All database tables enforce **Row Level Security** — users can only access their own data
- No customer PII or payout data is ever accessed

---

## License

MIT
