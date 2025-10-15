-- Migration: Data Room Expiry Automation Support
-- Date: 2025-10-15
-- Description: Add support fields for automated data room access expiry management

-- Add last_warning_sent_at column to track warning notifications
ALTER TABLE deal_data_room_access 
ADD COLUMN IF NOT EXISTS last_warning_sent_at timestamptz;

-- Add index on expires_at for efficient cron job queries
CREATE INDEX IF NOT EXISTS idx_deal_data_room_access_expires_at 
ON deal_data_room_access(expires_at) 
WHERE revoked_at IS NULL;

-- Add compound index for expiry warning queries
CREATE INDEX IF NOT EXISTS idx_deal_data_room_access_expiry_warnings
ON deal_data_room_access(expires_at, last_warning_sent_at)
WHERE revoked_at IS NULL AND expires_at IS NOT NULL;

COMMENT ON COLUMN deal_data_room_access.last_warning_sent_at IS 
  'Timestamp of last expiry warning notification sent to investor to prevent spam';

