"use client";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  es: "🇪🇸",
  de: "🇩🇪",
};

/**
 * Public-site language picker. On `md+` it renders as a compact dropdown.
 * On small screens we use a bottom-anchored Sheet — the native dropdown is
 * cramped and clipped on phones, the Sheet gives finger-sized targets and a
 * proper title.
 */
export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const change = (next: Locale) => {
    setSheetOpen(false);
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params shape is compatible at runtime
        { pathname, params },
        { locale: next }
      );
    });
  };

  return (
    <>
      {/* Mobile: bottom Sheet */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                aria-label={t("label")}
                className="gap-2"
              />
            }
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs uppercase">{locale}</span>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
          >
            <SheetHeader className="border-border/60 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Globe className="text-primary h-4 w-4" />
                {t("label")}
              </SheetTitle>
            </SheetHeader>
            <ul className="px-2 pb-2">
              {routing.locales.map((l) => {
                const active = l === locale;
                return (
                  <li key={l}>
                    <button
                      type="button"
                      disabled={active || isPending}
                      onClick={() => change(l)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted active:bg-muted",
                        "disabled:cursor-default"
                      )}
                    >
                      <span aria-hidden className="text-xl leading-none">
                        {FLAGS[l]}
                      </span>
                      <span className="flex-1 font-medium">{t(l)}</span>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">
                        {l}
                      </span>
                      {active && (
                        <Check className="text-primary h-4 w-4 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: dropdown menu */}
      <div className="hidden md:inline-flex">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                aria-label={t("label")}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs uppercase">{locale}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {routing.locales.map((l) => (
              <DropdownMenuItem
                key={l}
                disabled={l === locale}
                onClick={() => change(l)}
              >
                <span aria-hidden className="mr-2">
                  {FLAGS[l]}
                </span>
                {t(l)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
