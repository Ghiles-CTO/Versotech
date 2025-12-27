-- Migration: Add notification enhancement columns
-- Date: 2025-12-27
-- Adds type, created_by, and deal_id columns for notification filtering and tracking

ALTER TABLE investor_notifications
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES deals(id) ON DELETE SET NULL;

-- Index for type-based filtering
CREATE INDEX IF NOT EXISTS idx_investor_notifications_type
ON investor_notifications(type)
WHERE type IS NOT NULL;

-- Index for "created by me" queries
CREATE INDEX IF NOT EXISTS idx_investor_notifications_created_by
ON investor_notifications(created_by)
WHERE created_by IS NOT NULL;

-- Index for deal-based filtering
CREATE INDEX IF NOT EXISTS idx_investor_notifications_deal_id
ON investor_notifications(deal_id)
WHERE deal_id IS NOT NULL;

COMMENT ON COLUMN investor_notifications.type IS 'Notification category: deal, subscription, signature, dataroom, kyc, nda, agreement, proxy_subscription, task, reminder, general';
COMMENT ON COLUMN investor_notifications.created_by IS 'User who triggered this notification (for "sent by me" tracking)';
COMMENT ON COLUMN investor_notifications.deal_id IS 'Associated deal for deal-related notifications';
