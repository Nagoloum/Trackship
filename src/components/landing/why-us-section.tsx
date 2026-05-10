import {
  BadgeEuro,
  Eye,
  Globe2,
  Headphones,
  Radar,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionHeader } from "@/components/landing/services-section";

type Reason = { title: string; body: string };

const ICONS: LucideIcon[] = [Globe2, Radar, ShieldCheck, Eye, Headphones, BadgeEuro];

export function WhyUsSection() {
  const t = useTranslations("landing.whyUs");
  const reasons = t.raw("reasons") as Reason[];

  return (
    <section
      id="why-us"
      className="container mx-auto max-w-6xl px-4 py-20 md:py-24 scroll-mt-20"
    >
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={i}
              className="bg-card text-card-foreground flex gap-4 rounded-xl border p-6 shadow-sm"
            >
              <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{reason.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {reason.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
