-- Rate limiting for the public booking form and admin login. No client-reachable
-- path: only the server-only admin client touches this table (same pattern as
-- admin_users), so RLS is enabled with zero policies.
create table if not exists public.rate_limit_hits (
  id          bigint generated always as identity primary key,
  key         text not null,
  created_at  timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_created_idx
  on public.rate_limit_hits (key, created_at);

alter table public.rate_limit_hits enable row level security;
