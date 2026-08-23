"use client";

import { useState, useTransition } from "react";
import { suggestPropertyCopy } from "@/lib/actions/ai";

export default function AiSuggestButton({
  field,
  propertyName,
  location,
  currentValue,
  onApply,
}: {
  field: "tagline" | "description";
  propertyName: string;
  location: string;
  currentValue: string;
  onApply: (value: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSuggest() {
    setError(null);
    setSuggestion(null);
    startTransition(async () => {
      const result = await suggestPropertyCopy(field, {
        name: propertyName,
        location,
        currentValue,
      });
      if (!result.ok || !result.suggestion) {
        setError(result.message ?? "Could not get a suggestion.");
        return;
      }
      setSuggestion(result.suggestion);
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleSuggest}
        className="cursor-pointer text-[11px] uppercase tracking-[0.08em] text-brass transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Thinking…" : "✨ Suggest with AI"}
      </button>

      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}

      {suggestion && (
        <div className="mt-2 animate-[panel-in_0.25s_ease-out] rounded-md border border-line bg-bone-2 p-3">
          <p className="text-[14px] leading-relaxed text-ink">{suggestion}</p>
          <div className="mt-2.5 flex gap-4">
            <button
              type="button"
              onClick={() => {
                onApply(suggestion);
                setSuggestion(null);
              }}
              className="cursor-pointer text-[11px] uppercase tracking-[0.08em] text-ink transition-colors hover:text-brass"
            >
              Use this
            </button>
            <button
              type="button"
              onClick={() => setSuggestion(null)}
              className="cursor-pointer text-[11px] uppercase tracking-[0.08em] text-stone transition-colors hover:text-ink"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
