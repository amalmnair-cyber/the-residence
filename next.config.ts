import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Used for both next/image's remotePatterns and the CSP img-src below —
// derived from the existing env var so it can't silently drift out of sync
// with whichever Supabase project is actually configured.
const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;

// No nonce: nonce-based CSP requires dynamic rendering on every page
// (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md),
// which would disable static generation/CDN caching site-wide. 'unsafe-inline'
// on script-src is the tradeoff — Next's own App Router RSC bootstrap needs
// inline scripts. Every other directive still fully applies.
const contentSecurityPolicy = [
  "default-src 'self'",
  // va.vercel-scripts.com: Vercel Analytics' script only loads from here in
  // local dev (isDevelopment() check in the package) — production uses the
  // same-origin /_vercel/insights/script.js path instead, so this entry is
  // simply unused in production, not a real allowance there.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://images.unsplash.com https://${supabaseHostname}`,
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://www.openstreetmap.org",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB — too small for real photo uploads. Admin-only
      // action, validated server-side (mime type + this cap), so the
      // larger limit isn't an open abuse surface.
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
