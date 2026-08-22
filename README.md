# The Elmstead — AAAM Residency

A fictional luxury resort booking site — **The Elmstead**, an exclusive whole-house property in Hampstead, London, under the fictional brand **AAAM Residency**. A cinematic, Awwwards-style showcase with heavy scroll-driven animation, plus a real booking backend: a live database, an admin login, and a reservations dashboard.

Live imagery is sourced from Unsplash at runtime (no local image assets required).

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **GSAP** (ScrollTrigger, SplitText) for scroll-driven animation, pinning and text reveals
- **Motion** (the Framer Motion successor, `motion/react`) for gestures, drag and micro-interactions
- **Lenis** for smooth scrolling, synced to GSAP's ticker
- **Supabase** — Postgres database + auth, for real bookings and the admin login
- **Resend** — outbound email for booking notifications (optional; the site works without it)

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

Fill in the Supabase and Resend values — see **Backend setup** below for where to get them. `.env.local` is gitignored and never committed.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin dashboard is at [/admin/login](http://localhost:3000/admin/login).

### 4. Production build

```bash
npm run build
npm run start
```

### 5. Lint

```bash
npm run lint
```

## Backend setup (Supabase)

The booking form writes to a real Postgres database (via Supabase) and the admin dashboard reads from it. To set this up from scratch:

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run everything in [`supabase/schema.sql`](supabase/schema.sql) (or apply the files in `supabase/migrations/` with the Supabase CLI: `supabase db push --project-ref <ref> --password <db-password>`).
3. Copy **Project Settings → API → Project URL**, **Publishable key**, and **Secret key** into `.env.local`.
4. Create your admin login: **Authentication → Users → Add user**. Then, in SQL Editor:
   ```sql
   insert into public.admin_users (user_id) values ('<uuid shown for that user>');
   ```
   Only users in `admin_users` can access `/admin/*` — everyone else, even other logged-in Supabase users, is blocked at three layers (route gate, page-level check, and the database's own row-level security).

### Email notifications (optional)

Without `RESEND_API_KEY` set, bookings still save to the database and appear in `/admin/bookings` — the site just skips sending a notification email (fails silently, logged server-side, never blocks the booking).

To turn it on: create a free account at [resend.com](https://resend.com) using the address you want notifications sent to (this avoids needing to verify a sending domain), copy the API key into `RESEND_API_KEY`, and set `ADMIN_NOTIFICATION_EMAIL` to that same address.

## Project structure

```
src/
  app/
    (site)/               The public marketing/booking site (route group — doesn't affect URLs)
    admin/                 /admin/login, /admin/bookings — separate layout, no scroll/cursor effects
  components/
    layout/                 Navbar, MobileMenu, Footer, CustomCursor, ScrollProgress, SmoothScroll
    sections/                One component per homepage section (Hero, Introduction, Booking, ...)
    admin/                   Admin-only components (StatusControl)
    ui/                      Reusable primitives (RevealText, MagneticButton, Lightbox, FormField, Calendar, ...)
  data/                      Typed content: copy, room/material/gallery/location/booking config
  lib/
    supabase/                Server/admin Supabase clients + the requireAdmin() auth check
    actions/                 Server Actions: submitBooking, updateBookingStatus, login, logout
    queries/                 Read-only data fetching for Server Components
    email/                   Resend notification email
  hooks/                     useMediaQuery, useScrollTo, useMagnetic, usePrefersReducedMotion
  context/                   Custom cursor state
  proxy.ts                   Route protection for /admin/* (Next 16's replacement for middleware.ts)
supabase/
  schema.sql                 Full schema, readable in one file
  migrations/                 Same schema, timestamped — what `supabase db push` applies
```

## Notes on this build

- **Images**: all photography is hotlinked from Unsplash's CDN via `next/image`, resized/optimized on the fly. Allowed remote hosts are configured in `next.config.ts` (`images.remotePatterns`). No binary image assets are checked into the repo.
- **Motion**: scroll-linked effects (parallax, pinning, the sticky room sequence, reveal-on-scroll text) use GSAP + ScrollTrigger. One-shot UI transitions (mobile menu, lightbox, form success state) use plain CSS transitions/keyframes for reliability. Continuous pointer-driven effects (magnetic buttons, the custom cursor) use Motion's motion values.
- **Reduced motion**: `prefers-reduced-motion: reduce` disables Lenis smooth-scroll (falls back to native scrolling) and shortens/removes CSS transitions and animations globally.
- **Custom cursor**: desktop only (`(hover: hover) and (pointer: fine)`); disabled automatically on touch devices.
- **Booking data**: no real payments are collected. Submitting the form saves a "request to book" with a snapshotted price; nothing is charged. This mirrors how real luxury villa rental sites typically operate (manual confirmation), and avoids the site ever appearing to take real money for a fictional property.
- **Brand names**: centralized in `src/data/content.ts`'s `site` object (`site.brand`, `site.propertyName`) — change the resort/property name there rather than hunting through components.

## Deploying

### Push to GitHub

```bash
git add .
git commit -m "Your message"
git push
```

(A git repo and remote may already be set up — check `git remote -v` first.)

### Deploy to Vercel

Already linked to a Vercel project. To deploy:

```bash
npm i -g vercel
vercel --prod
```

Add the same environment variables from `.env.local` to the Vercel project (**Project Settings → Environment Variables**) before deploying, or the live site won't be able to reach Supabase/Resend.
