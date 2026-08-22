"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "../ui/RevealText";
import { images, architectureFeatures, site } from "@/data/content";

export default function Architecture() {
  const sectionRef = useRef<HTMLElement>(null);
  const mainImgRef = useRef<HTMLDivElement>(null);
  const detail1Ref = useRef<HTMLDivElement>(null);
  const detail2Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      [mainImgRef, detail1Ref, detail2Ref].forEach((ref, i) => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current,
          { y: -30 - i * 10 },
          {
            y: 30 + i * 10,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="architecture"
      ref={sectionRef}
      className="overflow-hidden bg-ink py-28 text-bone sm:py-36 lg:py-44"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-2xl">
          <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
            Architecture
          </RevealText>
          <RevealText
            as="h2"
            className="mt-6 text-[clamp(2.25rem,5.4vw,4.75rem)] font-display leading-[1.05]"
          >
            Considered from every angle
          </RevealText>
        </div>
      </div>

      <div className="relative mt-16 h-[60vh] w-full overflow-hidden sm:h-[78vh]">
        <div ref={mainImgRef} className="absolute inset-[-6%]">
          <Image
            src={images.architectureMain}
            alt={`Board-formed concrete and timber facade detail of ${site.propertyName}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-32">
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {architectureFeatures.map((f) => (
            <div key={f.title} className="border-t border-line-dark pt-6">
              <RevealText as="p" className="font-display text-2xl">
                {f.title}
              </RevealText>
              <RevealText as="p" className="mt-3 text-sm leading-relaxed text-bone/60">
                {f.copy}
              </RevealText>
            </div>
          ))}
        </div>

        <div className="mt-28 grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-3/4 overflow-hidden">
            <div ref={detail1Ref} className="absolute inset-[-6%]">
              <Image
                src={images.architectureDetail1}
                alt="Concrete balcony detail against the sky"
                fill
                sizes="(min-width: 640px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="relative aspect-3/4 overflow-hidden sm:mt-16">
            <div ref={detail2Ref} className="absolute inset-[-6%]">
              <Image
                src={images.architectureStair}
                alt="Minimalist plaster staircase"
                fill
                sizes="(min-width: 640px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
