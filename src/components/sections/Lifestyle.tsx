"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "../ui/RevealText";
import { images, lifestyleCopy } from "@/data/content";

export default function Lifestyle() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imgRef.current) return;
      gsap.fromTo(
        imgRef.current,
        { scale: 1.08, y: -40 },
        {
          scale: 1,
          y: 40,
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
      ref={sectionRef}
      className="relative flex h-[90vh] min-h-[560px] items-center justify-center overflow-hidden bg-ink text-bone sm:h-screen"
    >
      <div ref={imgRef} className="absolute inset-[-6%]">
        <Image
          src={images.lifestylePrimary}
          alt="Soft morning light through woodland near Hampstead Heath"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-ink/55" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <div className="font-display text-[clamp(2rem,6vw,4.25rem)] leading-[1.15]">
          <RevealText as="p">{lifestyleCopy.lines[0]}</RevealText>
          <RevealText as="p" delay={0.12}>
            {lifestyleCopy.lines[1]}
          </RevealText>
        </div>
        <RevealText
          as="p"
          delay={0.2}
          className="mx-auto mt-8 max-w-lg text-[15px] leading-relaxed text-bone/70"
        >
          {lifestyleCopy.body}
        </RevealText>
      </div>
    </section>
  );
}
