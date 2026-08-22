"use client";

import { useState } from "react";
import Image from "next/image";
import { floorPlanRooms, floorPlanBounds } from "@/data/floorplan";
import { useCursor } from "@/context/CursorContext";
import RevealText from "../ui/RevealText";

export default function FloorPlan() {
  const [activeId, setActiveId] = useState(floorPlanRooms[0].id);
  const { show, hide } = useCursor();
  const active = floorPlanRooms.find((r) => r.id === activeId)!;

  return (
    <section id="floor-plan" className="bg-paper py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="max-w-2xl">
          <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
            Floor Plan
          </RevealText>
          <RevealText
            as="h2"
            className="mt-6 text-[clamp(2.25rem,5.4vw,4.75rem)] font-display leading-[1.05] text-ink"
          >
            Explore the layout
          </RevealText>
        </div>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <svg
            viewBox="0 0 1000 640"
            className="w-full select-none"
            role="img"
            aria-label="Ground floor plan of The Residence"
          >
            <rect
              x={floorPlanBounds.x}
              y={floorPlanBounds.y}
              width={floorPlanBounds.w}
              height={floorPlanBounds.h}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth={2}
            />
            {floorPlanRooms.map((room) => {
              const isActive = room.id === activeId;
              return (
                <g
                  key={room.id}
                  onMouseEnter={() => {
                    setActiveId(room.id);
                    show("Explore");
                  }}
                  onMouseLeave={hide}
                  onClick={() => setActiveId(room.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    fill={isActive ? "var(--color-brass)" : "var(--color-bone-2)"}
                    fillOpacity={isActive ? 0.3 : 1}
                    stroke={isActive ? "var(--color-brass)" : "var(--color-line)"}
                    strokeWidth={isActive ? 2 : 1}
                    style={{ transition: "fill 0.3s, stroke 0.3s" }}
                  />
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none"
                    fill={isActive ? "var(--color-ink)" : "var(--color-stone)"}
                    style={{
                      fontSize: room.labelSize === "sm" ? 15 : 19,
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {room.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="relative">
            <div key={active.id} className="animate-[panel-in_0.45s_ease-out]">
              <div className="relative aspect-4/3 w-full overflow-hidden">
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-6 font-display text-3xl text-ink">{active.name}</h3>
              <p className="mt-2 text-sm uppercase tracking-[0.1em] text-brass">
                {active.dimensions}
              </p>
              <ul className="mt-5 space-y-2.5">
                {active.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-stone">
                    <span className="h-px w-4 bg-stone-light" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
