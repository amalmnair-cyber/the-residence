import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server client that acts on behalf of whoever is logged in (subject to RLS).
 * Use inside Server Components / Server Actions that need the current admin's session.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a context without a mutable cookie store (e.g. a
            // Server Component render) — fine, proxy.ts refreshes sessions.
          }
        },
      },
    },
  );
}

/**
 * For reading data that's public regardless of who's asking (properties,
 * property_images — both have "Anyone can view" RLS policies). Deliberately
 * does NOT touch cookies at all: calling next/headers' cookies() is what
 * forces Next.js to render a page fully dynamically on every request, even
 * when the actual data barely changes. Pages that only read through this
 * client can be cached/ISR'd instead of hitting the database on every visit.
 * Still respects RLS (uses the anon/publishable key, not the secret key) —
 * this only changes caching behavior, not what data is reachable.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
