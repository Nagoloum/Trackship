import { Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  MessagesDataTable,
  type AdminMessageRow,
} from "@/components/dashboard/messages-data-table";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_TABLE_LIMIT = 500;

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.messages");

  const supabase = createAdminClient();
  const { data: rawMessages } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(ADMIN_TABLE_LIMIT);

  const messages = (rawMessages ?? []) as AdminMessageRow[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{t("subtitle")}</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-card text-card-foreground rounded-xl border p-10 text-center shadow-sm">
          <Mail className="text-muted-foreground/50 mx-auto h-10 w-10" />
          <p className="text-muted-foreground mt-3 text-sm">{t("empty")}</p>
        </div>
      ) : (
        <MessagesDataTable messages={messages} locale={locale} />
      )}
    </div>
  );
}
