import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

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
          current_status
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

  const trackingUrl = publicTrackingUrl(request.nextUrl.origin, order.code);
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
        order={order}
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
