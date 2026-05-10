"use client";

import { FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

import { createReceiptAction } from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";

const LANGUAGES = ["fr", "en", "es", "de"] as const;

export function GenerateReceipt({ orderId }: { orderId: string }) {
  const t = useTranslations("dashboard.invoices");
  const tLang = useTranslations("language");
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const langId = useId();

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

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={langId}
          className="text-muted-foreground text-xs uppercase tracking-wider"
        >
          {t("language")}
        </Label>
        <FormSelect
          id={langId}
          name="language"
          defaultValue={locale}
          options={LANGUAGES.map((l) => ({ value: l, label: tLang(l) }))}
          className="h-9 min-w-35"
        />
      </div>

      <Button type="submit" size="sm" disabled={pending} className="gap-2">
        <FileText className="h-4 w-4" />
        {pending ? t("generating") : t("generate")}
      </Button>
    </form>
  );
}
