# Trackship

Multilingual parcel-tracking web app: a public landing page, a public tracking
page (no signup), an admin dashboard for managing orders + tracking events, and
on-demand generation of multilingual tracking receipts (PDF + PNG with QR
code and Code-128 barcode).

## Stack

- **Next.js 16** (App Router, Turbopack) on **TypeScript**
- **Tailwind v4** + **shadcn/ui** (built on `@base-ui/react`)
- **Supabase**: Postgres + Auth + RLS (service-role key used server-side only)
- **next-intl** for FR / EN / ES / DE
- **next-themes** for dark/light
- **@react-pdf/renderer** for PDF receipts, **next/og** (Satori) for PNG
- **qrcode** + **bwip-js** for QR + barcode generation
- Hosting: **Vercel**

## Local setup

### Prerequisites

- Node 20+ (project tested on 24)
- A Supabase project (free tier is fine)

### Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Provision the database**

   In the Supabase dashboard → SQL editor, run the entire content of
   [`supabase/schema.sql`](supabase/schema.sql). The script is idempotent and
   can be re-run safely after schema changes.

3. **Create the admin user**

   Either:
   - Manually: Supabase dashboard → Authentication → Users → Add user
     (with "Auto Confirm User" checked), or
   - Programmatically:

     ```bash
     node scripts/seed-admin.mjs <email> <password>
     ```

4. **Configure environment**

   Copy `.env.example` to `.env.local` and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
   ```

   The two public keys live on the client; the service-role key MUST stay
   server-side (it is used to bypass RLS for public tracking lookups and admin
   operations).

5. **Personalise the company info**

   Edit [`src/lib/company.ts`](src/lib/company.ts) — these values appear on
   every PDF / PNG receipt and on the legal pages.

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

## Scripts

| Script                                | Purpose                                          |
| ------------------------------------- | ------------------------------------------------ |
| `npm run dev`                         | Dev server (Turbopack)                           |
| `npm run build`                       | Production build                                 |
| `npm run start`                       | Production server (after build)                  |
| `npm run lint`                        | ESLint                                           |
| `node scripts/seed-admin.mjs <e> <p>` | Create or reset the admin user                   |
| `node scripts/check-admin.mjs`        | Diagnostic: list Supabase Auth users             |
| `node scripts/apply-migration.mjs`    | Reminder script for pending DDL changes          |

## Project structure

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)              # landing, track, legal, terms, privacy
│   │   ├── login/
│   │   └── dashboard/
│   │       ├── orders/           # CRUD + tracking events + receipts
│   │       ├── history/          # all issued receipts
│   │       └── messages/         # contact-form messages
│   ├── api/
│   │   └── invoices/[id]/{pdf,png}   # receipt generation routes (Node runtime)
│   └── actions/                  # server actions (auth, orders, invoices, etc.)
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── landing/                  # hero, services, FAQ, contact, footer, etc.
│   ├── dashboard/                # sidebar, topbar, forms, dialogs
│   ├── auth/
│   ├── legal/
│   └── icons/
├── i18n/                         # next-intl config
├── lib/
│   ├── supabase/                 # client, server, admin
│   ├── invoice-pdf.tsx           # @react-pdf/renderer template
│   ├── invoice-strings.ts        # PDF/PNG i18n labels
│   ├── qr-barcode.ts             # QR + barcode helpers
│   ├── company.ts                # billing entity (edit me)
│   ├── statuses.ts               # canonical tracking statuses
│   └── tracking-code.ts
└── proxy.ts                      # combined i18n + auth (Next.js 16 = `proxy`, ex-`middleware`)

messages/{fr,en,es,de}.json       # all UI strings
supabase/schema.sql               # Postgres schema (idempotent)
scripts/                          # one-off node helpers
```

## Deploying to Vercel

1. **Push the repository to GitHub** (or GitLab / Bitbucket).

2. In the **Vercel dashboard**, **Add New… → Project**, import the repo.

3. **Framework preset**: Next.js (auto-detected). Build / install / output
   defaults are fine.

4. Add the **environment variables** under
   _Settings → Environment Variables_:

   | Key                              | Value                                               | Environments |
   | -------------------------------- | --------------------------------------------------- | ------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`       | your project URL                                    | All          |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | your `sb_publishable_...` key                       | All          |
   | `SUPABASE_SERVICE_ROLE_KEY`      | your `sb_secret_...` key — KEEP SECRET              | All          |

5. Deploy. The first build takes ~1-2 minutes.

6. Once live, copy the production URL and add it to **Supabase → Authentication
   → URL Configuration → Redirect URLs** (e.g. `https://your-app.vercel.app/**`)
   so future auth flows work cleanly.

That's it — Vercel will redeploy on every push to the main branch.

## Languages

The UI ships in **French** (default), **English**, **Spanish** and **German**.
Add a new locale:

1. Add the code to [`src/i18n/routing.ts`](src/i18n/routing.ts).
2. Create `messages/{newcode}.json` mirroring the existing files.
3. Add the language label to the four message files under `language.*`.
4. Add the same code to the receipt translations in
   [`src/lib/invoice-strings.ts`](src/lib/invoice-strings.ts).

## Tracking code format

`TS` + 9 digits + ISO 3166-1 alpha-2 country code of the destination.
Example: `TS947261583FR` for a parcel to France. The country suffix is derived
automatically from the order's destination country at creation time (with a
retry on the rare collision).

## Receipt number format

`TS-INV-{YYYY}-{6-digit zero-padded sequence}`, with a per-year counter that
resets each January 1st. Example: `TS-INV-2026-000001`. Implementation lives
in the SQL function `public.next_invoice_number(p_year int)`.

## Security model

- **Anon clients have no direct table access.** All RLS policies grant
  `for all to authenticated using (true) with check (true)`.
- **Public tracking lookups** go through server-side code that uses the
  service-role key (bypasses RLS).
- The Next.js **proxy** (formerly middleware) protects every `/dashboard/*`
  route and redirects unauthenticated requests to `/login`.
- The dashboard layout re-checks the session server-side as defence in depth.

## Heads-up

- The legal pages (`/legal`, `/terms`, `/privacy`) ship with sensible standard
  content but contain placeholders ("à compléter") that you need to replace
  with your real legal entity details.
- [`src/lib/company.ts`](src/lib/company.ts) is wired into every receipt PDF —
  edit it before issuing real receipts.
