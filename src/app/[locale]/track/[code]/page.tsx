import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  ImageIcon,
  Lightbulb,
  Mail,
  MapPin,
  Package,
  PackageSearch,
  QrCode,
  Search,
  Send,
  User,
  Weight,
} from "lucide-react";
import Image from "next/image";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { COMPANY } from "@/lib/company";
import { normalizeOrderItems } from "@/lib/order-items";
import { recipientAddressLines, resolveSender } from "@/lib/receipt-order";
import { generateQrDataUrl, publicTrackingUrl } from "@/lib/qr-barcode";
import { lookupTracking } from "@/lib/tracking-lookup";
import { normalizeTrackingCode } from "@/lib/tracking-code";
import { cn } from "@/lib/utils";

// ISR: cache the rendered page for 30 s on the CDN edge. Admin order/event
// updates already call revalidatePath, so changes propagate within seconds
// without the page being recomputed for every visitor.
export const revalidate = 30;

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code: rawCode } = await params;
  setRequestLocale(locale);

  const code = normalizeTrackingCode(decodeURIComponent(rawCode));
  const order = await lookupTracking(code);
  const orderItems = order ? normalizeOrderItems(order.items) : [];

  const tc = await getTranslations("common");
  const td = await getTranslations("track.details");
  const tr = await getTranslations("track.receipt");
  const tForm = await getTranslations("dashboard.orders.form");
  const tCategory = await getTranslations("productCategory");
  const format = await getFormatter();

  // Use the configured app URL (set via NEXT_PUBLIC_APP_URL) so the QR points
  // at the canonical domain and the page can be statically cached without
  // touching headers() (which would force the route dynamic).
  const qrDataUrl = order
    ? await generateQrDataUrl(publicTrackingUrl("", order.code, locale), 280)
    : null;
  const pdfHref = order
    ? `/api/track/${order.code}/pdf?lang=${locale}&download=1`
    : "";
  const pngHref = order
    ? `/api/track/${order.code}/png?lang=${locale}&download=1`
    : "";

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6">
          <Link
            href="/track"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {tc("backToTracking")}
          </Link>
        </div>

        {!order ? (
          <NotFoundView code={code} />
        ) : (
          // 12-col layout on lg+: main content (9/12) + receipt sidebar (3/12).
          // Stacks naturally on smaller screens.
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-9">
              {/* Order info */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardDescription className="text-xs uppercase tracking-wider">
                        {td("trackingCode")}
                      </CardDescription>
                      <CardTitle className="mt-1 break-all font-mono text-2xl">
                        {order.code}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">
                        {td("currentStatus")}
                      </p>
                      <div className="mt-1">
                        <StatusBadge
                          status={order.current_status}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
                  <DetailRow
                    icon={<User className="h-4 w-4" />}
                    label={td("recipient")}
                    value={order.recipient_name}
                  />
                  {recipientAddressLines(order).length > 0 && (
                    <DetailRow
                      icon={<MapPin className="h-4 w-4" />}
                      label={td("recipientAddress")}
                      value={recipientAddressLines(order).join(" · ")}
                    />
                  )}
                  {order.recipient_delivery_hours && (
                    <DetailRow
                      icon={<Clock className="h-4 w-4" />}
                      label={td("deliveryHours")}
                      value={order.recipient_delivery_hours}
                    />
                  )}
                  {(() => {
                    const sender = resolveSender(order);
                    return (
                      <DetailRow
                        icon={<Send className="h-4 w-4" />}
                        label={td("sender")}
                        value={[sender.name, ...sender.lines].join(" · ")}
                      />
                    );
                  })()}
                  <DetailRow
                    icon={<Package className="h-4 w-4" />}
                    label={td("createdAt")}
                    value={format.dateTime(new Date(order.created_at), {
                      dateStyle: "medium",
                    })}
                  />
                  <DetailRow
                    icon={<MapPin className="h-4 w-4" />}
                    label={td("origin")}
                    value={`${order.origin} (${order.origin_country})`}
                  />
                  <DetailRow
                    icon={<MapPin className="h-4 w-4" />}
                    label={td("destination")}
                    value={`${order.destination} (${order.destination_country})`}
                  />
                  {order.weight_kg != null && (
                    <DetailRow
                      icon={<Weight className="h-4 w-4" />}
                      label={td("weight")}
                      value={`${order.weight_kg} kg`}
                    />
                  )}
                  {order.declared_value != null && (
                    <DetailRow
                      icon={<Package className="h-4 w-4" />}
                      label={td("declaredValue")}
                      value={format.number(Number(order.declared_value), {
                        style: "currency",
                        currency: "EUR",
                      })}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Items in the parcel */}
              {orderItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {tForm("sections.product")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-border/60 divide-y">
                      {orderItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            {item.category && (
                              <span className="bg-primary/10 text-primary inline-block rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider">
                                {tCategory(item.category)}
                              </span>
                            )}
                            {item.description && (
                              <p className="mt-1.5 text-sm font-medium wrap-break-word">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="bg-muted text-foreground shrink-0 self-start rounded-md px-2.5 py-1 font-mono text-sm sm:self-center">
                            × {item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{td("history")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrackingTimeline events={order.events} />
                </CardContent>
              </Card>
            </div>

            {/* Receipt sidebar */}
            <aside className="lg:col-span-3">
              <Card className="lg:sticky lg:top-20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="text-base">{tr("title")}</CardTitle>
                      <CardDescription className="text-xs">
                        {tr("subtitle")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qrDataUrl && (
                    <div className="bg-muted/30 flex flex-col items-center gap-2 rounded-xl border p-4">
                      <Image
                        src={qrDataUrl}
                        alt="QR"
                        width={160}
                        height={160}
                        unoptimized
                        className="h-36 w-36"
                      />
                      <p className="text-muted-foreground inline-flex items-center gap-1 text-center text-[11px]">
                        <QrCode className="h-3 w-3" />
                        {tr("qrCaption")}
                      </p>
                    </div>
                  )}
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {tr("description")}
                  </p>
                  <div className="space-y-2">
                    <a
                      href={pdfHref}
                      className={cn(
                        buttonVariants({ size: "default" }),
                        "w-full justify-center gap-2"
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      {tr("downloadPdf")}
                    </a>
                    <a
                      href={pngHref}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "default" }),
                        "w-full justify-center gap-2"
                      )}
                    >
                      <ImageIcon className="h-4 w-4" />
                      {tr("downloadPng")}
                    </a>
                  </div>
                  <p className="text-muted-foreground inline-flex items-start gap-1 text-[11px]">
                    <Download className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{tr("hint")}</span>
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-0.5 break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

async function NotFoundView({ code }: { code: string }) {
  const tt = await getTranslations("track");
  const reasonKeys = ["typo", "notYet", "wrongLink"] as const;

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Decorative blueprint */}
      <div
        aria-hidden
        className="bg-destructive/10 pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full blur-3xl"
      />

      <Card className="relative overflow-hidden">
        {/* Top header band with floating package + magnifier badge */}
        <div className="bg-muted/40 border-border/60 relative border-b px-6 py-10 sm:px-10 sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            }}
          />
          <div className="relative flex flex-col items-center text-center">
            <span className="bg-destructive/10 text-destructive inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider">
              <PackageSearch className="h-3 w-3" />
              {tt("notFoundEyebrow")}
            </span>

            <div className="ts-float relative mt-6 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
              <span className="bg-card border-border/80 absolute inset-0 rounded-3xl border shadow-lg" />
              <Package className="text-primary relative h-12 w-12 sm:h-14 sm:w-14" />
              <span className="bg-destructive text-destructive-foreground absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-4 ring-card">
                <Search className="h-4 w-4" />
              </span>
            </div>

            <h1 className="font-heading mt-6 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {tt("notFoundTitle")}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg text-balance text-sm sm:text-base">
              {tt("notFoundBody", { code })}
            </p>

            {/* Big mono code display */}
            <div className="mt-6 inline-flex flex-col items-center">
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
                {tt("notFoundCodeLabel")}
              </span>
              <span className="bg-card border-border/70 text-foreground mt-1.5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-base sm:text-lg">
                <span className="bg-destructive h-2 w-2 rounded-full" />
                {code}
              </span>
            </div>
          </div>
        </div>

        {/* Reasons + CTAs */}
        <CardContent className="p-6 sm:p-10">
          <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-md">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  {tt("notFoundReasonsTitle")}
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {reasonKeys.map((key) => (
                  <li
                    key={key}
                    className="bg-muted/30 border-border/60 flex items-start gap-3 rounded-lg border p-3"
                  >
                    <span className="bg-primary/15 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                      {reasonKeys.indexOf(key) + 1}
                    </span>
                    <p className="text-sm leading-relaxed">
                      {tt(`notFoundReasons.${key}`)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="bg-primary/5 border-primary/20 flex flex-col gap-3 rounded-lg border p-5">
                <Link
                  href="/track"
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "w-full justify-center gap-2"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {tt("notFoundRetry")}
                </Link>
                <Link
                  href={{ pathname: "/", query: { to: "contact" } }}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "w-full justify-center gap-2"
                  )}
                >
                  <Mail className="h-4 w-4" />
                  {tt("notFoundContact")}
                </Link>
                <p className="text-muted-foreground mt-1 text-center text-[11px] leading-relaxed">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {COMPANY.email}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
