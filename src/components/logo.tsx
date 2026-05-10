"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function Logo({
  className,
  width = 140,
  height = 36,
  priority,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: render the light variant by default until mounted.
  const src =
    mounted && resolvedTheme === "dark"
      ? "/trackship-dark.png"
      : "/trackship-light.png";

  return (
    <Image
      src={src}
      alt="Trackship"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
    />
  );
}
