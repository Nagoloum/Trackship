"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
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
    <div className="space-y-2">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 sm:flex-row"
        noValidate
      >
        <Input
          name="code"
          placeholder={tc("trackPlaceholder")}
          className="flex-1"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          aria-invalid={!!error}
          aria-describedby={error ? "tracking-error" : undefined}
        />
        <Button type="submit" size="lg" disabled={pending} className="gap-2">
          <Search className="h-4 w-4" />
          {tc("search")}
        </Button>
      </form>
      {error && (
        <p id="tracking-error" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
