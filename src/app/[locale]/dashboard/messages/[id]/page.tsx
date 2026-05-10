import { ArrowLeft, Calendar, Mail, MailOpen, User } from "lucide-react";
import { notFound } from "next/navigation";
import { getFormatter, getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { DeleteConfirmTranslated } from "@/components/dashboard/delete-confirm";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  deleteMessageAction,
  markMessageReadAction,
} from "@/app/actions/messages";
import { cn } from "@/lib/utils";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.messages");
  const tc = await getTranslations("common");
  const format = await getFormatter();
  const fmtLocale = await getLocale();

  const supabase = createAdminClient();
  const { data: message, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, locale, read_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !message) {
    notFound();
  }

  // Auto-mark as read on first open.
  if (!message.read_at) {
    await supabase
      .from("contact_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  }

  const unread = false; // we just marked it read

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/messages"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
      >
        <ArrowLeft className="h-4 w-4" />
        {tc("back")}
      </Link>

      <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {message.subject ?? t("noSubject")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {format.dateTime(new Date(message.created_at), {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={markMessageReadAction}>
              <input type="hidden" name="id" value={message.id} />
              <input type="hidden" name="locale" value={fmtLocale} />
              <input type="hidden" name="unread" value={unread ? "false" : "true"} />
              <Button variant="outline" size="sm" type="submit" className="gap-2">
                {unread ? (
                  <>
                    <MailOpen className="h-4 w-4" />
                    {t("markRead")}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    {t("markUnread")}
                  </>
                )}
              </Button>
            </form>
            <DeleteConfirmTranslated
              type="message"
              hiddenFields={{ id: message.id, locale: fmtLocale }}
              action={deleteMessageAction}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{message.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="text-muted-foreground h-4 w-4" />
            <a
              href={`mailto:${message.email}`}
              className="text-primary break-all hover:underline"
            >
              {message.email}
            </a>
          </div>
          {message.locale && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">
                {t("sentInLocale", { locale: message.locale.toUpperCase() })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 border-t pt-5">
          <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            {t("body")}
          </h2>
          <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed">
            {message.message}
          </p>
        </div>
      </div>
    </div>
  );
}
