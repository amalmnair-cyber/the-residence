"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "../ui/RevealText";
import { images, introCopy } from "@/data/content";

export default function Introduction() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imgRef.current) return;
      gsap.fromTo(
        imgRef.current,
        { y: -50 },
        {
          y: 50,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="residence"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper py-28 sm:py-36 lg:py-44"
    >
      <div className="mx-auto grid max-w-7xl gap-16 px-6 sm:px-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7 lg:pr-10">
          <RevealText
            as="p"
            className="text-[11px] uppercase tracking-[0.22em] text-brass"
          >
            Introduction
          </RevealText>
          <RevealText
            as="h2"
            className="mt-6 text-[clamp(2.25rem,5.4vw,4.75rem)] font-display leading-[1.05] text-ink"
          >
            {introCopy.heading}
          </RevealText>

          <div className="mt-10 max-w-lg space-y-5">
            {introCopy.paragraphs.map((p) => (
              <RevealText
                key={p}
                as="p"
                className="text-[15px] leading-relaxed text-stone sm:text-base"
              >
                {p}
              </RevealText>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div
            ref={imgRef}
            className="relative aspect-[4/5] w-full overflow-hidden"
          >
            <Image
              src={images.introduction}
              alt="The Residence exterior at twilight, framed by mature landscaping"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-7 -left-7 hidden h-24 w-24 flex-col items-center justify-center rounded-full bg-ink text-center text-[10px] uppercase leading-tight tracking-[0.1em] text-bone sm:flex">
            <span>Atelier</span>
            <span>North</span>
          </div>
        </div>
      </div>
    </section>
  );
}
