-- Run this now if bookings table already exists but create fails with:
-- permission denied for table bookings

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.bookings to postgres, service_role;
grant select, insert, update, delete on table public.bookings to anon, authenticated;
