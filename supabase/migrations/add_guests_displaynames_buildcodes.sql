-- Power Clash: Display names, Guest accounts, Community Build codes.
-- Idempotent — safe to run any number of times.

alter table public.profiles
  add column if not exists normalized_display_name text,
  add column if not exists is_guest boolean default false;

update public.profiles
set normalized_display_name = lower(trim(display_name))
where display_name is not null and normalized_display_name is null;

create unique index if not exists idx_profiles_normalized_name_unique
  on public.profiles (normalized_display_name)
  where normalized_display_name is not null;

create or replace function public.search_profiles(search_term text)
returns table (id uuid, display_name text, avatar_url text, is_guest boolean)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.avatar_url, p.is_guest
  from public.profiles p
  where p.id <> auth.uid()
    and p.display_name is not null
    and (
      p.normalized_display_name like '%' || lower(trim(search_term)) || '%'
      or lower(p.email) = lower(trim(search_term))
    )
  order by p.display_name
  limit 20;
$$;

grant execute on function public.search_profiles(text) to authenticated;

create or replace function public.is_display_name_available(candidate text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where normalized_display_name = lower(trim(candidate))
      and id <> auth.uid()
  );
$$;

grant execute on function public.is_display_name_available(text) to authenticated;

alter table public.community_builds
  add column if not exists build_code text,
  add column if not exists visibility text default 'unlisted' check (visibility in ('unlisted','public')),
  add column if not exists version int default 1,
  add column if not exists description text;

create unique index if not exists idx_community_builds_build_code
  on public.community_builds (build_code)
  where build_code is not null;

create index if not exists idx_community_builds_visibility on public.community_builds (visibility);

notify pgrst, 'reload schema';
