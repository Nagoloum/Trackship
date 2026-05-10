"use client";

import { FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { createReceiptAction } from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";

const LANGUAGES = ["fr", "en", "es", "de"] as const;

export function GenerateReceipt({ orderId }: { orderId: string }) {
  const t = useTranslations("dashboard.invoices");
  const tLang = useTranslations("language");
  const locale = useLocale();
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        await createReceiptAction({ status: "idle" }, formData);
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground font-medium uppercase tracking-wider">
          {t("language")}
        </span>
        <select
          name="language"
          defaultValue={locale}
          className="border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 h-8 rounded-md border px-2 text-sm transition-colors outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {tLang(l)}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" size="sm" disabled={pending} className="gap-2">
        <FileText className="h-4 w-4" />
        {pending ? t("generating") : t("generate")}
      </Button>
    </form>
  );
}
