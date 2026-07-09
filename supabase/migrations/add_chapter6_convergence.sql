-- Power Clash: Chapter 6 ("The Convergence") — the finale. Extends the
-- campaign from 47 to the full 60 levels across 6 chapters.
-- Idempotent — safe to run any number of times.

insert into public.story_ability_catalog (ability_key, boss_key) values
  ('rift_pulse', 'the_convergence_point'),
  ('unstable_form', 'the_convergence_point'),
  ('echo_static', 'the_convergence_point'),
  ('remembered_ground_slam', 'echo_of_stoneclaw'),
  ('hardened_memory', 'echo_of_stoneclaw'),
  ('echo_instability', 'echo_of_stoneclaw'),
  ('corrupted_glomp', 'echo_of_the_puddle_problem'),
  ('echo_resistance', 'echo_of_the_puddle_problem'),
  ('memory_split', 'echo_of_the_puddle_problem'),
  ('corrupted_discount', 'echo_of_the_middleman'),
  ('echo_negotiation', 'echo_of_the_middleman'),
  ('compound_interest', 'echo_of_the_middleman'),
  ('corrupted_dust', 'echo_of_mister_crumble'),
  ('echo_denial', 'echo_of_mister_crumble'),
  ('patient_corruption', 'echo_of_mister_crumble'),
  ('corrupted_lessons', 'echo_of_the_ranger'),
  ('echo_scholarship', 'echo_of_the_ranger'),
  ('corrupted_warning', 'echo_of_the_ranger'),
  ('corrupted_count', 'echo_of_the_ref'),
  ('echo_officiating', 'echo_of_the_ref'),
  ('corrupted_rulebook', 'echo_of_the_ref'),
  ('corrupted_contract', 'echo_of_the_promoter'),
  ('echo_authority', 'echo_of_the_promoter'),
  ('corrupted_fine_print', 'echo_of_the_promoter'),
  ('corrupted_reckoning', 'echo_of_the_leviathans_heir'),
  ('echo_bloodline', 'echo_of_the_leviathans_heir'),
  ('corrupted_authority', 'echo_of_the_leviathans_heir'),
  ('cascading_instability', 'the_convergence_unstable'),
  ('fragmentary_defense', 'the_convergence_unstable'),
  ('convergent_chaos', 'the_convergence_unstable'),
  ('design_flaw', 'the_architect'),
  ('architects_intent', 'the_architect'),
  ('blueprint_shift', 'the_architect'),
  ('full_blueprint', 'the_architect_awakened'),
  ('total_awareness', 'the_architect_awakened'),
  ('unbound_design', 'the_architect_awakened'),
  ('the_convergence_itself', 'the_true_convergence'),
  ('campaign_memory', 'the_true_convergence'),
  ('final_form_true', 'the_true_convergence')
on conflict (ability_key) do update set boss_key = excluded.boss_key;

-- Final total: 60.
create or replace function public.story_total_levels() returns int
language sql immutable as $$ select 60 $$;

notify pgrst, 'reload schema';
