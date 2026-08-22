"use client";

import { useRef, type ElementType } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";

type SplitType = "words" | "lines" | "chars";

interface RevealTextProps {
  children: string;
  as?: ElementType;
  type?: SplitType;
  className?: string;
  stagger?: number;
  start?: string;
  delay?: number;
  trigger?: "scroll" | "immediate";
  ease?: string;
  duration?: number;
}

export default function RevealText({
  children,
  as = "div",
  type = "lines",
  className,
  stagger = 0.06,
  start = "top 85%",
  delay = 0,
  trigger = "scroll",
  ease = "expo.out",
  duration = 1.1,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const split = SplitText.create(el, {
        type,
        mask: type,
        autoSplit: true,
        onSplit(self) {
          const targets =
            type === "words"
              ? self.words
              : type === "chars"
                ? self.chars
                : self.lines;

          return gsap.from(targets, {
            yPercent: 115,
            opacity: 0,
            duration,
            ease,
            stagger,
            delay,
            scrollTrigger:
              trigger === "scroll" ? { trigger: el, start } : undefined,
          });
        },
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [children, type] },
  );

  const Tag = as as "div";

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
