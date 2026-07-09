-- Power Clash: Chapter 4 ("The Circuit") — extends the campaign from 27 to
-- 37 levels. Idempotent — safe to run any number of times.

insert into public.story_ability_catalog (ability_key, boss_key) values
  ('three_count_special', 'the_ref_whos_seen_everything'),
  ('seen_it_all', 'the_ref_whos_seen_everything'),
  ('rulebook_knowledge', 'the_ref_whos_seen_everything'),
  ('definitely_not_allowed', 'disqualification_dan'),
  ('loophole_hunting', 'disqualification_dan'),
  ('banned_technique', 'disqualification_dan'),
  ('self_tag_combo', 'the_tag_team_of_one'),
  ('solo_teamwork', 'the_tag_team_of_one'),
  ('style_swap', 'the_tag_team_of_one'),
  ('live_commentary', 'ringside_rhonda'),
  ('crowd_hype', 'ringside_rhonda'),
  ('play_by_play', 'ringside_rhonda'),
  ('unmasking_strike', 'the_masked_mystery'),
  ('technique_mimicry', 'the_masked_mystery'),
  ('mystery_presence', 'the_masked_mystery'),
  ('undefeated_streak', 'championship_belt_karen'),
  ('championship_presence', 'championship_belt_karen'),
  ('belt_swing', 'championship_belt_karen'),
  ('grand_finale', 'the_pyrotechnics_guy'),
  ('showstopper', 'the_pyrotechnics_guy'),
  ('pyro_budget', 'the_pyrotechnics_guy'),
  ('comeback_special', 'undefeated_underdog'),
  ('never_say_die', 'undefeated_underdog'),
  ('underdog_speed', 'undefeated_underdog'),
  ('fine_print', 'the_promoter'),
  ('arena_control', 'the_promoter'),
  ('league_authority', 'the_promoter'),
  ('hall_of_fame_combo', 'the_circuits_living_legend'),
  ('circuit_legacy', 'the_circuits_living_legend'),
  ('main_event_energy', 'the_circuits_living_legend')
on conflict (ability_key) do update set boss_key = excluded.boss_key;

create or replace function public.story_total_levels() returns int
language sql immutable as $$ select 37 $$;

notify pgrst, 'reload schema';
