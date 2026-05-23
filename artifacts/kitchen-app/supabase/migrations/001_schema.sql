-- PrepFlows — Full Database Schema + RLS
-- Run this in your Supabase project → SQL Editor → Run
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS and IF NOT EXISTS guards)

-- ─────────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  full_name    text,
  avatar_url   text,
  role         text default 'staff',
  created_at   timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────────
-- TEAMS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.teams (
  id                uuid default gen_random_uuid() primary key,
  name              text not null,
  owner_id          uuid references auth.users on delete cascade not null,
  subscription_tier text default 'free' not null,
  created_at        timestamptz default now() not null
);

create index if not exists teams_owner_id_idx on public.teams (owner_id);

-- ─────────────────────────────────────────────────────────────────
-- TEAM MEMBERS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.team_members (
  id         uuid default gen_random_uuid() primary key,
  team_id    uuid references public.teams on delete cascade not null,
  user_id    uuid references auth.users on delete cascade not null,
  role       text default 'staff' not null,
  created_at timestamptz default now() not null,
  unique (team_id, user_id)
);

create index if not exists team_members_team_id_idx on public.team_members (team_id);
create index if not exists team_members_user_id_idx on public.team_members (user_id);

-- ─────────────────────────────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.invitations (
  id         uuid default gen_random_uuid() primary key,
  team_id    uuid references public.teams on delete cascade not null,
  email      text not null,
  role       text default 'staff' not null,
  invited_by uuid references auth.users on delete set null,
  accepted   boolean default false not null,
  created_at timestamptz default now() not null
);

create index if not exists invitations_email_idx on public.invitations (email);
create index if not exists invitations_team_id_idx on public.invitations (team_id);

-- ─────────────────────────────────────────────────────────────────
-- OPERATIONAL TABLES (kitchen data)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.kitchen_functions (
  id                   text primary key,
  name                 text,
  room                 text,
  floor                text,
  function_type        text,
  date                 text,
  start_time           text,
  end_time             text,
  guest_count          integer default 0,
  status               text default 'upcoming',
  menu                 jsonb default '[]',
  dietary_requirements jsonb default '[]',
  service_times        jsonb,
  service_events       jsonb,
  team_ids             jsonb default '[]',
  timeline             jsonb default '[]',
  chef_in_charge       text,
  team_id              uuid references public.teams,
  created_at           timestamptz default now()
);

create table if not exists public.staff_members (
  id            text primary key,
  staff_number  text,
  name          text,
  role          text,
  phone         text,
  pin           text,
  shift_start   text,
  shift_end     text,
  function_ids  jsonb default '[]',
  team_lead_for text,
  section       text,
  access_level  text,
  team_id       uuid references public.teams,
  created_at    timestamptz default now()
);

create table if not exists public.prep_items (
  id          text primary key,
  function_id text,
  category    text,
  team        text,
  dish        text,
  quantity    text,
  deadline    text,
  prep_day    text,
  note        text,
  completed   boolean default false,
  team_id     uuid references public.teams,
  created_at  timestamptz default now()
);

create table if not exists public.broadcast_messages (
  id          text primary key,
  text        text,
  sender_name text,
  sender_role text,
  sent_at     text,
  is_active   boolean default true,
  team_id     uuid references public.teams,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────
-- TRIGGER: auto-create profile on new user signup
-- ─────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.teams             enable row level security;
alter table public.team_members      enable row level security;
alter table public.invitations       enable row level security;
alter table public.kitchen_functions enable row level security;
alter table public.staff_members     enable row level security;
alter table public.prep_items        enable row level security;
alter table public.broadcast_messages enable row level security;

-- Drop existing policies before recreating (safe re-run)
do $$ begin
  drop policy if exists "profiles_select_own"  on public.profiles;
  drop policy if exists "profiles_update_own"  on public.profiles;
  drop policy if exists "teams_select"         on public.teams;
  drop policy if exists "teams_insert"         on public.teams;
  drop policy if exists "teams_update"         on public.teams;
  drop policy if exists "teams_delete"         on public.teams;
  drop policy if exists "team_members_select"  on public.team_members;
  drop policy if exists "team_members_insert"  on public.team_members;
  drop policy if exists "team_members_update"  on public.team_members;
  drop policy if exists "team_members_delete"  on public.team_members;
  drop policy if exists "invitations_select"   on public.invitations;
  drop policy if exists "invitations_insert"   on public.invitations;
  drop policy if exists "kf_select"            on public.kitchen_functions;
  drop policy if exists "kf_insert"            on public.kitchen_functions;
  drop policy if exists "kf_update"            on public.kitchen_functions;
  drop policy if exists "kf_delete"            on public.kitchen_functions;
  drop policy if exists "sm_select"            on public.staff_members;
  drop policy if exists "sm_insert"            on public.staff_members;
  drop policy if exists "sm_update"            on public.staff_members;
  drop policy if exists "sm_delete"            on public.staff_members;
  drop policy if exists "pi_select"            on public.prep_items;
  drop policy if exists "pi_insert"            on public.prep_items;
  drop policy if exists "pi_update"            on public.prep_items;
  drop policy if exists "pi_delete"            on public.prep_items;
  drop policy if exists "bm_select"            on public.broadcast_messages;
  drop policy if exists "bm_insert"            on public.broadcast_messages;
  drop policy if exists "bm_update"            on public.broadcast_messages;
  drop policy if exists "bm_delete"            on public.broadcast_messages;
end $$;

-- PROFILES
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- TEAMS
create policy "teams_select" on public.teams
  for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.team_members
      where team_id = teams.id and user_id = auth.uid()
    )
  );
create policy "teams_insert" on public.teams
  for insert with check (auth.uid() = owner_id);
create policy "teams_update" on public.teams
  for update using (auth.uid() = owner_id);
create policy "teams_delete" on public.teams
  for delete using (auth.uid() = owner_id);

-- TEAM MEMBERS
create policy "team_members_select" on public.team_members
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.teams
      where id = team_members.team_id and owner_id = auth.uid()
    )
  );
create policy "team_members_insert" on public.team_members
  for insert with check (
    exists (
      select 1 from public.teams
      where id = team_members.team_id and owner_id = auth.uid()
    )
    or exists (
      select 1 from public.team_members tm2
      where tm2.team_id = team_members.team_id
        and tm2.user_id = auth.uid()
        and tm2.role in ('owner', 'admin', 'manager')
    )
  );
create policy "team_members_update" on public.team_members
  for update using (
    exists (
      select 1 from public.teams
      where id = team_members.team_id and owner_id = auth.uid()
    )
  );
create policy "team_members_delete" on public.team_members
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.teams
      where id = team_members.team_id and owner_id = auth.uid()
    )
  );

-- INVITATIONS
create policy "invitations_select" on public.invitations
  for select using (
    email = (select email from auth.users where id = auth.uid())
    or invited_by = auth.uid()
    or exists (
      select 1 from public.teams
      where id = invitations.team_id and owner_id = auth.uid()
    )
  );
create policy "invitations_insert" on public.invitations
  for insert with check (
    exists (
      select 1 from public.teams
      where id = invitations.team_id and owner_id = auth.uid()
    )
    or exists (
      select 1 from public.team_members
      where team_id = invitations.team_id
        and user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

-- Helper: is this user a member of a team?
create or replace function public.is_team_member(tid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = tid and user_id = auth.uid()
  )
  or exists (
    select 1 from public.teams
    where id = tid and owner_id = auth.uid()
  );
$$;

-- KITCHEN FUNCTIONS
create policy "kf_select" on public.kitchen_functions
  for select using (team_id is null or public.is_team_member(team_id));
create policy "kf_insert" on public.kitchen_functions
  for insert with check (team_id is null or public.is_team_member(team_id));
create policy "kf_update" on public.kitchen_functions
  for update using (team_id is null or public.is_team_member(team_id));
create policy "kf_delete" on public.kitchen_functions
  for delete using (team_id is null or public.is_team_member(team_id));

-- STAFF MEMBERS
create policy "sm_select" on public.staff_members
  for select using (team_id is null or public.is_team_member(team_id));
create policy "sm_insert" on public.staff_members
  for insert with check (team_id is null or public.is_team_member(team_id));
create policy "sm_update" on public.staff_members
  for update using (team_id is null or public.is_team_member(team_id));
create policy "sm_delete" on public.staff_members
  for delete using (team_id is null or public.is_team_member(team_id));

-- PREP ITEMS
create policy "pi_select" on public.prep_items
  for select using (team_id is null or public.is_team_member(team_id));
create policy "pi_insert" on public.prep_items
  for insert with check (team_id is null or public.is_team_member(team_id));
create policy "pi_update" on public.prep_items
  for update using (team_id is null or public.is_team_member(team_id));
create policy "pi_delete" on public.prep_items
  for delete using (team_id is null or public.is_team_member(team_id));

-- BROADCAST MESSAGES
create policy "bm_select" on public.broadcast_messages
  for select using (team_id is null or public.is_team_member(team_id));
create policy "bm_insert" on public.broadcast_messages
  for insert with check (team_id is null or public.is_team_member(team_id));
create policy "bm_update" on public.broadcast_messages
  for update using (team_id is null or public.is_team_member(team_id));
create policy "bm_delete" on public.broadcast_messages
  for delete using (team_id is null or public.is_team_member(team_id));
