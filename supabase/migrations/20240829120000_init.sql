-- Apply this in the Supabase SQL editor or via the CLI when you connect a project.
-- Local app currently uses src/data/store.ts instead of this database.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  offense_color text not null default '#2563eb',
  defense_color text not null default '#dc2626',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'coach', 'assistant', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  tags text[] not null default '{}',
  thumbnail_url text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references public.plays (id) on delete cascade,
  name text not null,
  duration_ms integer not null default 8000,
  camera jsonb not null default '{}'::jsonb,
  court jsonb not null default '{}'::jsonb,
  ball_trail_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scene_players (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes (id) on delete cascade,
  team_side text not null check (team_side in ('offense', 'defense')),
  jersey_number integer,
  role text not null check (role in ('MB', 'OH', 'S', 'L', 'Opp', 'DS')),
  court_zone integer check (court_zone between 1 and 6),
  court_slot text check (
    court_slot in ('left', 'middle', 'right', 'back_left', 'back_middle', 'back_right')
  ),
  action_mode text not null check (
    action_mode in ('blocking', 'hitting', 'setting', 'defense', 'serving', 'running', 'jumping')
  ),
  start_position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.paths (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes (id) on delete cascade,
  kind text not null check (kind in ('player', 'ball', 'drawing')),
  player_id uuid references public.scene_players (id) on delete set null,
  color text,
  points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.path_jump_points (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.paths (id) on delete cascade,
  takeoff_time_ms integer not null,
  landing_time_ms integer not null,
  takeoff jsonb not null,
  peak jsonb not null,
  landing jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.keyframes (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes (id) on delete cascade,
  t_ms integer not null,
  label text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.film_jobs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  play_id uuid references public.plays (id) on delete set null,
  status text not null default 'queued' check (
    status in ('queued', 'processing', 'completed', 'failed')
  ),
  source_url text not null,
  result jsonb,
  error text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plays_team_id_idx on public.plays (team_id);
create index if not exists scenes_play_id_idx on public.scenes (play_id);
create index if not exists scene_players_scene_id_idx on public.scene_players (scene_id);
create index if not exists paths_scene_id_idx on public.paths (scene_id);
create index if not exists jump_points_path_id_idx on public.path_jump_points (path_id);
create index if not exists keyframes_scene_id_idx on public.keyframes (scene_id);
create index if not exists film_jobs_team_id_idx on public.film_jobs (team_id);

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.plays enable row level security;
alter table public.scenes enable row level security;
alter table public.scene_players enable row level security;
alter table public.paths enable row level security;
alter table public.path_jump_points enable row level security;
alter table public.keyframes enable row level security;
alter table public.film_jobs enable row level security;

create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and user_id = auth.uid()
  );
$$;

create or replace function public.can_write_team(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
      and role in ('owner', 'coach', 'assistant')
  );
$$;

create policy "profiles_self_select" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid());

create policy "teams_member_select" on public.teams
  for select using (public.is_team_member(id));
create policy "teams_insert_own" on public.teams
  for insert with check (created_by = auth.uid());
create policy "teams_owner_update" on public.teams
  for update using (
    exists (
      select 1 from public.team_members
      where team_id = id and user_id = auth.uid() and role = 'owner'
    )
  );

create policy "members_select" on public.team_members
  for select using (public.is_team_member(team_id));
create policy "members_owner_write" on public.team_members
  for all using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'owner'
    )
  );

create policy "plays_select" on public.plays
  for select using (public.is_team_member(team_id));
create policy "plays_write" on public.plays
  for all using (public.can_write_team(team_id))
  with check (public.can_write_team(team_id));

create policy "scenes_select" on public.scenes
  for select using (
    exists (
      select 1 from public.plays p
      where p.id = play_id and public.is_team_member(p.team_id)
    )
  );
create policy "scenes_write" on public.scenes
  for all using (
    exists (
      select 1 from public.plays p
      where p.id = play_id and public.can_write_team(p.team_id)
    )
  );

create policy "scene_players_select" on public.scene_players
  for select using (
    exists (
      select 1 from public.scenes s
      join public.plays p on p.id = s.play_id
      where s.id = scene_id and public.is_team_member(p.team_id)
    )
  );
create policy "scene_players_write" on public.scene_players
  for all using (
    exists (
      select 1 from public.scenes s
      join public.plays p on p.id = s.play_id
      where s.id = scene_id and public.can_write_team(p.team_id)
    )
  );

create policy "paths_select" on public.paths
  for select using (
    exists (
      select 1 from public.scenes s
      join public.plays p on p.id = s.play_id
      where s.id = scene_id and public.is_team_member(p.team_id)
    )
  );
create policy "paths_write" on public.paths
  for all using (
    exists (
      select 1 from public.scenes s
      join public.plays p on p.id = s.play_id
      where s.id = scene_id and public.can_write_team(p.team_id)
    )
  );

create policy "jump_points_select" on public.path_jump_points
  for select using (
    exists (
      select 1 from public.paths path
      join public.scenes s on s.id = path.scene_id
      join public.plays p on p.id = s.play_id
      where path.id = path_id and public.is_team_member(p.team_id)
    )
  );
create policy "jump_points_write" on public.path_jump_points
  for all using (
    exists (
      select 1 from public.paths path
      join public.scenes s on s.id = path.scene_id
      join public.plays p on p.id = s.play_id
      where path.id = path_id and public.can_write_team(p.team_id)
    )
  );

create policy "keyframes_select" on public.keyframes
  for select using (
    exists (
      select 1 from public.scenes s
      join public.plays p on p.id = s.play_id
      where s.id = scene_id and public.is_team_member(p.team_id)
    )
  );
create policy "keyframes_write" on public.keyframes
  for all using (
    exists (
      select 1 from public.scenes s
      join public.plays p on p.id = s.play_id
      where s.id = scene_id and public.can_write_team(p.team_id)
    )
  );

create policy "film_jobs_select" on public.film_jobs
  for select using (public.is_team_member(team_id));
create policy "film_jobs_write" on public.film_jobs
  for all using (public.can_write_team(team_id))
  with check (public.can_write_team(team_id));
