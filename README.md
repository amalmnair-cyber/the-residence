# AAAM Residency

A fictional luxury property brand with two exclusive whole-house stays — **The Elmstead** (Hampstead, London) and **The Kiln House** (St Ives, Cornwall) — each with its own theme, content, and photography. A cinematic, Awwwards-style showcase with scroll-driven animation, plus a real backend: a live database, an admin login, a content-management panel, and a reservations dashboard.

This is a personal learning project — see [`docs/LEARNING_GUIDE.md`](docs/LEARNING_GUIDE.md) for a full walkthrough of how it's built and why, written for someone learning full-stack development from this exact codebase.

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **GSAP** (ScrollTrigger, SplitText) for scroll-driven animation, pinning and text reveals
- **Motion** (the Framer Motion successor, `motion/react`) for gestures and micro-interactions
- **Lenis** for smooth scrolling, synced to GSAP's ticker
- **Supabase** — Postgres database, auth, and file storage (bookings, admin login, uploaded property photos)
- **Resend** — outbound email (booking notifications, password reset codes)
- **Open-Meteo** — live weather on each property's Location section (free, no API key)
- **Vercel Analytics** — first-party visitor analytics
- **Anthropic API** — AI-assisted copy suggestions in the admin content editor

## Getting started

### 1. Install dependencies

Requires **Node.js 22+** (Supabase's client library needs it).

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values — see **Backend setup** below for where to get each one. `.env.local` is gitignored and never committed.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to the flagship property). The admin dashboard is at [/admin/login](http://localhost:3000/admin/login).

### 4. Production build

```bash
npm run build
npm run start
```

### 5. Lint, unit tests, E2E tests

```bash
npm run lint
npm test
npm run test:e2e
```

E2E tests run against the real Supabase project configured in `.env.local` (no separate test environment) — the booking test cleans up the row it inserts afterward.

## Backend setup (Supabase)

The booking form, both properties, and the admin dashboard all read from and write to a real Postgres database via Supabase. To set this up from scratch:

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run everything in [`supabase/schema.sql`](supabase/schema.sql) (or apply the files in `supabase/migrations/` individually with the Supabase CLI).
3. Copy **Project Settings → API → Project URL**, **Publishable key**, and **Secret key** into `.env.local`.
4. Create your admin login: **Authentication → Users → Add user**. Then, in SQL Editor:
   ```sql
   insert into public.admin_users (user_id) values ('<uuid shown for that user>');
   ```
   Only users in `admin_users` can access `/admin/*` — everyone else, even other logged-in Supabase users, is blocked at three layers (route gate, page-level check, and the database's own row-level security).
5. In **Storage**, the `property-images` bucket is created by the migration itself (public read, admin-only write) — nothing extra to configure there.

### Email notifications (optional)

Without `RESEND_API_KEY` set, bookings still save to the database and appear in `/admin/bookings` — the site just skips sending a notification email (fails silently, logged server-side, never blocks the booking).

To turn it on: create a free account at [resend.com](https://resend.com) using the address you want notifications sent to (this avoids needing to verify a sending domain), copy the API key into `RESEND_API_KEY`, and set `ADMIN_NOTIFICATION_EMAIL` to that same address.

### AI-assisted copy (optional)

Without `ANTHROPIC_API_KEY` set, the admin content editor works normally — the "Suggest with AI" buttons just aren't there. To turn it on, create a key at [console.anthropic.com](https://console.anthropic.com) and add it to `.env.local`.

## Project structure

```
src/
  app/
    (site)/[slug]/          The public property pages — one route serves both properties
    admin/                   /admin/login, /admin/bookings, /admin/properties — separate layout
  components/
    layout/                  Navbar (property switcher), MobileMenu, Footer, CustomCursor, SmoothScroll
    sections/                One component per page section (Hero, Architecture, Location, Booking, ...)
    admin/                   Admin-only components (StatusControl, PropertyEditForm, PropertyImageManager)
    ui/                      Reusable primitives (RevealText, MagneticButton, FormField, Calendar, ...)
  data/                      Structural content that rarely changes: rooms, floor plans, coordinates
  lib/
    supabase/                Server/admin Supabase clients + the requireAdmin() auth check
    actions/                 Server Actions: submitBooking, updateProperty, uploadPropertyImage, login, ...
    queries/                 Read-only data fetching for Server Components
    email/                   Resend notification/reset-code emails
    weather.ts               Open-Meteo integration
  hooks/                     useMediaQuery, useScrollTo, useMagnetic, usePrefersReducedMotion
  context/                   Custom cursor state
  proxy.ts                   Route protection for /admin/* (Next 16's replacement for middleware.ts)
supabase/
  schema.sql                 Full schema, consolidated — see the file's own header before editing
  migrations/                 Same schema, timestamped — what actually gets run
.github/workflows/
  backup.yml                  Daily database snapshot → GitHub Actions artifact (90-day retention)
  e2e.yml                      Playwright suite on every push/PR
docs/
  LEARNING_GUIDE.md            The "how and why" walkthrough of this whole codebase
```

## Two properties, one codebase

Both properties share every component and route — `/the-elmstead` and `/the-kiln-house` both render through `src/app/(site)/[slug]/page.tsx`. What differs:

- **Editable via `/admin/properties`**: name, tagline, location, description, pricing, stats, hero/gallery photos.
- **Fixed in code** (`src/data/property-content.ts`, `src/data/coordinates.ts`): room layouts, floor plan geometry, architecture copy, weather coordinates — structural facts that don't change day to day, so they don't need an admin form.
- **Theming**: each property has a `theme_key` (`elmstead` / `kiln`) that selects a CSS custom-property palette in `globals.css` — every component re-themes automatically since they're all built on the same Tailwind utility classes.

## Notes on this build

- **Images**: photography not uploaded via the admin panel is hotlinked from Unsplash's CDN via `next/image`. Allowed remote hosts are configured in `next.config.ts` (`images.remotePatterns` + the CSP's `img-src`).
- **Motion**: scroll-linked effects (parallax, reveal-on-scroll text) use GSAP + ScrollTrigger. One-shot UI transitions use plain CSS transitions for reliability. Continuous pointer-driven effects (magnetic buttons, custom cursor) use Motion's motion values.
- **Reduced motion**: `prefers-reduced-motion: reduce` disables Lenis smooth-scroll and shortens/removes animations globally.
- **Booking data**: no real payments are collected. Submitting the form saves a "request to book" with a snapshotted price; nothing is charged — payment happens on arrival, mirroring how real luxury villa rentals typically operate.
- **Demo disclaimer**: shown on every visit (not just the first), since a fictional business collecting real contact details needs that to be unmissable, not a one-time notice someone might never see.
- **Brand name**: centralized in `src/data/content.ts`'s `site.brand`. Property names/taglines/etc. live in the database, editable via `/admin/properties`.

## Deploying

Pushing to `main` auto-deploys via Vercel. Add every variable from `.env.local` to the Vercel project (**Project Settings → Environment Variables**) first, or the live site won't be able to reach Supabase/Resend/Anthropic. The two GitHub Actions workflows need their own copies of the relevant secrets set separately (**Repo Settings → Secrets and variables → Actions**) — see each workflow file's header comment for exactly which ones.
