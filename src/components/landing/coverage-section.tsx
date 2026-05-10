import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionHeader } from "@/components/landing/services-section";

type Region = { name: string; countries: string };

export function CoverageSection() {
  const t = useTranslations("landing.coverage");
  const regions = t.raw("regions") as Region[];

  return (
    <section
      id="coverage"
      className="bg-muted/30 border-y border-border/60 scroll-mt-20"
    >
      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-24">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {regions.map((region, i) => (
            <div
              key={i}
              className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
                  <MapPin className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-semibold">{region.name}</h3>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {region.countries}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
