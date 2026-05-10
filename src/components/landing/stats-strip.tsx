"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type StatKey = "parcels" | "countries" | "onTime" | "support";

type StatDef = {
  key: StatKey;
  to: number;
  format: (n: number) => string;
};

const STATS_BY_LOCALE: Record<string, StatDef[]> = {
  fr: [
    { key: "parcels", to: 250000, format: (n) => `${Math.round(n / 1000)}K+` },
    { key: "countries", to: 50, format: (n) => `${Math.round(n)}+` },
    {
      key: "onTime",
      to: 99.5,
      format: (n) => `${n.toFixed(1).replace(".", ",")} %`,
    },
    { key: "support", to: 24, format: (n) => `${Math.round(n)}/7` },
  ],
  en: [
    { key: "parcels", to: 250000, format: (n) => `${Math.round(n / 1000)}K+` },
    { key: "countries", to: 50, format: (n) => `${Math.round(n)}+` },
    { key: "onTime", to: 99.5, format: (n) => `${n.toFixed(1)}%` },
    { key: "support", to: 24, format: (n) => `${Math.round(n)}/7` },
  ],
  es: [
    { key: "parcels", to: 250000, format: (n) => `${Math.round(n / 1000)}K+` },
    { key: "countries", to: 50, format: (n) => `${Math.round(n)}+` },
    {
      key: "onTime",
      to: 99.5,
      format: (n) => `${n.toFixed(1).replace(".", ",")} %`,
    },
    { key: "support", to: 24, format: (n) => `${Math.round(n)}/7` },
  ],
  de: [
    { key: "parcels", to: 250000, format: (n) => `${Math.round(n / 1000).toLocaleString("de-DE")}+` },
    { key: "countries", to: 50, format: (n) => `${Math.round(n)}+` },
    {
      key: "onTime",
      to: 99.5,
      format: (n) => `${n.toFixed(1).replace(".", ",")} %`,
    },
    { key: "support", to: 24, format: (n) => `${Math.round(n)}/7` },
  ],
};

const ANIMATION_MS = 1600;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function StatsStrip() {
  const t = useTranslations("landing.stats");

  return (
    <section className="border-b border-border/60 bg-muted/30 relative overflow-hidden">
      <DecorBackground />
      <div className="container mx-auto max-w-6xl px-4 py-12 relative">
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <Stat statKey="parcels" label={t("parcels.label")} />
          <Stat statKey="countries" label={t("countries.label")} />
          <Stat statKey="onTime" label={t("onTime.label")} />
          <Stat statKey="support" label={t("support.label")} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ statKey, label }: { statKey: StatKey; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const locale = document.documentElement.lang || "en";
    const defs = STATS_BY_LOCALE[locale] ?? STATS_BY_LOCALE.en;
    const def = defs.find((d) => d.key === statKey);
    if (!def) return;

    // Render the final value immediately for users who prefer reduced motion.
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValue(def.format(def.to));
      return;
    }

    let started = false;
    let rafId = 0;
    const startAnimation = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const ratio = Math.min(elapsed / ANIMATION_MS, 1);
        setValue(def.format(def.to * easeOutCubic(ratio)));
        if (ratio < 1) {
          rafId = window.requestAnimationFrame(tick);
        }
      };
      rafId = window.requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      startAnimation();
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          startAnimation();
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(node);

    return () => {
      obs.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [statKey]);

  return (
    <div ref={ref} className="text-center">
      <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-primary mt-2 text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
        {value || "—"}
      </dd>
    </div>
  );
}

function DecorBackground() {
  return (
    <svg
      aria-hidden
      className="text-primary absolute inset-0 h-full w-full opacity-15"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="stats-grid"
          width="36"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stats-grid)" />
    </svg>
  );
}
