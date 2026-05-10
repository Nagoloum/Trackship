// Applies the pending schema migration: makes invoices.amount/total nullable
// so we can issue tracking receipts without monetary fields.
//
// Usage: node scripts/apply-migration.mjs

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(2);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Sanity check that the invoices table exists and inspect current shape.
const { data: invoices, error: probeError } = await admin
  .from("invoices")
  .select("id")
  .limit(1);
if (probeError && probeError.code !== "PGRST116") {
  console.error("Cannot reach invoices table:", probeError.message);
  process.exit(1);
}

console.log(
  invoices?.length === 0
    ? "Table public.invoices is reachable (empty)."
    : `Table public.invoices is reachable (rows present).`
);

console.log(
  "\n  IMPORTANT: PostgREST cannot run DDL. Re-execute supabase/schema.sql in"
);
console.log(
  "  the Supabase SQL editor — the migration block at the bottom is idempotent."
);
console.log(
  "\n  https://supabase.com/dashboard/project/_/sql/new"
);
