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
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check — only the admin can download tracking receipts.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  if (!id) return new Response("Missing id", { status: 400 });

  const admin = createAdminClient();
  const { data: invoice, error } = await admin
    .from("invoices")
    .select(
      `
        invoice_number, language, issued_at,
        orders (
          code, recipient_name, recipient_email, recipient_phone, recipient_address,
          origin, origin_country, destination, destination_country, weight_kg,
          declared_value, items, current_status
        )
      `
    )
    .eq("id", id)
    .maybeSingle();

  // Supabase types `orders` as an array even when the FK enforces a single row.
  const order = Array.isArray(invoice?.orders)
    ? invoice.orders[0]
    : invoice?.orders;
  if (error || !invoice || !order) {
    return new Response("Not found", { status: 404 });
  }

  const trackingUrl = publicTrackingUrl(request.nextUrl.origin, order.code, invoice.language);
  const [qrDataUrl, barcodeDataUrl] = await Promise.all([
    generateQrDataUrl(trackingUrl),
    generateBarcodeDataUrl(order.code),
  ]);
  const lang = invoice.language as InvoiceLocale;
  const items = normalizeOrderItems(order.items);

  const buffer = await renderToBuffer(
    <ReceiptPdf
      receipt={{
        invoice_number: invoice.invoice_number,
        language: invoice.language,
        issued_at: invoice.issued_at,
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
        items,
        categoryLabel: (k) => getCategoryLabel(k, lang),
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
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
