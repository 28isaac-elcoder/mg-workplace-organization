create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  assigned_date date,
  last_update_date date,
  primary_due_date date,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Waiting', 'Completed', 'On Hold', 'Cancelled')),
  percent_complete integer not null default 0 check (percent_complete >= 0 and percent_complete <= 100),
  owner text,
  department_client text,
  next_action text,
  notes text,
  completed_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists requestors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists project_requestors (
  project_id uuid not null references projects(id) on delete cascade,
  requestor_id uuid not null references requestors(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (project_id, requestor_id)
);

create table if not exists project_tools (
  project_id uuid not null references projects(id) on delete cascade,
  tool_id uuid not null references tools(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (project_id, tool_id)
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  assigned_by text,
  due_date date,
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Waiting', 'Completed', 'On Hold', 'Cancelled')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  notes text,
  completed_date date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  update_date date not null default current_date,
  updated_field text not null,
  old_value text,
  new_value text,
  reason text not null,
  entered_by text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  organization text,
  role text not null default 'Client Contact',
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_notes_project_id on project_notes(project_id);

create index if not exists idx_projects_due_date on projects(primary_due_date);
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_projects_priority on projects(priority);
create index if not exists idx_milestones_project_id on milestones(project_id);
create index if not exists idx_updates_project_id on project_updates(project_id);
create index if not exists idx_contacts_project_id on contacts(project_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
before update on projects
for each row
execute function set_updated_at();

insert into requestors (name)
values
  ('Manager'),
  ('Director'),
  ('Client'),
  ('Coworker'),
  ('Self-Initiated')
on conflict (name) do nothing;

insert into tools (name)
values
  ('ArcGIS'),
  ('Excel'),
  ('IMPLAN'),
  ('Word'),
  ('PowerPoint'),
  ('Outlook'),
  ('SQL'),
  ('Power BI'),
  ('Access'),
  ('Adobe Acrobat')
on conflict (name) do nothing;
