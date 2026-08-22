import type { ReactNode } from "react";
import { site } from "@/data/content";

export const metadata = {
  title: `Admin — ${site.brand}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="border-b border-line px-6 py-5 sm:px-10">
        <p className="font-display text-lg">
          {site.brand} <span className="text-stone">— Admin</span>
        </p>
      </div>
      <div className="px-6 py-10 sm:px-10">{children}</div>
    </div>
  );
}
