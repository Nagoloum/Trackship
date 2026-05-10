import { useTranslations } from "next-intl";

const KEYS = ["parcels", "countries", "onTime", "support"] as const;

export function StatsStrip() {
  const t = useTranslations("landing.stats");

  return (
    <section className="border-b border-border/60 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {KEYS.map((key) => (
            <div key={key} className="text-center">
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t(`${key}.label`)}
              </dt>
              <dd className="text-primary mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {t(`${key}.value`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
