"use client";

import type { HTMLMotionProps } from "motion/react";
import { motion } from "motion/react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "outline-light";

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  solid: "bg-ink text-bone hover:bg-ink-2",
  outline: "border border-ink/25 text-ink hover:border-ink/70",
  "outline-light": "border border-bone/30 text-bone hover:border-bone/70",
};

export default function MagneticButton({
  children,
  className,
  variant = "solid",
  ...props
}: MagneticButtonProps) {
  const { ref, style, onMouseMove, onMouseLeave } = useMagnetic<HTMLButtonElement>(0.3);

  return (
    <motion.button
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
