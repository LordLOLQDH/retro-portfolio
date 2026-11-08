-- =====================================================
-- Schema für das Retro-Portfolio
-- Im Supabase Dashboard: SQL Editor -> New query -> einfügen -> Run
-- Das Skript ist wiederholbar ausführbar.
-- =====================================================

-- Projekte (öffentlich lesbar, nur du schreibst im Dashboard)
create table if not exists public.projects (
  id          bigint generated always as identity primary key,
  title       text not null check (char_length(title) <= 120),
  description text not null check (char_length(description) <= 500),
  url         text check (url is null or url ~* '^https?://'),
  tags        text check (tags is null or char_length(tags) <= 120),
  sort        int  not null default 0,
  created_at  timestamptz not null default now()
);

-- Kontaktnachrichten (jeder darf senden, niemand außer dir darf lesen)
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) between 3 and 200 and email ~* '^\S+@\S+\.\S+$'),
  company    text check (company is null or char_length(company) <= 100),
  message    text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Row Level Security einschalten (ohne Policy ist alles gesperrt)
alter table public.projects enable row level security;
alter table public.messages enable row level security;

-- Policies
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select to anon, authenticated using (true);

drop policy if exists "messages_public_insert" on public.messages;
create policy "messages_public_insert" on public.messages
  for insert to anon, authenticated with check (true);

-- Rechte: anon darf Projekte lesen und Nachrichten einfügen, sonst nichts
revoke all on public.projects from anon, authenticated;
revoke all on public.messages from anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert on public.messages to anon, authenticated;
