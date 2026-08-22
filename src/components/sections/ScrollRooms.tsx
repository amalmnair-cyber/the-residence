"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { rooms } from "@/data/rooms";

const steps = [
  rooms.find((r) => r.id === "living")!,
  rooms.find((r) => r.id === "kitchen")!,
  { ...rooms.find((r) => r.id === "master-suite")!, title: "Bedroom" },
  rooms.find((r) => r.id === "bathroom")!,
  rooms.find((r) => r.id === "pool")!,
  rooms.find((r) => r.id === "terrace")!,
];

export default function ScrollRooms() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const titleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useGSAP(
    () => {
      const layers = layerRefs.current;
      const titles = titleRefs.current;
      if (!containerRef.current || !panelRef.current) return;
      if (layers.some((l) => !l) || titles.some((t) => !t)) return;

      gsap.set(layers.slice(1), { autoAlpha: 0 });
      gsap.set(titles.slice(1), { autoAlpha: 0, y: 22 });
      gsap.set(layers[0], { autoAlpha: 1 });
      gsap.set(titles[0], { autoAlpha: 1, y: 0 });
      gsap.set(dotRefs.current[0], { backgroundColor: "var(--color-brass)", height: 28 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          pin: panelRef.current,
          onUpdate: (self) => {
            const idx = Math.min(
              steps.length - 1,
              Math.floor(self.progress * steps.length),
            );
            dotRefs.current.forEach((dot, i) => {
              if (!dot) return;
              gsap.set(dot, {
                backgroundColor: i === idx ? "var(--color-brass)" : "rgba(243,239,231,0.25)",
                height: i === idx ? 28 : 20,
              });
            });
          },
        },
      });

      steps.forEach((_, i) => {
        if (i === 0) return;
        tl.to(layers[i - 1], { autoAlpha: 0, duration: 0.5 }, i)
          .to(titles[i - 1], { autoAlpha: 0, y: -22, duration: 0.5 }, i)
          .to(layers[i], { autoAlpha: 1, duration: 0.5 }, i)
          .to(titles[i], { autoAlpha: 1, y: 0, duration: 0.5 }, i + 0.15);
      });
    },
    { scope: containerRef },
  );

  return (
    <section className="relative bg-ink text-bone">
      <div
        ref={containerRef}
        style={{ height: `${steps.length * 100}vh` }}
        className="relative"
      >
        <div ref={panelRef} className="relative h-screen w-full overflow-hidden">
          {steps.map((room, i) => (
            <div
              key={room.id}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="absolute inset-0"
            >
              <Image
                src={room.image}
                alt={room.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
            </div>
          ))}

          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 sm:pb-24">
              <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-brass">
                Scroll to explore
              </p>
              <div className="relative h-[9rem] sm:h-32">
                {steps.map((room, i) => (
                  <div
                    key={room.id}
                    ref={(el) => {
                      titleRefs.current[i] = el;
                    }}
                    className="absolute inset-0"
                  >
                    <p className="font-display text-sm text-bone/60">{room.number}</p>
                    <h3 className="mt-2 text-[clamp(2rem,5vw,3.75rem)] font-display leading-none">
                      {room.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm text-bone/70">
                      {room.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 sm:right-10 sm:flex">
            {steps.map((room, i) => (
              <span
                key={room.id}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="w-px bg-bone/25 transition-colors"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
