-- Enable Supabase Realtime for tables the app subscribes to.
-- The supabase_realtime publication was empty, so postgres_changes
-- subscriptions in /occupancy and /dashboard never received events.
alter publication supabase_realtime add table
  public.reservations,
  public.payments,
  public.rooms,
  public.guest_facility_requests;
