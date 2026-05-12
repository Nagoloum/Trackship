import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { getCategoryLabel, type InvoiceLocale } from "@/lib/invoice-strings";
import {
  RECEIPT_PNG_SIZE,
  ReceiptPngLayout,
} from "@/lib/receipt-png-layout";
import {
  generateBarcodeDataUrl,
  generateQrDataUrl,
  publicTrackingUrl,
} from "@/lib/qr-barcode";
import { buildReceiptOrder } from "@/lib/receipt-order";
import { lookupTracking } from "@/lib/tracking-lookup";

export const runtime = "nodejs";

const ALLOWED_LANGS = ["fr", "en", "es", "de"] as const;

/**
 * Public download of the tracking receipt for a given code, rendered as a
 * PNG (1240 x 1754). No authentication required — the same data is on the
 * public /track/[code] page. The receipt-number line is hidden because no
 * sequential admin number is assigned for the public download.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) return new Response("Missing code", { status: 400 });

  const order = await lookupTracking(decodeURIComponent(code));
  if (!order) return new Response("Not found", { status: 404 });

  const langParam = request.nextUrl.searchParams.get("lang") ?? "en";
  const language = (ALLOWED_LANGS as readonly string[]).includes(langParam)
    ? langParam
    : "en";

  const trackingUrl = publicTrackingUrl(request.nextUrl.origin, order.code, language);
  const [qrDataUrl, barcodeDataUrl] = await Promise.all([
    generateQrDataUrl(trackingUrl, 320),
    generateBarcodeDataUrl(order.code, 4),
  ]);

  return new ImageResponse(
    (
      <ReceiptPngLayout
        // No invoiceNumber — the public download omits the admin sequence.
        language={language}
        issuedAt={order.created_at}
        order={buildReceiptOrder(order, (k) =>
          getCategoryLabel(k, language as InvoiceLocale)
        )}
        qrDataUrl={qrDataUrl}
        barcodeDataUrl={barcodeDataUrl}
        trackingUrl={trackingUrl}
      />
    ),
    {
      ...RECEIPT_PNG_SIZE,
      headers: {
        "Cache-Control": "public, max-age=60",
        "Content-Disposition": `${
          request.nextUrl.searchParams.get("download") === "1"
            ? "attachment"
            : "inline"
        }; filename="${order.code}.png"`,
      },
    }
  );
}
