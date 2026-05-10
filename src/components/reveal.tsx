"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds before the animation starts. */
  delay?: number;
  /** Animation variant. `up` (default): fade + translate up. `fade`: opacity only. */
  variant?: "up" | "fade";
  /** IntersectionObserver threshold (0–1). */
  threshold?: number;
};

/**
 * Wraps content with a fade-up animation that triggers the first time the
 * element enters the viewport. Server-rendered HTML stays visually stable
 * (the element is invisible until JS hydrates and observes it).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Skip the observer entirely (and the animation) when JS isn't supported,
    // when the user prefers reduced motion, OR when the element starts in the
    // viewport (typical for the first sections after a fast load).
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      data-visible={visible || undefined}
      data-variant={variant}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn("ts-reveal", className)}
    >
      {children}
    </div>
  );
}
