-- Power Clash: enable 5v5 battle size at the database level.
-- Idempotent — safe to run any number of times.

alter table public.teams drop constraint if exists teams_battle_mode_check;
alter table public.teams add constraint teams_battle_mode_check
  check (battle_mode in ('1v1','2v2','3v3','5v5'));

alter table public.battle_challenges drop constraint if exists battle_challenges_battle_size_check;
alter table public.battle_challenges add constraint battle_challenges_battle_size_check
  check (battle_size in ('1v1','2v2','3v3','5v5'));

notify pgrst, 'reload schema';
