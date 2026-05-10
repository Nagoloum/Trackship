import { ArrowRight, FileText, History as HistoryIcon, ImageIcon } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
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

type ReceiptRow = {
  id: string;
  invoice_number: string;
  language: string;
  issued_at: string;
  orders: {
    id: string;
    code: string;
    recipient_name: string;
    destination: string;
    destination_country: string;
  } | null;
};

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.history");
  const format = await getFormatter();

  const supabase = createAdminClient();
  const { data: rawReceipts } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, language, issued_at, orders(id, code, recipient_name, destination, destination_country)"
    )
    .order("issued_at", { ascending: false })
    .limit(200);

  const receipts = (rawReceipts ?? []) as unknown as ReceiptRow[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{t("subtitle")}</p>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-xl border p-10 text-center shadow-sm">
          <HistoryIcon className="text-muted-foreground/50 mx-auto h-10 w-10" />
          <p className="text-muted-foreground mt-3 text-sm">{t("empty")}</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {receipts.map((r) => (
              <li key={r.id}>
                <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all font-mono text-sm font-medium text-primary">
                        {r.invoice_number}
                      </p>
                      <p className="mt-1 truncate font-medium">
                        {r.orders?.recipient_name ?? "—"}
                      </p>
                      {r.orders?.code && (
                        <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
                          {r.orders.code}
                        </p>
                      )}
                      {r.orders?.destination && (
                        <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                          <ArrowRight className="h-3 w-3" />
                          {r.orders.destination} ({r.orders.destination_country})
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs whitespace-nowrap">
                        {format.dateTime(new Date(r.issued_at), {
                          dateStyle: "medium",
                        })}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs uppercase">
                        {r.language}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`/api/invoices/${r.id}/pdf?download=1`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "gap-2"
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </a>
                    <a
                      href={`/api/invoices/${r.id}/png?download=1`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "gap-2"
                      )}
                    >
                      <ImageIcon className="h-4 w-4" />
                      PNG
                    </a>
                    {r.orders?.id && (
                      <Link
                        href={`/dashboard/orders/${r.orders.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "ml-auto"
                        )}
                      >
                        {t("viewOrder")}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("columns.number")}</TableHead>
                    <TableHead>{t("columns.order")}</TableHead>
                    <TableHead>{t("columns.recipient")}</TableHead>
                    <TableHead>{t("columns.destination")}</TableHead>
                    <TableHead>{t("columns.language")}</TableHead>
                    <TableHead>{t("columns.issued")}</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">{t("downloads")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs text-primary">
                        {r.invoice_number}
                      </TableCell>
                      <TableCell>
                        {r.orders?.id ? (
                          <Link
                            href={`/dashboard/orders/${r.orders.id}`}
                            className="text-primary font-mono text-xs hover:underline"
                          >
                            {r.orders.code}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-50 truncate font-medium">
                        {r.orders?.recipient_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {r.orders?.destination
                          ? `${r.orders.destination} (${r.orders.destination_country})`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs uppercase">
                        {r.language}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                        {format.dateTime(new Date(r.issued_at), { dateStyle: "medium" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <a
                            href={`/api/invoices/${r.id}/pdf?download=1`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "gap-1.5"
                            )}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            PDF
                          </a>
                          <a
                            href={`/api/invoices/${r.id}/png?download=1`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "gap-1.5"
                            )}
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            PNG
                          </a>
                        </div>
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
