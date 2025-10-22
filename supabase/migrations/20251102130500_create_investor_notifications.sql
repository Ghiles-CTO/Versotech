-- Migration: Deal Workflow Phase 4 - Investor Notifications
-- Date: 2025-11-02 13:05
-- Adds investor_notifications table for in-app/email notification tracking.

CREATE TABLE IF NOT EXISTS investor_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_investor_notifications_user_read ON investor_notifications(user_id, read_at);
ALTER TABLE investor_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS investor_notifications_self ON investor_notifications;
CREATE POLICY investor_notifications_self ON investor_notifications
FOR SELECT USING (investor_notifications.user_id = auth.uid());
DROP POLICY IF EXISTS investor_notifications_staff ON investor_notifications;
CREATE POLICY investor_notifications_staff ON investor_notifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
DROP POLICY IF EXISTS investor_notifications_insert_service ON investor_notifications;
CREATE POLICY investor_notifications_insert_service ON investor_notifications
FOR INSERT WITH CHECK (true);
COMMENT ON TABLE investor_notifications IS 'Stores notification entries delivered to investors and staff for deal workflow events.';
