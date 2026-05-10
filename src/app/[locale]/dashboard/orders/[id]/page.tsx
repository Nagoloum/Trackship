import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  FileText,
  ImageIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AddEventForm } from "@/components/dashboard/add-event-form";
import { DeleteConfirmTranslated } from "@/components/dashboard/delete-confirm";
import { GenerateReceipt } from "@/components/dashboard/generate-receipt";
import { StatusBadge } from "@/components/status-badge";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteReceiptAction } from "@/app/actions/invoices";
import { deleteOrderAction, deleteTrackingEventAction } from "@/app/actions/orders";
import { cn } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.orders.detail");
  const td = await getTranslations("track.details");
  const tc = await getTranslations("common");
  const format = await getFormatter();

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        code,
        recipient_name,
        recipient_email,
        recipient_phone,
        recipient_address,
        origin,
        origin_country,
        destination,
        destination_country,
        weight_kg,
        declared_value,
        current_status,
        notes,
        created_at,
        updated_at,
        tracking_events ( id, status, location, description, event_at ),
        invoices ( id, invoice_number, language, issued_at )
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  const ti = await getTranslations("dashboard.invoices");

  const events = (order.tracking_events ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.event_at).getTime() - new Date(a.event_at).getTime()
    );

  const invoices = (order.invoices ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/dashboard/orders"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            {tc("back")}
          </Link>
          <h1 className="mt-3 break-all font-mono text-xl text-primary md:text-2xl">
            {order.code}
          </h1>
          <p className="mt-1.5 text-2xl font-bold tracking-tight md:text-3xl">
            {order.recipient_name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/orders/${order.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            <Edit3 className="h-4 w-4" />
            {t("edit")}
          </Link>
          <DeleteConfirmTranslated
            type="order"
            hiddenFields={{ id: order.id, locale }}
            action={deleteOrderAction}
          />
        </div>
      </div>

      {/* Order info */}
      <section className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            {t("info")}
          </h2>
          <StatusBadge status={order.current_status} className="text-sm" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailRow icon={<MapPin className="h-4 w-4" />} label={td("origin")}>
            {order.origin} ({order.origin_country})
          </DetailRow>
          <DetailRow
            icon={<MapPin className="h-4 w-4" />}
            label={td("destination")}
          >
            {order.destination} ({order.destination_country})
          </DetailRow>
          {order.recipient_email && (
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
              <span className="break-all">{order.recipient_email}</span>
            </DetailRow>
          )}
          {order.recipient_phone && (
            <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone">
              {order.recipient_phone}
            </DetailRow>
          )}
          {order.recipient_address && (
            <DetailRow
              icon={<User className="h-4 w-4" />}
              label={t("address")}
              full
            >
              {order.recipient_address}
            </DetailRow>
          )}
          {order.weight_kg != null && (
            <DetailRow
              icon={<Package className="h-4 w-4" />}
              label={td("weight")}
            >
              {order.weight_kg} kg
            </DetailRow>
          )}
          {order.declared_value != null && (
            <DetailRow
              icon={<Package className="h-4 w-4" />}
              label={td("declaredValue")}
            >
              {format.number(Number(order.declared_value), {
                style: "currency",
                currency: "EUR",
              })}
            </DetailRow>
          )}
          <DetailRow
            icon={<ArrowRight className="h-4 w-4" />}
            label={td("createdAt")}
          >
            {format.dateTime(new Date(order.created_at), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </DetailRow>
          <DetailRow
            icon={<ArrowRight className="h-4 w-4" />}
            label={td("updatedAt")}
          >
            {format.dateTime(new Date(order.updated_at), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </DetailRow>
          {order.notes && (
            <DetailRow
              icon={<Edit3 className="h-4 w-4" />}
              label={t("notes")}
              full
            >
              {order.notes}
            </DetailRow>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm md:p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider">
          {td("history")}
        </h2>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">{td("noEvents")}</p>
        ) : (
          <ul className="space-y-5">
            {events.map((event, idx) => (
              <li
                key={event.id}
                className="border-border/60 group flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.status} />
                    <time
                      dateTime={event.event_at}
                      className="text-muted-foreground text-xs"
                    >
                      {format.dateTime(new Date(event.event_at), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                    {idx === 0 && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                        {t("latest")}
                      </span>
                    )}
                  </div>
                  {event.location && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-2 text-sm">{event.description}</p>
                  )}
                </div>
                <DeleteConfirmTranslated
                  type="event"
                  hiddenFields={{
                    event_id: event.id,
                    order_id: order.id,
                    locale,
                  }}
                  action={deleteTrackingEventAction}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddEventForm orderId={order.id} currentStatus={order.current_status} />

      {/* Tracking receipts */}
      <section className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              {ti("title")}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {ti("subtitleForOrder")}
            </p>
          </div>
          <GenerateReceipt orderId={order.id} />
        </div>

        {invoices.length === 0 ? (
          <p className="text-muted-foreground text-sm">{ti("emptyForOrder")}</p>
        ) : (
          <ul className="space-y-3">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="border-border/60 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="bg-primary/10 text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm font-medium">
                      {inv.invoice_number}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {format.dateTime(new Date(inv.issued_at), {
                        dateStyle: "medium",
                      })}
                      {" · "}
                      {inv.language.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <a
                    href={`/api/invoices/${inv.id}/pdf?download=1`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </a>
                  <a
                    href={`/api/invoices/${inv.id}/png?download=1`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2"
                    )}
                  >
                    <ImageIcon className="h-4 w-4" />
                    PNG
                  </a>
                  <DeleteConfirmTranslated
                    type="invoice"
                    hiddenFields={{
                      id: inv.id,
                      order_id: order.id,
                      locale,
                    }}
                    action={deleteReceiptAction}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
  full = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3", full && "sm:col-span-2")}>
      <span className="bg-muted text-muted-foreground mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium break-words">{children}</div>
      </div>
    </div>
  );
}
