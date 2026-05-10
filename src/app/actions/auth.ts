"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; reason: "invalid_credentials" | "missing_fields" | "server" };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const localeRaw = formData.get("locale")?.toString().trim() ?? "";
  const fromRaw = formData.get("from")?.toString().trim() ?? "";

  if (!email || !password) {
    return { status: "error", reason: "missing_fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (
      error.status === 400 ||
      error.message.toLowerCase().includes("invalid")
    ) {
      return { status: "error", reason: "invalid_credentials" };
    }
    console.error("login error:", error);
    return { status: "error", reason: "server" };
  }

  const locale = (routing.locales as readonly string[]).includes(localeRaw)
    ? localeRaw
    : routing.defaultLocale;

  // Allow `?from=/fr/dashboard/orders` to bring the admin back to the page they
  // were trying to reach. Sanity-check it stays inside the dashboard.
  const safeFrom =
    fromRaw && /^\/[a-z]{2}\/dashboard(?:\/|$)/.test(fromRaw) ? fromRaw : null;

  revalidatePath("/", "layout");
  redirect(safeFrom ?? `/${locale}/dashboard`);
}

export async function logoutAction(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const localeRaw = formData.get("locale")?.toString().trim() ?? "";
  const locale = (routing.locales as readonly string[]).includes(localeRaw)
    ? localeRaw
    : routing.defaultLocale;

  revalidatePath("/", "layout");
  redirect(`/${locale}`);
}
