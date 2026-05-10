import {
  Clock,
  FileText,
  MessageSquare,
  Package,
  TrendingUp,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { createAdminClient } from "@/lib/supabase/admin";

export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.home");

  const supabase = createAdminClient();
  const [orders, inTransit, invoices, messages] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("current_status", ["picked_up", "in_transit", "out_for_delivery"]),
    supabase.from("invoices").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null),
  ]);

  const stats = [
    {
      icon: <Package className="h-5 w-5" />,
      label: t("stats.orders"),
      value: orders.count ?? 0,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: t("stats.inTransit"),
      value: inTransit.count ?? 0,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: t("stats.invoices"),
      value: invoices.count ?? 0,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: t("stats.unreadMessages"),
      value: messages.count ?? 0,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                {s.icon}
              </span>
              <TrendingUp className="text-muted-foreground/40 h-4 w-4" />
            </div>
            <p className="text-muted-foreground mt-4 text-xs uppercase tracking-wider">
              {s.label}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
        <h2 className="text-base font-semibold">{t("nextSteps.title")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("nextSteps.subtitle")}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{t("nextSteps.items.orders")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{t("nextSteps.items.invoices")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{t("nextSteps.items.messages")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
