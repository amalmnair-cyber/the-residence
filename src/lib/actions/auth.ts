"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPasswordResetCode } from "@/lib/email/resend";

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
  email?: string;
}

export async function requestPasswordReset(
  prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Please enter your email." };
  }

  const ip = await getClientIp();
  const allowed = await checkRateLimit(`forgot-password:${ip}`, 5, 15);
  if (!allowed) {
    return { error: "Too many attempts. Please try again in a few minutes.", email };
  }

  // Deliberately not supabase.auth.resetPasswordForEmail(): that sends via
  // Supabase's own built-in mailer, which is separate from (and much more
  // limited than) the Resend setup already proven reliable for booking
  // emails. generateLink creates the same underlying recovery code without
  // Supabase emailing anything itself — we send it ourselves via Resend.
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });

  if (!error && data.properties?.email_otp) {
    try {
      await sendPasswordResetCode(email, data.properties.email_otp);
    } catch (err) {
      console.error("password reset email failed", err);
    }
  }
  // If `error` is set, it's almost always "user not found" — logging
  // that server-side only, never in the response: confirming or denying
  // an address exists in the response is an account-enumeration risk.
  else if (error) {
    console.error("generateLink failed", error);
  }

  // Always report success either way, for the same reason.
  return { sent: true, email };
}

export interface ResetPasswordState {
  error?: string;
}

export async function resetPasswordWithCode(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!code) {
    return { error: "Enter the code from your email." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const ip = await getClientIp();
  const allowed = await checkRateLimit(`reset-code:${ip}`, 5, 15);
  if (!allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "recovery",
  });
  if (verifyError) {
    return { error: "That code is incorrect or has expired." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return { error: "Could not update your password. Please try again." };
  }

  // Force a fresh login with the new password rather than carrying the
  // recovery session forward.
  await supabase.auth.signOut();
  redirect("/admin/login?reset=success");
}
