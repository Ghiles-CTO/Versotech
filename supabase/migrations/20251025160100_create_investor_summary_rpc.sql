-- Migration: Create RPC function to query investor summary materialized view
-- Purpose: Provide optimized function for fetching investor data with filters
-- Created: 2025-10-25

-- Function to get investor summaries with filtering and pagination
CREATE OR REPLACE FUNCTION get_investor_summaries(
  p_search_term TEXT DEFAULT NULL,
  p_kyc_status TEXT DEFAULT NULL,
  p_investor_type TEXT DEFAULT NULL,
  p_primary_rm UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  legal_name TEXT,
  display_name TEXT,
  type TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  kyc_status TEXT,
  status TEXT,
  onboarding_status TEXT,
  aml_risk_rating TEXT,
  rm_display_name TEXT,
  rm_email TEXT,
  subscription_count BIGINT,
  vehicle_count BIGINT,
  total_commitment NUMERIC,
  total_contributed NUMERIC,
  total_distributed NUMERIC,
  unfunded_commitment NUMERIC,
  current_nav NUMERIC,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  linked_users JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mv.id,
    mv.legal_name,
    mv.display_name,
    mv.type,
    mv.email,
    mv.phone,
    mv.country,
    mv.kyc_status,
    mv.status,
    mv.onboarding_status,
    mv.aml_risk_rating,
    mv.rm_display_name,
    mv.rm_email,
    mv.subscription_count,
    mv.vehicle_count,
    mv.total_commitment,
    mv.total_contributed,
    mv.total_distributed,
    mv.unfunded_commitment,
    mv.current_nav,
    mv.last_activity_at,
    mv.linked_users,
    mv.created_at
  FROM investor_summary_mv mv
  WHERE
    -- Search filter (name or email)
    (p_search_term IS NULL OR
     mv.legal_name ILIKE '%' || p_search_term || '%' OR
     mv.email ILIKE '%' || p_search_term || '%')
    -- KYC status filter
    AND (p_kyc_status IS NULL OR mv.kyc_status = p_kyc_status)
    -- Type filter
    AND (p_investor_type IS NULL OR mv.type = p_investor_type)
    -- RM filter
    AND (p_primary_rm IS NULL OR mv.primary_rm = p_primary_rm)
  ORDER BY mv.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_investor_summaries TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_investor_summaries IS
'Fetches investor summaries from materialized view with optional filters.
Uses pre-computed metrics for fast response times (<200ms).
Parameters:
- p_search_term: Search by legal_name or email (case-insensitive)
- p_kyc_status: Filter by KYC status
- p_investor_type: Filter by investor type
- p_primary_rm: Filter by relationship manager UUID
- p_limit: Number of results (default 20)
- p_offset: Offset for pagination (default 0)';

-- Function to get investor summary count with filters (for pagination)
CREATE OR REPLACE FUNCTION count_investor_summaries(
  p_search_term TEXT DEFAULT NULL,
  p_kyc_status TEXT DEFAULT NULL,
  p_investor_type TEXT DEFAULT NULL,
  p_primary_rm UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO result_count
  FROM investor_summary_mv mv
  WHERE
    (p_search_term IS NULL OR
     mv.legal_name ILIKE '%' || p_search_term || '%' OR
     mv.email ILIKE '%' || p_search_term || '%')
    AND (p_kyc_status IS NULL OR mv.kyc_status = p_kyc_status)
    AND (p_investor_type IS NULL OR mv.type = p_investor_type)
    AND (p_primary_rm IS NULL OR mv.primary_rm = p_primary_rm);

  RETURN result_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION count_investor_summaries TO authenticated;

-- Add comment
COMMENT ON FUNCTION count_investor_summaries IS
'Returns total count of investors matching filters.
Used for pagination alongside get_investor_summaries().';
