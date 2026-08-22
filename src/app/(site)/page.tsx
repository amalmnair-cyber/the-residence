import Link from "next/link";
import Image from "next/image";
import { unsplash } from "@/lib/unsplash";

// Hardcoded for now — switches to getProperties() once the properties
// migration is live. Deliberately no heavy animation/JS here: this is the
// first thing anyone sees, and the whole point of this page existing is
// the minimalist direction, not another scroll-driven showcase.
const properties = [
  {
    slug: "the-elmstead",
    name: "The Elmstead",
    tagline: "Designed for extraordinary living.",
    location: "Hampstead, London",
    image: unsplash("1748063578185-3d68121b11ff", 1600),
  },
  {
    slug: "the-kiln-house",
    name: "The Kiln House",
    tagline: "Where the coastline sets the pace.",
    location: "St Ives, Cornwall",
    image: unsplash("1570231396362-9340901b2044", 1600),
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-20 sm:py-28">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-brass">AAAM Residency</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-ink">
          Two properties. Reserved entirely for you.
        </h1>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {properties.map((p) => (
          <Link
            key={p.slug}
            href={`/${p.slug}`}
            className="group block overflow-hidden rounded-lg border border-line"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-stone">{p.location}</p>
              <h2 className="mt-2 font-display text-2xl text-ink">{p.name}</h2>
              <p className="mt-2 text-[14px] text-stone">{p.tagline}</p>
              <span className="mt-4 inline-block text-[12px] uppercase tracking-[0.1em] text-ink underline-offset-4 group-hover:underline">
                View property →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
