-- Power Clash: Victory Ribbons + redesigned post-fight data (impact
-- breakdown, active badge loadouts, score ledger, completed-fight codes).
-- Idempotent — safe to run any number of times.

alter table public.profiles add column if not exists total_ribbons int default 0;

alter table public.battle_history
  add column if not exists ribbon_awarded boolean default false,
  add column if not exists active_badges_a jsonb default '[]'::jsonb,
  add column if not exists active_badges_b jsonb default '[]'::jsonb,
  add column if not exists active_synergies_detail_a jsonb default '[]'::jsonb,
  add column if not exists active_synergies_detail_b jsonb default '[]'::jsonb,
  add column if not exists impact_breakdown_a jsonb default '{}'::jsonb,
  add column if not exists impact_breakdown_b jsonb default '{}'::jsonb,
  add column if not exists score_ledger_a jsonb default '[]'::jsonb,
  add column if not exists score_ledger_b jsonb default '[]'::jsonb,
  add column if not exists fighter_contributions_a jsonb default '[]'::jsonb,
  add column if not exists fighter_contributions_b jsonb default '[]'::jsonb,
  add column if not exists play_of_match text,
  add column if not exists fight_code text;

-- Fight Code must be unique so it can be safely resolved later, but only
-- enforce uniqueness once every row has one (existing historical rows will
-- simply have a null fight_code and won't collide with the unique index).
create unique index if not exists idx_battle_history_fight_code
  on public.battle_history (fight_code)
  where fight_code is not null;

create index if not exists idx_battle_history_ribbon_awarded on public.battle_history (ribbon_awarded);

notify pgrst, 'reload schema';
