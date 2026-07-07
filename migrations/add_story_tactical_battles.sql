-- Power Clash: Story Mode tactical battle system additions.
-- Idempotent — safe to run any number of times.

alter table public.story_fighter_progress
  add column if not exists wins_this_run int default 0,
  add column if not exists losses_this_run int default 0,
  add column if not exists completed_bosses jsonb default '[]'::jsonb;

notify pgrst, 'reload schema';
