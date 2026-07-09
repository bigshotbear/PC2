-- Power Clash: Chapter 3 ("The Wilds") — extends the campaign from 17 to
-- 27 levels. Idempotent — safe to run any number of times.

insert into public.story_ability_catalog (ability_key, boss_key) values
  ('root_slam', 'the_overgrown_guy'), ('bark_skin', 'the_overgrown_guy'), ('regrowth', 'the_overgrown_guy'),
  ('trash_panda_frenzy', 'nightmare_fuel'), ('startling_agility', 'nightmare_fuel'), ('feral_instinct', 'nightmare_fuel'),
  ('eviction_notice', 'the_landlord'), ('property_lines', 'the_landlord'), ('landlord_energy', 'the_landlord'),
  ('ember_volley', 'campfire_cassandra'), ('controlled_burn', 'campfire_cassandra'), ('ranger_focus', 'campfire_cassandra'),
  ('full_hive_assault', 'the_swarm'), ('sting_over_time', 'the_swarm'), ('hive_mind', 'the_swarm'),
  ('storms_reckoning', 'old_man_thunderbeard'), ('grounded_stance', 'old_man_thunderbeard'), ('static_buildup', 'old_man_thunderbeard'),
  ('ambush_strike', 'the_apex_predator'), ('apex_instincts', 'the_apex_predator'), ('predator_focus', 'the_apex_predator'),
  ('ancient_resolve', 'mossy_the_unkillable'), ('millennia_of_patience', 'mossy_the_unkillable'), ('root_network', 'mossy_the_unkillable'),
  ('wildfire_cascade', 'the_forests_final_warning'), ('natures_fury', 'the_forests_final_warning'), ('wilds_memory', 'the_forests_final_warning'),
  ('everything_ive_learned', 'the_rangers_final_warning'), ('chapter_scholar', 'the_rangers_final_warning'), ('final_warning', 'the_rangers_final_warning')
on conflict (ability_key) do update set boss_key = excluded.boss_key;

-- Bump the campaign total from 17 to 27 — the single source of truth
-- every final-level/reward check reads from.
create or replace function public.story_total_levels() returns int
language sql immutable as $$ select 27 $$;

notify pgrst, 'reload schema';
