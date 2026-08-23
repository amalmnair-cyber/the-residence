# Learning guide: how AAAM Residency is built, and why

This document exists for one reason: you asked, at the very start of this project, for something that would "teach you everything" once it was done. Everything else in this repo is written for the computer. This file is written for you.

It doesn't try to teach Next.js or Postgres in general — there are better resources for that. It explains **this specific codebase**: the decisions made in it, the patterns repeated across it, and why they're there. Read it alongside the actual files it references; it's meant to be a guide to the code, not a replacement for reading the code.

## Table of contents

1. [The big picture](#the-big-picture)
2. [How a page load actually works](#how-a-page-load-actually-works)
3. [How a booking actually works](#how-a-booking-actually-works)
4. [The database, table by table](#the-database-table-by-table)
5. [Three layers of admin security](#three-layers-of-admin-security)
6. [Two properties, one codebase](#two-properties-one-codebase)
7. [Server Components vs. Client Components](#server-components-vs-client-components)
8. [Server Actions](#server-actions)
9. [Caching and revalidation](#caching-and-revalidation)
10. [External services, and why each one](#external-services-and-why-each-one)
11. [CI/CD: what runs automatically and when](#cicd-what-runs-automatically-and-when)
12. [The security model, end to end](#the-security-model-end-to-end)
13. [Cookbook: how to make common changes](#cookbook-how-to-make-common-changes)
14. [Glossary](#glossary)

---

## The big picture

This is a **Next.js App Router** application, deployed on **Vercel**, backed by **Supabase** (which is really three services wearing a trenchcoat: a Postgres database, an authentication service, and file storage).

```
Browser
  │
  ▼
Vercel (runs the Next.js app)
  │
  ├── Server Components render HTML using data fetched at request time
  ├── Server Actions handle form submissions and admin mutations
  │
  ▼
Supabase
  ├── Postgres — properties, property_images, bookings, admin_users, rate_limit_hits
  ├── Auth — the one admin login, session cookies
  └── Storage — uploaded property photos (the `property-images` bucket)

Plus, called directly from the server when needed:
  Resend       — booking/reset emails
  Open-Meteo   — live weather (no key needed)
  Anthropic    — AI copy suggestions in admin
```

There is **no separate backend server**. "The backend" *is* Next.js's server-side code — Server Components and Server Actions running on Vercel's infrastructure, talking directly to Supabase. This is the core idea of the App Router: the same framework renders your pages *and* handles your mutations, with a clear line between code that runs on the server (and can safely hold secrets) and code that runs in the browser (and can't).

## How a page load actually works

Take `https://www.amallab.co.uk/the-kiln-house`. Here's exactly what happens, file by file:

1. **`src/app/(site)/[slug]/layout.tsx`** runs first. It calls `getPropertyBySlug("the-kiln-house")`, which queries the `properties` table. If nothing matches, `notFound()` — this is why a typo'd slug shows a real 404, not a broken page. It wraps everything in `<div data-theme={property.theme_key}>`, which is the *entire* mechanism that makes Kiln House look different from Elmstead (more on this in [Two properties, one codebase](#two-properties-one-codebase)).

2. **`src/app/(site)/[slug]/page.tsx`** runs next, in the same request. It calls `getPropertyBySlug` *again* — but this one is wrapped in React's `cache()`, so the second call doesn't hit the database again; React deduplicates it within the same request. The page also fetches the property's images, current weather, and looks up its `richContentBySlug` entry (the code-managed room/floor-plan/location content — see the cookbook below for why that's not in the database).

3. Every section component (`Hero`, `Introduction`, `RoomShowcase`, `Location`, ...) receives plain props — no component fetches its own data. All the data-fetching happens in the page, once, up front. This is deliberate: it means you can look at any section component and know exactly what it depends on just from its props, without hunting for hidden `fetch` calls buried inside it.

4. The whole thing renders to HTML **on the server**, before anything reaches the browser. This is why `view-source:` on this site shows real content — a search engine crawler doesn't need to run JavaScript to see the property description.

5. Once the HTML arrives, the browser hydrates it — React attaches event listeners, GSAP wires up scroll animations, Lenis takes over scrolling. This is where `"use client"` components (see below) come alive.

## How a booking actually works

This is the most instructive flow in the app because it touches almost every layer at once.

1. Guest fills out `BookingForm.tsx` (a Client Component — it needs `useState` for the form fields). On submit, it calls `submitBooking(formData)`.

2. `submitBooking` (in `src/lib/actions/bookings.ts`) is a **Server Action** — even though it's called from client-side code, this function's *body* runs on the server, never in the browser. Inside it, in order:
   - **Zod validation** (`bookingInputSchema`) rejects malformed input before anything else happens.
   - **Honeypot check**: if the invisible `website` field got filled in, the function returns a fake success without writing anything — a bot doesn't get useful feedback that its submission was rejected.
   - **Rate limiting** (`checkRateLimit`): at most 5 booking attempts per IP per 15 minutes, backed by the `rate_limit_hits` table.
   - **Property lookup**: fetches the *current* price for that property, not whatever the client claimed — this is what stops someone from tampering with the price in the browser before submitting.
   - **Insert**: the booking row is written using `createAdminClient()` — the one place in the whole app that deliberately bypasses Row Level Security (see below for why that's safe here specifically).
   - **Two emails, sent in parallel-ish sequence**: one to you (the admin notification), one to the guest (their receipt). Both are wrapped in `try/catch` — a failed email never fails the booking. The booking is the source of truth; the email is a courtesy.
   - **`revalidatePath("/(site)/[slug]", "page")`**: tells Next.js that every property page's cached data might now be stale (a new booking could affect calendar availability).

3. Later, you open `/admin/bookings`, see the request, and click **Confirm**. That calls `updateBookingStatus`, a *different* Server Action — this one calls `requireAdmin()` first, which is the whole reason `/admin/bookings` can trust that only you can change a booking's status.

## The database, table by table

- **`properties`** — one row per property (currently two). Everything in the `/admin/properties` edit form maps directly to a column here.
- **`property_images`** — hero and gallery photos, one row per image, with a `category` and `sort_order`. `storage_path` is only set for images uploaded through the admin panel (Supabase Storage objects); the originally-seeded Unsplash photos have it `null` because there's nothing to delete from storage for them.
- **`bookings`** — every request to book, whatever its status. `stay_range` is a *generated column* — Postgres computes it automatically from `check_in`/`check_out` as a `daterange`, which is what makes the double-booking constraint possible (see below).
- **`admin_users`** — just a list of `user_id`s allowed to act as admin. Deliberately separate from "anyone with a Supabase login," so if guest accounts are ever added, guests are never accidentally treated as admins.
- **`rate_limit_hits`** — a timestamped log of rate-limited actions (`login:1.2.3.4`, `booking:1.2.3.4`, ...). Old rows get swept out opportunistically (a 1%-chance cleanup on each check) rather than via a scheduled job, since this table's traffic is low enough that a cron job would be overkill.

**The double-booking guarantee** is worth understanding because it's not application code — it's the database refusing to let it happen:

```sql
constraint no_overlapping_confirmed_stays
  exclude using gist (property_id with =, stay_range with &&) where (status = 'confirmed')
```

This is a Postgres *exclusion constraint*: "no two rows can exist where `property_id` matches *and* `stay_range` overlaps, among rows where `status = 'confirmed'`." Even if the admin dashboard had a bug that let you confirm two overlapping bookings, the database itself would reject the second `UPDATE` outright. This only works because of the `btree_gist` extension, enabled in the first migration — it's what lets an *equality* column (`property_id`) and a *range* column (`stay_range`) be combined in one exclusion constraint.

## Three layers of admin security

Every table an admin can write to is protected the same way, and it's worth understanding as one pattern rather than six separate ones:

1. **`src/proxy.ts`** (Next's replacement for `middleware.ts`) — runs before *any* `/admin/*` request reaches a page. Checks "is someone logged in?" — fast, no database call, just reading the session cookie. This is a cheap first gate, not the real security boundary.

2. **`requireAdmin()`** (`src/lib/supabase/dal.ts`) — called at the top of every admin page *and every admin Server Action*. This does the real check: it calls the `is_admin()` Postgres function via RPC, which looks up the current user in `admin_users`. This is the layer that actually matters — proxy.ts only confirms "logged in," this confirms "logged in **as the specific admin**."

3. **Row Level Security itself** — even if steps 1 and 2 both had bugs, the database's own policies (`using (public.is_admin())`) would still refuse to return or modify rows for anyone who isn't the admin. This is the layer that fails safe: it doesn't trust the application code at all, it re-checks at the data layer every single time.

The `is_admin()` function is declared `security definer`, which is why it can read the `admin_users` table even though that table has **zero RLS policies** of its own (nothing outside this one function is allowed to touch it directly — not even other authenticated users).

One deliberate exception to "everything goes through RLS": the public booking form uses `createAdminClient()` (the Supabase *secret key*, which bypasses RLS entirely) to insert a booking. This is safe specifically because `bookings` has **no INSERT policy at all** — meaning no client-side code, logged in or not, can insert a booking directly via the Supabase API. The only way a row gets created is through `submitBooking`, which runs validation, rate limiting, and the honeypot check first. Bypassing RLS here isn't a shortcut — it's the only way to let an *anonymous* visitor write anything at all, since RLS policies are about which *authenticated* role can do what, and a guest booking a stay was never going to be authenticated as one of your Supabase users.

## Two properties, one codebase

The whole two-property system rests on one idea: **structural content stays in code, everything else lives in the database.**

- **Database-editable** (via `/admin/properties`): name, tagline, location, description, pricing, bedroom/bathroom counts, square footage, photos. These are things you'd plausibly want to change without touching code.
- **Code-managed** (`src/data/property-content.ts`, keyed by slug): room descriptions, floor plan rectangle coordinates, architecture feature copy, the Location section's supporting blurb and nearby-places list. These essentially never change, and building an admin form for "edit the floor plan's SVG rectangle coordinates" would be a lot of engineering for something that might get used once.

The one place this boundary got confusing in practice: the Location section's big heading used to come from the code-managed content, completely disconnected from the *database* `location` field editable in admin — same word, two different things, and editing one silently did nothing to the other. Fixed by deriving that heading from `property.location` directly (see `[slug]/page.tsx`), which is a good example of a subtle bug that only shows up when you actually use the feature end to end, not when you just read the code.

**Theming** is the other half. Every property has a `theme_key` (`elmstead` or `kiln`), set as a `data-theme` attribute on a wrapping `<div>` in the layout. `globals.css` defines the *same* set of CSS custom properties (`--color-bone`, `--color-ink`, `--color-brass`, ...) twice — once at `:root` (the default, Elmstead's palette) and once scoped under `[data-theme="kiln"]`. Every component uses Tailwind utility classes like `bg-bone` or `text-ink`, which resolve to whichever value is currently in scope. The result: **zero component code changes per theme.** Adding a third property's look would mean adding one more `[data-theme="..."]` block to `globals.css` — nothing else.

## Server Components vs. Client Components

Every component in `src/` is a Server Component **unless** it has `"use client"` at the top. This isn't a style choice — it changes where the code actually runs:

- **Server Components** (`Hero.tsx`, `Location.tsx`'s parent, most `page.tsx`/`layout.tsx` files) run only on the server. They can be `async`, can query the database directly, and their code never ships to the browser at all — which is exactly why database credentials can live safely inside them.
- **Client Components** (`BookingForm.tsx`, `Navbar.tsx`, anything using `useState`/`useEffect`/`onClick`) run in the browser. They're needed anywhere the page has to respond to user interaction — a form, a dropdown, an animation that reacts to scroll position.

The practical rule this codebase follows: push `"use client"` as far down the tree as possible. `Location.tsx` is a Client Component (it needs `useGSAP` for the reveal animation), but the *page* that renders it is a Server Component that fetches the data and passes it down as props — the data-fetching and the interactivity are kept separate, rather than one giant client-side component doing both.

## Server Actions

A Server Action is a function marked `"use server"` (either at the top of its file, like `src/lib/actions/bookings.ts`, or inline) that can be called directly from a Client Component as if it were a normal async function — but it actually executes on the server, over a POST request Next.js manages for you. No hand-written API route, no manual `fetch()` call, no separate endpoint to keep in sync with the form that calls it.

This is why `updateProperty`, `uploadPropertyImage`, `submitBooking`, and `login` are all just exported `async function`s, importable straight into a client component and called like any other function — `const result = await updateProperty(id, formData)`. Next.js handles serializing the arguments, making the network request, and getting the return value back.

One consequence worth knowing: Server Actions have a default request body size limit of **1MB** — too small for a real photo upload. `next.config.ts` raises this to 8MB specifically because of `uploadPropertyImage`, with a comment explaining why that's still safe (the action validates file type and size server-side regardless of what the raw limit allows through).

## Caching and revalidation

Next.js caches aggressively by default, which is fantastic for performance and occasionally confusing when you change data and don't see it reflected. The pattern used everywhere in this repo: after any mutation, call `revalidatePath` for whatever pages that mutation could have affected.

`revalidatePath("/(site)/[slug]", "page")` is worth understanding specifically — the `[slug]` and the `"page"` type together mean "invalidate every page matching this dynamic route pattern," not just one specific property. This one call, used identically in `submitBooking`, `updateBookingStatus`, `deleteBooking`, `updateProperty`, and every image action, is why editing Kiln House's tagline shows up on the live Kiln House page without you ever having to specify which exact URL to invalidate.

In practice, most of this repo's pages turned out to already be **dynamically rendered** on every request (Next.js infers this automatically once a page reads cookies, which `createClient()` does internally to check the session) — meaning there's often nothing cached to invalidate in the first place. `revalidatePath` is kept in anyway as a correctness guarantee, not a workaround for a caching bug: relying on "this route happens to already be dynamic" would be fragile if that ever changed.

## External services, and why each one

Every third-party service in this project was chosen for a specific, stated reason — worth knowing not just *that* they're used, but *why these specific ones*:

- **Supabase** — Postgres + Auth + Storage in one project, instead of stitching together three separate services for a project this size.
- **Resend** — chosen specifically because Supabase's own built-in email sending turned out to be unreliable for delivery (this was a real, debugged issue early in the project — see the git history around `20260822...`). Resend now handles every outbound email: booking notifications, guest receipts, and password reset codes.
- **Open-Meteo** (weather) and **OpenStreetMap** (the Location section's map) — both chosen for the same reason: genuinely free, no API key, no account to create. For a small, single feature like "show the current temperature," adding an account and a secret key to manage would have been disproportionate to the value.
- **Vercel Analytics** — first-party, and specifically avoids adding any new Content-Security-Policy allowances in production, because it's proxied through the same domain the site is already served from (`/_vercel/insights/script.js`). It only needs an external script URL in local development, which is why `next.config.ts`'s CSP allowance for `va.vercel-scripts.com` is scoped to dev only.
- **Anthropic** — the one integration that *does* need real signup and a real key, because there's no free-and-keyless way to call an LLM. Used narrowly (drafting property copy in admin), not as a general chatbot bolted onto the public site.

## CI/CD: what runs automatically and when

Two GitHub Actions workflows, both added specifically because they were previously manual, easy-to-forget steps:

- **`.github/workflows/backup.yml`** — runs daily (and on-demand via `workflow_dispatch`), dumps `properties`, `property_images`, `bookings`, and `admin_users` to a GitHub Actions artifact. Not committed to the repo — bookings contain real guest names, emails, and phone numbers, which has no business sitting in git history even on a private repo. Retention is 90 days, the practical maximum on a free plan; this is a safety net against accidental deletion, not a long-term archive.
- **`.github/workflows/e2e.yml`** — runs the Playwright suite (an accessibility scan + a full booking submission) on every push to `main`, every pull request, and on-demand. It runs against the *real* Supabase project (no separate test environment exists), so it cleans up the test booking it creates afterward regardless of whether the run passed or failed — otherwise the real admin dashboard would slowly fill up with "Playwright Test Guest" entries.

Both workflows need their own copies of the relevant secrets in **Repo Settings → Secrets and variables → Actions** — separate from Vercel's environment variables, since GitHub Actions runs in a completely different environment.

Deploys themselves aren't a GitHub Action — Vercel watches the repo directly and deploys automatically on every push to `main`. There's no staging environment or approval gate; this is a deliberate simplicity tradeoff for a solo project, not an oversight, but it's worth knowing that pushing to `main` **is** deploying to production.

## The security model, end to end

Pulling together everything above into one list, roughly in the order a request would hit each layer:

1. **CSP + security headers** (`next.config.ts`) — set on every response, restrict what the browser will execute/load/frame at all, regardless of what the server sends.
2. **`proxy.ts`** — blocks unauthenticated access to `/admin/*` before any page code runs.
3. **Zod validation** on every user-facing input (bookings, property edits, image uploads) — rejects malformed data before it reaches the database.
4. **Rate limiting** — login, password reset, and booking submission are all capped per-IP, backed by `rate_limit_hits`.
5. **Honeypot field** on the booking form — a hidden field real visitors never fill in; bots that fill in every field get a silent fake success instead of useful signal that they were caught.
6. **`requireAdmin()`** — the real "is this actually the admin" check, re-run at the top of every admin page and every admin Server Action.
7. **Row Level Security** — the database's own last line of defense, re-checked on every single query regardless of what the application code did or didn't verify.
8. **Server-side file validation** on uploads — MIME type and size are checked in the Server Action itself, not just via the `accept` attribute on the file input (which a malicious client can simply ignore).

No single layer here is doing everything — that's deliberate. A bug in `requireAdmin()` wouldn't expose guest data, because RLS would still block it. A bug in RLS wouldn't let an anonymous user insert a booking, because there's no INSERT policy for it to fail. Layered defense means one mistake doesn't become one incident.

## Cookbook: how to make common changes

**Change a property's price, description, or stats** — `/admin/properties`, log in, edit, save. No code change, no deploy.

**Add or replace a photo** — same admin page, the image manager section. Upload goes to Supabase Storage; the old hardcoded Unsplash fallback only ever shows if a property has zero images in `property_images`.

**Change a room description or the floor plan** — edit `src/data/property-content.ts` directly (find the property's entry in `richContentBySlug`), then deploy. This is intentionally code, not an admin form — see [Two properties, one codebase](#two-properties-one-codebase) for why.

**Add a third property** — insert a row in `properties` (a new migration, following the pattern in `20260822190000_properties.sql`), add a `[data-theme="..."]` block to `globals.css` if it needs its own look, add an entry to `richContentBySlug` in `property-content.ts`, add its coordinates to `src/data/coordinates.ts`. Everything else — routing, the nav switcher, the booking form, theming — already generalizes to however many properties exist.

**Change the brand name** — `src/data/content.ts`'s `site.brand`. Property names live in the database, not here.

**Rotate a secret** (Supabase key, Resend key, etc.) — update `.env.local` for local dev, the Vercel project's environment variables for production, and both GitHub Actions workflows' secrets if that key is used in CI (check each workflow file's `env:` block).

## Glossary

- **RLS (Row Level Security)** — a Postgres feature where the database itself decides, per row, whether the current user is allowed to see or modify it. Enabled per-table; enforced even if the application code has a bug.
- **Server Component** — a React component that renders on the server and never ships its code to the browser. The App Router default.
- **Client Component** — a React component marked `"use client"`, which does ship to the browser, because it needs interactivity `useState`/`useEffect`/event handlers provide.
- **Server Action** — a server-only function (`"use server"`) callable directly from client code, without hand-writing an API route.
- **CSP (Content Security Policy)** — an HTTP header that tells the browser which sources of scripts, images, frames, etc. are allowed to load at all. Set in `next.config.ts`.
- **Security definer** — a Postgres function attribute meaning "run with the permissions of whoever *created* this function," not whoever is *calling* it. What lets `is_admin()` read a table that the calling user otherwise has zero access to.
- **Exclusion constraint** — a Postgres constraint type that rejects a row if it conflicts with an existing row under some rule you define (here: same property, overlapping dates, both confirmed) — stronger than a unique constraint, which can only check for exact duplicates.
- **Revalidation** — telling Next.js that previously-cached data for a given path is now stale and should be refetched on next visit.
- **Idempotent** (of a migration) — safe to run more than once without duplicating data or erroring, usually via `if not exists` / `on conflict do nothing`.
