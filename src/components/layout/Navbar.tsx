"use client";

import { useState } from "react";
import { useLenis } from "lenis/react";
import { navLinks } from "@/data/navigation";
import { useScrollTo } from "@/hooks/useScrollTo";
import { cn } from "@/lib/cn";
import MagneticButton from "../ui/MagneticButton";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleAnchorClick, scrollToId } = useScrollTo(-88);

  useLenis(({ scroll }) => {
    setScrolled(scroll > 32);
  });

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between rounded-full border transition-all duration-500",
            scrolled
              ? "border-line bg-bone/75 px-5 py-2.5 shadow-[0_8px_30px_-15px_rgba(20,19,15,0.3)] backdrop-blur-md"
              : "border-transparent bg-transparent px-5 py-3",
          )}
        >
          <a
            href="#top"
            onClick={(e) => handleAnchorClick(e, "#top")}
            className={cn(
              "font-display text-[15px] tracking-[0.18em] uppercase transition-colors duration-500",
              scrolled ? "text-ink" : "text-bone",
            )}
          >
            Atelier North
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className={cn(
                  "group relative text-[12.5px] uppercase tracking-[0.13em] transition-colors duration-500",
                  scrolled
                    ? "text-ink/65 hover:text-ink"
                    : "text-bone/80 hover:text-bone",
                )}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-brass transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <MagneticButton
              variant={scrolled ? "solid" : "outline-light"}
              className="px-6 py-2.5 text-[11px]"
              onClick={() => scrollToId("#enquiry")}
            >
              Private Viewing
            </MagneticButton>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex cursor-pointer flex-col items-end gap-[5px] p-2 lg:hidden"
          >
            <span
              className={cn(
                "h-px w-6 transition-all duration-500",
                scrolled ? "bg-ink" : "bg-bone",
              )}
            />
            <span
              className={cn(
                "h-px w-4 transition-all duration-500",
                scrolled ? "bg-ink" : "bg-bone",
              )}
            />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
