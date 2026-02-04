-- =============================================================================
-- AI Agents registry for Compliance Team
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  role text NOT NULL,
  avatar_url text,
  email_identity text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  task_code text NOT NULL UNIQUE,
  task_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_task_assignments_agent_id_idx
  ON agent_task_assignments(agent_id);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_task_assignments ENABLE ROW LEVEL SECURITY;

-- AI Agents policies
CREATE POLICY "ai_agents_select" ON ai_agents FOR SELECT
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid())
);

CREATE POLICY "ai_agents_insert" ON ai_agents FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

CREATE POLICY "ai_agents_update" ON ai_agents FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

CREATE POLICY "ai_agents_delete" ON ai_agents FOR DELETE
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

-- Agent Task Assignments policies
CREATE POLICY "agent_task_assignments_select" ON agent_task_assignments FOR SELECT
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid())
);

CREATE POLICY "agent_task_assignments_insert" ON agent_task_assignments FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

CREATE POLICY "agent_task_assignments_update" ON agent_task_assignments FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

CREATE POLICY "agent_task_assignments_delete" ON agent_task_assignments FOR DELETE
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

-- Seed Compliance Team agents (avatars can be added later)
INSERT INTO ai_agents (name, role, avatar_url, email_identity)
VALUES
  ('Uma NAIDU', 'CCO', NULL, NULL),
  ('Valerie LEMOINE', 'Compliance Officer', NULL, NULL),
  ('Wayne O''CONNOR', 'Compliance Officer', NULL, NULL)
ON CONFLICT (name) DO NOTHING;

-- Seed default task assignments (one agent per task)
WITH agents AS (
  SELECT id, name FROM ai_agents WHERE name IN ('Uma NAIDU', 'Valerie LEMOINE', 'Wayne O''CONNOR')
),
uma AS (SELECT id FROM agents WHERE name = 'Uma NAIDU'),
valerie AS (SELECT id FROM agents WHERE name = 'Valerie LEMOINE'),
wayne AS (SELECT id FROM agents WHERE name = 'Wayne O''CONNOR')
INSERT INTO agent_task_assignments (agent_id, task_code, task_name)
VALUES
  ((SELECT id FROM uma), 'U001', 'Produce OFAC Reports'),
  ((SELECT id FROM uma), 'U002', 'Categorize Client Risk Profile'),
  ((SELECT id FROM uma), 'U003', 'Maintain a Blacklist'),
  ((SELECT id FROM valerie), 'V001', 'Manage NDA-NDNC Processes'),
  ((SELECT id FROM valerie), 'V002', 'Maintain KYC and AML Records'),
  ((SELECT id FROM valerie), 'V003', 'Maintain Compliance and Suitability Documentation'),
  ((SELECT id FROM wayne), 'W001', 'Manage Compliance Questions'),
  ((SELECT id FROM wayne), 'W002', 'Maintain Compliance Log'),
  ((SELECT id FROM wayne), 'W003', 'Record Compliance Enquiries')
ON CONFLICT (task_code) DO UPDATE
SET agent_id = EXCLUDED.agent_id,
    task_name = EXCLUDED.task_name,
    is_active = true;
