import { Boxes, Globe2, ShoppingBag, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const ITEMS: Array<{ key: "express" | "international" | "ecommerce" | "custom"; icon: ReactNode }> = [
  { key: "express", icon: <Boxes className="h-6 w-6" /> },
  { key: "international", icon: <Globe2 className="h-6 w-6" /> },
  { key: "ecommerce", icon: <ShoppingBag className="h-6 w-6" /> },
  { key: "custom", icon: <Sparkles className="h-6 w-6" /> },
];

export function ServicesSection() {
  const t = useTranslations("landing.services");

  return (
    <section
      id="services"
      className="container mx-auto max-w-6xl px-4 py-20 md:py-24 scroll-mt-20"
    >
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ key, icon }) => (
          <article
            key={key}
            className="bg-card text-card-foreground hover:border-primary/40 group rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
              {icon}
            </div>
            <h3 className="text-base font-semibold">{t(`items.${key}.title`)}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {t(`items.${key}.body`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-primary text-xs font-semibold uppercase tracking-wider">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-4 text-balance">{subtitle}</p>
      )}
    </div>
  );
}
