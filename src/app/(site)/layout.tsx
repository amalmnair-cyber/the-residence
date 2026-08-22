import type { ReactNode } from "react";
import DemoDisclaimer from "@/components/layout/DemoDisclaimer";

// Deliberately minimal: the property experience (Navbar, smooth-scroll,
// custom cursor, theme) lives in [slug]/layout.tsx instead, since only a
// layout *inside* a dynamic segment can read that segment's params — a
// layout here can't know which property is being viewed. This layout only
// holds what's truly page-independent (the landing page included).
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <DemoDisclaimer />
    </>
  );
}
