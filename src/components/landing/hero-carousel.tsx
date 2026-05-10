"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, type ComponentType, type SVGProps } from "react";

import {
  InternationalIllustration,
  SecurityIllustration,
  TrackingIllustration,
} from "@/components/landing/hero-illustrations";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
};

const ROTATE_MS = 7000;

const ILLUSTRATIONS: ComponentType<SVGProps<SVGSVGElement>>[] = [
  TrackingIllustration,
  InternationalIllustration,
  SecurityIllustration,
];

export function HeroCarousel() {
  const t = useTranslations("landing.hero");
  const slides = t.raw("slides") as Slide[];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = slides.length;
  const next = useCallback(
    () => setIndex((i) => (i + 1) % total),
    [total]
  );
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(next, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [next, paused]);

  return (
    <section
      id="hero"
      aria-roledescription="carousel"
      aria-label={t("ariaLabel")}
      className="relative overflow-hidden border-b border-border/60 scroll-mt-20"
    >
      {/* Background ambience */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 via-background to-background"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-105 bg-[radial-gradient(circle_at_30%_-10%,var(--color-primary)_0%,transparent_55%)] opacity-15"
      />

      <div className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="relative">
          {slides.map((slide, i) => {
            const Illustration = ILLUSTRATIONS[i % ILLUSTRATIONS.length];
            const isActive = i === index;
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${total}`}
                aria-hidden={!isActive}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isActive
                    ? "relative opacity-100 translate-y-0"
                    : "absolute inset-0 opacity-0 translate-y-3 pointer-events-none"
                )}
              >
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className="text-center lg:text-left">
                    <p
                      className={cn(
                        "bg-primary/10 text-primary inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-xs font-medium uppercase tracking-wider",
                        "transition-all duration-700",
                        isActive ? "opacity-100 translate-y-0 delay-100" : "opacity-0 translate-y-2"
                      )}
                    >
                      {slide.eyebrow}
                    </p>
                    <h1
                      className={cn(
                        "mt-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl",
                        "transition-all duration-700",
                        isActive ? "opacity-100 translate-y-0 delay-200" : "opacity-0 translate-y-3"
                      )}
                    >
                      {slide.title}
                    </h1>
                    <p
                      className={cn(
                        "text-muted-foreground mt-6 text-balance text-lg md:text-xl",
                        "transition-all duration-700",
                        isActive ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-3"
                      )}
                    >
                      {slide.subtitle}
                    </p>
                    <div
                      className={cn(
                        "mt-10 flex flex-wrap justify-center gap-3 lg:justify-start",
                        "transition-all duration-700",
                        isActive ? "opacity-100 translate-y-0 delay-[400ms]" : "opacity-0 translate-y-3"
                      )}
                    >
                      <Link
                        href="/track"
                        className={cn(buttonVariants({ size: "lg" }), "gap-2")}
                      >
                        {slide.primaryCta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <a
                        href="#services"
                        className={buttonVariants({ variant: "outline", size: "lg" })}
                      >
                        {slide.secondaryCta}
                      </a>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "relative mx-auto w-full max-w-xl transition-all duration-700",
                      isActive ? "opacity-100 scale-100 delay-150" : "opacity-0 scale-95"
                    )}
                  >
                    <Illustration className="h-auto w-full drop-shadow-xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label={t("previous")}
            className="hover:bg-muted text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t("goToSlide", { n: i + 1 })}
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

          <button
            type="button"
            onClick={next}
            aria-label={t("next")}
            className="hover:bg-muted text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? t("play") : t("pause")}
            className="hover:bg-muted text-muted-foreground hover:text-foreground ml-2 flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
}
