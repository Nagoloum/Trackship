import { History as HistoryIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  ReceiptsDataTable,
  type AdminReceiptRow,
} from "@/components/dashboard/receipts-data-table";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_TABLE_LIMIT = 500;

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.history");

  const supabase = createAdminClient();
  const { data: rawReceipts } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, language, issued_at, orders(id, code, recipient_name, destination, destination_country)"
    )
    .order("issued_at", { ascending: false })
    .limit(ADMIN_TABLE_LIMIT);

  const receipts = (rawReceipts ?? []) as unknown as AdminReceiptRow[];

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
        <ReceiptsDataTable
          receipts={receipts}
          locale={locale}
          viewOrderLabel={t("viewOrder")}
          downloadsLabel={t("downloads")}
          columns={{
            number: t("columns.number"),
            order: t("columns.order"),
            recipient: t("columns.recipient"),
            destination: t("columns.destination"),
            language: t("columns.language"),
            issued: t("columns.issued"),
          }}
        />
      )}
    </div>
  );
}
