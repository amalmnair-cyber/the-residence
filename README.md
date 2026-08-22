# The Residence — Atelier North

A fictional luxury property website for **The Residence**, Hampstead, London — designed by the fictional practice **Atelier North**. Built as a cinematic, Awwwards-style single-page showcase with heavy scroll-driven animation.

Live imagery is sourced from Unsplash at runtime (no local image assets required).

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **GSAP** (ScrollTrigger, SplitText) for scroll-driven animation, pinning and text reveals
- **Motion** (the Framer Motion successor, `motion/react`) for gestures, drag and micro-interactions
- **Lenis** for smooth scrolling, synced to GSAP's ticker

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Production build

```bash
npm run build
npm run start
```

### 4. Lint

```bash
npm run lint
```

## Project structure

```
src/
  app/                  Root layout, page, global styles
  components/
    layout/              Navbar, MobileMenu, Footer, CustomCursor, ScrollProgress, SmoothScroll
    sections/            One component per homepage section (Hero, Introduction, Architecture, ...)
    ui/                  Reusable primitives (RevealText, MagneticButton, Lightbox, FormField, ...)
  data/                  Typed content: copy, room/material/gallery/location data
  hooks/                 useMediaQuery, useScrollTo, useMagnetic, usePrefersReducedMotion
  context/               Custom cursor state
  lib/                   GSAP setup, Unsplash URL helper, small utilities
```

Sections are composed in `src/app/page.tsx`. Each section is a self-contained component under `src/components/sections/`, so reordering or removing a section is a one-line change.

## Notes on this build

- **Images**: all photography is hotlinked from Unsplash's CDN via `next/image`, resized/optimized on the fly. Allowed remote hosts are configured in `next.config.ts` (`images.remotePatterns`). No binary image assets are checked into the repo.
- **Motion**: scroll-linked effects (parallax, pinning, the sticky room sequence, reveal-on-scroll text) use GSAP + ScrollTrigger. One-shot UI transitions (mobile menu, lightbox, form success state) use plain CSS transitions/keyframes for reliability. Continuous pointer-driven effects (magnetic buttons, the custom cursor) use Motion's motion values.
- **Reduced motion**: `prefers-reduced-motion: reduce` disables Lenis smooth-scroll (falls back to native scrolling) and shortens/removes CSS transitions and animations globally.
- **Custom cursor**: desktop only (`(hover: hover) and (pointer: fine)`); disabled automatically on touch devices.

## Deploying

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
2. Vercel auto-detects Next.js — no build settings need to be changed.
3. Deploy. You'll get a free `*.vercel.app` domain immediately; a custom domain can be attached later from the project's Vercel dashboard.

Alternatively, from the CLI:

```bash
npm i -g vercel
vercel
```
