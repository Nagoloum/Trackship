import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { BonExpeditionPrint } from "@/components/dashboard/bon-expedition-print";
import { normalizeOrderItems } from "@/lib/order-items";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateQrDataUrl, publicTrackingUrl } from "@/lib/qr-barcode";
import { recipientAddressLines, resolveSender } from "@/lib/receipt-order";

export default async function BonExpeditionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const db = createAdminClient();
  const { data: order, error } = await db
    .from("orders")
    .select(
      `id, code, recipient_name, recipient_email, recipient_phone,
       recipient_address, recipient_address_line2, recipient_city, recipient_state,
       recipient_postal_code, sender_name, sender_address, sender_phone, sender_email,
       origin, origin_country, destination, destination_country,
       weight_kg, declared_value, vat_rate, items, current_status, notes, created_at`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !order) notFound();

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qrDataUrl = await generateQrDataUrl(
    publicTrackingUrl(appOrigin, order.code, locale),
    140
  );

  const sender = resolveSender(order);
  const addressLines = recipientAddressLines(order);
  const items = normalizeOrderItems(order.items);

  return (
    <BonExpeditionPrint
      locale={locale}
      orderId={id}
      code={order.code}
      recipientName={order.recipient_name}
      recipientEmail={order.recipient_email ?? null}
      recipientPhone={order.recipient_phone ?? null}
      recipientAddress={addressLines}
      senderName={sender.name}
      senderLines={sender.lines}
      origin={order.origin}
      originCountry={order.origin_country}
      destination={order.destination}
      destinationCountry={order.destination_country}
      weightKg={order.weight_kg ?? null}
      declaredValue={order.declared_value ?? null}
      vatRate={order.vat_rate ?? null}
      items={items}
      currentStatus={order.current_status}
      createdAt={order.created_at}
      notes={order.notes ?? null}
      qrDataUrl={qrDataUrl}
    />
  );
}
