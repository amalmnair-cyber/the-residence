import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Optimistic check only: confirms *someone* has a valid session, fast, no
// database call. The real admin check (requireAdmin, checking admin_users)
// happens again inside every /admin page and action — this is just the gate.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;
  const path = request.nextUrl.pathname;

  // forgot-password must be reachable while logged out (that's the point).
  // reset-password isn't listed here: it needs isLoggedIn, which the
  // recovery-token link from /auth/confirm establishes before arriving.
  const publicAdminPaths = ["/admin/login", "/admin/forgot-password"];

  if (path.startsWith("/admin") && !publicAdminPaths.includes(path) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (path === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/bookings", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
