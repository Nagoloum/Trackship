"use client";

import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

type NavItem = {
  key: "home" | "orders" | "invoices" | "messages";
  href: "/dashboard" | "/dashboard/orders" | "/dashboard/invoices" | "/dashboard/messages";
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  { key: "home", href: "/dashboard", icon: LayoutDashboard },
  { key: "orders", href: "/dashboard/orders", icon: Package },
  { key: "invoices", href: "/dashboard/invoices", icon: FileText },
  { key: "messages", href: "/dashboard/messages", icon: MessageSquare },
];

export function DashboardSidebar() {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  return (
    <aside className="bg-card hidden h-screen w-64 shrink-0 flex-col border-r md:sticky md:top-0 md:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo width={130} height={32} />
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
