"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function markMessageReadAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";
  const unread = formData.get("unread") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("contact_messages")
    .update({ read_at: unread ? null : new Date().toISOString() })
    .eq("id", id);

  revalidatePath(`/${localeRaw}/dashboard/messages`);
  revalidatePath(`/${localeRaw}/dashboard/messages/${id}`);
  revalidatePath(`/${localeRaw}/dashboard`);
}

export async function deleteMessageAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const localeRaw = formData.get("locale")?.toString().trim() ?? "fr";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteMessage failed:", error);
    return;
  }

  revalidatePath(`/${localeRaw}/dashboard/messages`);
  revalidatePath(`/${localeRaw}/dashboard`);
  redirect(`/${localeRaw}/dashboard/messages`);
}
