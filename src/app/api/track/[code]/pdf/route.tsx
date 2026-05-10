import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";

import { ReceiptPdf } from "@/lib/invoice-pdf";
import { getCategoryLabel, type InvoiceLocale } from "@/lib/invoice-strings";
import { normalizeOrderItems } from "@/lib/order-items";
import {
  generateBarcodeDataUrl,
  generateQrDataUrl,
  publicTrackingUrl,
} from "@/lib/qr-barcode";
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
      order={{
        code: order.code,
        recipient_name: order.recipient_name,
        recipient_email: order.recipient_email,
        recipient_phone: order.recipient_phone,
        recipient_address: order.recipient_address,
        origin: order.origin,
        origin_country: order.origin_country,
        destination: order.destination,
        destination_country: order.destination_country,
        weight_kg: order.weight_kg != null ? Number(order.weight_kg) : null,
        declared_value:
          order.declared_value != null ? Number(order.declared_value) : null,
        current_status: order.current_status,
        items: normalizeOrderItems(order.items),
        categoryLabel: (k) => getCategoryLabel(k, language as InvoiceLocale),
      }}
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
