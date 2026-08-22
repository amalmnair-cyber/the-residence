"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "demo-disclaimer-seen";

export default function DemoDisclaimer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so this can only be checked
    // after mount — the resulting extra render is the point, not a mistake.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // Private browsing etc. can throw on localStorage access — just skip
      // the notice rather than crash the page over it.
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore — worst case the notice shows again next visit.
    }
    setOpen(false);
  }

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
          onClick={dismiss}
          tabIndex={open ? 0 : -1}
          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-ink px-8 py-3 text-[12px] uppercase tracking-[0.12em] text-bone transition-colors hover:bg-ink-2"
        >
          Understood
        </button>
      </div>
    </div>
  );
}
