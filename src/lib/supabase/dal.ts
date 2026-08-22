import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./server";

/**
 * Confirms the current session belongs to an admin (checked via the
 * database's `is_admin()` function, not a client-side flag). Redirects to
 * the login page otherwise. Call this at the top of every admin page and
 * every admin server action — proxy.ts only checks "is someone logged in",
 * this checks "is it specifically the admin."
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (!claims) {
    redirect("/admin/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return { userId: claims.sub as string, email: claims.email as string | undefined };
}
