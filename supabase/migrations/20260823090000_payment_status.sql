-- Test-mode Stripe payments. Booking still confirms the same way as
-- always (admin review, not automatic) — this only adds a way to track
-- whether the (test) payment for an already-confirmed booking has come
-- through, via a Stripe Checkout Session generated on confirmation.
alter table public.bookings
  add column if not exists payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid', 'paid'));
