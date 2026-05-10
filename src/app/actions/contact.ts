"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; reason: "missing_fields" | "invalid_email" | "server" };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactMessage(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const subject = formData.get("subject")?.toString().trim() || null;
  const message = formData.get("message")?.toString().trim() ?? "";
  const locale = formData.get("locale")?.toString().trim() || null;

  if (!name || !email || !message) {
    return { status: "error", reason: "missing_fields" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { status: "error", reason: "invalid_email" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
    locale,
  });

  if (error) {
    console.error("contact_messages insert failed:", error);
    return { status: "error", reason: "server" };
  }

  return { status: "success" };
}
