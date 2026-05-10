"use client";

import {
  History,
  LayoutDashboard,
  MessageSquare,
  Package,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  key: "home" | "orders" | "history" | "messages";
  href:
    | "/dashboard"
    | "/dashboard/orders"
    | "/dashboard/history"
    | "/dashboard/messages";
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  { key: "home", href: "/dashboard", icon: LayoutDashboard },
  { key: "orders", href: "/dashboard/orders", icon: Package },
  { key: "history", href: "/dashboard/history", icon: History },
  { key: "messages", href: "/dashboard/messages", icon: MessageSquare },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5 px-3 py-4">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
