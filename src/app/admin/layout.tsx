import type { ReactNode } from "react";
import Link from "next/link";
import { site } from "@/data/content";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: `Admin — ${site.brand}`,
  robots: { index: false, follow: false },
};

const adminNavLinks = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/properties", label: "Properties" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Optimistic check only (same as proxy.ts) — just to decide whether to
  // show the nav, not a security boundary. No redirect here: login and
  // forgot-password must render for logged-out visitors too.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-line px-6 py-5 sm:px-10">
        <p className="font-display text-lg">
          {site.brand} <span className="text-stone">— Admin</span>
        </p>
        {isLoggedIn && (
          <nav className="flex gap-6">
            {adminNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] uppercase tracking-[0.1em] text-stone transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="px-6 py-10 sm:px-10">{children}</div>
    </div>
  );
}
