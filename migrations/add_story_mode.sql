-- Power Clash: Story Mode. Idempotent — safe to run any number of times.

create table if not exists public.story_fighter_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fighter_id uuid references public.fighters(id) on delete cascade,
  strength_bonus int default 0,
  speed_bonus int default 0,
  durability_bonus int default 0,
  battle_iq_bonus int default 0,
  stamina_bonus int default 0,
  current_level int default 1,
  highest_level int default 1,
  run_status text default 'idle' check (run_status in ('idle','active','pending_reward','pending_training')),
  total_attempts int default 0,
  completed_runs int default 0,
  final_boss_victories int default 0,
  pending_training_reward boolean default false,
  last_boss_key text,
  last_defeat_cause text,
  equipped_ability_1 text,
  equipped_ability_2 text,
  equipped_ability_3 text,
  conqueror_of_seven boolean default false,
  best_victory_grade text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, fighter_id)
);

alter table public.story_fighter_progress enable row level security;

drop policy if exists "Users manage their own story progress" on public.story_fighter_progress;
create policy "Users manage their own story progress"
  on public.story_fighter_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_story_progress_user on public.story_fighter_progress (user_id);
create index if not exists idx_story_progress_fighter on public.story_fighter_progress (fighter_id);

-- =========================================================
create table if not exists public.story_unlocked_abilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fighter_id uuid references public.fighters(id) on delete cascade,
  ability_key text not null,
  source_boss text,
  upgrade_level int default 1 check (upgrade_level between 1 and 3),
  unlocked_at timestamptz default now(),
  unique (user_id, fighter_id, ability_key)
);

alter table public.story_unlocked_abilities enable row level security;

drop policy if exists "Users manage their own unlocked abilities" on public.story_unlocked_abilities;
create policy "Users manage their own unlocked abilities"
  on public.story_unlocked_abilities for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_story_abilities_user_fighter on public.story_unlocked_abilities (user_id, fighter_id);

-- =========================================================
create table if not exists public.story_boss_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fighter_id uuid references public.fighters(id) on delete cascade,
  boss_key text not null,
  times_fought int default 0,
  times_defeated int default 0,
  times_lost int default 0,
  last_defeat_cause text,
  last_equipped_abilities jsonb default '[]'::jsonb,
  highest_damage numeric default 0,
  lowest_boss_health numeric default 100,
  best_victory_grade text,
  intel_level int default 0,
  mastery_level int default 0,
  updated_at timestamptz default now(),
  unique (user_id, fighter_id, boss_key)
);

alter table public.story_boss_progress enable row level security;

drop policy if exists "Users manage their own boss progress" on public.story_boss_progress;
create policy "Users manage their own boss progress"
  on public.story_boss_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_story_boss_user_fighter on public.story_boss_progress (user_id, fighter_id);
create index if not exists idx_story_boss_key on public.story_boss_progress (boss_key);

notify pgrst, 'reload schema';
