# GiveAwayLead — Project Roadmap

> **Project type:** Giveaway & Marketing Platform (India-focused, INR)
> **Stack:** Next.js 16 (Frontend) · FastAPI / Python (Backend) · MongoDB Atlas (Database)
> **Last updated:** 2026-07-16
> **Full product details:** See `doc/PRODUCT.md`

---

## What Already Exists (UI Shell — All Dummy Data)

| Area | Pages / Components | Status |
|------|-------------------|--------|
| Public landing page | Hero, Featured Campaigns, How It Works, Testimonials | UI only |
| Campaigns listing | Grid with search bar | UI only |
| Campaign detail | Product info + entry form (Name, Phone, Email, City) | UI only |
| User dashboard | Stats, joined campaigns table | UI only |
| Seller dashboard | Stats, top campaigns, chart placeholder | UI only |
| Seller → Create campaign | Product info + settings form | UI only |
| Seller → Leads | Table with CSV export button | UI only |
| Admin dashboard | Platform stats, recent signups | UI only |
| Admin → Approvals | Approve / Reject cards | UI only |
| Layout | Navbar, role-based Sidebar (user / seller / admin) | UI only |
| UI components | Button, Card, Badge, Input, Label, Table, Avatar | Done |

**Nothing is wired to a database. No auth. No backend logic.**

---

## What Is Missing (Full Gap List)

- Authentication (register, login, OTP/email verify, role assignment)
- Database + ORM (schema for Users, Campaigns, Entries, Leads, Winners)
- Real campaign creation, listing, and filtering
- Entry / participation system (form submission → lead captured)
- Winner draw mechanism (random, verifiable, transparent)
- Admin approval workflow (approve → campaign goes live)
- Lead export as real CSV
- Charts and analytics (Recharts or similar)
- Email notifications (entry confirmation, winner announcement)
- Payments (seller pays platform to publish campaign)
- Social sharing / referral system (viral loops)
- Pages missing for sidebar links: My Wins, Profile, Seller Analytics, Seller Payments, Admin Campaigns, Admin Users, Admin Fraud, Admin Revenue
- Mobile sidebar (hamburger menu)
- SEO, OG images, metadata per campaign

---

## 4-Phase Build Plan

---

### Phase 1 — Foundation & Authentication
**Goal:** Replace the UI shell with a real, working application base.

#### 1.1 Database Setup
- Install and configure **Prisma** with **PostgreSQL** (or SQLite for local dev)
- Define core schema:
  - `User` (id, name, email, phone, role: USER | SELLER | ADMIN, createdAt)
  - `Campaign` (id, title, description, image, price, offerType, duration, winnersCount, status: DRAFT | PENDING | ACTIVE | ENDED, sellerId, createdAt, endsAt)
  - `Entry` (id, userId, campaignId, enteredAt) — one entry per user per campaign
  - `Lead` (id, name, phone, email, city, campaignId, createdAt) — raw lead capture (no auth required)
  - `Winner` (id, entryId, campaignId, drawnAt, notified)

#### 1.2 Authentication
- Install **NextAuth.js v5** (or **Clerk** for faster setup)
- Providers: Email + Password, Google OAuth
- Role-based session (USER, SELLER, ADMIN)
- Protected routes middleware (`/dashboard/*` requires login)
- Register page (`/register`) — name, email, password, role selection
- Login page (`/login`) — email + password, forgot password link
- Redirect after login based on role (user → `/dashboard/user`, seller → `/dashboard/seller`, admin → `/dashboard/admin`)

#### 1.3 Layout Fixes
- Wire Navbar Sign In → `/login`, Launch Campaign → `/register?role=seller`
- Mobile hamburger sidebar (currently hidden on small screens)
- Add proper metadata and font in `app/layout.tsx`

**Deliverables:** Working login/register, sessions, DB connected, role-based redirects.

---

### Phase 2 — Core Giveaway Engine
**Goal:** Brands can create campaigns. Users can enter. Admin approves. Winners get drawn.

#### 2.1 Campaign Management (Seller)
- Create campaign form → saves to DB (status: PENDING)
- Image upload (Cloudinary or UploadThing)
- Seller "My Campaigns" page — list with real status badges (Pending / Active / Ended)
- Edit campaign (only while PENDING)
- Cancel campaign

#### 2.2 Admin Approval Workflow
- Approval queue pulls real PENDING campaigns from DB
- Approve → status becomes ACTIVE, campaign appears on public listing
- Reject → seller notified, campaign stays DRAFT
- Flag → marks for further review

#### 2.3 Public Campaign Listing
- Campaigns page shows only ACTIVE campaigns
- Filter by: category, offer type (Free / Discount), time left
- Sort by: newest, ending soon, most participants
- Search works against real DB (title, brand)
- Pagination

#### 2.4 Campaign Detail & Entry
- Campaign detail page reads real data by ID
- Entry form submits → creates `Lead` row (no login needed — lead capture)
- If user is logged in → also creates `Entry` row (eligible for draw)
- Real-time participant count
- Prevent duplicate entries (one per user per campaign)
- Countdown timer to end date

#### 2.5 Winner Draw
- Admin triggers draw on ended campaigns
- Random selection from `Entry` table (N winners as configured)
- Creates `Winner` rows
- Winner announcement section on campaign detail page
- Email notification to winners (Phase 3)

**Deliverables:** Full end-to-end giveaway flow — create → approve → enter → draw → announce.

---

### Phase 3 — Marketing Engine & Lead Management
**Goal:** Turn giveaways into a lead generation machine for brands.

#### 3.1 Lead Dashboard (Seller)
- Real leads table for each campaign (from `Lead` table)
- Filter by campaign, city, date range
- Search by name, phone, email
- Real CSV export (generates file server-side)
- Lead verification status (valid phone format, etc.)

#### 3.2 Analytics (Seller)
- Seller Analytics page with real Recharts:
  - Daily entries chart (line chart)
  - Lead source breakdown (direct / referral / social)
  - City-wise distribution (bar chart)
  - Conversion funnel (viewed → entered → verified)
- Campaign comparison table

#### 3.3 Admin Analytics
- Platform-wide growth chart (users, campaigns, entries over time)
- Revenue chart
- Top performing brands
- Flagged / suspicious activity list

#### 3.4 Referral / Viral Loop
- Each entry generates a unique referral link
- User shares link → friend enters → referrer gets bonus entries
- Track referral source on `Lead` and `Entry` rows
- Referral leaderboard on campaign page ("Top Sharers")
- Social share buttons (WhatsApp, Instagram, Twitter/X) with pre-filled text

#### 3.5 Email Notifications (Resend / Nodemailer)
- Entry confirmation email (with referral link)
- Campaign ending soon reminder (24h before)
- Winner announcement email
- Seller notification when campaign goes live / gets a new lead milestone

#### 3.6 User Dashboard (real data)
- My Wins page — campaigns won, shipping status
- My Campaigns — all active entries, countdown per campaign
- Profile page — edit name, phone, city

**Deliverables:** Sellers get real lead data, analytics, viral sharing. Users get full account experience.

---

### Phase 4 — Monetization, Growth & Polish
**Goal:** Generate revenue, prevent fraud, scale to production.

#### 4.1 Payments (Razorpay)
- Seller pays a platform fee to publish a campaign
- Pricing tiers:
  - Basic — ₹999/campaign (up to 10,000 entries)
  - Pro — ₹2,499/campaign (unlimited entries + analytics)
  - Enterprise — custom pricing
- Razorpay order create → verify webhook → campaign unlocked
- Seller Payments page — invoice history, download receipts

#### 4.2 Subscription Plans (Seller)
- Monthly subscription for sellers (unlimited campaigns)
- Plan management page in seller dashboard
- Upgrade / downgrade / cancel

#### 4.3 Fraud Detection (Admin)
- Detect duplicate phone numbers / emails across entries
- Flag entries from same IP in short time window
- Suspicious entry report in Admin → Fraud Detection page
- One-click disqualify fraudulent entries

#### 4.4 SEO & Performance
- Dynamic metadata per campaign page (title, description, OG image)
- Sitemap generation (`/sitemap.xml`)
- Campaign share image (auto-generated OG card with product image + prize value)
- Core Web Vitals optimization (image optimization, lazy loading)

#### 4.5 Winner Experience
- Dedicated winner announcement page (`/winners`)
- Confetti animation on winner announcement
- Winner badge on user profile
- Social share: "I won an iPhone 14 on GiveAwayLead!" with OG image

#### 4.6 Campaign Embed Widget
- Sellers can embed a campaign entry widget on their own website
- `/embed/[campaignId]` → lightweight iframe-ready entry form
- Leads captured from external embeds tagged with source

#### 4.7 PWA & Mobile
- `manifest.json` for installable PWA
- Push notifications (winner alerts, campaign reminders)
- Mobile-optimized entry flow

**Deliverables:** Platform generates revenue, is fraud-resistant, SEO-optimized, and production-ready.

---

## Suggested Tech Stack Per Phase

| Need | Package |
|------|---------|
| ORM / DB | `prisma` + PostgreSQL |
| Auth | `next-auth` v5 or `@clerk/nextjs` |
| Image upload | `uploadthing` or Cloudinary SDK |
| Charts | `recharts` |
| Email | `resend` |
| Payments | `razorpay` |
| Forms | `react-hook-form` + `zod` |
| Date/time | `date-fns` |
| Toast/alerts | `sonner` |

---

## Sidebar Pages Status

| Page | Phase | Status |
|------|-------|--------|
| `/dashboard/user` | 2 | UI done |
| `/dashboard/user/campaigns` | 2 | Missing |
| `/dashboard/user/wins` | 3 | Missing |
| `/dashboard/user/profile` | 3 | Missing |
| `/dashboard/seller` | 2 | UI done |
| `/dashboard/seller/campaigns/new` | 2 | UI done |
| `/dashboard/seller/campaigns` | 2 | Missing |
| `/dashboard/seller/leads` | 3 | UI done |
| `/dashboard/seller/analytics` | 3 | Missing |
| `/dashboard/seller/payments` | 4 | Missing |
| `/dashboard/admin` | 2 | UI done |
| `/dashboard/admin/approvals` | 2 | UI done |
| `/dashboard/admin/campaigns` | 2 | Missing |
| `/dashboard/admin/users` | 3 | Missing |
| `/dashboard/admin/fraud` | 4 | Missing |
| `/dashboard/admin/revenue` | 4 | Missing |
