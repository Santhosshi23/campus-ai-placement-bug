# 🐞 CampusAI: The Placement Bug

> **"Your placement journey has a bug. Can you fix it before your campus does?"**

A gamified growth platform built for the **NxtWave Growth Intern Challenge**. The mission: get 500 final-year
engineering students to register for NxtWave's free workshop **"Build Your First AI Project in 60 Minutes"**
— on a ₹2,000 budget, in 7 days.

Instead of another workshop landing page, this is a full-stack **placement-themed mini-game → personalised
AI diagnosis → registration → referral system → inter-college leaderboard → growth analytics dashboard**,
engineered end-to-end to create a real acquisition → engagement → conversion → referral loop.

📄 [Growth Plan](docs/GROWTH_PLAN.md) · 🧠 [AI + Learning Notes](docs/AI_LEARNING_NOTES.md) · 🖥 Live Growth
Command Center at `/admin` (demo code: `growth2026`)

---

## Table of contents
1. [Problem & solution](#problem--solution)
2. [Features](#features)
3. [The growth loop](#the-growth-loop)
4. [Architecture & tech stack](#architecture--tech-stack)
5. [Project structure](#project-structure)
6. [Installation](#installation)
7. [Environment variables](#environment-variables)
8. [Running the app](#running-the-app)
9. [API reference](#api-reference)
10. [Demo walkthrough](#demo-walkthrough)
11. [Deployment](#deployment)
12. [Known limitations](#known-limitations)
13. [Future improvements](#future-improvements)

---

## Problem & solution

**Problem:** Final-year engineering students are flooded with "register for our workshop" messages. A plain
landing page and a signup form don't stand out, and don't give students a reason to tell their friends.

**Solution:** Turn registration itself into the growth mechanism.
- The **mini-game** ("Placement Bug Challenge") hooks attention in under a minute with code-debugging,
  software-judgment and AI/GenAI scenario questions — no sign-up required to play.
- The **personalised diagnosis** makes the pitch feel like it's about *them*, not a generic workshop ad.
- **Registration** is the "patch" — a natural, low-friction next step once a gap is revealed.
- The **referral system + CampusAI League** (inter-college leaderboard) turns every registrant into a
  distribution channel, because they're now representing their campus.
- The **Growth Command Center** (`/admin`) demonstrates the acquisition funnel, channel performance and
  rule-based growth insights that would drive the campaign in a real 7-day, ₹2,000 execution.

## Features

| Area | What's implemented |
|---|---|
| **Mini-game** | 5 timed questions (code debugging, engineering judgement, AI/GenAI scenarios, placement situational), live countdown, progress indicator, scoring |
| **Diagnosis** | Rule-based scoring engine → 4-axis skill breakdown, AI-readiness score (0-100), 5 possible profiles (Debugger / Builder / Problem Solver / Explorer / AI Beginner), personalised gap + strength |
| **Registration** | Validated form (name, college email, college, branch, graduation year, optional WhatsApp), duplicate-email prevention, server-side validation |
| **Referral system** | Unique referral code + link per student, self-referral blocking, click + conversion tracking, personal referral dashboard |
| **CampusAI League** | Live inter-college leaderboard — rank, registrations, points, progress, 24h trend — fully computed from the database, not hard-coded |
| **Campus Bug Tracker** | Per-college progress bar, configurable target, milestone ladder (4 levels), next-milestone countdown |
| **Gamification** | 5-tier badge system (Bug Hunter → CampusAI Legend) auto-unlocked from referral count, next-badge progress |
| **Campus Boss Battle** | Simple engagement challenge that unlocks at campus Level 3 and awards bonus campus points |
| **AI Project Discovery** | 8 categorised AI project ideas with skills/difficulty/interest count; "I'm Interested" increments a live counter and nudges toward registration |
| **Growth Command Center** | `/admin` — 500-registration target tracker, acquisition source breakdown, funnel (visitor → game → registration → referral), top colleges, referral performance, rule-based "AI Growth Insights", prioritised channel plan, ₹2,000 budget planner, 7-day timeline |
| **Demo data** | Seeded, clearly-labelled simulated data across 6 colleges (327 of the 500-student target, matching the challenge's own example numbers) |
| **Responsive design** | Mobile-first layouts for the game, forms, leaderboards, referral sharing and dashboards |
| **Error handling** | Loading / empty / error states on every data-driven page |

## The growth loop

```
 DISCOVER → PLAY → DIAGNOSE → REGISTER → GET REFERRAL CODE → INVITE FRIENDS
      ↑                                                            │
      └──────────────── COLLEGE COMPETITION ← LEADERBOARD ◄────────┘
                                   │
                         MORE REGISTRATIONS
```

Every registered student becomes a referral node. Every referral adds points to their college. Climbing
college ranks creates FOMO for rival campuses, which pulls in more students — the loop that actually gets a
campaign from 0 to 500 registrations without a paid budget.

## Architecture & tech stack

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│   React + TypeScript │ ───────────────────────▶ │   FastAPI (Python)   │
│   Vite · Tailwind v4  │ ◀─────────────────────── │   SQLModel + SQLite  │
│   Framer Motion       │                          │   (swap-in Postgres) │
│   Recharts            │                          └──────────────────────┘
└─────────────────────┘
```

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, React Router, Framer Motion (animations),
  Recharts (admin charts). No heavy UI kit — a small custom design system (`index.css`) for the
  terminal/cyberpunk aesthetic.
- **Backend:** FastAPI + SQLModel (SQLAlchemy + Pydantic). Clean router-per-domain structure, service-layer
  functions for scoring, referral codes, badges, milestones and growth insights.
- **Database:** SQLite by default (zero setup, file-based, perfect for a demo). The code uses SQLAlchemy
  through SQLModel, so swapping `DATABASE_URL` to a Postgres connection string works without code changes.
- **Seeding:** `backend/seed/seed_data.py` seeds 6 colleges, ~330 students, game results, referrals, project
  interests and funnel events automatically the first time the API starts against an empty database.

## Project structure

```
campus-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, CORS, startup seeding
│   │   ├── database.py            # SQLModel engine/session
│   │   ├── models.py              # User, College, Referral, Project, GameResult, Badge, Event, ...
│   │   ├── schemas.py             # Pydantic request/response models
│   │   ├── routers/               # registration, colleges, users, game, referral, projects, badges,
│   │   │                            analytics, events — one router per domain
│   │   └── services/              # scoring.py, referral.py, badges.py, milestones.py, insights.py
│   ├── seed/seed_data.py          # Demo data generator (auto-runs on first startup)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Home, Debug, Diagnosis, Register, Success, League, CollegePage,
│   │   │                            Profile, Projects, Admin, GrowthPlan
│   │   ├── components/            # ui/, layout/, admin/, game, ShareBox
│   │   ├── context/AppContext.tsx # session id, referral capture, game result, registration state
│   │   ├── api/client.ts          # typed fetch wrapper
│   │   ├── data/                  # game questions, profile copy
│   │   └── types/                 # shared TypeScript interfaces
│   ├── vite.config.ts             # dev proxy of /api → backend
│   └── .env.example
├── docs/
│   ├── GROWTH_PLAN.md             # ≤2-page growth plan (challenge submission artifact)
│   └── AI_LEARNING_NOTES.md       # 3 AI-assisted build decisions (challenge submission artifact)
└── README.md
```

## Installation

**Prerequisites:** Python 3.10+, Node.js 18+ (tested on Python 3.13 / Node 20).

```bash
git clone <this-repo> campus-ai
cd campus-ai
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # defaults are already fine for local/demo use
```

### Frontend
```bash
cd ../frontend
npm install
cp .env.example .env             # leave VITE_API_BASE_URL empty for local dev
```

## Environment variables

**`backend/.env`**
| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./campus_ai.db` | SQLAlchemy connection string. Point this at Postgres in production. |
| `FRONTEND_URL` | `http://localhost:5173` | Used to build the full referral link returned by `POST /api/register`. |
| `CORS_ORIGINS` | `*` | Comma-separated allow-list, or `*` for the demo. |

**`frontend/.env`**
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty)* | Leave empty for local dev (Vite proxies `/api`). Set to your deployed backend URL when frontend/backend are hosted separately. |
| `VITE_BACKEND_URL` | `http://localhost:8000` | Only used by `vite.config.ts` for the dev proxy target. |

## Database setup

No manual setup needed. On first run, the backend:
1. Creates all tables (`SQLModel.metadata.create_all`).
2. Seeds the 5 achievement badges.
3. If the `college` table is empty, runs `seed/seed_data.py` to populate ~330 realistic demo students across
   6 colleges, game results, referrals, project interests and funnel events.

To reset the demo data, stop the backend and delete `backend/campus_ai.db`, then restart — it reseeds
automatically.

To seed manually without starting the API:
```bash
cd backend
python -m seed.seed_data
```

## Running the app

**Terminal 1 — backend (http://localhost:8000, docs at `/docs`):**
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — frontend (http://localhost:5173):**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The dev server proxies all `/api/*` calls to the backend automatically.

### Demo / admin access
Visit `/admin` and enter the demo access code: **`growth2026`** (shown on the unlock screen itself — this is
a lightweight demo gate, not a real auth system, as the challenge only requires simple admin demo access).

## API reference

Base URL: `http://localhost:8000/api`. Full interactive docs (Swagger UI) at `http://localhost:8000/docs`.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/register` | Register a student, create college if new, generate referral code, attribute referrals, return result |
| `GET` | `/leaderboard` | CampusAI League — all colleges ranked by points |
| `GET` | `/colleges` | Raw list of colleges |
| `GET` | `/college/{id}` | Bug tracker, milestones, top referrers, boss-battle status for one college |
| `POST` | `/college/{id}/boss-battle` | Submit a Campus Boss Battle attempt, awards bonus campus points |
| `GET` | `/user/{id}` | Full profile dashboard — rank, badges, referral stats, project interests |
| `POST` | `/game-result` | Submit mini-game answers → returns score, AI-readiness score, profile, diagnosis |
| `POST` | `/referral` | Track a referral link click |
| `GET` | `/referral/{code}` | Resolve a referral code (used to show "invited by X" banner) |
| `GET` | `/referral-stats/{code}` | Click/conversion stats for one referral code |
| `GET` | `/projects` | AI project discovery list |
| `POST` | `/projects/{id}/interest` | Register interest in a project, increments live counter |
| `GET` | `/badges` | All badge definitions |
| `POST` | `/event` | Log a funnel event (visitor, game_started, registration_started, ...) |
| `GET` | `/analytics` | Full growth dashboard payload — target progress, acquisition sources, funnel, referral performance, daily growth |
| `GET` | `/growth-insights` | Rule-based "AI Growth Insights" generated from the current (demo) data |
| `GET` | `/campaign-plan` | Prioritised channel plan, ₹2,000 budget allocation, 7-day timeline |

All endpoints validate input (Pydantic), return proper 4xx errors (e.g. `409` for duplicate email registration
attempts, `404` for unknown IDs/referral codes), and never leak internal details in error messages.

## Demo walkthrough

1. **Home (`/`)** — "Placement System Error" hero, live system-scan terminal animation, social proof ticker,
   league/project previews.
2. **`/debug`** — Play the 5-question, 60-second Placement Bug Challenge.
3. **`/diagnosis`** — See your personalised AI-readiness diagnosis and profile.
4. **`/register`** — Register for the real workshop ("Build Your First AI Project in 60 Minutes").
5. **`/success`** — Patch-installed celebration, referral code, WhatsApp share, invite your squad.
6. **`/league`** — CampusAI League leaderboard; click any college for its bug tracker (`/college/:id`).
7. **`/profile/:id`** — Personal growth dashboard — badges, referrals, project interests.
8. **`/projects`** — AI Project Discovery — mark interest, nudged toward the workshop.
9. **`/admin`** (code `growth2026`) — Growth Command Center: 500-target tracker, funnel, acquisition sources,
   referral performance, AI growth insights, prioritised channels, ₹2,000 budget, 7-day timeline.
10. **`/growth-plan`** — In-app Growth Plan & AI Learning Notes (challenge submission artifacts).

To see the referral loop end-to-end: register once, copy the referral link from `/success` or your profile,
open it in a new private window, and register a second student — the referrer's badge/points and the
college's leaderboard position update immediately.

## Deployment

The app is two independently deployable pieces — no paid infrastructure required.

**Backend (Render / Railway / Fly.io / any Python host):**
1. Push `backend/` as the service root.
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set `FRONTEND_URL` to your deployed frontend URL and `CORS_ORIGINS` to that same origin.
5. SQLite works out of the box on a single instance. For a managed DB, set `DATABASE_URL` to a Postgres
   connection string (the code is already SQLAlchemy/SQLModel-based, so no code changes are needed beyond
   adding `psycopg2-binary` to `requirements.txt`).

**Frontend (Vercel / Netlify):**
1. Push `frontend/` as the project root. Build command: `npm run build`. Output dir: `dist`.
2. Set `VITE_API_BASE_URL` to your deployed backend's URL (e.g. `https://campusai-backend.onrender.com`).
3. Deploy.

## Known limitations

- The admin gate is a simple demo password (`growth2026`), not a real authentication system — intentional,
  per the challenge's scope ("no authentication system required for the demo").
- WhatsApp sharing uses the standard `wa.me` share-link mechanism; it does not send messages automatically
  (the challenge explicitly says not to auto-send).
- Referral fraud prevention covers the obvious cases (duplicate email, self-referral by email match) but does
  not do device/IP fingerprinting — flagged as a "next 24 hours" improvement.
- All numbers (registrations, colleges, budget, channel estimates) are clearly-labelled **simulated/demo
  data**, not real NxtWave campaign results.

## Future improvements

See [`docs/AI_LEARNING_NOTES.md`](docs/AI_LEARNING_NOTES.md#if-i-had-another-24-hours) for the full list —
in short: real WhatsApp Business API automation, a college-ambassador dashboard, more mini-game variants,
A/B testing, personalised project recommendations, stronger referral-fraud detection, and deeper cohort
analytics.

---

Built for the **NxtWave Growth Intern Challenge**. All registration numbers, colleges and analytics shown in
this app are simulated demo data for the purposes of this submission.
