"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { normalizeOrderItems, type OrderItem } from "@/lib/order-items";
import { TRACKING_STATUSES } from "@/lib/statuses";
import { generateTrackingCode } from "@/lib/tracking-code";
import { createClient } from "@/lib/supabase/server";

const ISO2_RE = /^[A-Z]{2}$/;

type OrderInput = {
  recipient_name: string;
  recipient_phone: string | null;
  recipient_email: string | null;
  recipient_address: string | null;
  origin: string;
  origin_country: string;
  destination: string;
  destination_country: string;
  weight_kg: number | null;
  declared_value: number | null;
  items: OrderItem[];
  current_status: string;
  notes: string | null;
};

export type OrderState =
  | { status: "idle" }
  | { status: "error"; message: string };

function parseFormData(formData: FormData): OrderInput | string {
  const get = (k: string) => formData.get(k)?.toString().trim() ?? "";
  const optional = (k: string) => {
    const v = get(k);
    return v.length > 0 ? v : null;
  };
  const num = (k: string) => {
    const v = get(k);
    if (v.length === 0) return null;
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const recipient_name = get("recipient_name");
  const origin = get("origin");
  const origin_country = get("origin_country").toUpperCase();
  const destination = get("destination");
  const destination_country = get("destination_country").toUpperCase();
  const current_status = get("current_status") || "pending";

  if (!recipient_name) return "missing_recipient_name";
  if (!origin) return "missing_origin";
  if (!destination) return "missing_destination";
  if (!ISO2_RE.test(origin_country)) return "invalid_origin_country";
  if (!ISO2_RE.test(destination_country)) return "invalid_destination_country";
  if (!(TRACKING_STATUSES as readonly string[]).includes(current_status)) {
    return "invalid_status";
  }

  // Items arrive as a JSON string from <input type="hidden" name="items">.
  // Parse, normalise (drops empty rows, validates categories, clamps qty).
  const itemsRaw = get("items");
  let items: OrderItem[] = [];
  if (itemsRaw) {
    try {
      items = normalizeOrderItems(JSON.parse(itemsRaw));
    } catch {
      return "invalid_items";
    }
  }

  return {
    recipient_name,
    recipient_phone: optional("recipient_phone"),
    recipient_email: optional("recipient_email"),
    recipient_address: optional("recipient_address"),
    origin,
    origin_country,
    destination,
    destination_country,
    weight_kg: num("weight_kg"),
    declared_value: num("declared_value"),
    items,
    current_status,
    notes: optional("notes"),
  };
}

export async function createOrderAction(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  const parsed = parseFormData(formData);
  if (typeof parsed === "string") {
    return { status: "error", message: parsed };
  }

  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";
  const supabase = await createClient();

  // Retry a few times on tracking-code collision (extremely unlikely with 9 digits).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTrackingCode(parsed.destination_country);
    const { data, error } = await supabase
      .from("orders")
      .insert({ ...parsed, code })
      .select("id")
      .single();

    if (!error && data) {
      // Seed an initial tracking event so the timeline isn't empty.
      await supabase.from("tracking_events").insert({
        order_id: data.id,
        status: parsed.current_status,
        location: parsed.origin,
        description: null,
      });

      revalidatePath(`/${localeRaw}/dashboard/orders`);
      revalidatePath(`/${localeRaw}/dashboard`);
      redirect(`/${localeRaw}/dashboard/orders/${data.id}`);
    }

    // 23505 = unique_violation (the `code` collided)
    if (error?.code === "23505") continue;

    if (error) {
      console.error("createOrder failed:", error);
      return { status: "error", message: "server" };
    }
  }

  return { status: "error", message: "code_collision" };
}

export async function updateOrderAction(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  const id = formData.get("id")?.toString();
  if (!id) return { status: "error", message: "missing_id" };

  const parsed = parseFormData(formData);
  if (typeof parsed === "string") {
    return { status: "error", message: parsed };
  }

  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update(parsed)
    .eq("id", id);

  if (error) {
    console.error("updateOrder failed:", error);
    return { status: "error", message: "server" };
  }

  revalidatePath(`/${localeRaw}/dashboard/orders`);
  revalidatePath(`/${localeRaw}/dashboard/orders/${id}`);
  redirect(`/${localeRaw}/dashboard/orders/${id}`);
}

export async function deleteOrderAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) {
    console.error("deleteOrder failed:", error);
    return;
  }

  revalidatePath(`/${localeRaw}/dashboard/orders`);
  revalidatePath(`/${localeRaw}/dashboard`);
  redirect(`/${localeRaw}/dashboard/orders`);
}

export type EventState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function addTrackingEventAction(
  _prev: EventState,
  formData: FormData
): Promise<EventState> {
  const orderId = formData.get("order_id")?.toString();
  const status = formData.get("status")?.toString() ?? "";
  const location = formData.get("location")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;
  const eventAtRaw = formData.get("event_at")?.toString().trim() ?? "";
  const updateCurrent = formData.get("update_current") === "on";
  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";

  if (!orderId) return { status: "error", message: "missing_id" };
  if (!(TRACKING_STATUSES as readonly string[]).includes(status)) {
    return { status: "error", message: "invalid_status" };
  }

  const event_at = eventAtRaw ? new Date(eventAtRaw).toISOString() : new Date().toISOString();

  const supabase = await createClient();
  const { error } = await supabase.from("tracking_events").insert({
    order_id: orderId,
    status,
    location,
    description,
    event_at,
  });

  if (error) {
    console.error("addTrackingEvent failed:", error);
    return { status: "error", message: "server" };
  }

  if (updateCurrent) {
    await supabase
      .from("orders")
      .update({ current_status: status })
      .eq("id", orderId);
  }

  revalidatePath(`/${localeRaw}/dashboard/orders/${orderId}`);
  revalidatePath(`/${localeRaw}/dashboard/orders`);
  return { status: "success" };
}

export async function deleteTrackingEventAction(formData: FormData) {
  const eventId = formData.get("event_id")?.toString();
  const orderId = formData.get("order_id")?.toString();
  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";
  if (!eventId || !orderId) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("tracking_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    console.error("deleteTrackingEvent failed:", error);
    return;
  }

  revalidatePath(`/${localeRaw}/dashboard/orders/${orderId}`);
}
