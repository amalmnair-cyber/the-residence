"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { galleryImages } from "@/data/gallery";
import { useCursor } from "@/context/CursorContext";
import RevealText from "../ui/RevealText";
import Lightbox from "../ui/Lightbox";

const COUNT = galleryImages.length;
const VH_PER_IMAGE = 45;

export default function Gallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imgRefs = useRef<Array<HTMLImageElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { show, hide } = useCursor();

  useGSAP(
    () => {
      const layers = layerRefs.current;
      const imgs = imgRefs.current;
      if (!containerRef.current || !panelRef.current) return;
      if (layers.some((l) => !l) || imgs.some((im) => !im)) return;

      gsap.set(layers, { autoAlpha: 0 });
      gsap.set(layers[0], { autoAlpha: 1 });
      gsap.set(imgs, { scale: 1 });
      gsap.set(dotRefs.current[0], { backgroundColor: "var(--color-brass)", width: 22 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          pin: panelRef.current,
          onUpdate: (self) => {
            const idx = Math.min(COUNT - 1, Math.floor(self.progress * COUNT));
            dotRefs.current.forEach((dot, i) => {
              if (!dot) return;
              gsap.set(dot, {
                backgroundColor: i === idx ? "var(--color-brass)" : "rgba(243,239,231,0.3)",
                width: i === idx ? 22 : 7,
              });
            });
          },
        },
      });

      galleryImages.forEach((_, i) => {
        tl.fromTo(imgs[i], { scale: 1 }, { scale: 1.5, ease: "none", duration: 1 }, i);
        if (i > 0) {
          tl.to(layers[i - 1], { autoAlpha: 0, duration: 0.32, ease: "power1.in" }, i - 0.16).to(
            layers[i],
            { autoAlpha: 1, duration: 0.32, ease: "power1.out" },
            i - 0.16,
          );
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <section id="gallery" className="relative bg-ink">
      <div className="px-6 pt-28 text-center sm:pt-36">
        <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
          Gallery
        </RevealText>
        <RevealText
          as="h2"
          className="mt-6 text-[clamp(2.25rem,5.4vw,4.75rem)] font-display leading-[1.05] text-bone"
        >
          A walk through
        </RevealText>
        <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-bone/45">
          Scroll to continue
        </p>
      </div>

      <div
        ref={containerRef}
        style={{ height: `${COUNT * VH_PER_IMAGE}vh` }}
        className="relative mt-16"
      >
        <div ref={panelRef} className="relative h-screen w-full overflow-hidden">
          {galleryImages.map((img, i) => (
            <div
              key={img.id}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              onClick={() => setLightboxIndex(i)}
              onMouseEnter={() => show("View")}
              onMouseLeave={hide}
              className="absolute inset-0 cursor-pointer overflow-hidden"
            >
              <Image
                ref={(el) => {
                  imgRefs.current[i] = el;
                }}
                src={img.image}
                alt={img.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/25" />
              <p className="pointer-events-none absolute bottom-8 left-6 font-display text-sm text-bone/70 sm:left-10">
                {String(i + 1).padStart(2, "0")}
                <span className="text-bone/40"> / {String(COUNT).padStart(2, "0")}</span>
              </p>
            </div>
          ))}

          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center gap-2 sm:bottom-10">
            {galleryImages.map((img, i) => (
              <span
                key={img.id}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="h-1.5 rounded-full bg-bone/30 transition-[width] duration-200"
              />
            ))}
          </div>
        </div>
      </div>

      <Lightbox
        images={galleryImages.map((g) => ({ src: g.image, alt: g.alt }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
