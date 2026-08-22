"use client";

import { useActionState, useState } from "react";
import { resetPassword, type ResetPasswordState } from "@/lib/actions/auth";
import FormField from "@/components/ui/FormField";
import MagneticButton from "@/components/ui/MagneticButton";

const initialState: ResetPasswordState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center">
      <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Admin</p>
      <h1 className="mt-3 font-display text-3xl text-ink">Set a new password</h1>

      <form action={formAction} className="mt-10 space-y-7">
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
          {pending ? "Updating" : "Update Password"}
        </MagneticButton>
      </form>
    </div>
  );
}
