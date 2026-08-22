"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { RichRoom } from "@/data/property-content";
import ArrowIcon from "../ui/ArrowIcon";

export default function RoomShowcase({ rooms }: { rooms: RichRoom[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState(0);
  const [offset, setOffset] = useState(0);

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(rooms.length - 1, index));
    const slide = slideRefs.current[clamped];
    const container = containerRef.current;
    if (!slide || !container) return;

    const maxOffset = -(
      slide.parentElement!.scrollWidth - container.clientWidth
    );
    setOffset(Math.max(maxOffset, Math.min(0, -slide.offsetLeft)));
    setActive(clamped);
  }

  return (
    <section id="interiors" className="overflow-hidden bg-paper py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-brass">Interiors</p>
            <h2 className="mt-4 text-[clamp(2.25rem,5.4vw,4.75rem)] font-display leading-[1.05] text-ink">
              An interior world
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-display text-lg text-ink">
              {String(active + 1).padStart(2, "0")}
              <span className="text-stone"> / {String(rooms.length).padStart(2, "0")}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                aria-label="Previous room"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                onClick={() => goTo(active + 1)}
                disabled={active === rooms.length - 1}
                aria-label="Next room"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="pl-6 sm:pl-10">
        <div
          className="flex gap-5 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {rooms.map((room, i) => (
            <button
              key={room.id}
              type="button"
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              onClick={() => goTo(i)}
              aria-label={`View ${room.title}`}
              className="relative aspect-3/4 w-[78vw] flex-none cursor-pointer overflow-hidden text-left sm:w-[46vw] lg:w-[32vw]"
            >
              <Image
                src={room.image}
                alt={room.title}
                fill
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 78vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-sm text-bone/70">{room.number}</p>
                <p className="mt-1 font-display text-2xl text-bone">{room.title}</p>
                <p className="mt-2 max-w-xs text-sm text-bone/70">{room.description}</p>
              </div>
            </button>
          ))}
          <div className="w-1 flex-none sm:w-4" />
        </div>
      </div>
    </section>
  );
}
