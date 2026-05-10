import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { getCategoryLabel, type InvoiceLocale } from "@/lib/invoice-strings";
import { normalizeOrderItems } from "@/lib/order-items";
import {
  RECEIPT_PNG_SIZE,
  ReceiptPngLayout,
} from "@/lib/receipt-png-layout";
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
  // Auth check.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

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

  const order = Array.isArray(invoice?.orders)
    ? invoice.orders[0]
    : invoice?.orders;
  if (error || !invoice || !order) {
    return new Response("Not found", { status: 404 });
  }

  const trackingUrl = publicTrackingUrl(request.nextUrl.origin, order.code, invoice.language);
  const [qrDataUrl, barcodeDataUrl] = await Promise.all([
    generateQrDataUrl(trackingUrl, 320),
    generateBarcodeDataUrl(order.code, 4),
  ]);

  return new ImageResponse(
    (
      <ReceiptPngLayout
        invoiceNumber={invoice.invoice_number}
        language={invoice.language}
        issuedAt={invoice.issued_at}
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
          weight_kg:
            order.weight_kg != null ? Number(order.weight_kg) : null,
          declared_value:
            order.declared_value != null ? Number(order.declared_value) : null,
          current_status: order.current_status,
          items: normalizeOrderItems(order.items),
          categoryLabel: (k) =>
            getCategoryLabel(k, invoice.language as InvoiceLocale),
        }}
        qrDataUrl={qrDataUrl}
        barcodeDataUrl={barcodeDataUrl}
        trackingUrl={trackingUrl}
      />
    ),
    {
      ...RECEIPT_PNG_SIZE,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${
          request.nextUrl.searchParams.get("download") === "1"
            ? "attachment"
            : "inline"
        }; filename="${invoice.invoice_number}.png"`,
      },
    }
  );
}
