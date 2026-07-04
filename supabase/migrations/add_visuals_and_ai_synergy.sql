-- Power Clash: visual system + Clash Coach fields. Safe to run repeatedly.

alter table public.fighters
add column if not exists visual_config jsonb default '{}'::jsonb,
add column if not exists visual_version integer default 1,
add column if not exists synergy_explanation text default '',
add column if not exists ai_synergy_review jsonb default '{}'::jsonb,
add column if not exists ai_synergy_modifier numeric default 0,
add column if not exists ai_synergy_updated_at timestamptz;

notify pgrst, 'reload schema';
