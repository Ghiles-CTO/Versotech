-- Migration: Create staff filter views table
-- Purpose: Allow staff to save commonly used filter combinations
-- Created: 2025-10-25

-- Create staff_filter_views table
CREATE TABLE IF NOT EXISTS staff_filter_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('investor', 'subscription', 'deal', 'vehicle')),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX staff_filter_views_user_id_idx ON staff_filter_views(user_id);
CREATE INDEX staff_filter_views_entity_type_idx ON staff_filter_views(entity_type);
CREATE INDEX staff_filter_views_user_entity_idx ON staff_filter_views(user_id, entity_type);

-- Add unique constraint to prevent duplicate names per user per entity
CREATE UNIQUE INDEX staff_filter_views_unique_name_idx
  ON staff_filter_views(user_id, entity_type, name);

-- Enable Row Level Security
ALTER TABLE staff_filter_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Staff can only see their own filter views
CREATE POLICY "Staff can view own filter views"
  ON staff_filter_views
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  );

-- Staff can create their own filter views
CREATE POLICY "Staff can create own filter views"
  ON staff_filter_views
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  );

-- Staff can update their own filter views
CREATE POLICY "Staff can update own filter views"
  ON staff_filter_views
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  );

-- Staff can delete their own filter views
CREATE POLICY "Staff can delete own filter views"
  ON staff_filter_views
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  );

-- Add comment
COMMENT ON TABLE staff_filter_views IS
'Stores saved filter combinations for staff users. Allows quick access to commonly used filters.';

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_filter_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER staff_filter_views_updated_at
  BEFORE UPDATE ON staff_filter_views
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_filter_views_updated_at();
