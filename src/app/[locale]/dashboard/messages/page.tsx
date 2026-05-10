import { Mail, MailOpen } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
};

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.messages");
  const format = await getFormatter();

  const supabase = createAdminClient();
  const { data: rawMessages } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const messages = (rawMessages ?? []) as MessageRow[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
        <ul className="space-y-3">
          {messages.map((m) => {
            const unread = !m.read_at;
            return (
              <li key={m.id}>
                <Link
                  href={`/dashboard/messages/${m.id}`}
                  className={cn(
                    "bg-card text-card-foreground hover:border-primary/40 block rounded-xl border p-4 shadow-sm transition-colors",
                    unread && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          unread
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {unread ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <MailOpen className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <p className="truncate font-medium">{m.name}</p>
                          {unread && (
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                              {t("unread")}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate text-xs">
                          {m.email}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm">
                          {m.subject ?? m.message}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                      {format.dateTime(new Date(m.created_at), {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
