-- Admin CRUD on bookings was missing Delete — only Select/Update existed.
create policy "Admins can delete bookings"
  on public.bookings for delete to authenticated
  using (public.is_admin());
