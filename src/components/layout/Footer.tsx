import { navLinks } from "@/data/navigation";
import { site } from "@/data/content";

export default function Footer() {
  return (
    <footer className="bg-ink text-bone">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl">{site.propertyName}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone/55">
              A private architectural retreat in Hampstead, London, available
              for exclusive whole-house stays. An {site.brand} property.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-bone/40">
              Navigate
            </p>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-bone/70 transition-colors hover:text-bone"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-bone/40">
              Reservations
            </p>
            <div className="mt-5 space-y-3 text-sm text-bone/70">
              <p>reservations@aaamresidency.co.uk</p>
              <p>+44 (0)20 7946 0891</p>
              <p>Hampstead, London NW3</p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-bone/10 pt-8 text-xs text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.brand}. All rights reserved.
          </p>
          <p>A fictional resort, created for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
