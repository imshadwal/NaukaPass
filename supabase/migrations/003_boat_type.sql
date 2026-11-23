-- Add boat type for Motor Boat / Bajra Boat

alter table public.bookings
  add column if not exists boat_type text not null default 'motor_boat';

alter table public.bookings
  drop constraint if exists bookings_boat_type_check;

alter table public.bookings
  add constraint bookings_boat_type_check
  check (boat_type in ('motor_boat', 'bajra_boat'));
