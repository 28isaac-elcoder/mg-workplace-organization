-- Run this in the Supabase SQL Editor to enable project notes on the overview card.
-- Creates project_notes table and index; safe to run multiple times (if not exists).

create table if not exists project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_notes_project_id on project_notes(project_id);

-- Optional: enable RLS and allow authenticated access (adjust policy to your auth setup)
-- alter table project_notes enable row level security;
-- create policy "Allow all for project_notes" on project_notes for all using (true);
