"use client";

import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/lib/actions/payments";

export default function PaymentLinkButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClick() {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await createCheckoutSession(bookingId);
      if (!result.ok || !result.url) {
        setError(result.message ?? "Could not create a payment link.");
        return;
      }
      setUrl(result.url);
    });
  }

  function handleCopy() {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="cursor-pointer text-[11px] uppercase tracking-[0.08em] text-brass transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating…" : "Get payment link (test mode)"}
      </button>
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
      {url && (
        <div className="mt-2 flex items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 truncate rounded-md border border-line bg-bone-2 px-2.5 py-1.5 text-[12px] text-stone"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="flex-none cursor-pointer text-[11px] uppercase tracking-[0.08em] text-ink transition-colors hover:text-brass"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
