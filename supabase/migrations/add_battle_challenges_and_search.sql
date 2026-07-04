-- Power Clash: fighter-first battle flow support.
-- Safe to run repeatedly.

-- =========================================================
-- Safe profile search (case-insensitive, partial display name,
-- exact email) that never exposes email or other private data
-- to the caller. SECURITY DEFINER bypasses per-row profile RLS
-- deliberately, but the function itself only ever returns
-- id/display_name/avatar_url.
-- =========================================================

create or replace function public.search_profiles(search_term text)
returns table (id uuid, display_name text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.avatar_url
  from public.profiles p
  where p.id <> auth.uid()
    and (
      p.display_name ilike '%' || search_term || '%'
      or lower(p.email) = lower(search_term)
    )
  order by p.display_name
  limit 20;
$$;

grant execute on function public.search_profiles(text) to authenticated;

create index if not exists idx_profiles_display_name_lower on public.profiles (lower(display_name));
create index if not exists idx_profiles_email_lower on public.profiles (lower(email));

-- =========================================================
-- TABLE: battle_challenges (async friend challenges)
-- =========================================================
create table if not exists public.battle_challenges (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade,
  receiver_id uuid references auth.users(id) on delete cascade,
  battle_size text not null check (battle_size in ('1v1','2v2','3v3')),
  sender_fighter_snapshots jsonb not null,
  receiver_fighter_snapshots jsonb,
  status text default 'pending' check (status in ('pending','accepted','declined','completed','cancelled')),
  created_at timestamptz default now(),
  completed_at timestamptz,
  battle_result_id uuid references public.battle_history(id)
);

alter table public.battle_challenges enable row level security;

drop policy if exists "Sender and receiver can read their challenges" on public.battle_challenges;
create policy "Sender and receiver can read their challenges"
  on public.battle_challenges for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Sender can create challenges" on public.battle_challenges;
create policy "Sender can create challenges"
  on public.battle_challenges for insert
  to authenticated
  with check (auth.uid() = sender_id);

drop policy if exists "Sender or receiver can update challenge" on public.battle_challenges;
create policy "Sender or receiver can update challenge"
  on public.battle_challenges for update
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id)
  with check (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Sender can delete their own challenge" on public.battle_challenges;
create policy "Sender can delete their own challenge"
  on public.battle_challenges for delete
  to authenticated
  using (auth.uid() = sender_id);

create index if not exists idx_battle_challenges_receiver on public.battle_challenges (receiver_id, status);
create index if not exists idx_battle_challenges_sender on public.battle_challenges (sender_id, status);

notify pgrst, 'reload schema';
