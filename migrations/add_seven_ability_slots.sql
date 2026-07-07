-- Power Clash: widen Story Mode equipped abilities from 3 slots to 7.
-- Idempotent — safe to run any number of times.

alter table public.story_fighter_progress
  add column if not exists equipped_ability_4 text,
  add column if not exists equipped_ability_5 text,
  add column if not exists equipped_ability_6 text,
  add column if not exists equipped_ability_7 text;

notify pgrst, 'reload schema';
