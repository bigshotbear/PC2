-- Run this BEFORE re-running the rest of the migration.
-- Postgres won't let CREATE OR REPLACE change a function's return columns,
-- so the old version has to be dropped first.

drop function if exists public.search_profiles(text);

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

notify pgrst, 'reload schema';
