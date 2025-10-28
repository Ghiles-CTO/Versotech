-- Migration: Create activity feed table
-- Purpose: Track all activities and interactions across the platform
-- Created: 2025-10-25

-- Create activity_feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('subscription', 'capital_call', 'distribution', 'kyc', 'document', 'message', 'profile', 'system')),
  entity_id UUID NOT NULL,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX activity_feed_investor_id_idx ON activity_feed(investor_id);
CREATE INDEX activity_feed_entity_type_idx ON activity_feed(entity_type);
CREATE INDEX activity_feed_created_at_idx ON activity_feed(created_at DESC);
CREATE INDEX activity_feed_created_by_idx ON activity_feed(created_by);
CREATE INDEX activity_feed_investor_entity_idx ON activity_feed(investor_id, entity_type);

-- Enable Row Level Security
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Staff can view all activity
CREATE POLICY "Staff can view all activity"
  ON activity_feed
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  );

-- Investors can view their own activity
CREATE POLICY "Investors can view own activity"
  ON activity_feed
  FOR SELECT
  TO authenticated
  USING (
    investor_id IN (
      SELECT investor_id FROM investor_users
      WHERE user_id = auth.uid()
    )
  );

-- Staff can insert activity records
CREATE POLICY "Staff can insert activity"
  ON activity_feed
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  );

-- System can insert activity records (for triggers)
CREATE POLICY "System can insert activity"
  ON activity_feed
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE activity_feed IS
'Tracks all activities and interactions across the platform for audit and timeline purposes.';

-- Function to automatically create activity feed entries for subscriptions
CREATE OR REPLACE FUNCTION create_subscription_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_feed (
    entity_type,
    entity_id,
    investor_id,
    action,
    description,
    metadata,
    created_by,
    created_at
  ) VALUES (
    'subscription',
    NEW.id,
    NEW.investor_id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Subscription Created'
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'Status Changed'
      ELSE 'Subscription Updated'
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'New subscription created with commitment of ' || NEW.commitment || ' ' || NEW.currency
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'Status changed from ' || OLD.status || ' to ' || NEW.status
      ELSE 'Subscription details updated'
    END,
    jsonb_build_object(
      'subscription_id', NEW.id,
      'commitment', NEW.commitment,
      'currency', NEW.currency,
      'status', NEW.status
    ),
    auth.uid(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for subscription activity
CREATE TRIGGER subscription_activity_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_activity();

-- Function to create activity for investor updates
CREATE OR REPLACE FUNCTION create_investor_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_feed (
    entity_type,
    entity_id,
    investor_id,
    action,
    description,
    metadata,
    created_by,
    created_at
  ) VALUES (
    'profile',
    NEW.id,
    NEW.id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Investor Created'
      WHEN TG_OP = 'UPDATE' AND OLD.kyc_status != NEW.kyc_status THEN 'KYC Status Changed'
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'Status Changed'
      ELSE 'Profile Updated'
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'New investor profile created: ' || NEW.legal_name
      WHEN TG_OP = 'UPDATE' AND OLD.kyc_status != NEW.kyc_status THEN 'KYC status changed from ' || OLD.kyc_status || ' to ' || NEW.kyc_status
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'Status changed from ' || OLD.status || ' to ' || NEW.status
      ELSE 'Investor profile updated'
    END,
    jsonb_build_object(
      'investor_id', NEW.id,
      'legal_name', NEW.legal_name,
      'kyc_status', NEW.kyc_status,
      'status', NEW.status
    ),
    auth.uid(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for investor activity
CREATE TRIGGER investor_activity_trigger
  AFTER INSERT OR UPDATE ON investors
  FOR EACH ROW
  EXECUTE FUNCTION create_investor_activity();

-- Grant permissions
GRANT SELECT ON activity_feed TO authenticated;
GRANT INSERT ON activity_feed TO authenticated;
