-- Row Level Security Policies (from PRD Section 11)
-- Run this AFTER creating the schema

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES (everyone can read their own; staff can read all)
CREATE POLICY "profiles_self_read"
ON profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "profiles_staff_read_all"
ON profiles FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- INVESTORS (investor user sees only linked investors)
CREATE POLICY "investor_users_read"
ON investors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = investors.id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- POSITIONS (investor sees only their positions; staff all)
CREATE POLICY "positions_investor_read"
ON positions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = positions.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- DOCUMENTS (owner-based and entitlement via vehicle)
CREATE POLICY "documents_read_entitled"
ON documents FOR SELECT
USING (
  -- document owned by investor and current user belongs to that investor
  (owner_investor_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = documents.owner_investor_id AND iu.user_id = auth.uid()
  ))
  -- or entitled via vehicle (investor has subscription to that vehicle)
  OR (vehicle_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = documents.vehicle_id AND iu.user_id = auth.uid()
  ))
  -- or staff
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- CHAT (allow only participants; supports groups)
CREATE POLICY conv_read ON conversations FOR SELECT
USING (EXISTS (SELECT 1 FROM conversation_participants cp
               WHERE cp.conversation_id = conversations.id
                 AND cp.user_id = auth.uid()));

CREATE POLICY conv_part_read ON conversation_participants FOR SELECT
USING (EXISTS (SELECT 1 FROM conversation_participants cp
               WHERE cp.conversation_id = conversation_participants.conversation_id
                 AND cp.user_id = auth.uid()));

CREATE POLICY messages_read ON messages FOR SELECT
USING (EXISTS (SELECT 1 FROM conversation_participants cp
               WHERE cp.conversation_id = messages.conversation_id
                 AND cp.user_id = auth.uid()));

CREATE POLICY messages_insert ON messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM conversation_participants cp
                    WHERE cp.conversation_id = messages.conversation_id
                      AND cp.user_id = auth.uid()));

-- ASK REQUESTS (investor sees own; staff all)
CREATE POLICY request_tickets_read ON request_tickets FOR SELECT
USING (
  created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%')
);

-- Writes: staff can update; creator can create
CREATE POLICY request_tickets_insert_creator ON request_tickets FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY request_tickets_update_staff ON request_tickets FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- WORKFLOW RUNS gated by title
CREATE POLICY workflows_read_staff ON workflows FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

CREATE POLICY workflow_runs_insert_allowed ON workflow_runs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workflows w
    JOIN profiles p ON p.id = auth.uid()
    WHERE w.id = workflow_runs.workflow_id
      AND p.role LIKE 'staff_%'
      AND (w.allowed_titles IS NULL OR w.allowed_titles @> array[p.title])
  )
);

-- SUBSCRIPTIONS (investors see their own; staff see all)
CREATE POLICY subscriptions_read ON subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = subscriptions.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- VEHICLES (investors see entitled vehicles; staff see all)
CREATE POLICY vehicles_read ON vehicles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = vehicles.id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- CASHFLOWS (investors see their own; staff see all)
CREATE POLICY cashflows_read ON cashflows FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = cashflows.investor_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- REPORT REQUESTS (investors see their own; staff see all)
CREATE POLICY report_requests_read ON report_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = report_requests.investor_id AND iu.user_id = auth.uid()
  )
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- TASKS (users see their own tasks; staff can see all)
CREATE POLICY tasks_read ON tasks FOR SELECT
USING (
  owner_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- AUDIT LOG (staff only)
CREATE POLICY audit_log_staff_read ON audit_log FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'));

-- VALUATIONS (available to entitled investors and staff)
CREATE POLICY valuations_read ON valuations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = valuations.vehicle_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- CAPITAL CALLS (available to entitled investors and staff)
CREATE POLICY capital_calls_read ON capital_calls FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = capital_calls.vehicle_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

-- DISTRIBUTIONS (available to entitled investors and staff)
CREATE POLICY distributions_read ON distributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = distributions.vehicle_id AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role LIKE 'staff_%'
  )
);

