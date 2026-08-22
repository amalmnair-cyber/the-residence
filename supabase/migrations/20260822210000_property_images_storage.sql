-- Storage bucket for admin-uploaded property images (hero/gallery), backing
-- the new content-management admin UI. Public read (these are public
-- marketing photos, served directly on the property pages); admin-only
-- write, same is_admin() used everywhere else.

-- Nullable: the existing seeded rows point at external Unsplash URLs, not
-- objects in this bucket, so there's nothing to delete from storage for
-- them. Only rows created via the admin upload flow have a path here.
alter table public.property_images add column if not exists storage_path text;

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "Public read access to property images bucket"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "Admins can upload property images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images' and public.is_admin());

create policy "Admins can delete property images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin());
