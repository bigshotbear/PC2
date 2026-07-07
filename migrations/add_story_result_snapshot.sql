-- Power Clash: durable Story result snapshot for reliable hard-refresh
-- recovery. sessionStorage remains a fast pointer, but the actual display
-- data is now backed by the server, not just the browser tab.
-- Idempotent — safe to run any number of times.

alter table public.story_battle_completions
  add column if not exists result_snapshot jsonb;

-- complete_story_battle now also accepts and stores the full judgment
-- snapshot (never used for reward eligibility — claim_story_reward still
-- reads won/level/boss/grade only from their own dedicated columns).
drop function if exists public.complete_story_battle(text, uuid, text, int, boolean, text, numeric, text);

create or replace function public.complete_story_battle(
  p_idempotency_key text, p_fighter_id uuid, p_boss_key text, p_level int,
  p_won boolean, p_grade text, p_boss_lowest_health numeric, p_defeat_cause text,
  p_result_snapshot jsonb default null
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
  v_snapshot_out jsonb;
begin
  if v_caller is null then raise exception 'not authenticated'; end if;
  select exists(select 1 from public.fighters where id = p_fighter_id and owner_id = v_caller) into v_owns_fighter;
  if not v_owns_fighter then raise exception 'fighter does not belong to the authenticated user'; end if;
  if p_idempotency_key is null or length(p_idempotency_key) = 0 then raise exception 'idempotency key is required'; end if;

  -- result_snapshot is CLIENT-SUBMITTED DISPLAY DATA ONLY. It is stored
  -- verbatim for the aftermath screen and is NEVER read by any progression
  -- logic below — won/level/boss/grade/ribbons/reward-eligibility all come
  -- exclusively from the function's own typed parameters and the
  -- dedicated columns they populate. Still, validate its shape so a
  -- malformed or oversized payload can't corrupt storage.
  if p_result_snapshot is not null then
    if jsonb_typeof(p_result_snapshot) <> 'object' then
      raise exception 'result_snapshot must be a JSON object or null';
    end if;
    if length(p_result_snapshot::text) > 50000 then
      raise exception 'result_snapshot exceeds the maximum allowed size';
    end if;
  end if;

  insert into public.story_battle_completions (user_id, fighter_id, idempotency_key, boss_key, level, won, grade, result_snapshot)
  values (v_caller, p_fighter_id, p_idempotency_key, p_boss_key, p_level, p_won, p_grade, p_result_snapshot)
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_completion_id;

  if v_completion_id is null then
    -- Duplicate/retry with the same key: return the ORIGINAL stored row,
    -- including its original result_snapshot. Never overwritten, never
    -- re-derived from this call's (possibly different) payload.
    select id, result_snapshot into v_completion_id, v_snapshot_out
      from public.story_battle_completions where user_id = v_caller and idempotency_key = p_idempotency_key;
    select * into v_fighter_progress from public.story_fighter_progress where user_id = v_caller and fighter_id = p_fighter_id;
    select * into v_boss_progress from public.story_boss_progress where user_id = v_caller and fighter_id = p_fighter_id and boss_key = p_boss_key;
    return jsonb_build_object('already_processed', true, 'completion_id', v_completion_id, 'result_snapshot', v_snapshot_out, 'fighter_progress', to_jsonb(v_fighter_progress), 'boss_progress', to_jsonb(v_boss_progress));
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
  return jsonb_build_object('already_processed', false, 'completion_id', v_completion_id, 'result_snapshot', p_result_snapshot, 'fighter_progress', to_jsonb(v_fighter_progress), 'boss_progress', to_jsonb(v_boss_progress));
end;
$$;

grant execute on function public.complete_story_battle(text, uuid, text, int, boolean, text, numeric, text, jsonb) to authenticated;

-- get_unclaimed_story_win now also returns the full snapshot.
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

  select c.id, c.boss_key, c.level, c.grade, c.result_snapshot into v_row
  from public.story_battle_completions c
  left join public.story_reward_claims r on r.completion_id = c.id
  where c.user_id = v_caller and c.fighter_id = p_fighter_id and c.won = true and r.id is null
  order by c.created_at desc
  limit 1;

  if v_row.id is null then return null; end if;
  return jsonb_build_object('completion_id', v_row.id, 'boss_key', v_row.boss_key, 'level', v_row.level, 'grade', v_row.grade, 'result_snapshot', v_row.result_snapshot);
end;
$$;

grant execute on function public.get_unclaimed_story_win(uuid) to authenticated;

-- New: fetch a KNOWN completion (win or loss) by id, for recovering the
-- aftermath screen itself (not just the unclaimed-reward flow). Ownership
-- checked; read-only; never touches progress or rewards.
create or replace function public.get_story_completion(p_completion_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_row public.story_battle_completions;
begin
  if v_caller is null then raise exception 'not authenticated'; end if;
  select * into v_row from public.story_battle_completions where id = p_completion_id;
  if v_row.id is null then return null; end if;
  if v_row.user_id is distinct from v_caller then raise exception 'completion does not belong to the authenticated user'; end if;
  return to_jsonb(v_row);
end;
$$;

grant execute on function public.get_story_completion(uuid) to authenticated;

notify pgrst, 'reload schema';
