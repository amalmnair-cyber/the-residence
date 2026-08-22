"use client";

import { useEffect } from "react";
import Image from "next/image";
import ArrowIcon from "./ArrowIcon";
import { cn } from "@/lib/cn";

export interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null;
  const current = index !== null ? images[index] : null;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (index === null) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, images.length, onClose, onNavigate]);

  return (
    <div
      aria-hidden={!open}
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-[95] flex items-center justify-center bg-ink/96 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        className="absolute right-6 top-6 z-10 cursor-pointer text-[12px] uppercase tracking-[0.15em] text-bone/70 transition-colors hover:text-bone"
      >
        Close
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (index !== null) onNavigate((index - 1 + images.length) % images.length);
        }}
        aria-label="Previous image"
        tabIndex={open ? 0 : -1}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer p-3 text-bone/70 transition-colors hover:text-bone sm:left-8"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (index !== null) onNavigate((index + 1) % images.length);
        }}
        aria-label="Next image"
        tabIndex={open ? 0 : -1}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer p-3 text-bone/70 transition-colors hover:text-bone sm:right-8"
      >
        <ArrowIcon direction="right" />
      </button>

      {current && (
        <div
          key={index}
          onClick={(e) => e.stopPropagation()}
          className="relative h-[72vh] w-[88vw] animate-[lightbox-in_0.4s_ease-out] sm:h-[78vh] sm:w-[80vw] lg:w-[65vw]"
        >
          <Image src={current.src} alt={current.alt} fill sizes="80vw" className="object-contain" />
        </div>
      )}

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] tracking-[0.1em] text-bone/45">
        {index !== null ? index + 1 : 0} / {images.length}
      </p>
    </div>
  );
}
