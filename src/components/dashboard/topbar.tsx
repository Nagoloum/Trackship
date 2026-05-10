"use client";

import { LogOut, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { logoutAction } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function DashboardTopbar({ email }: { email: string }) {
  const t = useTranslations("dashboard.topbar");
  const locale = useLocale();

  return (
    <header className="bg-background/85 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 flex h-16 items-center gap-2 border-b px-3 backdrop-blur md:px-6">
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <User className="h-4 w-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-muted-foreground hidden text-xs uppercase tracking-wider sm:block">
            {t("signedInAs")}
          </p>
          <p className="truncate text-sm font-medium" title={email}>
            {email}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <ThemeToggle />
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="ml-1 gap-2"
            aria-label={t("logout")}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
