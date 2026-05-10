import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaBanner() {
  const t = useTranslations("landing.cta");

  return (
    <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl px-8 py-14 md:px-14 md:py-16">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.25) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.18) 0%, transparent 40%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="max-w-xl">
            <h2 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-balance text-sm opacity-90 md:text-base">
              {t("body")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:shrink-0">
            <Link
              href="/track"
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "gap-2"
              )}
            >
              {t("primary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#contact"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              {t("secondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
