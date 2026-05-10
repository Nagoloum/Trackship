import { useTranslations } from "next-intl";

import { SectionHeader } from "@/components/landing/services-section";

type Step = { title: string; body: string };

export function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");
  const steps = t.raw("steps") as Step[];

  return (
    <section className="bg-muted/30 border-y border-border/60">
      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-24">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={i} className="relative">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-md">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="bg-border absolute left-10 top-5 hidden h-px w-[calc(100%-2.5rem)] md:block"
                />
              )}
              <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
