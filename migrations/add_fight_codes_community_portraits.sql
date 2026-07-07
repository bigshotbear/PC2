-- Power Clash: Fight Codes, Community Builds, and Portrait uploads.
-- Idempotent — safe to run any number of times.

-- =========================================================
-- Fighters: portrait support
-- =========================================================
alter table public.fighters add column if not exists portrait_url text;

-- =========================================================
-- TABLE: fight_codes
-- =========================================================
create table if not exists public.fight_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_id uuid references auth.users(id) on delete cascade,
  code_type text not null default 'fighter' check (code_type in ('fighter','roster','challenge')),
  fighter_snapshot jsonb not null,
  battle_size integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz,
  is_active boolean default true,
  times_used integer default 0
);

alter table public.fight_codes enable row level security;

drop policy if exists "Owners manage their own fight codes" on public.fight_codes;
create policy "Owners manage their own fight codes"
  on public.fight_codes for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Authenticated users can resolve active fight codes" on public.fight_codes;
create policy "Authenticated users can resolve active fight codes"
  on public.fight_codes for select
  to authenticated
  using (is_active = true or auth.uid() = owner_id);

create index if not exists idx_fight_codes_code on public.fight_codes (code);
create index if not exists idx_fight_codes_owner on public.fight_codes (owner_id);

create or replace function public.increment_fight_code_usage(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.fight_codes
  set times_used = times_used + 1
  where code = upper(trim(p_code));
end;
$$;

grant execute on function public.increment_fight_code_usage(text) to authenticated;

-- =========================================================
-- TABLE: community_builds
-- =========================================================
create table if not exists public.community_builds (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid unique,
  owner_id uuid references auth.users(id) on delete cascade,
  owner_display_name text,
  fighter_name text not null,
  fighter_snapshot jsonb not null,
  portrait_url text,
  power_source text,
  fighting_style text,
  combat_role text,
  total_power_cost numeric,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  times_fought integer default 0,
  wins integer default 0,
  losses integer default 0
);

alter table public.community_builds enable row level security;

drop policy if exists "Anyone authenticated can view active community builds" on public.community_builds;
create policy "Anyone authenticated can view active community builds"
  on public.community_builds for select
  to authenticated
  using (is_active = true or auth.uid() = owner_id);

drop policy if exists "Owners can insert their own community builds" on public.community_builds;
create policy "Owners can insert their own community builds"
  on public.community_builds for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their own community builds" on public.community_builds;
create policy "Owners can update their own community builds"
  on public.community_builds for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete their own community builds" on public.community_builds;
create policy "Owners can delete their own community builds"
  on public.community_builds for delete
  to authenticated
  using (auth.uid() = owner_id);

create index if not exists idx_community_builds_active on public.community_builds (is_active);
create index if not exists idx_community_builds_owner on public.community_builds (owner_id);
create index if not exists idx_community_builds_fighter on public.community_builds (fighter_id);

-- Secure random-opponent picker: runs as owner of the function so it can
-- see all active builds, but only ever returns public gameplay columns
-- and always excludes the caller's own builds via auth.uid().
create or replace function public.get_random_community_builds(requested_count int, exclude_ids uuid[] default '{}')
returns setof public.community_builds
language sql
security definer
set search_path = public
as $$
  select *
  from public.community_builds
  where is_active = true
    and owner_id <> auth.uid()
    and id <> all(exclude_ids)
  order by random()
  limit requested_count;
$$;

grant execute on function public.get_random_community_builds(int, uuid[]) to authenticated;

-- Lets any authenticated user (an opponent) safely record a fought result
-- without being granted general update rights on someone else's build.
create or replace function public.record_community_build_result(build_id uuid, did_win boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_builds
  set times_fought = times_fought + 1,
      wins = wins + case when did_win then 1 else 0 end,
      losses = losses + case when did_win then 0 else 1 end,
      updated_at = now()
  where id = build_id;
end;
$$;

grant execute on function public.record_community_build_result(uuid, boolean) to authenticated;

-- =========================================================
-- STORAGE: fighter-portraits bucket + policies
-- =========================================================
insert into storage.buckets (id, name, public)
values ('fighter-portraits', 'fighter-portraits', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own portraits" on storage.objects;
create policy "Users can upload their own portraits"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fighter-portraits' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own portraits" on storage.objects;
create policy "Users can update their own portraits"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fighter-portraits' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own portraits" on storage.objects;
create policy "Users can delete their own portraits"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fighter-portraits' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Anyone can view fighter portraits" on storage.objects;
create policy "Anyone can view fighter portraits"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'fighter-portraits');

notify pgrst, 'reload schema';
