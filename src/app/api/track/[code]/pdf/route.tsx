import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";

import { ReceiptPdf } from "@/lib/invoice-pdf";
import { getCategoryLabel, type InvoiceLocale } from "@/lib/invoice-strings";
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
 * Public download of a tracking receipt for a given code. No authentication
 * required — the same data is already visible on the public /track/[code]
 * page. The PDF is generated on demand and is suitable for printing or
 * sharing with the recipient.
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
    generateQrDataUrl(trackingUrl),
    generateBarcodeDataUrl(order.code),
  ]);

  const buffer = await renderToBuffer(
    <ReceiptPdf
      receipt={{
        // No invoice_number — the public download omits the admin-issued
        // sequential number; the tracking code is the document identifier.
        language,
        issued_at: order.created_at,
      }}
      order={buildReceiptOrder(order, (k) =>
        getCategoryLabel(k, language as InvoiceLocale)
      )}
      qrDataUrl={qrDataUrl}
      barcodeDataUrl={barcodeDataUrl}
      trackingUrl={trackingUrl}
    />
  );

  const inline = request.nextUrl.searchParams.get("download") !== "1";

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${order.code}.pdf"`,
      "Cache-Control": "public, max-age=60",
    },
  });
}
