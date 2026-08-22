"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, animate, type PanInfo } from "motion/react";
import { rooms } from "@/data/rooms";
import { useCursor } from "@/context/CursorContext";
import ArrowIcon from "../ui/ArrowIcon";

export default function RoomShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const x = useMotionValue(0);
  const [active, setActive] = useState(0);
  const { show, hide } = useCursor();

  function getBounds() {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return { min: 0, max: 0 };
    return { min: -(track.scrollWidth - container.clientWidth), max: 0 };
  }

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(rooms.length - 1, index));
    const slide = slideRefs.current[clamped];
    if (!slide) return;
    const { min, max } = getBounds();
    const target = Math.max(min, Math.min(max, -slide.offsetLeft));
    animate(x, target, { type: "spring", stiffness: 200, damping: 30, mass: 0.6 });
    setActive(clamped);
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    const { min, max } = getBounds();
    const projected = Math.max(min, Math.min(max, x.get() + info.velocity.x * 0.22));

    let nearestIndex = 0;
    let nearestDist = Infinity;
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;
      const dist = Math.abs(-slide.offsetLeft - projected);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });
    goTo(nearestIndex);
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
                aria-label="Previous room"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                onClick={() => goTo(active + 1)}
                aria-label="Next room"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="pl-6 sm:pl-10">
        <motion.div
          ref={trackRef}
          className="flex cursor-grab gap-5 active:cursor-grabbing"
          style={{ x }}
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0.15}
          dragMomentum={false}
          dragTransition={{ power: 0.2, timeConstant: 150 }}
          onDragEnd={handleDragEnd}
        >
          {rooms.map((room, i) => (
            <div
              key={room.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              onMouseEnter={() => show("Drag")}
              onMouseLeave={hide}
              className="relative aspect-3/4 w-[78vw] flex-none overflow-hidden sm:w-[46vw] lg:w-[32vw]"
            >
              <Image
                src={room.image}
                alt={room.title}
                fill
                draggable={false}
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 78vw"
                className="pointer-events-none object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-sm text-bone/70">{room.number}</p>
                <p className="mt-1 font-display text-2xl text-bone">{room.title}</p>
                <p className="mt-2 max-w-xs text-sm text-bone/70">{room.description}</p>
              </div>
            </div>
          ))}
          <div className="w-1 flex-none sm:w-4" />
        </motion.div>
      </div>
    </section>
  );
}
