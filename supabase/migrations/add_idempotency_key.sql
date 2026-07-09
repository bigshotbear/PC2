-- Power Clash: prevents duplicate battle saves (network retries, double
-- taps, refreshes) from ever recording the same fight twice.
-- Idempotent — safe to run any number of times.

alter table public.battle_history
  add column if not exists client_idempotency_key text;

create unique index if not exists idx_battle_history_idempotency_key
  on public.battle_history (client_idempotency_key)
  where client_idempotency_key is not null;

notify pgrst, 'reload schema';
