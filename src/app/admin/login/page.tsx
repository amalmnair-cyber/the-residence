"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, type LoginState } from "@/lib/actions/auth";
import FormField from "@/components/ui/FormField";
import MagneticButton from "@/components/ui/MagneticButton";

const initialState: LoginState = {};

function ResetStatus() {
  const searchParams = useSearchParams();
  const reset = searchParams.get("reset");

  if (reset === "success") {
    return (
      <p className="mt-4 text-[13px] leading-relaxed text-brass">
        Password updated — sign in with your new password.
      </p>
    );
  }
  if (reset === "error") {
    return (
      <p className="mt-4 text-[13px] leading-relaxed text-red-600">
        That reset link is invalid or has expired. Request a new one below.
      </p>
    );
  }
  return null;
}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center">
      <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Admin</p>
      <h1 className="mt-3 font-display text-3xl text-ink">Sign in</h1>

      <Suspense fallback={null}>
        <ResetStatus />
      </Suspense>

      <form action={formAction} className="mt-10 space-y-7">
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={setEmail}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          required
          value={password}
          onChange={setPassword}
        />

        {state?.error && (
          <p className="animate-[panel-in_0.25s_ease-out] text-[13px] text-red-600">
            {state.error}
          </p>
        )}

        <MagneticButton type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in" : "Sign In"}
        </MagneticButton>

        <Link
          href="/admin/forgot-password"
          className="block text-center text-[12px] uppercase tracking-[0.1em] text-stone transition-colors hover:text-ink"
        >
          Forgot password?
        </Link>
      </form>
    </div>
  );
}
