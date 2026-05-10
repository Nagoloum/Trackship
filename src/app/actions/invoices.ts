"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

export type ReceiptState =
  | { status: "idle" }
  | { status: "error"; message: string };

const SUPPORTED_LANGUAGES: ReadonlyArray<string> = ["fr", "en", "es", "de"];

/**
 * Issues a tracking receipt for the given order. The receipt is identified by
 * a sequential number (TS-INV-{year}-{6 digits}) and stored alongside the
 * chosen language. Monetary fields stay null — the receipt is a shipping
 * document, not a financial invoice.
 */
export async function createReceiptAction(
  _prev: ReceiptState,
  formData: FormData
): Promise<ReceiptState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "unauthorized" };

  const orderId = formData.get("order_id")?.toString();
  const language = formData.get("language")?.toString().trim() ?? "fr";
  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";

  if (!orderId) return { status: "error", message: "missing_order" };
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return { status: "error", message: "invalid_language" };
  }

  const admin = createAdminClient();
  const year = new Date().getFullYear();

  const { data: nextNumber, error: rpcError } = await admin.rpc(
    "next_invoice_number",
    { p_year: year }
  );
  if (rpcError || nextNumber == null) {
    console.error("next_invoice_number rpc failed:", rpcError);
    return { status: "error", message: "server" };
  }

  const padded = String(nextNumber).padStart(6, "0");
  const receiptNumber = `TS-INV-${year}-${padded}`;

  const { error } = await admin.from("invoices").insert({
    order_id: orderId,
    invoice_number: receiptNumber,
    language,
    amount: null,
    tax_rate: 0,
    tax_amount: 0,
    total: null,
  });

  if (error) {
    console.error("createReceipt failed:", error);
    return { status: "error", message: "server" };
  }

  const safeLocale = (routing.locales as readonly string[]).includes(localeRaw)
    ? localeRaw
    : routing.defaultLocale;

  revalidatePath(`/${safeLocale}/dashboard/orders/${orderId}`);
  revalidatePath(`/${safeLocale}/dashboard/history`);
  revalidatePath(`/${safeLocale}/dashboard`);

  redirect(`/${safeLocale}/dashboard/orders/${orderId}`);
}

export async function deleteReceiptAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const orderId = formData.get("order_id")?.toString();
  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";
  if (!id) return;

  const admin = createAdminClient();
  const { error } = await admin.from("invoices").delete().eq("id", id);
  if (error) {
    console.error("deleteReceipt failed:", error);
    return;
  }

  const safeLocale = (routing.locales as readonly string[]).includes(localeRaw)
    ? localeRaw
    : routing.defaultLocale;

  if (orderId) {
    revalidatePath(`/${safeLocale}/dashboard/orders/${orderId}`);
  }
  revalidatePath(`/${safeLocale}/dashboard/history`);
  revalidatePath(`/${safeLocale}/dashboard`);
}
