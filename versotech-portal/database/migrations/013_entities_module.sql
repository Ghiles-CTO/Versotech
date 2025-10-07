-- Migration 013: Entities module enhancements
-- Adds metadata to vehicles, entity directors/events tables, and documents.entity_id

-- 1. Vehicles metadata
alter table vehicles
  add column if not exists formation_date date,
  add column if not exists legal_jurisdiction text,
  add column if not exists registration_number text,
  add column if not exists notes text;

-- 2. Entity directors
create table if not exists entity_directors (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  full_name text not null,
  role text,
  email text,
  effective_from date default current_date,
  effective_to date,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_entity_directors_vehicle on entity_directors(vehicle_id);
create index if not exists idx_entity_directors_active on entity_directors(vehicle_id, effective_to);

-- 3. Entity events
create table if not exists entity_events (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  event_type text not null,
  description text,
  changed_by uuid references profiles(id),
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_entity_events_vehicle on entity_events(vehicle_id);
create index if not exists idx_entity_events_created on entity_events(created_at desc);

-- 4. Documents tagging
alter table documents
  add column if not exists entity_id uuid references vehicles(id);

create index if not exists idx_documents_entity_id on documents(entity_id);



