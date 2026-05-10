import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionHeader } from "@/components/landing/services-section";

type Testimonial = { quote: string; name: string; role: string };

export function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");
  const items = t.raw("items") as Testimonial[];

  return (
    <section className="container mx-auto max-w-6xl px-4 py-20 md:py-24">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {items.map((item, i) => (
          <figure
            key={i}
            className="bg-card text-card-foreground relative rounded-xl border p-6 shadow-sm"
          >
            <Quote className="text-primary/30 absolute right-5 top-5 h-8 w-8" aria-hidden />
            <blockquote className="text-sm leading-relaxed">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-muted-foreground text-xs">{item.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
