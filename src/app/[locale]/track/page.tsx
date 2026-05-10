import { ArrowLeft, Package } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { TrackingForm } from "@/components/tracking-form";
import { buttonVariants } from "@/components/ui/button";
import { TRACKING_STATUSES } from "@/lib/statuses";
import { cn } from "@/lib/utils";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("common");
  const tt = await getTranslations("track");

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <DecorBackground />

        <div className="container relative mx-auto max-w-3xl px-4 py-16 md:py-20">
          {/* Hero */}
          <div className="mb-10 text-center">
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border border-primary/20 px-3 py-1 text-xs font-medium uppercase tracking-wider">
              <Package className="h-3.5 w-3.5" />
              {tt("eyebrow")}
            </span>
            <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight md:text-5xl">
              {tt("title")}
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-balance md:text-lg">
              {tt("subtitle")}
            </p>
          </div>

          {/* Search */}
          <TrackingForm />

          {/* Statuses preview */}
          <section className="mt-16">
            <div className="text-center">
              <p className="text-primary text-xs font-semibold uppercase tracking-wider">
                {tt("statusesEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                {tt("statusesTitle")}
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-balance text-sm">
                {tt("statusesSubtitle")}
              </p>
            </div>

            <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
              {TRACKING_STATUSES.map((status) => (
                <li key={status}>
                  <StatusBadge status={status} className="text-sm" />
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-2"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              {tc("back")}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function DecorBackground() {
  return (
    <>
      {/* Soft radial glow at the top, primary tinted */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-105 bg-[radial-gradient(circle_at_50%_-10%,var(--color-primary)_0%,transparent_55%)] opacity-15"
      />
      {/* Subtle dotted grid */}
      <svg
        aria-hidden
        className="text-primary absolute inset-0 -z-10 h-full w-full opacity-10"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="track-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#track-grid)" />
      </svg>
    </>
  );
}
