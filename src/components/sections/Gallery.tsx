"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { galleryImages, type GalleryImage } from "@/data/gallery";
import { useCursor } from "@/context/CursorContext";
import RevealText from "../ui/RevealText";
import Lightbox from "../ui/Lightbox";

const spanClasses: Record<GalleryImage["span"], string> = {
  large: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  small: "col-span-1 row-span-1",
};

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { show, hide } = useCursor();

  useGSAP(
    () => {
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const distance = 22 + (i % 3) * 10;
        const direction = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(
          el,
          { y: -distance * direction },
          {
            y: distance * direction,
            ease: "none",
            scrollTrigger: {
              trigger: el,
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
    <section id="gallery" ref={sectionRef} className="bg-paper py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-2xl">
          <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
            Gallery
          </RevealText>
          <RevealText
            as="h2"
            className="mt-6 text-[clamp(2.25rem,5.4vw,4.75rem)] font-display leading-[1.05] text-ink"
          >
            A closer look
          </RevealText>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-2 grid-flow-dense gap-2.5 px-6 sm:grid-cols-4 sm:gap-3 sm:px-10">
        {galleryImages.map((img, i) => (
          <div
            key={img.id}
            className={`relative overflow-hidden ${spanClasses[img.span]}`}
          >
            <div
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute inset-[-8%] cursor-pointer"
              onClick={() => setLightboxIndex(i)}
              onMouseEnter={() => show("View")}
              onMouseLeave={hide}
            >
              <Image
                src={img.image}
                alt={img.alt}
                fill
                sizes="(min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
              />
            </div>
          </div>
        ))}
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
