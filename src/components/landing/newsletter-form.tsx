"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ className }: { className?: string }) {
  const t = useTranslations("footer.newsletter");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_REGEX.test(email)) return;
    // Newsletter wiring (storage, ESP) will land in a later phase.
    // For now we only acknowledge to the user.
    setSubmitted(true);
    setEmail("");
  };

  if (submitted) {
    return (
      <p
        role="status"
        className={cn(
          "text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-2 text-sm",
          className
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        required
        className="bg-background flex-1"
      />
      <Button type="submit" disabled={!EMAIL_REGEX.test(email)}>
        {t("submit")}
      </Button>
    </form>
  );
}
