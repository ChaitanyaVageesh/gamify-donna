# WorkQuest — Gamify Your Startup

Turn daily work into a competitive, scored leaderboard. AI scores every task, tracks KPI progress, announces weekly champions, and sends reminder emails.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| AI Scoring | Google Gemini 1.5 Flash |
| Email | Resend |
| Charts | Recharts |
| Hosting | Vercel |

---

## Quick Setup (15 minutes)

### 1. Supabase — Database

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**
3. Go to **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### 2. Google Gemini — AI Scoring

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create an API key → `GEMINI_API_KEY`
3. Free tier gives 15 requests/min — plenty for a small team

### 3. Resend — Email Reminders (optional)

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key → `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to a verified sender (e.g. `noreply@yourcompany.com`)

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourcompany.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_SECRET=generate-random-32-char-string
```

Generate a `CRON_SECRET`: run `openssl rand -hex 16` in your terminal.

### 5. Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/setup`.

---

## Deploying to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add them from your `.env.local`.

### Option B — GitHub → Vercel (recommended for teams)

1. Push this repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial WorkQuest setup"
   git remote add origin https://github.com/YOUR_ORG/gamify-donna.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new) → Import your GitHub repo

3. Add environment variables in Vercel dashboard:
   - Settings → Environment Variables → add all from `.env.local`

4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL (e.g. `https://gamify-donna.vercel.app`)

5. Deploy!

### Cron Jobs (auto-configured)

`vercel.json` already sets up:
- **Daily 5 PM UTC** — reminder emails to players who haven't logged
- **Sunday 8 PM UTC** — weekly winner announcement email

Vercel runs these automatically on the Hobby plan (free). The cron endpoints are protected by `CRON_SECRET`.

---

## Usage Guide

### First Time Setup

1. Go to `/setup` → Enter your company name, description, and stage
2. Add all team members (names + emails for reminders)
3. Go to `/kpis` → Add your Key Performance Indicators
   - Click **AI Suggest** to get startup-framework-backed KPI recommendations
   - Set priority (1 = most important), target value, deadline
4. Share the link with your team!

### Daily Workflow

1. **Log tasks**: `/log` → select your name → pick date → add tasks
   - Describe each task in detail for better AI scoring
   - Select which KPI it contributes to
   - Mark direct vs indirect contribution
   - Enter hours spent
2. **View scores**: AI gives impact (0-10), effort (0-10), time value (0-10)
3. **Check dashboard**: See KPI progress, leaderboard, and activity feed

### Scoring Formula

```
Base = (Impact × 0.4) + (Effort × 0.3) + (TimeValue × 0.3)

KPI Priority Multiplier:
  P1 → ×1.5  |  P2 → ×1.25  |  P3 → ×1.0  |  P4+ → ×0.85

Contribution Multiplier:
  Direct → ×1.0  |  Indirect → ×0.7

Total = Base × KPI Multiplier × Contribution Multiplier × 10
```

**Max score per task: ~150 points** (P1 direct, all 10/10 scores)

**Time Value scoring:**
- 8-10: Strategic decisions, client relationships, creative problem-solving, novel R&D
- 4-7: Technical implementation, analysis, planning, coordination
- 1-3: Data entry, repetitive tasks, work easily automated by AI

---

## Features

| Feature | Details |
|---------|---------|
| **AI Task Scoring** | Gemini 1.5 Flash scores every task (impact, effort, time value) |
| **KPI Tracking** | Multiple KPIs with priority, deadline, progress bars |
| **KPI Suggestions** | AI analyzes your company stage and suggests relevant KPIs |
| **Cumulative Leaderboard** | Running total of all scores since day one |
| **Weekly Leaderboard** | Resets Monday, winner announced Sunday |
| **Score History** | 30-day score graph per player |
| **Retroactive Logging** | Log past days if you forgot |
| **Email Reminders** | Daily reminder to players who haven't logged |
| **Hall of Champions** | Past weekly winners displayed permanently |
| **Progress Updates** | Admin can manually update KPI current values |

---

## Project Structure

```
app/
├── page.tsx              # Dashboard
├── setup/page.tsx        # Company + player setup
├── kpis/page.tsx         # KPI management
├── log/page.tsx          # Task logging
├── leaderboard/page.tsx  # Full leaderboard
└── api/
    ├── company/          # Company CRUD
    ├── players/          # Player CRUD
    ├── kpis/             # KPI CRUD + AI suggestions
    ├── tasks/            # Task logging + AI scoring
    ├── leaderboard/      # Score aggregation
    └── cron/
        ├── reminders/    # Daily email reminders
        └── weekly-winner/ # Sunday winner email
components/
├── Navigation.tsx        # Top nav bar
├── ScoreGraph.tsx        # Recharts line chart
└── KPIProgress.tsx       # KPI progress card
lib/
├── types.ts              # TypeScript interfaces
├── supabase.ts           # Supabase client
├── gemini.ts             # Gemini AI integration
├── email.ts              # Resend email templates
└── utils.ts              # Scoring formula + helpers
supabase/
└── schema.sql            # Run this in Supabase SQL editor
```

---

## Customization

- **Change scoring weights** → edit `lib/utils.ts` → `calculateScore()`
- **Change LLM model** → edit `lib/gemini.ts` → `model: 'gemini-1.5-flash'`
- **Change reminder time** → edit `vercel.json` cron schedule (UTC)
- **Add company stages** → edit `lib/types.ts` → `COMPANY_STATES`

---

Built with ⚡ WorkQuest
