"use client";

import { LogOut, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { logoutAction } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function DashboardTopbar({ email }: { email: string }) {
  const t = useTranslations("dashboard.topbar");
  const locale = useLocale();

  return (
    <header className="bg-background/85 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full">
          <User className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("signedInAs")}
          </p>
          <p className="text-sm font-medium">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <Button variant="ghost" size="sm" type="submit" className="ml-1 gap-2">
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </form>
      </div>
    </header>
  );
}
