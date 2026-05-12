import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";

import { ReceiptPdf } from "@/lib/invoice-pdf";
import { getCategoryLabel, type InvoiceLocale } from "@/lib/invoice-strings";
import {
  generateBarcodeDataUrl,
  generateQrDataUrl,
  publicTrackingUrl,
} from "@/lib/qr-barcode";
import { buildReceiptOrder, RECEIPT_ORDER_COLUMNS } from "@/lib/receipt-order";
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
        orders ( ${RECEIPT_ORDER_COLUMNS} )
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

  const buffer = await renderToBuffer(
    <ReceiptPdf
      receipt={{
        invoice_number: invoice.invoice_number,
        language: invoice.language,
        issued_at: invoice.issued_at,
      }}
      order={buildReceiptOrder(order, (k) => getCategoryLabel(k, lang))}
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
