"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const ip = await getClientIp();
  const allowed = await checkRateLimit(`login:${ip}`, 5, 15);
  if (!allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/admin/bookings");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export interface ForgotPasswordState {
  error?: string;
  sent?: boolean;
}

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Please enter your email." };
  }

  const ip = await getClientIp();
  const allowed = await checkRateLimit(`forgot-password:${ip}`, 5, 15);
  if (!allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/admin/reset-password`,
  });

  // Always report success, whether or not that email actually has an
  // account — confirming/denying an address exists is an enumeration risk.
  return { sent: true };
}

export interface ResetPasswordState {
  error?: string;
}

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Could not update your password. The reset link may have expired." };
  }

  // Force a fresh login with the new password rather than carrying the
  // recovery session forward.
  await supabase.auth.signOut();
  redirect("/admin/login?reset=success");
}
