// Diagnostic script: verifies the Supabase project keys and tries to read
// the admin user from Auth. Run with `node scripts/check-admin.mjs`.

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Load env from .env.local manually (Node doesn't read it by default).
const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL set:    ", !!url, url?.slice(0, 40) + "...");
console.log("ANON set:   ", !!anon, anon?.slice(0, 20) + "...");
console.log("SERVICE set:", !!service, service?.slice(0, 20) + "...");

if (!url || !service) {
  console.error("\n[ERROR] Missing required env vars.");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const targetEmail = "landhack049@gmail.com";

console.log("\nLooking up user:", targetEmail);
const { data, error } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});

if (error) {
  console.error("[ERROR] listUsers failed:", error.message);
  process.exit(1);
}

const user = data.users.find((u) => u.email?.toLowerCase() === targetEmail);

if (!user) {
  console.log("\n[NOT FOUND] No user with that email exists in Auth.");
  console.log("Existing users:");
  for (const u of data.users) {
    console.log("  -", u.email, "(confirmed:", !!u.email_confirmed_at, ")");
  }
  process.exit(2);
}

console.log("\n[FOUND] User exists:");
console.log("  id:                ", user.id);
console.log("  email:             ", user.email);
console.log("  email_confirmed_at:", user.email_confirmed_at ?? "NOT CONFIRMED");
console.log("  created_at:        ", user.created_at);
console.log("  banned_until:      ", user.banned_until ?? "no");
console.log("  last_sign_in_at:   ", user.last_sign_in_at ?? "never");

if (!user.email_confirmed_at) {
  console.log(
    "\n[WARN] Email not confirmed — signInWithPassword will fail with 'Email not confirmed'."
  );
}
