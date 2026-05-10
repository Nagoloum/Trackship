import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { TrackingForm } from "@/components/tracking-form";

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
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {tt("title")}
          </h1>
          <p className="text-muted-foreground mt-3">{tt("subtitle")}</p>
        </div>

        <TrackingForm />

        <div className="mt-8 text-center">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {tc("back")}
          </Link>
        </div>
      </main>
    </>
  );
}
