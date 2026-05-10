import {
  AlertCircle,
  Download,
  FileText,
  ImageIcon,
  MapPin,
  Package,
  QrCode,
  User,
  Weight,
} from "lucide-react";
import Image from "next/image";
import { headers } from "next/headers";
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
import { normalizeOrderItems } from "@/lib/order-items";
import { generateQrDataUrl, publicTrackingUrl } from "@/lib/qr-barcode";
import { lookupTracking } from "@/lib/tracking-lookup";
import { normalizeTrackingCode } from "@/lib/tracking-code";
import { cn } from "@/lib/utils";

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
  const tt = await getTranslations("track");
  const td = await getTranslations("track.details");
  const tr = await getTranslations("track.receipt");
  const tForm = await getTranslations("dashboard.orders.form");
  const tCategory = await getTranslations("productCategory");
  const format = await getFormatter();

  const headerStore = await headers();
  const host = headerStore.get("host");
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "";
  const qrDataUrl = order
    ? await generateQrDataUrl(publicTrackingUrl(origin, order.code, locale), 280)
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
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>{tt("notFoundTitle")}</CardTitle>
                  <CardDescription>
                    {tt("notFoundBody", { code })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
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
