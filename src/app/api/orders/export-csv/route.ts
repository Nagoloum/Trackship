import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function escapeCell(val: string | number | null | undefined): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function GET() {
  // Require an authenticated admin session
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return new Response("Non autorisé", { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select(
      "code, recipient_name, recipient_email, recipient_phone, " +
      "recipient_address, recipient_address_line2, recipient_delivery_hours, " +
      "sender_name, sender_email, sender_phone, sender_address, " +
      "origin, origin_country, destination, destination_country, " +
      "weight_kg, declared_value, vat_rate, current_status, notes, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return new Response("Erreur lors de la récupération des commandes", { status: 500 });
  }

  type OrderRow = {
    code: string; recipient_name: string; recipient_email: string | null;
    recipient_phone: string | null; recipient_address: string | null;
    recipient_address_line2: string | null; recipient_delivery_hours: string | null;
    sender_name: string | null; sender_email: string | null; sender_phone: string | null;
    sender_address: string | null; origin: string; origin_country: string;
    destination: string; destination_country: string; weight_kg: number | null;
    declared_value: number | null; vat_rate: number | null;
    current_status: string; notes: string | null;
  };
  const orders = (rawOrders ?? []) as unknown as OrderRow[];

  const headers = [
    "code", "recipient_name", "recipient_email", "recipient_phone",
    "recipient_address", "recipient_address_line2", "recipient_delivery_hours",
    "sender_name", "sender_email", "sender_phone", "sender_address",
    "origin", "origin_country", "destination", "destination_country",
    "weight_kg", "declared_value", "vat_rate", "current_status", "notes",
  ];

  const rows = (orders ?? []).map((o) => {
    const vatPct = o.vat_rate != null ? (o.vat_rate * 100).toFixed(1) : "";
    return [
      o.code,
      o.recipient_name,
      o.recipient_email,
      o.recipient_phone,
      o.recipient_address,
      o.recipient_address_line2,
      o.recipient_delivery_hours,
      o.sender_name,
      o.sender_email,
      o.sender_phone,
      o.sender_address,
      o.origin,
      o.origin_country,
      o.destination,
      o.destination_country,
      o.weight_kg,
      o.declared_value,
      vatPct,
      o.current_status,
      o.notes,
    ].map(escapeCell).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const filename = `trackship-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
