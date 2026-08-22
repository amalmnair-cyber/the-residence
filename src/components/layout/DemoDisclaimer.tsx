"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export default function DemoDisclaimer() {
  // Shows on every visit, not just the first — deliberate: the point is
  // making sure no one mistakes this for a real business, and a one-time
  // notice a visitor dismissed weeks ago (or never saw, because someone
  // else shared a link straight to a section) doesn't do that reliably.
  const [open, setOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-disclaimer-title"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 px-6 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 text-center shadow-2xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Before you continue</p>
        <h2 id="demo-disclaimer-title" className="mt-4 font-display text-2xl text-ink">
          This is a demo site
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-stone">
          The Elmstead and AAAM Residency are fictional. This site was built by Amal as a
          personal practice project to learn full-stack web development — it isn&apos;t a real
          property or booking service, and no payment is ever collected. Please don&apos;t
          submit real personal details you wouldn&apos;t want stored for testing.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-ink px-8 py-3 text-[12px] uppercase tracking-[0.12em] text-bone transition-colors hover:bg-ink-2"
        >
          Understood
        </button>
      </div>
    </div>
  );
}
