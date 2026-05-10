-- Trackship database schema
-- Run this in the Supabase SQL editor (or via supabase db push) to create
-- the tables, indexes, RLS policies and helper functions.

-- =========================================================================
-- Tables
-- =========================================================================

-- orders: a parcel/shipment
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                     -- TS947261583FR
  recipient_name text not null,
  recipient_phone text,
  recipient_email text,
  recipient_address text,
  origin text not null,
  origin_country text not null,                  -- ISO 3166-1 alpha-2
  destination text not null,
  destination_country text not null,             -- ISO 3166-1 alpha-2 (used in code)
  weight_kg numeric,
  declared_value numeric,
  current_status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_code_idx on public.orders(code);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- tracking_events: history of status changes per order
create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  location text,
  description text,
  event_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists tracking_events_order_idx
  on public.tracking_events(order_id, event_at desc);

-- invoices: tracking invoices generated per order
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  invoice_number text unique not null,           -- TS-INV-2026-000124
  language text not null default 'fr',           -- fr | en | es | de
  amount numeric not null,
  tax_rate numeric not null default 0,           -- e.g. 0.20 for 20%
  tax_amount numeric not null default 0,
  total numeric not null,
  pdf_path text,                                 -- path in Supabase Storage
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists invoices_order_idx on public.invoices(order_id);
create index if not exists invoices_number_idx on public.invoices(invoice_number);

-- invoice_counter: per-year sequential numbering (resets each year)
create table if not exists public.invoice_counter (
  year int primary key,
  last_number int not null default 0
);

-- contact_messages: messages submitted via the public contact form
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  locale text,                                   -- ui language at submission
  read_at timestamptz,                           -- set by admin when read
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages(created_at desc);

-- =========================================================================
-- Functions
-- =========================================================================

-- Atomically increment & return the next invoice number for the given year.
create or replace function public.next_invoice_number(p_year int)
returns int
language plpgsql
as $$
declare
  v_number int;
begin
  insert into public.invoice_counter(year, last_number)
  values (p_year, 1)
  on conflict (year) do update
    set last_number = public.invoice_counter.last_number + 1
  returning last_number into v_number;
  return v_number;
end;
$$;

-- Auto-update updated_at on orders.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================
-- Strategy:
--   * Anon clients have NO direct access. Public lookups (the tracking page)
--     must go through server-side code that uses the service-role key.
--   * Authenticated users (the admin) have full access.

alter table public.orders            enable row level security;
alter table public.tracking_events   enable row level security;
alter table public.invoices          enable row level security;
alter table public.invoice_counter   enable row level security;
alter table public.contact_messages  enable row level security;

drop policy if exists "admin all on orders"           on public.orders;
drop policy if exists "admin all on tracking_events"  on public.tracking_events;
drop policy if exists "admin all on invoices"         on public.invoices;
drop policy if exists "admin all on invoice_counter"  on public.invoice_counter;
drop policy if exists "admin all on contact_messages" on public.contact_messages;

create policy "admin all on orders"
  on public.orders for all
  to authenticated using (true) with check (true);

create policy "admin all on tracking_events"
  on public.tracking_events for all
  to authenticated using (true) with check (true);

create policy "admin all on invoices"
  on public.invoices for all
  to authenticated using (true) with check (true);

create policy "admin all on invoice_counter"
  on public.invoice_counter for all
  to authenticated using (true) with check (true);

create policy "admin all on contact_messages"
  on public.contact_messages for all
  to authenticated using (true) with check (true);

-- =========================================================================
-- Migrations (idempotent, safe to re-run)
-- =========================================================================

-- The "invoices" table now stores tracking receipts (no amounts required).
-- Make the monetary columns nullable so receipts can be issued without prices.
do $$ begin
  alter table public.invoices alter column amount drop not null;
exception when others then null;
end $$;

do $$ begin
  alter table public.invoices alter column total drop not null;
exception when others then null;
end $$;
