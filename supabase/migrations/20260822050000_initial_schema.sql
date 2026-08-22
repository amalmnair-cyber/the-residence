-- AAAM Residency — Phase 1 schema.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

create extension if not exists btree_gist;

create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  check_in      date not null,
  check_out     date not null,
  guests        integer not null check (guests > 0),

  name          text not null,
  email         text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  phone         text not null,
  country       text not null,
  message       text,

  -- Price snapshot at submission time, so a booking's total never drifts if
  -- rates in src/data/booking.ts change later.
  nights        integer not null check (nights > 0),
  nightly_rate  integer not null,
  cleaning_fee  integer not null,
  total_amount  integer not null,
  currency      text not null default '£',

  status        text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'declined')),
  admin_note    text,

  stay_range    daterange generated always as (daterange(check_in, check_out, '[)')) stored,

  constraint check_out_after_check_in check (check_out > check_in),

  -- Two CONFIRMED bookings can never overlap — Postgres rejects it outright,
  -- even if an admin accidentally confirms two overlapping requests.
  constraint no_overlapping_confirmed_stays
    exclude using gist (stay_range with &&) where (status = 'confirmed')
);

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_confirmed_dates_idx
  on public.bookings (check_in, check_out) where status = 'confirmed';

-- Admin allow-list. Deliberately separate from "any authenticated user" —
-- if guest accounts are ever added later, this is what keeps guests from
-- being able to read each other's bookings.
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Lets a logged-in user call is_admin() via RPC to check their own status,
-- without being able to read the admin_users table directly.
grant execute on function public.is_admin() to authenticated;

alter table public.bookings enable row level security;
alter table public.admin_users enable row level security;

create policy "Admins can view bookings"
  on public.bookings for select to authenticated
  using (public.is_admin());

create policy "Admins can update bookings"
  on public.bookings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- No INSERT policy: the public booking form writes via the server-only
-- secret-key client (src/lib/supabase/admin.ts), which bypasses RLS by
-- design — so this table has zero client-reachable write path.
-- No policies at all on admin_users: nothing outside is_admin() ever reads it.

-- After running this file, create your own login at:
--   Dashboard → Authentication → Users → Add user
-- then copy the UUID it shows you and run:
--   insert into public.admin_users (user_id) values ('paste-uuid-here');
