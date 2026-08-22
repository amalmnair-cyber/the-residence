"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface AnimatedCounterProps {
  value: number;
  from?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  from = 0,
  duration = 1.8,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const obj = { val: from };

      gsap.to(obj, {
        val: value,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          once: true,
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.val).toLocaleString("en-US");
          }
        },
      });
    },
    { scope: ref, dependencies: [value, from] },
  );

  return (
    <span ref={ref} className={className}>
      {from.toLocaleString("en-US")}
    </span>
  );
}
