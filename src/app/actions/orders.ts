"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { normalizeOrderItems, type OrderItem } from "@/lib/order-items";
import { TRACKING_STATUSES } from "@/lib/statuses";
import { generateTrackingCode, isValidTrackingCode, normalizeTrackingCode } from "@/lib/tracking-code";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ISO2_RE = /^[A-Z]{2}$/;

type OrderInput = {
  recipient_name: string;
  recipient_phone: string | null;
  recipient_email: string | null;
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
  vat_rate: number | null;
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
    recipient_address_line2: optional("recipient_address_line2"),
    recipient_city: optional("recipient_city"),
    recipient_state: optional("recipient_state"),
    recipient_postal_code: optional("recipient_postal_code"),
    recipient_delivery_hours: optional("recipient_delivery_hours"),
    sender_name: optional("sender_name"),
    sender_address: optional("sender_address"),
    sender_phone: optional("sender_phone"),
    sender_email: optional("sender_email"),
    origin,
    origin_country,
    destination,
    destination_country,
    weight_kg: num("weight_kg"),
    declared_value: num("declared_value"),
    vat_rate: (() => {
      const pct = num("vat_rate");
      if (pct == null) return null;
      return Math.max(0, pct) / 100;
    })(),
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

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTrackingCode(parsed.destination_country);
    const { data, error } = await supabase
      .from("orders")
      .insert({ ...parsed, code })
      .select("id")
      .single();

    if (!error && data) {
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

  // Handle manual tracking code override
  const codeRaw = formData.get("code")?.toString().trim() ?? "";
  const updatePayload: typeof parsed & { code?: string } = { ...parsed };
  if (codeRaw.length > 0) {
    const normalized = normalizeTrackingCode(codeRaw);
    if (!isValidTrackingCode(normalized)) {
      return { status: "error", message: "invalid_tracking_code" };
    }
    updatePayload.code = normalized;
  }

  const { error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    // 23505 = unique_violation on the code column
    if (error.code === "23505") {
      return { status: "error", message: "code_already_exists" };
    }
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

// ─── CSV bulk import ──────────────────────────────────────────────────────────

export type CsvImportState =
  | { status: "idle" }
  | { status: "success"; created: number; errors: string[] }
  | { status: "error"; message: string };

const CSV_HEADERS = [
  "code", "recipient_name", "recipient_email", "recipient_phone",
  "recipient_address", "recipient_address_line2", "recipient_delivery_hours",
  "sender_name", "sender_email", "sender_phone", "sender_address",
  "origin", "origin_country", "destination", "destination_country",
  "weight_kg", "declared_value", "vat_rate", "current_status", "notes",
] as const;

function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const fields: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        fields.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    fields.push(cur);
    rows.push(fields);
  }
  return rows;
}

export async function importOrdersCsvAction(
  _prev: CsvImportState,
  formData: FormData
): Promise<CsvImportState> {
  const file = formData.get("csv_file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "no_file" };
  }

  const text = await file.text();
  const rows = parseCsvText(text);
  if (rows.length < 2) {
    return { status: "error", message: "empty_file" };
  }

  // Detect header row
  const headerRow = rows[0].map((h) => h.toLowerCase().trim());
  const dataRows = rows.slice(1);

  const idx = (col: string): number => headerRow.indexOf(col);

  const get = (row: string[], col: string): string =>
    (row[idx(col)] ?? "").trim();

  const supabase = createAdminClient();
  let created = 0;
  const errors: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2;

    const recipient_name = get(row, "recipient_name");
    const origin = get(row, "origin");
    const origin_country = get(row, "origin_country").toUpperCase();
    const destination = get(row, "destination");
    const destination_country = get(row, "destination_country").toUpperCase();

    if (!recipient_name) { errors.push(`Ligne ${rowNum}: nom destinataire manquant`); continue; }
    if (!origin) { errors.push(`Ligne ${rowNum}: ville d'origine manquante`); continue; }
    if (!destination) { errors.push(`Ligne ${rowNum}: ville de destination manquante`); continue; }
    if (!ISO2_RE.test(origin_country)) { errors.push(`Ligne ${rowNum}: code pays origine invalide "${origin_country}"`); continue; }
    if (!ISO2_RE.test(destination_country)) { errors.push(`Ligne ${rowNum}: code pays destination invalide "${destination_country}"`); continue; }

    const toNum = (v: string) => {
      if (!v) return null;
      const n = Number(v.replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    const rawCode = get(row, "code");
    let code: string;
    if (rawCode && isValidTrackingCode(normalizeTrackingCode(rawCode))) {
      code = normalizeTrackingCode(rawCode);
    } else {
      code = generateTrackingCode(destination_country);
    }

    const rawStatus = get(row, "current_status") || "pending";
    const current_status = (TRACKING_STATUSES as readonly string[]).includes(rawStatus)
      ? rawStatus
      : "pending";

    const vatPct = toNum(get(row, "vat_rate"));

    const payload = {
      code,
      recipient_name,
      recipient_email: get(row, "recipient_email") || null,
      recipient_phone: get(row, "recipient_phone") || null,
      recipient_address: get(row, "recipient_address") || null,
      recipient_address_line2: get(row, "recipient_address_line2") || null,
      recipient_city: null,
      recipient_state: null,
      recipient_postal_code: null,
      recipient_delivery_hours: get(row, "recipient_delivery_hours") || null,
      sender_name: get(row, "sender_name") || null,
      sender_email: get(row, "sender_email") || null,
      sender_phone: get(row, "sender_phone") || null,
      sender_address: get(row, "sender_address") || null,
      origin,
      origin_country,
      destination,
      destination_country,
      weight_kg: toNum(get(row, "weight_kg")),
      declared_value: toNum(get(row, "declared_value")),
      vat_rate: vatPct != null ? Math.max(0, vatPct) / 100 : null,
      current_status,
      notes: get(row, "notes") || null,
      items: [],
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      errors.push(`Ligne ${rowNum}: ${error.message}`);
      continue;
    }

    if (data) {
      await supabase.from("tracking_events").insert({
        order_id: data.id,
        status: current_status,
        location: origin,
        description: null,
      });
      created++;
    }
  }

  revalidatePath("/fr/dashboard/orders");
  revalidatePath("/en/dashboard/orders");
  revalidatePath("/fr/dashboard");
  revalidatePath("/en/dashboard");

  return { status: "success", created, errors };
}
