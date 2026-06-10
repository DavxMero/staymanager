-- Soft-cancel audit columns (Shneiderman: easy reversal of actions).
-- Set on cancel, reset to NULL on restore. No enum change needed:
-- reservations.status already includes 'cancelled'.
alter table public.reservations
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid,
  add column if not exists cancellation_reason text;
