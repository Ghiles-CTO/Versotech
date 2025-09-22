-- VERSO Holdings Database Schema (from PRD Section 22)
-- Run this in your Supabase SQL editor

-- ROLES
CREATE TYPE user_role AS ENUM ('investor','staff_admin','staff_ops','staff_rm');

-- PROFILES
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'investor',
  display_name text,
  email text UNIQUE,
  title text,
  created_at timestamptz DEFAULT now()
);

-- INVESTORS & MEMBERSHIP
CREATE TABLE investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  type text, -- individual/entity
  kyc_status text DEFAULT 'pending',
  country text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE investor_users (
  investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (investor_id, user_id)
);

-- VEHICLES & INVESTMENTS
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text, -- fund/spv/securitization/...
  domicile text,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  commitment numeric(18,2),
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  signed_doc_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  as_of_date date NOT NULL,
  nav_total numeric(18,2),
  nav_per_unit numeric(18,6)
);

CREATE TABLE positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  units numeric(28,8),
  cost_basis numeric(18,2),
  last_nav numeric(18,6),
  as_of_date date
);

CREATE TABLE capital_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  name text,
  call_pct numeric(7,4),
  due_date date,
  status text DEFAULT 'draft'
);

CREATE TABLE distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  name text,
  amount numeric(18,2),
  date date,
  classification text
);

CREATE TABLE cashflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  type text CHECK (type IN ('call','distribution')),
  amount numeric(18,2),
  date date,
  ref_id uuid
);

-- DOCUMENTS & TASKS
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_investor_id uuid REFERENCES investors(id),
  owner_user_id uuid REFERENCES profiles(id),
  vehicle_id uuid REFERENCES vehicles(id),
  type text, -- NDA/Subscription/Report/Statement/KYC
  file_key text NOT NULL,
  watermark jsonb,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  kind text, -- onboarding_step etc
  due_at timestamptz,
  status text DEFAULT 'open',
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE report_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id),
  vehicle_id uuid REFERENCES vehicles(id),
  filters jsonb,
  status text DEFAULT 'queued',
  result_doc_id uuid REFERENCES documents(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- WORKFLOWS
CREATE TABLE workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  n8n_webhook_url text NOT NULL,
  schema jsonb,
  allowed_titles text[]
);

CREATE TABLE workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id),
  triggered_by uuid REFERENCES profiles(id),
  payload jsonb,
  status text DEFAULT 'queued',
  result_ref uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CHAT
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text,
  created_by uuid REFERENCES profiles(id),
  type text CHECK (type IN ('dm','group')) DEFAULT 'dm',
  name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id),
  body text,
  file_key text,
  created_at timestamptz DEFAULT now()
);

-- ASK FOR REQUEST
CREATE TABLE request_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES investors(id),
  created_by uuid REFERENCES profiles(id),
  category text,
  subject text,
  details text,
  status text DEFAULT 'open',      -- open/assigned/in_progress/ready/closed
  priority text DEFAULT 'normal',  -- low/normal/high
  assigned_to uuid REFERENCES profiles(id),
  linked_workflow_run uuid,
  result_doc_id uuid REFERENCES documents(id),
  created_at timestamptz DEFAULT now()
);

-- AUDIT
CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES profiles(id),
  action text,
  entity text,
  entity_id uuid,
  ts timestamptz DEFAULT now(),
  hash text,
  prev_hash text
);

-- INDEXES (samples)
CREATE INDEX ON positions (investor_id, vehicle_id);
CREATE INDEX ON cashflows (investor_id, vehicle_id, date);
CREATE INDEX ON documents (owner_investor_id, vehicle_id, type);
CREATE INDEX idx_request_tickets_status_assignee ON request_tickets (status, assigned_to);
CREATE INDEX idx_conversations_type ON conversations (type);

