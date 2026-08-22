import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Fixed-window rate limit backed by Postgres — no new service to run this
 * single-property site's low traffic through. Returns true if the action
 * is allowed. Fails open (allows the request) if the check itself errors,
 * so a database hiccup can't take down the booking form or admin login.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMinutes: number,
): Promise<boolean> {
  const supabase = createAdminClient();
  const windowStart = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { count, error } = await supabase
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);

  if (error) {
    console.error("rate limit check failed", error);
    return true;
  }

  if ((count ?? 0) >= limit) return false;

  await supabase.from("rate_limit_hits").insert({ key });

  // Cheap, dependency-free cleanup: on ~1% of calls, sweep hits old enough
  // that no active window could still need them, instead of running a cron job.
  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    await supabase.from("rate_limit_hits").delete().lt("created_at", cutoff);
  }

  return true;
}
