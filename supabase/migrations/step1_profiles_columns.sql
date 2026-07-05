alter table public.profiles
  add column if not exists normalized_display_name text,
  add column if not exists is_guest boolean default false;

update public.profiles
set normalized_display_name = lower(trim(display_name))
where display_name is not null and normalized_display_name is null;

create unique index if not exists idx_profiles_normalized_name_unique
  on public.profiles (normalized_display_name)
  where normalized_display_name is not null;

notify pgrst, 'reload schema';
