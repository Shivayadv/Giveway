# GiveAwayLead

A full-stack giveaway platform where brands run prize campaigns to capture verified US leads. Users enter for free, brands get a quality lead list, and the platform earns a listing fee.

```
Brand Partner         Platform              Public Users
─────────────         ────────              ────────────
List a campaign  →  Campaign goes live  →  Enter to win
Pay listing fee  ←  Leads delivered    ←  Random draw
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4 |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| Backend | FastAPI (Python), Uvicorn |
| Database | MongoDB Atlas (Motor async driver) |
| Auth | JWT (HS256), httpOnly cookies |

## Features

**Users** — browse campaigns, enter giveaways, track wins, view entry history

**Sellers (Brand Partners)** — create campaigns, monitor lead counts by status, download leads as CSV, view per-campaign analytics

**Admins** — approve / reject pending campaigns, trigger random winner draw (MongoDB `$sample`), view platform stats and recent signups

## Project Structure

```
Giveway/
├── frontend/                  Next.js 16 app
│   ├── app/
│   │   ├── (public)/          Public pages (home, campaigns, campaign detail)
│   │   ├── (auth)/            Login & register
│   │   ├── api/[...path]/     Auth-injecting proxy Route Handler
│   │   └── dashboard/
│   │       ├── user/          Entry history, wins
│   │       ├── seller/        Campaigns, leads, create campaign
│   │       └── admin/         Approvals, winner draw, platform stats
│   ├── components/
│   │   ├── campaigns/         EntryForm client component
│   │   ├── layout/            Sidebar, dashboard layout
│   │   └── ui/                shadcn/ui primitives
│   ├── lib/                   apiFetch, session, DAL, token utilities
│   └── proxy.ts               Route protection (Next.js 16 middleware)
├── backend/
│   ├── main.py                FastAPI app, CORS, lifespan
│   ├── database.py            Motor client, collection helpers
│   ├── seed.py                Demo data: admin + users + campaigns + entries
│   ├── routers/
│   │   ├── auth.py            POST /api/auth/login, /register, GET /me
│   │   ├── campaigns.py       CRUD + approve/reject/draw endpoints
│   │   ├── entries.py         Enter campaign, leads view, CSV export
│   │   ├── stats.py           Platform / seller / user stats
│   │   └── brands.py          Brand partner management
│   ├── models/                Pydantic v2 schemas
│   └── utils/                 JWT, bcrypt helpers
├── doc/                       Product blueprint, roadmap, setup guide
└── dev.ps1                    Start both servers with one command
```

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- MongoDB Atlas account (free M0 tier works)

### 1. Clone & install

```bash
git clone <repo-url>
cd Giveway

# Frontend
cd frontend && npm install && cd ..

# Backend — Windows
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt

# Backend — macOS/Linux
cd backend
python -m venv venv
source venv/bin/activate && pip install -r requirements.txt
```

### 2. Environment variables

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/giveway
JWT_SECRET=pick_any_long_random_string_at_least_32_chars
```

**`frontend/.env.local`**
```env
JWT_SECRET=same_value_as_backend
FASTAPI_URL=http://localhost:8000
```

> `JWT_SECRET` must be identical in both files — the frontend verifies tokens the backend signs.

### 3. Seed demo data

```bash
# Windows
cd backend && venv\Scripts\python seed.py

# macOS/Linux
cd backend && venv/bin/python seed.py
```

Creates: 1 admin, 3 demo users, 6 campaigns, sample entries.

### 4. Run

**Both servers at once (Windows):**
```powershell
.\dev.ps1
```

**Or separately:**
```bash
# Backend — http://localhost:8000
cd backend && venv\Scripts\uvicorn main:app --reload --port 8000

# Frontend — http://localhost:3000
cd frontend && npm run dev
```

API docs (Swagger UI): http://localhost:8000/docs

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@giveway.com | Admin@1234 |
| Seller | seller@demo.com | Demo@1234 |
| User | user@demo.com | Demo@1234 |

## API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (role: user or seller) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user profile |

### Campaigns
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/campaigns` | Public | List active campaigns |
| GET | `/api/campaigns/{id}` | Public | Campaign detail |
| POST | `/api/campaigns` | Seller | Create campaign (starts as pending) |
| GET | `/api/campaigns/mine` | Seller | Seller's own campaigns |
| GET | `/api/campaigns/pending` | Admin | Pending approval queue |
| PATCH | `/api/campaigns/{id}/approve` | Admin | Approve campaign |
| PATCH | `/api/campaigns/{id}/reject` | Admin | Reject campaign |
| POST | `/api/campaigns/{id}/draw` | Admin | Draw random winners |

### Entries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/entries` | User | Enter a campaign |
| GET | `/api/entries/me` | User | My entries |
| GET | `/api/entries/campaign/{id}` | Seller | Campaign leads |
| GET | `/api/entries/campaign/{id}/csv` | Seller | Export leads as CSV |

### Stats
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats/platform` | Admin | Platform-wide metrics |
| GET | `/api/stats/seller` | Seller | Seller dashboard metrics |
| GET | `/api/stats/user` | User | User participation stats |

## How Auth Works

1. Login → FastAPI issues a signed JWT
2. Next.js stores it in an `httpOnly` cookie (inaccessible to client-side JS)
3. Server components read the cookie and pass it as `Authorization: Bearer` directly to FastAPI
4. Client components call `/api/*` which hits the catch-all Route Handler (`app/api/[...path]/route.ts`) — it reads the cookie server-side, injects the Bearer header, and proxies the request to FastAPI

## Role-Based Access

```
proxy.ts (Next.js middleware) → checks cookie → redirects unauthenticated users
FastAPI _require_role()       → checks JWT role claim → 403 if insufficient
```
