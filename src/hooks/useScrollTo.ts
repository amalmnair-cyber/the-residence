"use client";

import { useLenis } from "lenis/react";
import type { MouseEvent } from "react";

export function useScrollTo(offset = -96) {
  const lenis = useLenis();

  function scrollToId(id: string) {
    const target = document.querySelector(id);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, { offset, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleAnchorClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    scrollToId(href);
    window.history.pushState(null, "", href);
  }

  return { scrollToId, handleAnchorClick };
}
