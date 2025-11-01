-- Migration: Fix Management Fees in Subscriptions
-- Date: 2025-12-01
-- Description: Add management fee fields to subscriptions table and update approval logic
-- Priority: CRITICAL - Fixes missing management fee tracking

-- =============================================================================
-- ADD MANAGEMENT FEE FIELDS TO SUBSCRIPTIONS TABLE
-- =============================================================================

-- Add management fee fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS management_fee_percent numeric(7,4),
ADD COLUMN IF NOT EXISTS management_fee_amount numeric(18,2),
ADD COLUMN IF NOT EXISTS management_fee_frequency text
  CHECK (management_fee_frequency IN ('one_time', 'monthly', 'quarterly', 'annual', 'on_exit'));

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.management_fee_percent IS 'Management fee as percentage (e.g., 2.5 for 2.5%)';
COMMENT ON COLUMN subscriptions.management_fee_amount IS 'Fixed management fee amount if applicable';
COMMENT ON COLUMN subscriptions.management_fee_frequency IS 'How often management fees are charged';

-- =============================================================================
-- CREATE TRIGGER FOR AUTO-APPROVALS FROM INVESTOR DEAL INTEREST
-- =============================================================================

CREATE OR REPLACE FUNCTION create_deal_interest_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority text;
  v_deal_name text;
  v_investor_name text;
BEGIN
  -- Only create approval for pending_review status
  IF NEW.status != 'pending_review' THEN
    RETURN NEW;
  END IF;

  -- Get deal name
  SELECT name INTO v_deal_name FROM deals WHERE id = NEW.deal_id;

  -- Get investor name
  SELECT legal_name INTO v_investor_name FROM investors WHERE id = NEW.investor_id;

  -- Calculate priority based on indicative amount
  v_priority := CASE
    WHEN NEW.indicative_amount > 1000000 THEN 'critical'
    WHEN NEW.indicative_amount > 100000 THEN 'high'
    WHEN NEW.indicative_amount > 50000 THEN 'medium'
    ELSE 'low'
  END;

  -- Create approval record
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  ) VALUES (
    'deal_interest',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'indicative_amount', NEW.indicative_amount,
      'indicative_currency', NEW.indicative_currency,
      'notes', NEW.notes,
      'deal_name', v_deal_name,
      'investor_name', v_investor_name
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_deal_interest_create_approval ON investor_deal_interest;
CREATE TRIGGER on_deal_interest_create_approval
  AFTER INSERT ON investor_deal_interest
  FOR EACH ROW
  WHEN (NEW.status = 'pending_review')
  EXECUTE FUNCTION create_deal_interest_approval();

-- =============================================================================
-- CREATE TRIGGER FOR AUTO-APPROVALS FROM DEAL SUBSCRIPTION SUBMISSIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION create_subscription_submission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority text;
  v_deal_name text;
  v_investor_name text;
  v_amount numeric;
BEGIN
  -- Only create approval for pending status
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Get deal name
  SELECT name INTO v_deal_name FROM deals WHERE id = NEW.deal_id;

  -- Get investor name
  SELECT legal_name INTO v_investor_name FROM investors WHERE id = NEW.investor_id;

  -- Extract amount from payload
  v_amount := (NEW.payload_json->>'amount')::numeric;

  -- Calculate priority based on amount
  v_priority := CASE
    WHEN v_amount > 1000000 THEN 'critical'
    WHEN v_amount > 100000 THEN 'high'
    WHEN v_amount > 50000 THEN 'medium'
    ELSE 'low'
  END;

  -- Create approval record
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  ) VALUES (
    'deal_subscription',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'payload', NEW.payload_json,
      'deal_name', v_deal_name,
      'investor_name', v_investor_name,
      'amount', v_amount
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_subscription_submission_create_approval ON deal_subscription_submissions;
CREATE TRIGGER on_subscription_submission_create_approval
  AFTER INSERT ON deal_subscription_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION create_subscription_submission_approval();

-- =============================================================================
-- CREATE TRIGGER TO AUTO-CHANGE STATUS TO COMMITTED WHEN CONTRACT SIGNED
-- =============================================================================

CREATE OR REPLACE FUNCTION auto_commit_subscription_on_task_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id uuid;
BEGIN
  -- Only process when task is marked as completed
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Only process subscription contract signature tasks
  IF NEW.kind != 'compliance_subscription_agreement' THEN
    RETURN NEW;
  END IF;

  -- Get subscription ID from task metadata or instructions
  v_subscription_id := COALESCE(
    (NEW.metadata->>'subscription_id')::uuid,
    (NEW.instructions->>'subscription_id')::uuid,
    (NEW.related_entity_id)::uuid
  );

  -- If we found a subscription ID, update its status
  IF v_subscription_id IS NOT NULL THEN
    UPDATE subscriptions
    SET status = 'committed',
        committed_at = NOW()
    WHERE id = v_subscription_id
    AND status = 'pending';

    -- Log this auto-update
    INSERT INTO audit_logs (
      timestamp,
      event_type,
      action,
      actor_id,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      NOW(),
      'subscription_auto_commit',
      'update',
      NEW.owner_user_id,
      'subscriptions',
      v_subscription_id,
      jsonb_build_object(
        'trigger', 'task_completion',
        'task_id', NEW.id,
        'task_kind', NEW.kind
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_task_complete_commit_subscription ON tasks;
CREATE TRIGGER on_task_complete_commit_subscription
  AFTER UPDATE ON tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION auto_commit_subscription_on_task_complete();

-- Comments for documentation
COMMENT ON FUNCTION create_deal_interest_approval IS
  'Automatically creates approval when investor expresses interest in a deal';
COMMENT ON FUNCTION create_subscription_submission_approval IS
  'Automatically creates approval when investor submits subscription form';
COMMENT ON FUNCTION auto_commit_subscription_on_task_complete IS
  'Automatically changes subscription status to committed when contract signing task is completed';