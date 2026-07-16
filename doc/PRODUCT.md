# GiveAwayLead — Product Blueprint

> **Stack:** Next.js 16 (Frontend) · FastAPI / Python (Backend) · MongoDB Atlas (Database)
> **Updated:** 2026-07-16

---

## What I Understand — The Core Business Model

```
Brand Partner                Platform (You)                   Public Users
─────────────                ──────────────                   ────────────
"I have 10 units of          Add products as a                Browse → Enroll
 Product X to giveaway       campaign on the site             (name, phone, email)
 and get marketing reach"         │
          │                       ▼
          └──────────────► Campaign goes LIVE
                           ⏱ 24-hour countdown
                           📈 People enroll (lead captured)
                                   │
                              After 24 hrs
                                   │
                                   ▼
                        🎲 Random draw → 10 winners
                        📦 Brand ships product to winners
                        📊 Brand gets full lead list
                           (everyone who enrolled = their audience)
```

**You make money from:** Brands paying you a fee to list their campaign.
**Brands get:** Massive marketing reach + quality lead list.
**Users get:** Chance to win premium products for free.
**Why users keep coming back:** New campaigns daily, real winners, trust builds.

---

## The Engagement Problem (And How to Solve It)

The platform dies if users only come once and leave. Here's what makes it sticky:

| Problem | Solution |
|---------|----------|
| User enrolls and forgets | Daily countdown emails + push alerts |
| No reason to return | New campaigns every 24 hrs (daily drops) |
| User doesn't trust draws | Live winner reveal + verifiable random seed |
| Slow growth | Refer friends → get extra entries (viral loop) |
| One-time visit | Login streak rewards + loyalty points |
| Boring enrollment | Animated entry, live counter, FOMO messaging |

---

## MongoDB Atlas — Collection Schemas

### `users`
```json
{
  "_id": "ObjectId",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+91 98765 43210",
  "password_hash": "bcrypt_hash",
  "role": "user",
  "avatar": null,
  "city": "Delhi",
  "referral_code": "RAHUL8X2",
  "referred_by": "ObjectId | null",
  "streak": 3,
  "total_wins": 1,
  "total_entries": 14,
  "is_verified": true,
  "is_banned": false,
  "created_at": "ISODate",
  "last_login": "ISODate"
}
```

### `brands`
```json
{
  "_id": "ObjectId",
  "name": "TechCorp India",
  "email": "contact@techcorp.in",
  "phone": "+91 99000 11000",
  "logo": "https://cdn.../logo.png",
  "website": "https://techcorp.in",
  "category": "Electronics",
  "is_verified": true,
  "is_approved": true,
  "campaigns_run": 4,
  "total_leads_generated": 82000,
  "created_at": "ISODate"
}
```

### `campaigns`
```json
{
  "_id": "ObjectId",
  "title": "iPhone 15 Pro Max Giveaway",
  "slug": "iphone-15-pro-max-giveaway-jul2026",
  "description": "Win the latest iPhone 15 Pro Max 256GB...",
  "brand_id": "ObjectId",
  "products": [
    {
      "name": "iPhone 15 Pro Max 256GB",
      "image": "https://cdn.../iphone15.jpg",
      "mrp": 159900,
      "quantity": 10
    }
  ],
  "total_winners": 10,
  "category": "Electronics",
  "tags": ["smartphone", "apple", "iphone"],
  "status": "active",
  "starts_at": "ISODate",
  "ends_at": "ISODate",
  "total_entries": 54320,
  "winner_drawn": false,
  "draw_seed": null,
  "terms": ["Must be 18+", "India residents only"],
  "share_text": "Win a FREE iPhone 15 Pro Max! Join now →",
  "created_at": "ISODate",
  "approved_at": "ISODate",
  "approved_by": "ObjectId"
}
```
> **status enum:** `draft` → `pending` → `active` → `drawing` → `ended`

### `entries`
```json
{
  "_id": "ObjectId",
  "campaign_id": "ObjectId",
  "user_id": "ObjectId | null",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+91 98765 43210",
  "city": "Delhi",
  "referral_code_used": "PRIYA9K1",
  "extra_entries": 2,
  "total_weight": 3,
  "source": "direct | whatsapp | instagram | referral | embed",
  "ip_address": "103.x.x.x",
  "user_agent": "...",
  "is_winner": false,
  "is_disqualified": false,
  "entered_at": "ISODate"
}
```
> `total_weight` = base 1 + extra entries from referrals (weighted random draw)

### `winners`
```json
{
  "_id": "ObjectId",
  "campaign_id": "ObjectId",
  "entry_id": "ObjectId",
  "user_id": "ObjectId | null",
  "name": "Rahul Sharma",
  "phone": "+91 98765 43210",
  "email": "rahul@example.com",
  "product": "iPhone 15 Pro Max 256GB",
  "draw_position": 1,
  "draw_seed": "sha256_seed_for_verification",
  "notified_email": false,
  "notified_whatsapp": false,
  "shipping_status": "pending",
  "drawn_at": "ISODate"
}
```

### `referrals`
```json
{
  "_id": "ObjectId",
  "referrer_user_id": "ObjectId",
  "referred_entry_id": "ObjectId",
  "campaign_id": "ObjectId",
  "extra_entries_awarded": 1,
  "created_at": "ISODate"
}
```

### `notifications`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "type": "winner | reminder | new_campaign | almost_won",
  "title": "You WON an iPhone 15!",
  "body": "Congratulations Rahul...",
  "is_read": false,
  "created_at": "ISODate"
}
```

### `admin_logs`
```json
{
  "_id": "ObjectId",
  "admin_id": "ObjectId",
  "action": "approved_campaign | rejected_campaign | banned_user | drew_winners",
  "target_id": "ObjectId",
  "target_type": "campaign | user | entry",
  "note": "Duplicate entry detected",
  "created_at": "ISODate"
}
```

---

## Python FastAPI — Backend Structure

```
backend/
├── main.py                    # FastAPI app entry
├── config.py                  # MongoDB URI, JWT secret, env vars
├── database.py                # Motor (async MongoDB client)
├── models/
│   ├── user.py
│   ├── brand.py
│   ├── campaign.py
│   ├── entry.py
│   └── winner.py
├── routers/
│   ├── auth.py                # /api/auth/register, login, refresh
│   ├── campaigns.py           # /api/campaigns CRUD + listing
│   ├── entries.py             # /api/entries/enroll, status
│   ├── winners.py             # /api/winners/draw, announce
│   ├── brands.py              # /api/brands CRUD
│   ├── leads.py               # /api/leads export CSV
│   ├── referrals.py           # /api/referrals track
│   ├── notifications.py       # /api/notifications
│   └── admin.py               # /api/admin approvals, stats, fraud
├── services/
│   ├── draw_service.py        # Weighted random winner selection
│   ├── email_service.py       # Resend / SMTP
│   ├── whatsapp_service.py    # WhatsApp Business API
│   ├── fraud_service.py       # Duplicate IP/phone detection
│   └── scheduler.py           # APScheduler — auto-draw at campaign end
├── middleware/
│   ├── auth_middleware.py     # JWT verify
│   └── rate_limiter.py        # Prevent spam entries
└── utils/
    ├── crypto.py              # SHA-256 seed for verifiable draws
    └── csv_export.py          # Lead CSV generator
```

### Key API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/campaigns              # public listing (active only)
GET    /api/campaigns/{slug}       # public detail
POST   /api/campaigns              # seller creates (auth required)
PATCH  /api/campaigns/{id}         # seller edits (pending only)

POST   /api/entries/enroll         # user enrolls (no auth needed)
GET    /api/entries/check/{campaign_id}  # check if already enrolled

POST   /api/admin/campaigns/{id}/approve
POST   /api/admin/campaigns/{id}/reject
POST   /api/winners/draw/{campaign_id}   # admin triggers draw
GET    /api/winners/{campaign_id}        # public winner list

GET    /api/leads/{campaign_id}          # seller's leads (auth)
GET    /api/leads/{campaign_id}/export   # CSV download

POST   /api/referrals/track        # track referral click
GET    /api/referrals/stats/{user_id}

GET    /api/admin/stats            # platform overview
GET    /api/admin/fraud            # flagged entries
```

---

## What Needs to Be Built — Feature Checklist

### Must-Have (Core Flow Works)
- [ ] User registration / login (JWT, phone OTP optional)
- [ ] Brand registration + admin approval
- [ ] Campaign creation by admin (on behalf of brand)
- [ ] Campaign approval workflow
- [ ] Public campaign listing (active, countdown)
- [ ] Enrollment form → lead captured in MongoDB
- [ ] Duplicate entry prevention (email + campaign)
- [ ] Auto-draw at campaign end (APScheduler)
- [ ] Winner selection (weighted random with SHA-256 seed for transparency)
- [ ] Winner announcement on campaign page
- [ ] Winner email notification

### High Impact for Engagement
- [ ] **Live entry counter** on campaign page (WebSocket or polling)
- [ ] **24-hour countdown timer** — animated, visible urgency
- [ ] **Share for extra entries** — unique referral link per entry
- [ ] **WhatsApp share button** — pre-filled text + campaign link
- [ ] **Winner reveal animation** — confetti, names scroll in live
- [ ] **Daily new campaign** notification email to subscribers
- [ ] **"Almost won" email** — re-engage losers ("You were #3,421 of 54,320!")
- [ ] **Public winners page** — `/winners` shows recent real winners with photos

### Brand / Marketing Features
- [ ] Lead export CSV for brands (filtered by campaign)
- [ ] Brand analytics: entries over time, city breakdown, conversion %
- [ ] Campaign performance report (auto-generated PDF/email to brand on end)
- [ ] Embeddable entry widget (`/embed/[slug]`) for brand websites
- [ ] UTM / source tracking on entries

### Platform Monetization
- [ ] Razorpay payment gate for brands (pay to publish)
- [ ] Pricing tiers: Basic / Pro / Enterprise
- [ ] Invoice generation

### Trust & Safety
- [ ] Verifiable draw (public SHA-256 seed published before draw)
- [ ] Fraud detection: same IP, same phone, bulk entries
- [ ] Admin can disqualify entries before draw
- [ ] Terms & conditions per campaign

### SEO & Growth
- [ ] Dynamic OG image per campaign (product photo + prize value)
- [ ] `/winners` public page indexed by Google ("won iPhone free India")
- [ ] Blog/press section for winner stories

---

## Interactive Approach — What Will Make It Viral

### 1. Referral System (Most Important)
```
User enrolls → gets unique link: givewaylead.in/c/iphone15?ref=RAHUL8X2
Friend clicks → enrolls → Rahul gets +1 extra entry
More referrals = more chances to win
```
Show referral count on campaign page: "You have 4 entries (3 from referrals)"

### 2. Daily Drop Model
- New campaign every day at 10:00 AM
- Email blast to all subscribers
- Creates habit — users check daily
- WhatsApp broadcast for big campaigns

### 3. Winner Reveal Event (Like a Live Show)
- When draw happens, show a live-style animation
- Names appear one by one with confetti
- Shareable winner card: "I won [Product] on GiveAwayLead!"
- Social proof drives new user signups

### 4. Streak System
- Login 7 days in a row → get bonus entry in all active campaigns
- Gamifies daily return

### 5. "Almost Won" Notification
- Email to non-winners: "You were #4,521 out of 62,000 entrants"
- "Don't miss the next one → Active campaigns now"
- Drives immediate re-engagement

### 6. Category Preferences
- Users set interests on signup (Electronics / Fashion / Food / Beauty)
- Only get notified for relevant campaigns
- Higher open rates, less unsubscribes

---

## 4-Phase Build Plan (Updated for MongoDB + Python)

### Phase 1 — Backend Foundation + Auth (Week 1–2)
- FastAPI project setup, Motor (async MongoDB driver)
- User & Brand models, JWT auth, bcrypt passwords
- Admin seeded in DB
- Login / Register pages wired to API
- Protected routes (Next.js middleware)
- Brand onboarding form

### Phase 2 — Giveaway Core Engine (Week 3–4)
- Campaign CRUD API + frontend
- Entry enrollment API (no-auth lead capture)
- APScheduler auto-draw at `ends_at`
- Weighted random draw with SHA-256 seed
- Winner reveal page
- Admin approval panel wired to real API
- Countdown timer on campaign cards

### Phase 3 — Marketing Engine (Week 5–6)
- Referral link generation + tracking
- WhatsApp + social share buttons
- Email notifications (entry confirm, winner alert, "almost won")
- Live entry counter (polling every 30s)
- Lead export CSV for brands
- Brand analytics page (Recharts)
- Public `/winners` page

### Phase 4 — Monetization + Growth (Week 7–8)
- Razorpay payment integration
- Pricing tiers + invoice
- Fraud detection system
- Verifiable draw (public seed)
- SEO — dynamic OG images, sitemap
- Daily campaign email blast
- Winner social share card
- Embeddable widget
- PWA manifest + push notifications

---

## MongoDB Atlas Setup Notes

- Use **Motor** (async) not PyMongo in FastAPI
- Create indexes:
  - `campaigns`: `{ status: 1, ends_at: 1 }` — listing queries
  - `entries`: `{ campaign_id: 1, email: 1 }` — duplicate check (unique)
  - `entries`: `{ campaign_id: 1, ip_address: 1 }` — fraud check
  - `users`: `{ email: 1 }` unique, `{ referral_code: 1 }` unique
- Use MongoDB Atlas Search for campaign search (text index on title, tags)
- Connection string in `.env.local` (Next.js) and `backend/.env` (FastAPI)
- Use Atlas free tier (M0) for development, M10+ for production

---

## Next.js ↔ FastAPI Communication

```
Next.js Frontend         FastAPI Backend          MongoDB Atlas
─────────────────        ──────────────           ─────────────
fetch('/api/...')   →    Running on :8000    →    Cloud DB
                         (proxied via Next.js
                          rewrites in
                          next.config.ts)
```

In `next.config.ts` add rewrites so frontend calls `/api/...` which proxies to `http://localhost:8000/api/...` — no CORS issues in dev.
