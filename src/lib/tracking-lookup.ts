import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isValidTrackingCode, normalizeTrackingCode } from "@/lib/tracking-code";

export type TrackingEvent = {
  id: string;
  status: string;
  location: string | null;
  description: string | null;
  event_at: string;
};

export type TrackingOrder = {
  id: string;
  code: string;
  recipient_name: string;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  weight_kg: number | null;
  declared_value: number | null;
  product_category: string | null;
  product_description: string | null;
  quantity: number | null;
  current_status: string;
  created_at: string;
  updated_at: string;
  events: TrackingEvent[];
};

/**
 * Public-facing tracking lookup. Runs server-side with the service role key
 * (RLS denies anon access to the tables). Returns null when:
 *   - the code is malformed (TS + 9 digits + 2 letters)
 *   - no order matches the code
 */
export async function lookupTracking(
  rawCode: string
): Promise<TrackingOrder | null> {
  const code = normalizeTrackingCode(rawCode);
  if (!isValidTrackingCode(code)) return null;

  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        code,
        recipient_name,
        origin,
        origin_country,
        destination,
        destination_country,
        weight_kg,
        declared_value,
        product_category,
        product_description,
        quantity,
        current_status,
        created_at,
        updated_at,
        tracking_events (
          id,
          status,
          location,
          description,
          event_at
        )
      `
    )
    .eq("code", code)
    .maybeSingle();

  if (error || !order) return null;

  const events = (order.tracking_events ?? []).slice().sort((a, b) => {
    return new Date(b.event_at).getTime() - new Date(a.event_at).getTime();
  });

  return {
    id: order.id,
    code: order.code,
    recipient_name: order.recipient_name,
    origin: order.origin,
    origin_country: order.origin_country,
    destination: order.destination,
    destination_country: order.destination_country,
    weight_kg: order.weight_kg,
    declared_value: order.declared_value,
    product_category: order.product_category,
    product_description: order.product_description,
    quantity: order.quantity,
    current_status: order.current_status,
    created_at: order.created_at,
    updated_at: order.updated_at,
    events,
  };
}
