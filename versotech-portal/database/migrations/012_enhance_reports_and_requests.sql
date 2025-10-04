-- Migration: Enhance Reports and Requests Schema
-- Version: 012
-- Description: Add missing columns and business logic for Reports & Requests feature
-- Date: 2025-01-03

-- ============================================
-- PART 1: Enhance report_requests table
-- ============================================

-- Add missing columns to report_requests
ALTER TABLE report_requests
  ADD COLUMN IF NOT EXISTS report_type text
    CHECK (report_type IN (
      'positions_statement',
      'investment_summary',
      'capital_activity',
      'tax_pack',
      'custom'
    )),
  ADD COLUMN IF NOT EXISTS workflow_run_id uuid REFERENCES workflow_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Update status enum to include 'processing' if not exists
DO $$ BEGIN
  ALTER TYPE report_status_enum ADD VALUE IF NOT EXISTS 'processing';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add performance indexes for report_requests
CREATE INDEX IF NOT EXISTS idx_report_requests_status_created
  ON report_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_requests_investor_status
  ON report_requests(investor_id, status);

CREATE INDEX IF NOT EXISTS idx_report_requests_workflow
  ON report_requests(workflow_run_id)
  WHERE workflow_run_id IS NOT NULL;

-- ============================================
-- PART 2: Enhance request_tickets table
-- ============================================

-- Add missing columns to request_tickets
ALTER TABLE request_tickets
  ADD COLUMN IF NOT EXISTS due_date timestamptz,
  ADD COLUMN IF NOT EXISTS completion_note text,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================
-- PART 3: Business Logic Functions
-- ============================================

-- Function to calculate SLA based on priority
CREATE OR REPLACE FUNCTION calculate_request_sla(priority_level request_priority_enum)
RETURNS interval AS $$
BEGIN
  RETURN CASE priority_level
    WHEN 'high' THEN interval '1 day'
    WHEN 'normal' THEN interval '3 days'
    WHEN 'low' THEN interval '7 days'
    ELSE interval '3 days'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_request_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS request_tickets_updated_at ON request_tickets;
CREATE TRIGGER request_tickets_updated_at
  BEFORE UPDATE ON request_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_request_tickets_updated_at();

-- Trigger function to auto-set due_date on insert
CREATE OR REPLACE FUNCTION set_request_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date IS NULL THEN
    NEW.due_date = now() + calculate_request_sla(NEW.priority);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setting due_date
DROP TRIGGER IF EXISTS request_tickets_set_due_date ON request_tickets;
CREATE TRIGGER request_tickets_set_due_date
  BEFORE INSERT ON request_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_request_due_date();

-- ============================================
-- PART 4: Performance Indexes for request_tickets
-- ============================================

-- Index for SLA monitoring (find overdue requests)
CREATE INDEX IF NOT EXISTS idx_request_tickets_sla
  ON request_tickets(status, due_date)
  WHERE status NOT IN ('closed', 'ready');

-- Index for recent activity
CREATE INDEX IF NOT EXISTS idx_request_tickets_updated
  ON request_tickets(updated_at DESC);

-- Index for staff assignment queries
CREATE INDEX IF NOT EXISTS idx_request_tickets_assigned_status
  ON request_tickets(assigned_to, status)
  WHERE assigned_to IS NOT NULL;

-- ============================================
-- PART 5: Helper Views (Optional but useful)
-- ============================================

-- View for overdue requests
CREATE OR REPLACE VIEW overdue_requests AS
SELECT
  rt.*,
  i.legal_name as investor_name,
  p.display_name as created_by_name,
  ap.display_name as assigned_to_name,
  (now() - rt.due_date) as overdue_by
FROM request_tickets rt
JOIN investors i ON i.id = rt.investor_id
JOIN profiles p ON p.id = rt.created_by
LEFT JOIN profiles ap ON ap.id = rt.assigned_to
WHERE rt.status NOT IN ('closed', 'ready')
  AND rt.due_date < now()
ORDER BY rt.due_date ASC;

-- View for report request statistics
CREATE OR REPLACE VIEW report_request_stats AS
SELECT
  report_type,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_completion_seconds
FROM report_requests
WHERE report_type IS NOT NULL
GROUP BY report_type, status;

-- ============================================
-- PART 6: Data Migrations (Backfill)
-- ============================================

-- Backfill updated_at for existing request_tickets
UPDATE request_tickets
SET updated_at = created_at
WHERE updated_at IS NULL;

-- ============================================
-- PART 7: Comments for Documentation
-- ============================================

COMMENT ON COLUMN report_requests.report_type IS 'Type of report being requested (positions_statement, investment_summary, capital_activity, tax_pack, custom)';
COMMENT ON COLUMN report_requests.workflow_run_id IS 'Reference to the n8n workflow run that processes this report';
COMMENT ON COLUMN report_requests.error_message IS 'Error message if report generation failed';
COMMENT ON COLUMN report_requests.completed_at IS 'Timestamp when report generation completed (success or failure)';

COMMENT ON COLUMN request_tickets.due_date IS 'SLA deadline - auto-calculated based on priority at creation';
COMMENT ON COLUMN request_tickets.completion_note IS 'Staff note explaining how the request was resolved';
COMMENT ON COLUMN request_tickets.closed_at IS 'Timestamp when request was closed';
COMMENT ON COLUMN request_tickets.updated_at IS 'Auto-updated timestamp on any change';

COMMENT ON FUNCTION calculate_request_sla IS 'Calculates SLA interval based on priority: high=1d, normal=3d, low=7d';
COMMENT ON VIEW overdue_requests IS 'Lists all open/in-progress requests that are past their due date';
COMMENT ON VIEW report_request_stats IS 'Aggregated statistics for report generation performance';

-- ============================================
-- END OF MIGRATION
-- ============================================
