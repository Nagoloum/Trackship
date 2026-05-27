"use client";

import { Download, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRef, useActionState } from "react";
import { useTranslations } from "next-intl";

import { importOrdersCsvAction, type CsvImportState } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";

const INITIAL: CsvImportState = { status: "idle" };

export function CsvToolbar() {
  const t = useTranslations("dashboard.orders.csv");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(importOrdersCsvAction, INITIAL);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Export */}
      <a href="/api/orders/export-csv" download>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          {t("export")}
        </Button>
      </a>

      {/* Import */}
      <form ref={formRef} action={formAction}>
        <input
          ref={fileRef}
          type="file"
          name="csv_file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {pending ? t("importing") : t("import")}
        </Button>
      </form>

      {/* Feedback */}
      {state.status === "success" && (
        <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          {t("importSuccess", { count: state.created })}
          {state.errors.length > 0 && (
            <span className="text-muted-foreground">
              {" "}({state.errors.length} {t("importErrors")})
            </span>
          )}
        </span>
      )}
      {state.status === "error" && (
        <span className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {t(`importError_${state.message}`) || t("importError_server")}
        </span>
      )}
    </div>
  );
}
