"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "../ui/RevealText";
import type { RichContent } from "@/data/property-content";

export default function Location({ location }: { location: RichContent["location"] }) {
  const { heading, blurb, places: nearbyPlaces, images: locationImages } = location;
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      if (!listRef.current) return;
      gsap.from(listRef.current.children, {
        opacity: 0,
        x: -24,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: listRef.current, start: "top 85%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="location"
      ref={sectionRef}
      className="bg-ink py-28 text-bone sm:py-36 lg:py-44"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
              Location
            </RevealText>
            <h2 className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95]">
              {heading[0]}
              <br />
              {heading[1]}
            </h2>
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-bone/65">{blurb}</p>

            <ul
              ref={listRef}
              className="mt-12 divide-y divide-line-dark border-t border-line-dark"
            >
              {nearbyPlaces.map((place) => (
                <li
                  key={place.name}
                  className="flex items-center justify-between py-4"
                >
                  <span className="text-sm text-bone/85">{place.name}</span>
                  <span className="text-sm text-brass">{place.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:col-span-7">
            <div className="relative aspect-4/3 w-full overflow-hidden sm:aspect-16/10">
              <Image
                src={locationImages[0]}
                alt={`${heading[0]}, ${heading[1]}`}
                fill
                sizes="(min-width: 1024px) 55vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-6 hidden h-40 w-32 overflow-hidden border-4 border-ink shadow-2xl sm:block lg:h-48 lg:w-40">
              <Image
                src={locationImages[1]}
                alt={`Near ${heading[0]}`}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
