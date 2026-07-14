import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { CsvToolbar } from "@/components/dashboard/csv-toolbar";
import {
  OrdersDataTable,
  type AdminOrderRow,
} from "@/components/dashboard/orders-data-table";
import { buttonVariants } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRACKING_STATUSES } from "@/lib/statuses";
import { cn } from "@/lib/utils";

const ADMIN_TABLE_LIMIT = 500;

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.orders.list");
  const td = await getTranslations("dashboard.orders");
  const tStatus = await getTranslations("status");
  const statusLabels = Object.fromEntries(
    TRACKING_STATUSES.map((status) => [status, tStatus(status)])
  );

  const supabase = createAdminClient();
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select(
      "id, code, recipient_name, origin, origin_country, destination, destination_country, current_status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(ADMIN_TABLE_LIMIT);

  const orders = (rawOrders ?? []) as AdminOrderRow[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {td("title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <CsvToolbar />
          <Link
            href="/dashboard/orders/new"
            className={cn(buttonVariants({ size: "default" }), "gap-2")}
          >
            <Plus className="h-4 w-4" />
            {t("create")}
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {t("loadError")}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-xl border p-10 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
          <Link
            href="/dashboard/orders/new"
            className={cn(buttonVariants({ size: "sm" }), "mt-4 gap-2")}
          >
            <Plus className="h-4 w-4" />
            {t("create")}
          </Link>
        </div>
      ) : (
        <OrdersDataTable
          orders={orders}
          locale={locale}
          openLabel={t("open")}
          statusLabels={statusLabels}
          columns={{
            code: t("columns.code"),
            recipient: t("columns.recipient"),
            route: t("columns.route"),
            status: t("columns.status"),
            created: t("columns.created"),
            actions: t("columns.actions"),
          }}
        />
      )}
    </div>
  );
}
