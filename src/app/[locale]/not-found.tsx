import { ArrowLeft, Compass, MapPinned, Package, PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 items-center overflow-hidden py-20 md:py-28">
        {/* Decorative blueprint background */}
        <div
          aria-hidden
          className="from-primary/8 pointer-events-none absolute inset-0 bg-gradient-to-b via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="bg-primary/15 pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-primary/10 pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full blur-3xl"
        />
        <DotGrid />

        <div className="container relative mx-auto max-w-3xl px-4">
          <div className="mx-auto flex flex-col items-center text-center">
            {/* Eyebrow chip */}
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider">
              <Compass className="h-3 w-3" />
              {t("eyebrow")}
            </span>

            {/* Big 404 with floating parcels */}
            <div className="relative mt-8 flex items-end justify-center gap-2 md:gap-4">
              <Digit char="4" />
              <FloatingParcel />
              <Digit char="4" />
            </div>

            <h1 className="font-heading mt-8 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl text-balance text-base md:text-lg">
              {t("subtitle")}
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className={cn(buttonVariants({ size: "lg" }), "gap-2")}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("primaryCta")}
              </Link>
              <Link
                href="/track"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2"
                )}
              >
                <PackageSearch className="h-4 w-4" />
                {t("secondaryCta")}
              </Link>
            </div>

            <p className="text-muted-foreground mt-10 inline-flex items-center gap-1.5 text-xs">
              <MapPinned className="h-3.5 w-3.5" />
              {t("support", { email: COMPANY.email })}
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Digit({ char }: { char: string }) {
  return (
    <span
      aria-hidden
      className="font-heading text-primary text-[120px] font-bold leading-none tracking-tight md:text-[180px]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, var(--color-primary) 0%, oklch(0.62 0.17 252) 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {char}
    </span>
  );
}

function FloatingParcel() {
  return (
    <span
      aria-hidden
      className="ts-float bg-primary text-primary-foreground relative flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-3xl shadow-2xl md:h-[150px] md:w-[150px]"
    >
      <Package className="h-12 w-12 md:h-20 md:w-20" />
      {/* Halo ring */}
      <span
        aria-hidden
        className="border-primary/40 absolute -inset-2 rounded-3xl border-2 border-dashed ts-float-ring"
      />
    </span>
  );
}

function DotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }}
    />
  );
}
