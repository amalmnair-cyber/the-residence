-- Two-property expansion, stage 1: schema.
--
-- Adds properties + property_images, makes bookings property-aware, and
-- re-scopes the double-booking constraint per property (two different
-- physical villas obviously don't share one calendar).

create table if not exists public.properties (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  tagline       text not null,
  location      text not null,
  description   text not null,

  -- Price snapshot fields on bookings already protect confirmed bookings
  -- from drifting if these change later — same pattern as before.
  nightly_rate  integer not null,
  cleaning_fee  integer not null,
  currency      text not null default '£',
  min_nights    integer not null default 3,
  max_guests    integer not null,

  bedrooms      integer not null,
  bathrooms     integer not null,
  square_feet   integer not null,
  floors        integer not null,

  -- Key into a hardcoded set of curated theme tokens in the frontend, not
  -- free-form colors — an admin picking arbitrary hex values is how you
  -- get an ugly or unreadable page. Extend the preset set in code if a
  -- third property ever needs its own look.
  theme_key     text not null default 'elmstead',

  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete cascade,
  url           text not null,
  alt           text not null default '',
  category      text not null check (category in ('hero', 'gallery')),
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists property_images_property_idx
  on public.property_images (property_id, category, sort_order);

-- Seed Property 1 with a fixed id so bookings can be backfilled against it
-- below, migrated from the current hardcoded src/data/*.ts content.
insert into public.properties
  (id, slug, name, tagline, location, description,
   nightly_rate, cleaning_fee, currency, min_nights, max_guests,
   bedrooms, bathrooms, square_feet, floors, theme_key, sort_order)
values
  ('c7578989-730a-4add-a01e-d7d988107bd1', 'the-elmstead', 'The Elmstead',
   'Designed for extraordinary living.', 'Hampstead, London',
   'A private architectural retreat, available for exclusive whole-house stays, designed around light, proportion and natural materials. Set within a quiet, gated plot moments from Hampstead Heath.',
   4500, 850, '£', 3, 12, 6, 8, 12500, 4, 'elmstead', 0)
on conflict (id) do nothing;

-- Property 2: a genuine contrast, not a re-skin — a coastal retreat with a
-- different material language (dark timber/slate vs. glass-and-concrete),
-- to justify an actually distinct theme. Placeholder copy, refine later
-- via the admin content editor once it exists.
insert into public.properties
  (id, slug, name, tagline, location, description,
   nightly_rate, cleaning_fee, currency, min_nights, max_guests,
   bedrooms, bathrooms, square_feet, floors, theme_key, sort_order)
values
  ('5a31d133-a06b-4634-837a-bc50db5a0499', 'the-kiln-house', 'The Kiln House',
   'Where the coastline sets the pace.', 'St Ives, Cornwall',
   'A weathered timber and slate retreat above the harbour, built around a single vast room open to the sea. Reserved entirely for you, moments from the working port and the coastal path.',
   3200, 650, '£', 3, 8, 4, 4, 6800, 2, 'kiln', 1)
on conflict (id) do nothing;

-- Seed a hero + gallery image per property so the page stops relying on the
-- hardcoded fallback in [slug]/page.tsx. Both verified to resolve on
-- images.unsplash.com before use. Fixed ids, same idempotency pattern as
-- the properties insert above.
insert into public.property_images (id, property_id, url, alt, category, sort_order)
values
  ('61b0a7d9-2705-41a4-a7ce-d7123b155bc9', 'c7578989-730a-4add-a01e-d7d988107bd1',
   'https://images.unsplash.com/photo-1748063578185-3d68121b11ff?q=80&w=2400&auto=format&fit=crop',
   'The Elmstead at dusk', 'hero', 0),
  ('ec267303-303c-4fca-88d6-9963d54de91e', 'c7578989-730a-4add-a01e-d7d988107bd1',
   'https://images.unsplash.com/photo-1679364297777-1db77b6199be?q=80&w=1800&auto=format&fit=crop',
   'Interior view of The Elmstead', 'gallery', 0),
  ('65d73ec2-a503-471c-b86a-dc0661ec763a', '5a31d133-a06b-4634-837a-bc50db5a0499',
   'https://images.unsplash.com/photo-1580051719856-fc5913b27710?q=80&w=2400&auto=format&fit=crop',
   'The Kiln House above St Ives harbour', 'hero', 0),
  ('5c8725ee-4bd2-458f-9a01-fa78aa98fad5', '5a31d133-a06b-4634-837a-bc50db5a0499',
   'https://images.unsplash.com/photo-1645099815150-ec1633635a3e?q=80&w=1800&auto=format&fit=crop',
   'St Ives harbour below The Kiln House', 'gallery', 0)
on conflict (id) do nothing;

-- bookings becomes property-aware.
alter table public.bookings add column if not exists property_id uuid references public.properties(id);
update public.bookings set property_id = 'c7578989-730a-4add-a01e-d7d988107bd1' where property_id is null;
alter table public.bookings alter column property_id set not null;

create index if not exists bookings_property_idx on public.bookings (property_id);

-- Re-scope the double-booking constraint per property. btree_gist (already
-- enabled) is what lets a plain equality column (property_id) join a range
-- column (stay_range) in the same exclusion constraint.
alter table public.bookings drop constraint if exists no_overlapping_confirmed_stays;
alter table public.bookings add constraint no_overlapping_confirmed_stays
  exclude using gist (property_id with =, stay_range with &&) where (status = 'confirmed');

alter table public.properties enable row level security;
alter table public.property_images enable row level security;

-- Public marketing content — anyone (including anonymous visitors) reads
-- it; only admins write it. Same is_admin() used everywhere else.
create policy "Anyone can view properties"
  on public.properties for select
  using (true);

create policy "Admins can manage properties"
  on public.properties for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can view property images"
  on public.property_images for select
  using (true);

create policy "Admins can manage property images"
  on public.property_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
