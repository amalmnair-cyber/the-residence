import Link from "next/link";
import Image from "next/image";
import { getProperties, getPropertyImages } from "@/lib/queries/properties";
import { unsplash } from "@/lib/unsplash";

// Fallbacks only used until real images are uploaded via the admin panel
// (property_images is empty right now) — keyed by slug since these are
// specifically each property's known-good launch photo.
const FALLBACK_IMAGES: Record<string, string> = {
  "the-elmstead": unsplash("1748063578185-3d68121b11ff", 1600),
  "the-kiln-house": unsplash("1570231396362-9340901b2044", 1600),
};

export default async function LandingPage() {
  const properties = await getProperties();

  const cards = await Promise.all(
    properties.map(async (p) => {
      const [hero] = await getPropertyImages(p.id, "hero");
      return { ...p, image: hero?.url ?? FALLBACK_IMAGES[p.slug] };
    }),
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-20 sm:py-28">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-brass">AAAM Residency</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-ink">
          Two properties. Reserved entirely for you.
        </h1>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {cards.map((p) => (
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
