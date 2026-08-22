import Image from "next/image";
import { materials } from "@/data/materials";
import RevealText from "../ui/RevealText";

export default function Materials() {
  return (
    <section id="materials" className="bg-ink py-28 text-bone sm:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-2xl">
          <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
            Materials
          </RevealText>
          <RevealText
            as="h2"
            className="mt-6 text-[clamp(2.25rem,5.4vw,4.75rem)] font-display leading-[1.05]"
          >
            A restrained palette
          </RevealText>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-1.5 px-4 sm:grid-cols-3 sm:px-6 lg:flex lg:h-[680px] lg:gap-1 lg:px-1">
        {materials.map((m) => (
          <div
            key={m.id}
            className="group relative aspect-square overflow-hidden lg:aspect-auto lg:h-full lg:flex-1 lg:transition-[flex-grow] lg:duration-700 lg:ease-out lg:hover:flex-[2.4]"
          >
            <Image
              src={m.image}
              alt={m.name}
              fill
              sizes="(min-width: 1024px) 40vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <p className="font-display text-base sm:text-xl">{m.name}</p>
              <p className="mt-1.5 max-w-[220px] text-[12px] leading-relaxed text-bone/75 transition-opacity duration-500 sm:text-[13px] lg:opacity-0 lg:group-hover:opacity-100">
                {m.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
