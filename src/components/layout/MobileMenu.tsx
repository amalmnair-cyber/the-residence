"use client";

import { useEffect } from "react";
import { navLinks } from "@/data/navigation";
import { useScrollTo } from "@/hooks/useScrollTo";
import { cn } from "@/lib/cn";
import MagneticButton from "../ui/MagneticButton";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { scrollToId } = useScrollTo(-72);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleClick(href: string) {
    onClose();
    window.setTimeout(() => scrollToId(href), 350);
  }

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[80] flex flex-col bg-ink text-bone transition-opacity duration-500 ease-out lg:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <span className="font-display text-sm uppercase tracking-[0.2em]">
          Atelier North
        </span>
        <button
          onClick={onClose}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          className="cursor-pointer text-[13px] uppercase tracking-[0.15em] text-bone/70"
        >
          Close
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-1 px-8">
        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            tabIndex={open ? 0 : -1}
            onClick={(e) => {
              e.preventDefault();
              handleClick(link.href);
            }}
            style={{ transitionDelay: open ? `${150 + i * 60}ms` : "0ms" }}
            className={cn(
              "border-b border-bone/10 py-3.5 font-display text-4xl transition-all duration-500 ease-out",
              open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div
        style={{ transitionDelay: open ? "480ms" : "0ms" }}
        className={cn(
          "px-8 pb-10 transition-all duration-500 ease-out",
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <MagneticButton
          variant="outline-light"
          className="w-full"
          onClick={() => handleClick("#enquiry")}
          tabIndex={open ? 0 : -1}
        >
          Private Viewing
        </MagneticButton>
      </div>
    </div>
  );
}
