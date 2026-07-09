-- Power Clash: Chapter 5 ("The Deep") — extends the campaign from 37 to
-- 47 levels. Idempotent — safe to run any number of times.

insert into public.story_ability_catalog (ability_key, boss_key) values
  ('crushing_tide', 'the_tide_warden'),
  ('tidal_guard', 'the_tide_warden'),
  ('current_control', 'the_tide_warden'),
  ('lure_and_strike', 'bioluminescent_betty'),
  ('false_safety', 'bioluminescent_betty'),
  ('deep_camouflage', 'bioluminescent_betty'),
  ('depth_charge', 'the_pressure_cooker'),
  ('crush_resistant', 'the_pressure_cooker'),
  ('pressure_buildup', 'the_pressure_cooker'),
  ('maelstrom_command', 'captain_undertow'),
  ('ghostly_authority', 'captain_undertow'),
  ('sunken_tactics', 'captain_undertow'),
  ('borrowed_grasp', 'the_krakens_apprentice'),
  ('apprentice_instinct', 'the_krakens_apprentice'),
  ('many_hands', 'the_krakens_apprentice'),
  ('shock_current', 'static_eel_sam'),
  ('eel_speed', 'static_eel_sam'),
  ('live_wire', 'static_eel_sam'),
  ('too_good_to_be_true', 'the_anglerfish_con_artist'),
  ('smooth_talker', 'the_anglerfish_con_artist'),
  ('bait_and_switch', 'the_anglerfish_con_artist'),
  ('the_deepest_point', 'pressures_embrace'),
  ('abyssal_patience', 'pressures_embrace'),
  ('crushing_embrace', 'pressures_embrace'),
  ('everything_youve_missed', 'the_abyss_watches'),
  ('watching_presence', 'the_abyss_watches'),
  ('abyssal_speed', 'the_abyss_watches'),
  ('abyssal_reckoning', 'the_leviathans_heir'),
  ('leviathan_bloodline', 'the_leviathans_heir'),
  ('depths_authority', 'the_leviathans_heir')
on conflict (ability_key) do update set boss_key = excluded.boss_key;

create or replace function public.story_total_levels() returns int
language sql immutable as $$ select 47 $$;

notify pgrst, 'reload schema';
