"use client";

import { useActionState, useState } from "react";
import { requestPasswordReset, type ForgotPasswordState } from "@/lib/actions/auth";
import FormField from "@/components/ui/FormField";
import MagneticButton from "@/components/ui/MagneticButton";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  const [email, setEmail] = useState("");

  if (state?.sent) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Admin</p>
        <h1 className="mt-3 font-display text-3xl text-ink">Check your email</h1>
        <p className="mt-4 text-[14px] leading-relaxed text-stone">
          If an account exists for that address, a password reset link is on its way.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center">
      <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Admin</p>
      <h1 className="mt-3 font-display text-3xl text-ink">Reset your password</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-stone">
        Enter your email and we&apos;ll send a link to reset your password.
      </p>

      <form action={formAction} className="mt-10 space-y-7">
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={setEmail}
        />

        {state?.error && (
          <p className="animate-[panel-in_0.25s_ease-out] text-[13px] text-red-600">
            {state.error}
          </p>
        )}

        <MagneticButton type="submit" disabled={pending} className="w-full">
          {pending ? "Sending" : "Send Reset Link"}
        </MagneticButton>

        <a
          href="/admin/login"
          className="block text-center text-[12px] uppercase tracking-[0.1em] text-stone transition-colors hover:text-ink"
        >
          Back to sign in
        </a>
      </form>
    </div>
  );
}
