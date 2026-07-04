-- Power Clash: Gauntlet Mode support on battle_history.
-- Idempotent — safe to run any number of times.

alter table public.battle_history
  add column if not exists battle_format text default 'team',
  add column if not exists lineup_order_a jsonb default '[]'::jsonb,
  add column if not exists lineup_order_b jsonb default '[]'::jsonb,
  add column if not exists lineup_visibility text default 'open',
  add column if not exists gauntlet_matchups jsonb default '[]'::jsonb,
  add column if not exists special_result text;

alter table public.battle_history drop constraint if exists battle_history_battle_format_check;
alter table public.battle_history add constraint battle_history_battle_format_check
  check (battle_format in ('team','gauntlet'));

alter table public.battle_history drop constraint if exists battle_history_lineup_visibility_check;
alter table public.battle_history add constraint battle_history_lineup_visibility_check
  check (lineup_visibility in ('open','blind'));

create index if not exists idx_battle_history_battle_format on public.battle_history (battle_format);

notify pgrst, 'reload schema';
