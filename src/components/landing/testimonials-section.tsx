"use client";

import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/landing/services-section";
import { cn } from "@/lib/utils";

type Testimonial = { quote: string; name: string; role: string };

export function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");
  const items = t.raw("items") as Testimonial[];
  const [index, setIndex] = useState(0);
  const total = items.length;

  const go = (next: number) => setIndex((next + total) % total);

  return (
    <section
      id="testimonials"
      className="container mx-auto max-w-6xl px-4 py-20 md:py-24 scroll-mt-20"
    >
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="relative mt-14">
        {/* Carousel viewport */}
        <div
          aria-roledescription="carousel"
          aria-label={t("title")}
          className="relative overflow-hidden"
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${total}`}
                aria-hidden={i !== index}
                className="w-full shrink-0 px-2 md:px-6"
              >
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            aria-label={t("previous")}
            onClick={() => go(index - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t("goTo", { n: i + 1 })}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-3"
                )}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            aria-label={t("next")}
            onClick={() => go(index + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="bg-card text-card-foreground relative mx-auto max-w-3xl rounded-2xl border p-8 shadow-sm md:p-12">
      <Quote
        className="text-primary/20 absolute right-6 top-6 h-12 w-12"
        aria-hidden
      />
      <div className="text-amber-500 flex items-center gap-1" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-5 text-balance text-base leading-relaxed md:text-lg">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 border-t pt-5">
        <p className="font-semibold">{item.name}</p>
        <p className="text-muted-foreground text-sm">{item.role}</p>
      </figcaption>
    </figure>
  );
}
