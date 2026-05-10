"use client";

import { AlertCircle, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import {
  isValidTrackingCode,
  normalizeTrackingCode,
} from "@/lib/tracking-code";

export function TrackingForm() {
  const tc = useTranslations("common");
  const tt = useTranslations("track");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const code = normalizeTrackingCode(data.get("code")?.toString() ?? "");

    if (!isValidTrackingCode(code)) {
      setError(tt("invalidFormat"));
      return;
    }

    setPending(true);
    router.push(`/track/${code}`);
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={onSubmit}
        className="bg-card flex flex-col gap-2 rounded-2xl border p-2 shadow-sm focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-primary/15 sm:flex-row sm:items-center"
        noValidate
      >
        <div className="flex flex-1 items-center gap-2 px-2 sm:px-3">
          <Search className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden />
          <Input
            name="code"
            placeholder={tc("trackPlaceholder")}
            className="h-12 flex-1 border-0 bg-transparent px-0 font-mono text-base uppercase shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            aria-invalid={!!error}
            aria-describedby={error ? "tracking-error" : "tracking-help"}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-colors"
        >
          <Search className="h-4 w-4" />
          {tc("search")}
        </button>
      </form>

      {error ? (
        <p
          id="tracking-error"
          role="alert"
          className="text-destructive bg-destructive/10 inline-flex items-start gap-2 rounded-md px-3 py-2 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        <p
          id="tracking-help"
          className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs"
        >
          <span>{tt("formatHelp")}</span>
          <span aria-hidden className="hidden text-border sm:inline">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="uppercase tracking-wider">{tt("exampleLabel")}</span>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[11px]">
              {tt("exampleValue")}
            </code>
          </span>
        </p>
      )}
    </div>
  );
}
