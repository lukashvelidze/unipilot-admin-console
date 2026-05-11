-- Journey planner request and generation lifecycle
create table if not exists public.journey_plan_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  origin_country_code text not null,
  destination_country_code text not null,
  visa_type_code text,
  level_of_study text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'visible')),
  generation_state text not null default 'queued' check (generation_state in ('queued', 'in_progress', 'completed', 'failed')),
  current_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_plan_versions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.journey_plan_requests(id) on delete cascade,
  version integer not null,
  generation_mode text not null default 'ai' check (generation_mode in ('ai', 'fallback')),
  procedures jsonb not null default '[]'::jsonb,
  deadlines jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (request_id, version)
);

create table if not exists public.journey_plan_checklist_groups (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.journey_plan_versions(id) on delete cascade,
  source_checklist_id uuid references public.checklists(id) on delete set null,
  title text not null,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'basic', 'standard', 'premium')),
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.journey_plan_checklist_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.journey_plan_checklist_groups(id) on delete cascade,
  source_checklist_item_id uuid references public.checklist_items(id) on delete set null,
  label text not null,
  details text,
  required boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.journey_plan_sources (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.journey_plan_versions(id) on delete cascade,
  label text not null,
  url text,
  last_updated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.journey_plan_generation_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.journey_plan_requests(id) on delete cascade,
  event_type text not null check (event_type in ('generation_started', 'generation_succeeded', 'generation_failed', 'regenerated')),
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists journey_plan_requests_user_id_idx
  on public.journey_plan_requests(user_id);

create index if not exists journey_plan_requests_status_idx
  on public.journey_plan_requests(status, generation_state);

create index if not exists journey_plan_versions_request_id_idx
  on public.journey_plan_versions(request_id, version desc);

create index if not exists journey_plan_group_version_id_idx
  on public.journey_plan_checklist_groups(version_id, sort_order);

create index if not exists journey_plan_items_group_id_idx
  on public.journey_plan_checklist_items(group_id, sort_order);

create index if not exists journey_plan_sources_version_id_idx
  on public.journey_plan_sources(version_id);

create index if not exists journey_plan_events_request_id_idx
  on public.journey_plan_generation_events(request_id, created_at desc);
