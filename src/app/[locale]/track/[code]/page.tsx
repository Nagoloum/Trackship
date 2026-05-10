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
import { generateQrDataUrl, publicTrackingUrl } from "@/lib/qr-barcode";
import { lookupTracking } from "@/lib/tracking-lookup";
import { normalizeTrackingCode } from "@/lib/tracking-code";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code: rawCode } = await params;
  setRequestLocale(locale);

  const code = normalizeTrackingCode(decodeURIComponent(rawCode));
  const order = await lookupTracking(code);

  const tc = await getTranslations("common");
  const tt = await getTranslations("track");
  const td = await getTranslations("track.details");
  const tr = await getTranslations("track.receipt");
  const format = await getFormatter();

  // Build the receipt download URLs and an inline QR pointing to this page,
  // using the actual host so QR scans land on the right environment.
  const headerStore = await headers();
  const host = headerStore.get("host");
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "";
  const qrDataUrl = order
    ? await generateQrDataUrl(publicTrackingUrl(origin, order.code), 280)
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
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <Link
            href="/track"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {tc("backToTracking")}
          </Link>
        </div>

        {!order ? (
          <Card>
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardDescription className="font-mono text-xs uppercase tracking-wider">
                      {td("trackingCode")}
                    </CardDescription>
                    <CardTitle className="mt-1 font-mono text-2xl">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{td("history")}</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingTimeline events={order.events} />
              </CardContent>
            </Card>

            {/* Tracking receipt (PDF + PNG) + QR code */}
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-lg">{tr("title")}</CardTitle>
                    <CardDescription>{tr("subtitle")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
                  {qrDataUrl && (
                    <div className="bg-card flex flex-col items-center gap-2 rounded-xl border p-4 shadow-sm">
                      {/* QR is base64 data URL — Next/Image needs unoptimized */}
                      <Image
                        src={qrDataUrl}
                        alt="QR"
                        width={160}
                        height={160}
                        unoptimized
                        className="h-40 w-40"
                      />
                      <p className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                        <QrCode className="h-3 w-3" />
                        {tr("qrCaption")}
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {tr("description")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={pdfHref}
                        className={cn(
                          buttonVariants({ size: "default" }),
                          "gap-2"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        {tr("downloadPdf")}
                      </a>
                      <a
                        href={pngHref}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "default" }),
                          "gap-2"
                        )}
                      >
                        <ImageIcon className="h-4 w-4" />
                        {tr("downloadPng")}
                      </a>
                    </div>
                    <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <Download className="h-3 w-3" />
                      {tr("hint")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
      <span className="bg-muted text-muted-foreground mt-0.5 flex h-7 w-7 items-center justify-center rounded-md">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
}
