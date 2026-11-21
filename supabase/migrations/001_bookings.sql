-- NaukaPass bookings (run once in Supabase SQL Editor)

create extension if not exists "pgcrypto";

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  leader_name text not null,
  contact_number text not null default '',
  pax integer not null check (pax >= 1 and pax <= 500),
  status text not null default 'pending' check (status in ('pending', 'scanned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  scanned_at timestamptz
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);

alter table public.bookings enable row level security;

-- No public policies: anon/authenticated cannot read or write.
-- The app uses SUPABASE_SERVICE_ROLE_KEY on the server (bypasses RLS).
