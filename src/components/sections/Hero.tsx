"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";

interface HeroProps {
  propertyName: string;
  location: string;
  tagline: string;
  heroImage: string;
}

export default function Hero({ propertyName, location, tagline, heroImage }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!mediaRef.current || !titleRef.current) return;

      const xTo = gsap.quickTo(mediaRef.current, "x", {
        duration: 1.2,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(mediaRef.current, "y", {
        duration: 1.2,
        ease: "power3.out",
      });

      function onPointerMove(e: PointerEvent) {
        const relX = e.clientX / window.innerWidth - 0.5;
        const relY = e.clientY / window.innerHeight - 0.5;
        xTo(relX * -30);
        yTo(relY * -22);
      }
      window.addEventListener("pointermove", onPointerMove);

      if (imgRef.current) {
        gsap.fromTo(
          imgRef.current,
          { scale: 1 },
          { scale: 1.12, duration: 20, ease: "sine.out" },
        );
      }

      gsap.to(mediaRef.current, {
        scale: 1.14,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-content", {
        y: 100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "65% top",
          scrub: true,
        },
      });

      const split = SplitText.create(titleRef.current, {
        type: "words",
        mask: "words",
      });

      const tl = gsap.timeline({ delay: 0.4 });
      tl.from(split.words, {
        yPercent: 120,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
      }).from(
        ".hero-fade",
        { y: 18, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 },
        "-=0.75",
      );

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        split.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div ref={mediaRef} className="absolute inset-[-10%]">
          <Image
            ref={imgRef}
            src={heroImage}
            alt={`${propertyName}, ${location}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-ink/35" />
      </div>

      <div className="hero-content relative z-10 flex h-full flex-col items-center justify-end px-6 pb-28 text-center sm:pb-32">
        <p className="hero-fade mb-5 text-[13px] uppercase tracking-[0.32em] text-bone/85">
          {location}
        </p>
        <h1
          ref={titleRef}
          className="font-display text-[16vw] leading-[0.92] text-bone sm:text-[12vw] lg:text-[8.4vw]"
        >
          {propertyName}
        </h1>
        <p className="hero-fade mt-7 max-w-md text-[15px] text-bone/80 sm:text-base">
          {tagline}
        </p>
      </div>

      <div className="hero-fade absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-bone/70">
        <span className="text-[10px] uppercase tracking-[0.28em]">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-bone/25">
          <span className="absolute inset-x-0 -top-full h-full bg-bone animate-[scroll-dot_1.8s_ease-in-out_infinite]" />
        </span>
      </div>
    </section>
  );
}
