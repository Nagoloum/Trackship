import { COMPANY } from "@/lib/company";
import { normalizeOrderItems, type OrderItem } from "@/lib/order-items";

/**
 * The order fields the PDF/PNG receipt templates read. Shared by
 * `invoice-pdf.tsx` and `receipt-png-layout.tsx` so the two stay in sync.
 */
export type ReceiptOrder = {
  code: string;
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;
  recipient_address_line2: string | null;
  recipient_city: string | null;
  recipient_state: string | null;
  recipient_postal_code: string | null;
  recipient_delivery_hours: string | null;
  sender_name: string | null;
  sender_address: string | null;
  sender_phone: string | null;
  sender_email: string | null;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  weight_kg: number | null;
  declared_value: number | null;
  /** VAT rate applied to the declared value, as a fraction (e.g. 0.20). */
  vat_rate: number | null;
  current_status: string;
  items: OrderItem[];
  /** Localised category-label resolver (out of React i18n context). */
  categoryLabel?: (key: string) => string;
};

/** Columns to select from `orders` when feeding a receipt template. */
export const RECEIPT_ORDER_COLUMNS =
  "code, recipient_name, recipient_email, recipient_phone, recipient_address, " +
  "recipient_address_line2, recipient_city, recipient_state, recipient_postal_code, " +
  "recipient_delivery_hours, sender_name, sender_address, sender_phone, sender_email, " +
  "origin, origin_country, destination, destination_country, weight_kg, declared_value, " +
  "vat_rate, items, current_status";

/** Build a {@link ReceiptOrder} from a raw `orders` row (DB or lookup result). */
export function buildReceiptOrder(
  rowInput: object,
  categoryLabel?: (key: string) => string
): ReceiptOrder {
  const row = rowInput as Record<string, unknown>;
  const str = (k: string) => {
    const v = row[k];
    return typeof v === "string" && v.trim().length > 0 ? v : null;
  };
  const numv = (k: string) => {
    const v = row[k];
    return v != null && v !== "" ? Number(v) : null;
  };
  return {
    code: String(row.code ?? ""),
    recipient_name: String(row.recipient_name ?? ""),
    recipient_email: str("recipient_email"),
    recipient_phone: str("recipient_phone"),
    recipient_address: str("recipient_address"),
    recipient_address_line2: str("recipient_address_line2"),
    recipient_city: str("recipient_city"),
    recipient_state: str("recipient_state"),
    recipient_postal_code: str("recipient_postal_code"),
    recipient_delivery_hours: str("recipient_delivery_hours"),
    sender_name: str("sender_name"),
    sender_address: str("sender_address"),
    sender_phone: str("sender_phone"),
    sender_email: str("sender_email"),
    origin: String(row.origin ?? ""),
    origin_country: String(row.origin_country ?? ""),
    destination: String(row.destination ?? ""),
    destination_country: String(row.destination_country ?? ""),
    weight_kg: numv("weight_kg"),
    declared_value: numv("declared_value"),
    vat_rate: numv("vat_rate"),
    current_status: String(row.current_status ?? "pending"),
    items: normalizeOrderItems(row.items),
    categoryLabel,
  };
}

/** Resolved sender block: the per-shipment sender, or the company fallback. */
export function resolveSender(order: {
  sender_name: string | null;
  sender_address: string | null;
  sender_phone: string | null;
  sender_email: string | null;
}): { name: string; lines: string[] } {
  if (order.sender_name) {
    return {
      name: order.sender_name,
      lines: [order.sender_address, order.sender_phone, order.sender_email].filter(
        (l): l is string => Boolean(l)
      ),
    };
  }
  return {
    name: COMPANY.name,
    lines: [`${COMPANY.city}, ${COMPANY.country}`, COMPANY.email],
  };
}

/**
 * VAT breakdown for the declared value. Returns `null` when no declared value
 * is set. `rate` is a fraction (0.20 → 20%); a missing rate is treated as 0.
 */
export function vatBreakdown(order: {
  declared_value: number | null;
  vat_rate: number | null;
}): { rate: number; net: number; vat: number; total: number } | null {
  if (order.declared_value == null) return null;
  const rate = order.vat_rate != null ? order.vat_rate : 0;
  const net = Number(order.declared_value);
  const vat = net * rate;
  return { rate, net, vat, total: net + vat };
}

/** Lines making up the recipient's postal address (line 1, line 2, postcode+city, state). */
export function recipientAddressLines(order: {
  recipient_address: string | null;
  recipient_address_line2: string | null;
  recipient_city: string | null;
  recipient_state: string | null;
  recipient_postal_code: string | null;
}): string[] {
  const cityLine = [order.recipient_postal_code, order.recipient_city]
    .filter(Boolean)
    .join(" ");
  return [
    order.recipient_address,
    order.recipient_address_line2,
    cityLine || null,
    order.recipient_state,
  ].filter((l): l is string => Boolean(l && l.trim()));
}
