-- Migration: Deal Workflow Phase 4 - Deal Activity Events
-- Date: 2025-11-02 12:45
-- Adds deal_activity_events table for analytics and audit of deal-stage conversions.

CREATE TABLE IF NOT EXISTS deal_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_activity_events_deal ON deal_activity_events(deal_id, event_type, occurred_at DESC);

ALTER TABLE deal_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deal_activity_events_staff_select ON deal_activity_events;
CREATE POLICY deal_activity_events_staff_select ON deal_activity_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);

DROP POLICY IF EXISTS deal_activity_events_insert_staff ON deal_activity_events;
CREATE POLICY deal_activity_events_insert_staff ON deal_activity_events
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);

COMMENT ON TABLE deal_activity_events IS 'Captures analytics events for the deal workflow (interest approvals, NDA completion, subscription funding, etc.).';
