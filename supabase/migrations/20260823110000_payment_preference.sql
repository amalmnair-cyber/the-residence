-- Guest's payment preference, captured at booking time rather than only
-- decided by the admin after confirming. "upfront" is what makes
-- updateBookingStatus auto-generate and email a (test-mode) Stripe
-- payment link on confirmation; "arrival" skips that, matching the
-- existing pay-on-arrival default. An admin can still generate a payment
-- link manually for either case via the bookings dashboard.
alter table public.bookings
  add column if not exists payment_preference text not null default 'arrival'
  check (payment_preference in ('arrival', 'upfront'));
