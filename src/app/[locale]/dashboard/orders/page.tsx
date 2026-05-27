import { ArrowRight, Plus } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { CsvToolbar } from "@/components/dashboard/csv-toolbar";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

type OrderRow = {
  id: string;
  code: string;
  recipient_name: string;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  current_status: string;
  created_at: string;
};

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.orders.list");
  const td = await getTranslations("dashboard.orders");
  const format = await getFormatter();

  const supabase = createAdminClient();
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select(
      "id, code, recipient_name, origin, origin_country, destination, destination_country, current_status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (rawOrders ?? []) as OrderRow[];

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
        <>
          {/* Mobile: stacked cards */}
          <ul className="space-y-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/dashboard/orders/${o.id}`}
                  className="bg-card text-card-foreground hover:border-primary/40 block rounded-xl border p-4 shadow-sm transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all font-mono text-xs text-primary">
                        {o.code}
                      </p>
                      <p className="mt-1 truncate font-medium">
                        {o.recipient_name}
                      </p>
                    </div>
                    <StatusBadge status={o.current_status} className="shrink-0" />
                  </div>
                  <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                    <span className="truncate">
                      {o.origin} ({o.origin_country})
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {o.destination} ({o.destination_country})
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {format.dateTime(new Date(o.created_at), { dateStyle: "medium" })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("columns.code")}</TableHead>
                    <TableHead>{t("columns.recipient")}</TableHead>
                    <TableHead>{t("columns.route")}</TableHead>
                    <TableHead>{t("columns.status")}</TableHead>
                    <TableHead>{t("columns.created")}</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">{t("columns.actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="text-primary font-mono text-xs hover:underline"
                        >
                          {o.code}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {o.recipient_name}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                          <span>{o.origin_country}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{o.destination_country}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.current_status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                        {format.dateTime(new Date(o.created_at), {
                          dateStyle: "medium",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          {t("open")}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
