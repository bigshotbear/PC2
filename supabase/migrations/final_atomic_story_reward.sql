-- Power Clash: ONE final, rerunnable migration for the Story reward system.
-- Safe to run regardless of whether any earlier reward migration was run.
--
-- NOTE ON "7 vs 17 LEVELS": story_total_levels() returns 17, matching the
-- actual deployed campaign (Arc 1: 7 bosses + Arc 2: 10 bosses, ending at
-- "The Everything Guy" / level 17). If you want the campaign capped at 7
-- instead, change the single RETURN value below and nothing else needs
-- to change — every final-level check in this file reads from this one
-- function.

-- =========================================================
-- 0. Base tables this migration depends on, created only if missing.
-- =========================================================
create table if not exists public.story_battle_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fighter_id uuid references public.fighters(id) on delete cascade,
  idempotency_key text not null,
  boss_key text not null,
  level int not null,
  won boolean not null,
  grade text,
  created_at timestamptz default now(),
  unique (user_id, idempotency_key)
);

alter table public.story_battle_completions enable row level security;
drop policy if exists "Users manage their own story battle completions" on public.story_battle_completions;
drop policy if exists "Users select their own story battle completions" on public.story_battle_completions;
create policy "Users select their own story battle completions"
  on public.story_battle_completions for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.story_battle_completions from authenticated;
revoke insert, update, delete on public.story_battle_completions from anon;
revoke insert, update, delete on public.story_battle_completions from public;

create index if not exists idx_story_completions_user on public.story_battle_completions (user_id);
create index if not exists idx_story_completions_unclaimed on public.story_battle_completions (fighter_id, won, created_at);

-- =========================================================
-- 1. story_ability_catalog
-- =========================================================
create table if not exists public.story_ability_catalog (
  ability_key text primary key,
  boss_key text not null
);

insert into public.story_ability_catalog (ability_key, boss_key) values
  ('stone_armor', 'stoneclaw'), ('ground_slam', 'stoneclaw'), ('unbreakable_stance', 'stoneclaw'),
  ('flame_dash', 'ember_fang'), ('burning_counter', 'ember_fang'), ('inferno_rush', 'ember_fang'),
  ('cyclone_step', 'gale_hunter'), ('wind_blade', 'gale_hunter'), ('air_dash', 'gale_hunter'),
  ('aegis_protocol', 'iron_oracle'), ('target_scan', 'iron_oracle'), ('overclock', 'iron_oracle'),
  ('soul_anchor', 'grave_warden'), ('shadow_step', 'grave_warden'), ('life_drain', 'grave_warden'),
  ('lightning_counter', 'storm_herald'), ('thunder_step', 'storm_herald'), ('storm_field', 'storm_herald'),
  ('void_collapse', 'void_king'), ('echo_step', 'void_king'), ('null_field', 'void_king'),
  ('no_hands_discount', 'the_puddle_problem'), ('puddle_slap', 'the_puddle_problem'), ('gutter_dive', 'the_puddle_problem'),
  ('it_just_bounces_off', 'test_dummy_zero'), ('overdrive_haymaker', 'test_dummy_zero'), ('warranty_void', 'test_dummy_zero'),
  ('tingly_numb_poke', 'quiet_guy_with_knives'), ('quiet_step', 'quiet_guy_with_knives'), ('blade_lecture', 'quiet_guy_with_knives'),
  ('one_more_rep', 'protein_shake_enjoyer'), ('protein_reserves', 'protein_shake_enjoyer'), ('gym_bro_wisdom', 'protein_shake_enjoyer'),
  ('five_finger_discount', 'the_middleman'), ('polite_negotiation', 'the_middleman'), ('return_policy', 'the_middleman'),
  ('its_just_dust_now', 'mister_crumble'), ('structural_integrity_denial', 'mister_crumble'), ('calm_before_the_crumble', 'mister_crumble'),
  ('regenerate_exe', 'the_understudy'), ('understudy_footwork', 'the_understudy'), ('second_wind_drink', 'the_understudy'),
  ('big_mad_energy', 'ceo_of_rage_quitting'), ('corporate_composure', 'ceo_of_rage_quitting'), ('email_the_whole_team', 'ceo_of_rage_quitting'),
  ('delete_city_bat', 'the_awakened_understudy'), ('too_much_power', 'the_awakened_understudy'), ('unstable_flicker', 'the_awakened_understudy'),
  ('one_power_to_rule', 'the_everything_guy'), ('collector_of_everything', 'the_everything_guy'), ('final_form_no_really', 'the_everything_guy')
on conflict (ability_key) do update set boss_key = excluded.boss_key;

alter table public.story_ability_catalog enable row level security;
drop policy if exists "Anyone authenticated can read the ability catalog" on public.story_ability_catalog;
create policy "Anyone authenticated can read the ability catalog"
  on public.story_ability_catalog for select to authenticated using (true);

revoke insert, update, delete on public.story_ability_catalog from authenticated;
revoke insert, update, delete on public.story_ability_catalog from anon;
revoke insert, update, delete on public.story_ability_catalog from public;

create or replace function public.story_total_levels() returns int
language sql immutable as $$ select 17 $$;

-- =========================================================
-- 2. story_reward_claims
-- =========================================================
create table if not exists public.story_reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fighter_id uuid references public.fighters(id) on delete cascade,
  idempotency_key text,
  level int,
  is_final boolean default false,
  reward_type text,
  ability_key text,
  stat_points jsonb,
  created_at timestamptz default now()
);

alter table public.story_reward_claims add column if not exists completion_id uuid;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'story_reward_claims' and constraint_name = 'story_reward_claims_completion_id_fkey'
  ) then
    alter table public.story_reward_claims
      add constraint story_reward_claims_completion_id_fkey
      foreign key (completion_id) references public.story_battle_completions(id);
  end if;
end $$;

alter table public.story_reward_claims alter column reward_type set not null;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'story_reward_claims_reward_type_check') then
    alter table public.story_reward_claims
      add constraint story_reward_claims_reward_type_check check (reward_type in ('ability', 'points'));
  end if;
end $$;

-- Requirement 5: completion_id is the ONLY thing that makes a claim
-- unique — not any client-supplied key.
create unique index if not exists idx_story_reward_claims_completion
  on public.story_reward_claims (completion_id)
  where completion_id is not null;

create index if not exists idx_story_reward_claims_user on public.story_reward_claims (user_id);

alter table public.story_reward_claims enable row level security;

drop policy if exists "Users manage their own reward claims" on public.story_reward_claims;
drop policy if exists "Users select their own reward claims" on public.story_reward_claims;
create policy "Users select their own reward claims"
  on public.story_reward_claims for select
  to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.story_reward_claims from authenticated;
revoke insert, update, delete on public.story_reward_claims from anon;
revoke insert, update, delete on public.story_reward_claims from public;

-- =========================================================
-- 3. Duplicate-equipped-ability trigger, WITH a preflight cleanup of any
--    existing duplicate loadouts so the trigger can never lock an
--    existing player out of ordinary progress saves.
-- =========================================================

-- Preflight: for any row where the same ability appears in more than one
-- slot, null out every occurrence after the first. Runs once, harmlessly
-- re-runs as a no-op on subsequent executions of this migration.
do $$
declare
  r record;
  seen text[];
  slots text[7];
  i int;
begin
  for r in select id, equipped_ability_1, equipped_ability_2, equipped_ability_3,
                  equipped_ability_4, equipped_ability_5, equipped_ability_6, equipped_ability_7
           from public.story_fighter_progress
  loop
    slots := array[r.equipped_ability_1, r.equipped_ability_2, r.equipped_ability_3,
                   r.equipped_ability_4, r.equipped_ability_5, r.equipped_ability_6, r.equipped_ability_7];
    seen := array[]::text[];
    for i in 1..7 loop
      if slots[i] is not null then
        if slots[i] = any(seen) then
          slots[i] := null; -- duplicate occurrence — clear it, keep the first
        else
          seen := seen || slots[i];
        end if;
      end if;
    end loop;
    update public.story_fighter_progress
    set equipped_ability_1 = slots[1], equipped_ability_2 = slots[2], equipped_ability_3 = slots[3],
        equipped_ability_4 = slots[4], equipped_ability_5 = slots[5], equipped_ability_6 = slots[6], equipped_ability_7 = slots[7]
    where id = r.id
      and (equipped_ability_1, equipped_ability_2, equipped_ability_3, equipped_ability_4, equipped_ability_5, equipped_ability_6, equipped_ability_7)
        is distinct from (slots[1], slots[2], slots[3], slots[4], slots[5], slots[6], slots[7]);
  end loop;
end $$;

create or replace function public.check_unique_equipped_abilities()
returns trigger
language plpgsql
as $$
declare
  v_filtered text[];
begin
  select array_agg(x) into v_filtered
  from unnest(array[new.equipped_ability_1, new.equipped_ability_2, new.equipped_ability_3,
                     new.equipped_ability_4, new.equipped_ability_5, new.equipped_ability_6, new.equipped_ability_7]) x
  where x is not null;

  if v_filtered is not null and array_length(v_filtered, 1) <> (select count(distinct x) from unnest(v_filtered) x) then
    raise exception 'the same ability cannot be equipped in more than one slot' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_unique_equipped_abilities on public.story_fighter_progress;
create trigger trg_unique_equipped_abilities
before insert or update on public.story_fighter_progress
for each row execute function public.check_unique_equipped_abilities();

-- =========================================================
-- 4. complete_story_battle — returns completion_id in BOTH branches.
-- =========================================================
drop function if exists public.complete_story_battle(text, uuid, text, int, boolean, text, numeric, text);

create or replace function public.complete_story_battle(
  p_idempotency_key text, p_fighter_id uuid, p_boss_key text, p_level int,
  p_won boolean, p_grade text, p_boss_lowest_health numeric, p_defeat_cause text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_owns_fighter boolean;
  v_completion_id uuid;
  v_boss_progress public.story_boss_progress;
  v_fighter_progress public.story_fighter_progress;
  v_times_fought int; v_times_defeated int; v_times_lost int;
  v_intel_level int; v_mastery_level int; v_best_grade text;
  v_grade_rank jsonb := '{"S":4,"A":3,"B":2,"C":1}'::jsonb;
begin
  if v_caller is null then raise exception 'not authenticated'; end if;
  select exists(select 1 from public.fighters where id = p_fighter_id and owner_id = v_caller) into v_owns_fighter;
  if not v_owns_fighter then raise exception 'fighter does not belong to the authenticated user'; end if;
  if p_idempotency_key is null or length(p_idempotency_key) = 0 then raise exception 'idempotency key is required'; end if;

  insert into public.story_battle_completions (user_id, fighter_id, idempotency_key, boss_key, level, won, grade)
  values (v_caller, p_fighter_id, p_idempotency_key, p_boss_key, p_level, p_won, p_grade)
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_completion_id;

  if v_completion_id is null then
    -- Requirement 6: recover and return completion_id on the duplicate
    -- path too, not just on first success.
    select id into v_completion_id from public.story_battle_completions where user_id = v_caller and idempotency_key = p_idempotency_key;
    select * into v_fighter_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = p_fighter_id;
    select * into v_boss_progress from public.story_boss_progress where user_id = v_caller and fighter_id = p_fighter_id and boss_key = p_boss_key;
    return jsonb_build_object('already_processed', true, 'completion_id', v_completion_id, 'fighter_progress', to_jsonb(v_fighter_progress), 'boss_progress', to_jsonb(v_boss_progress));
  end if;

  insert into public.story_boss_progress (user_id, fighter_id, boss_key)
  values (v_caller, p_fighter_id, p_boss_key)
  on conflict (user_id, fighter_id, boss_key) do nothing;

  select * into v_boss_progress from public.story_boss_progress
  where user_id = v_caller and fighter_id = p_fighter_id and boss_key = p_boss_key for update;

  v_times_fought := coalesce(v_boss_progress.times_fought, 0) + 1;
  v_times_defeated := coalesce(v_boss_progress.times_defeated, 0) + (case when p_won then 1 else 0 end);
  v_times_lost := coalesce(v_boss_progress.times_lost, 0) + (case when p_won then 0 else 1 end);
  v_intel_level := case when v_times_lost >= 3 then 3 when v_times_lost >= 1 then greatest(coalesce(v_boss_progress.intel_level,0),1) else coalesce(v_boss_progress.intel_level,0) end;
  v_mastery_level := case when v_times_fought >= 6 then 3 when v_times_fought >= 4 then greatest(coalesce(v_boss_progress.mastery_level,0),2) when v_times_fought >= 2 then greatest(coalesce(v_boss_progress.mastery_level,0),1) else coalesce(v_boss_progress.mastery_level,0) end;
  v_best_grade := case when p_won and (v_boss_progress.best_victory_grade is null or (v_grade_rank->>p_grade)::int > (v_grade_rank->>v_boss_progress.best_victory_grade)::int) then p_grade else v_boss_progress.best_victory_grade end;

  update public.story_boss_progress
  set times_fought = v_times_fought, times_defeated = v_times_defeated, times_lost = v_times_lost,
      last_defeat_cause = case when p_won then last_defeat_cause else p_defeat_cause end,
      lowest_boss_health = least(coalesce(lowest_boss_health,100), p_boss_lowest_health),
      best_victory_grade = v_best_grade, intel_level = v_intel_level, mastery_level = v_mastery_level, updated_at = now()
  where user_id = v_caller and fighter_id = p_fighter_id and boss_key = p_boss_key;

  select * into v_fighter_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = p_fighter_id for update;

  if p_won then
    update public.story_fighter_progress
    set highest_level = greatest(highest_level, p_level), run_status = 'active',
        wins_this_run = coalesce(wins_this_run,0) + 1,
        completed_bosses = (select coalesce(jsonb_agg(distinct x), '[]'::jsonb) from jsonb_array_elements(coalesce(completed_bosses,'[]'::jsonb) || to_jsonb(array[p_boss_key])) x),
        updated_at = now()
    where user_id = v_caller and fighter_id = p_fighter_id;
  else
    update public.story_fighter_progress
    set highest_level = greatest(highest_level, p_level), run_status = 'pending_training',
        last_boss_key = p_boss_key, last_defeat_cause = p_defeat_cause,
        current_level = p_level, losses_this_run = coalesce(losses_this_run,0) + 1, updated_at = now()
    where user_id = v_caller and fighter_id = p_fighter_id;
  end if;

  select * into v_fighter_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = p_fighter_id;
  select * into v_boss_progress from public.story_boss_progress where user_id = v_caller and fighter_id = p_fighter_id and boss_key = p_boss_key;
  return jsonb_build_object('already_processed', false, 'completion_id', v_completion_id, 'fighter_progress', to_jsonb(v_fighter_progress), 'boss_progress', to_jsonb(v_boss_progress));
end;
$$;

grant execute on function public.complete_story_battle(text, uuid, text, int, boolean, text, numeric, text) to authenticated;

-- =========================================================
-- 5. Requirement 13 recovery path: given a fighter, find the most recent
--    WON completion that has not yet issued a reward. This is the
--    server-side fallback when the client has lost completionId entirely
--    (e.g. a hard browser refresh cleared in-memory route state). No
--    client storage is required for this path to work.
-- =========================================================
create or replace function public.get_unclaimed_story_win(p_fighter_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_row record;
begin
  if v_caller is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.fighters where id = p_fighter_id and owner_id = v_caller) then
    raise exception 'fighter does not belong to the authenticated user';
  end if;

  select c.id, c.boss_key, c.level, c.grade into v_row
  from public.story_battle_completions c
  left join public.story_reward_claims r on r.completion_id = c.id
  where c.user_id = v_caller and c.fighter_id = p_fighter_id and c.won = true and r.id is null
  order by c.created_at desc
  limit 1;

  if v_row.id is null then return null; end if;
  return jsonb_build_object('completion_id', v_row.id, 'boss_key', v_row.boss_key, 'level', v_row.level, 'grade', v_row.grade);
end;
$$;

grant execute on function public.get_unclaimed_story_win(uuid) to authenticated;

-- =========================================================
-- 6. claim_story_reward — every prior overload dropped first, all values
--    read from the verified completion row, never trusted from the client.
-- =========================================================
drop function if exists public.claim_story_reward(text, uuid, int, boolean, text, text, text, jsonb, text);
drop function if exists public.claim_story_reward(uuid, text, text, jsonb);

create or replace function public.claim_story_reward(
  p_completion_id uuid,
  p_reward_type text,
  p_ability_key text default null,
  p_stat_points jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_completion public.story_battle_completions;
  v_progress public.story_fighter_progress;
  v_claim_id uuid;
  v_is_final boolean;
  v_total_points int;
  v_k text;
  v_raw_val text;
  v_grade_rank jsonb := '{"S":4,"A":3,"B":2,"C":1}'::jsonb;
  v_best_grade text;
  v_unlocked jsonb;
begin
  if v_caller is null then raise exception 'not authenticated'; end if;
  if p_reward_type not in ('ability', 'points') then raise exception 'invalid reward type'; end if;

  -- Requirement 7: everything below comes from the verified completion
  -- row — level, boss, grade, ownership, win status. Nothing here is
  -- trusted from the client except WHICH completion and WHICH reward.
  select * into v_completion from public.story_battle_completions where id = p_completion_id;
  if v_completion.id is null then raise exception 'completion not found'; end if;
  if v_completion.user_id is distinct from v_caller then raise exception 'completion does not belong to the authenticated user'; end if;
  if not v_completion.won then raise exception 'this attempt was not a win — no reward is available'; end if;

  if not exists (select 1 from public.fighters where id = v_completion.fighter_id and owner_id = v_caller) then
    raise exception 'fighter does not belong to the authenticated user';
  end if;

  select * into v_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = v_completion.fighter_id;
  if v_progress.id is null then raise exception 'story progress not found for this fighter'; end if;

  select id into v_claim_id from public.story_reward_claims where completion_id = p_completion_id;
  if v_claim_id is not null then
    select * into v_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = v_completion.fighter_id;
    select coalesce(jsonb_agg(to_jsonb(u)), '[]'::jsonb) into v_unlocked from public.story_unlocked_abilities u where u.user_id = v_caller and u.fighter_id = v_completion.fighter_id;
    return jsonb_build_object('already_processed', true, 'fighter_progress', to_jsonb(v_progress), 'unlocked_abilities', v_unlocked);
  end if;

  if p_reward_type = 'ability' then
    if p_ability_key is null then raise exception 'ability_key is required for an ability reward'; end if;
    if not exists (select 1 from public.story_ability_catalog where ability_key = p_ability_key and boss_key = v_completion.boss_key) then
      raise exception 'that ability is not eligible from this completed battle';
    end if;
    if exists (select 1 from public.story_unlocked_abilities where user_id = v_caller and fighter_id = v_completion.fighter_id and ability_key = p_ability_key) then
      raise exception 'that ability is already unlocked for this fighter';
    end if;
  end if;

  if p_reward_type = 'points' then
    if p_stat_points is null or jsonb_typeof(p_stat_points) <> 'object' then
      raise exception 'stat_points must be a JSON object';
    end if;
    for v_k in select jsonb_object_keys(p_stat_points) loop
      if v_k not in ('strength','speed','durability','battle_iq','stamina') then
        raise exception 'unexpected key in stat_points: %', v_k;
      end if;
    end loop;
    for v_k in select unnest(array['strength','speed','durability','battle_iq','stamina']) loop
      if p_stat_points ? v_k then
        v_raw_val := p_stat_points->>v_k;
        if v_raw_val !~ '^[0-9]+$' then
          raise exception 'stat_points.% must be a nonnegative integer, got %', v_k, v_raw_val;
        end if;
      end if;
    end loop;
    v_total_points := coalesce((p_stat_points->>'strength')::int,0) + coalesce((p_stat_points->>'speed')::int,0)
      + coalesce((p_stat_points->>'durability')::int,0) + coalesce((p_stat_points->>'battle_iq')::int,0) + coalesce((p_stat_points->>'stamina')::int,0);
    if v_total_points <> 7 then
      raise exception 'stat_points must total exactly 7, got %', v_total_points;
    end if;
  end if;

  -- Requirement 5: the unique index on completion_id is the atomic guard.
  insert into public.story_reward_claims (user_id, fighter_id, idempotency_key, completion_id, level, is_final, reward_type, ability_key, stat_points)
  values (v_caller, v_completion.fighter_id, p_completion_id::text, p_completion_id, v_completion.level,
          v_completion.level >= public.story_total_levels(), p_reward_type, p_ability_key, p_stat_points)
  on conflict (completion_id) do nothing
  returning id into v_claim_id;

  if v_claim_id is null then
    select * into v_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = v_completion.fighter_id;
    select coalesce(jsonb_agg(to_jsonb(u)), '[]'::jsonb) into v_unlocked from public.story_unlocked_abilities u where u.user_id = v_caller and u.fighter_id = v_completion.fighter_id;
    return jsonb_build_object('already_processed', true, 'fighter_progress', to_jsonb(v_progress), 'unlocked_abilities', v_unlocked);
  end if;

  if p_reward_type = 'ability' then
    insert into public.story_unlocked_abilities (user_id, fighter_id, ability_key, source_boss)
    values (v_caller, v_completion.fighter_id, p_ability_key, v_completion.boss_key)
    on conflict (user_id, fighter_id, ability_key) do nothing;
  else
    update public.story_fighter_progress
    set strength_bonus = strength_bonus + coalesce((p_stat_points->>'strength')::int, 0),
        speed_bonus = speed_bonus + coalesce((p_stat_points->>'speed')::int, 0),
        durability_bonus = durability_bonus + coalesce((p_stat_points->>'durability')::int, 0),
        battle_iq_bonus = battle_iq_bonus + coalesce((p_stat_points->>'battle_iq')::int, 0),
        stamina_bonus = stamina_bonus + coalesce((p_stat_points->>'stamina')::int, 0)
    where user_id = v_caller and fighter_id = v_completion.fighter_id;
  end if;

  -- Requirement 8: final status derived server-side from the verified
  -- completion's level, compared against the trusted story_total_levels().
  v_is_final := v_completion.level >= public.story_total_levels();

  select * into v_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = v_completion.fighter_id for update;

  if v_is_final then
    v_best_grade := case
      when v_progress.best_victory_grade is null or (v_grade_rank->>v_completion.grade)::int > (v_grade_rank->>v_progress.best_victory_grade)::int
      then v_completion.grade else v_progress.best_victory_grade
    end;
    update public.story_fighter_progress
    set completed_runs = coalesce(completed_runs, 0) + 1,
        final_boss_victories = coalesce(final_boss_victories, 0) + 1,
        conqueror_of_seven = true,
        best_victory_grade = v_best_grade,
        current_level = 1,
        run_status = 'idle',
        updated_at = now()
    where user_id = v_caller and fighter_id = v_completion.fighter_id;
  else
    update public.story_fighter_progress
    set current_level = v_completion.level + 1,
        run_status = 'active',
        updated_at = now()
    where user_id = v_caller and fighter_id = v_completion.fighter_id;
  end if;

  select * into v_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = v_completion.fighter_id;
  select coalesce(jsonb_agg(to_jsonb(u)), '[]'::jsonb) into v_unlocked from public.story_unlocked_abilities u where u.user_id = v_caller and u.fighter_id = v_completion.fighter_id;
  return jsonb_build_object('already_processed', false, 'fighter_progress', to_jsonb(v_progress), 'unlocked_abilities', v_unlocked);
end;
$$;

grant execute on function public.claim_story_reward(uuid, text, text, jsonb) to authenticated;

notify pgrst, 'reload schema';
