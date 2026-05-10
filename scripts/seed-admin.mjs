// One-shot script to create (or update) the admin user in Supabase Auth.
// Usage:
//   node scripts/seed-admin.mjs <email> <password>
// Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local.
// The user is created with email_confirm=true so login works immediately.

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const [, , emailArg, passwordArg] = process.argv;
if (!emailArg || !passwordArg) {
  console.error("Usage: node scripts/seed-admin.mjs <email> <password>");
  process.exit(2);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(2);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("Looking up:", emailArg);
const { data: list, error: listErr } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});
if (listErr) {
  console.error("listUsers failed:", listErr.message);
  process.exit(1);
}

const existing = list.users.find(
  (u) => u.email?.toLowerCase() === emailArg.toLowerCase()
);

if (existing) {
  console.log("User exists, updating password + ensuring confirmed.");
  const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
    password: passwordArg,
    email_confirm: true,
  });
  if (error) {
    console.error("updateUser failed:", error.message);
    process.exit(1);
  }
  console.log("OK. id:", data.user.id, " confirmed:", !!data.user.email_confirmed_at);
} else {
  console.log("User not found, creating.");
  const { data, error } = await admin.auth.admin.createUser({
    email: emailArg,
    password: passwordArg,
    email_confirm: true,
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  console.log("OK. id:", data.user.id, " confirmed:", !!data.user.email_confirmed_at);
}

console.log("\nDone. You can now sign in at /login.");
process.exit(0);
