"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useCursor } from "@/context/CursorContext";
import { useIsDesktopPointer } from "@/hooks/useMediaQuery";

export default function CustomCursor() {
  const isDesktop = useIsDesktopPointer();
  const { label } = useCursor();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    document.documentElement.classList.toggle("cursor-ready", isDesktop);
    return () => document.documentElement.classList.remove("cursor-ready");
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    function move(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [isDesktop, x, y]);

  if (!isDesktop) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[999]"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
    >
      <div
        style={{ width: label ? 100 : 9, height: label ? 100 : 9 }}
        className={
          "flex items-center justify-center rounded-full bg-ink transition-[width,height] duration-300 ease-out " +
          (label ? "" : "mix-blend-difference")
        }
      >
        {label && (
          <span
            key={label}
            className="animate-[lightbox-in_0.2s_ease-out] text-[10px] font-medium uppercase tracking-[0.18em] text-bone"
          >
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
}
