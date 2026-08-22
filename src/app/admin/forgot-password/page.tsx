"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  resetPasswordWithCode,
  type ForgotPasswordState,
  type ResetPasswordState,
} from "@/lib/actions/auth";
import FormField from "@/components/ui/FormField";
import MagneticButton from "@/components/ui/MagneticButton";

const requestInitialState: ForgotPasswordState = {};
const resetInitialState: ResetPasswordState = {};

function RequestCodeStage({ onSent }: { onSent: (email: string) => void }) {
  const [state, formAction, pending] = useActionState(requestPasswordReset, requestInitialState);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (state?.sent && state.email) onSent(state.email);
  }, [state, onSent]);

  return (
    <>
      <p className="mt-3 text-[14px] leading-relaxed text-stone">
        Enter your email and we&apos;ll send a code to reset your password.
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
          {pending ? "Sending" : "Send Code"}
        </MagneticButton>
        <Link
          href="/admin/login"
          className="block text-center text-[12px] uppercase tracking-[0.1em] text-stone transition-colors hover:text-ink"
        >
          Back to sign in
        </Link>
      </form>
    </>
  );
}

function EnterCodeStage({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordWithCode, resetInitialState);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <>
      <p className="mt-3 text-[14px] leading-relaxed text-stone">
        Enter the code sent to <span className="text-ink">{email}</span>, and your new
        password.
      </p>
      <form action={formAction} className="mt-10 space-y-7">
        <input type="hidden" name="email" value={email} />
        <FormField label="Code" name="code" required value={code} onChange={setCode} />
        <FormField
          label="New password"
          name="password"
          type="password"
          required
          value={password}
          onChange={setPassword}
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        {state?.error && (
          <p className="animate-[panel-in_0.25s_ease-out] text-[13px] text-red-600">
            {state.error}
          </p>
        )}
        <MagneticButton type="submit" disabled={pending} className="w-full">
          {pending ? "Updating" : "Reset Password"}
        </MagneticButton>
      </form>
    </>
  );
}

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center">
      <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Admin</p>
      <h1 className="mt-3 font-display text-3xl text-ink">Reset your password</h1>

      {sentTo ? (
        <EnterCodeStage email={sentTo} />
      ) : (
        <RequestCodeStage onSent={setSentTo} />
      )}
    </div>
  );
}
