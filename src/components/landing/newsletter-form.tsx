"use client";

import { Mail, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * Cosmetic-only newsletter card. Replaces the previous functional form so we
 * don't lie to users about being subscribed when there is no ESP wired up yet.
 * Re-introduce a real form when storage + sending are ready.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const t = useTranslations("footer.newsletter");

  return (
    <div
      className={cn(
        "group bg-card text-card-foreground relative overflow-hidden rounded-xl border p-4 shadow-sm",
        className
      )}
    >
      {/* Soft animated gradient halo behind the icon */}
      <span
        aria-hidden
        className="bg-primary/15 pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full blur-2xl ts-newsletter-halo"
      />

      <div className="relative flex items-start gap-3">
        <span className="bg-primary/10 text-primary relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Mail className="h-5 w-5 ts-newsletter-mail" />
          <Sparkles className="text-primary absolute -right-1 -top-1 h-3.5 w-3.5 ts-newsletter-spark" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{t("body")}</span>
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
            {t("notice")}
          </p>
          <span className="bg-primary/10 text-primary mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider">
            <span className="bg-primary relative flex h-1.5 w-1.5 rounded-full">
              <span className="bg-primary absolute inset-0 rounded-full ts-newsletter-ping" />
            </span>
            {t("comingSoon")}
          </span>
        </div>
      </div>
    </div>
  );
}
