import { Bus, Plane, Ship, Train, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionHeader } from "@/components/landing/services-section";

const ITEMS: Array<{ key: "maritime" | "aerial" | "rail" | "road"; icon: LucideIcon }> = [
  { key: "maritime", icon: Ship },
  { key: "aerial", icon: Plane },
  { key: "rail", icon: Train },
  { key: "road", icon: Bus },
];

export function TransportSection() {
  const t = useTranslations("landing.transport");

  return (
    <section
      id="transport"
      className="relative overflow-hidden border-y border-border/60 scroll-mt-20"
    >
      {/* Soft watermark of route lines */}
      <DecorRoutes />

      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-24 relative">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, icon: Icon }) => (
            <article
              key={key}
              className="bg-card text-card-foreground hover:border-primary/40 group rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">{t(`items.${key}.title`)}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {t(`items.${key}.body`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DecorRoutes() {
  return (
    <svg
      aria-hidden
      className="text-primary absolute inset-0 -z-0 h-full w-full opacity-10"
      preserveAspectRatio="none"
      viewBox="0 0 1200 600"
    >
      <defs>
        <pattern id="routes-pattern" width="240" height="120" patternUnits="userSpaceOnUse">
          <path
            d="M0 60 Q60 0 120 60 T240 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#routes-pattern)" />
    </svg>
  );
}
