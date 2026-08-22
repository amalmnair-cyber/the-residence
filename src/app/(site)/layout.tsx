import type { ReactNode } from "react";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { CursorProvider } from "@/context/CursorContext";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import DemoDisclaimer from "@/components/layout/DemoDisclaimer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <CursorProvider>
      <SmoothScroll>
        <Navbar />
        <ScrollProgress />
        {children}
        <CustomCursor />
        <DemoDisclaimer />
      </SmoothScroll>
    </CursorProvider>
  );
}
