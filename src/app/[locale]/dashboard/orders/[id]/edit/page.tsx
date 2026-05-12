import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { OrderForm } from "@/components/dashboard/order-form";
import { buttonVariants } from "@/components/ui/button";
import { normalizeOrderItems } from "@/lib/order-items";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.orders.edit");
  const tc = await getTranslations("common");

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, recipient_name, recipient_email, recipient_phone, recipient_address, recipient_address_line2, recipient_city, recipient_state, recipient_postal_code, recipient_delivery_hours, sender_name, sender_address, sender_phone, sender_email, origin, origin_country, destination, destination_country, weight_kg, declared_value, vat_rate, items, current_status, notes, code"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/orders/${order.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="h-4 w-4" />
          {tc("back")}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1.5 break-all font-mono text-xs">
          {order.code}
        </p>
      </div>

      <OrderForm
        mode="edit"
        defaults={{
          id: order.id,
          recipient_name: order.recipient_name,
          recipient_email: order.recipient_email,
          recipient_phone: order.recipient_phone,
          recipient_address: order.recipient_address,
          recipient_address_line2: order.recipient_address_line2,
          recipient_city: order.recipient_city,
          recipient_state: order.recipient_state,
          recipient_postal_code: order.recipient_postal_code,
          recipient_delivery_hours: order.recipient_delivery_hours,
          sender_name: order.sender_name,
          sender_address: order.sender_address,
          sender_phone: order.sender_phone,
          sender_email: order.sender_email,
          origin: order.origin,
          origin_country: order.origin_country,
          destination: order.destination,
          destination_country: order.destination_country,
          weight_kg: order.weight_kg,
          declared_value: order.declared_value,
          vat_rate: order.vat_rate,
          items: normalizeOrderItems(order.items),
          current_status: order.current_status,
          notes: order.notes,
        }}
      />
    </div>
  );
}
