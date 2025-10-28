SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
CREATE SCHEMA IF NOT EXISTS "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA "extensions";
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'citext'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    EXECUTE 'CREATE DOMAIN "public"."citext" AS "extensions"."citext"';
  END IF;
END
$$;
CREATE SCHEMA IF NOT EXISTS "public";
ALTER SCHEMA "public" OWNER TO "pg_database_owner";
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE TYPE "public"."allocation_status_enum" AS ENUM (
    'pending_review',
    'approved',
    'rejected',
    'settled'
);
ALTER TYPE "public"."allocation_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."conversation_type_enum" AS ENUM (
    'dm',
    'group',
    'deal_room',
    'broadcast'
);
ALTER TYPE "public"."conversation_type_enum" OWNER TO "postgres";
CREATE TYPE "public"."conversation_visibility_enum" AS ENUM (
    'investor',
    'internal',
    'deal'
);
ALTER TYPE "public"."conversation_visibility_enum" OWNER TO "postgres";
CREATE TYPE "public"."convo_type_enum" AS ENUM (
    'dm',
    'group',
    'deal_room',
    'broadcast'
);
ALTER TYPE "public"."convo_type_enum" OWNER TO "postgres";
CREATE TYPE "public"."deal_member_role" AS ENUM (
    'investor',
    'co_investor',
    'spouse',
    'advisor',
    'lawyer',
    'banker',
    'introducer',
    'viewer',
    'verso_staff'
);
ALTER TYPE "public"."deal_member_role" OWNER TO "postgres";
CREATE TYPE "public"."deal_status_enum" AS ENUM (
    'draft',
    'open',
    'allocation_pending',
    'closed',
    'cancelled'
);
ALTER TYPE "public"."deal_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."deal_type_enum" AS ENUM (
    'equity_secondary',
    'equity_primary',
    'credit_trade_finance',
    'other'
);
ALTER TYPE "public"."deal_type_enum" OWNER TO "postgres";
CREATE TYPE "public"."doc_package_kind_enum" AS ENUM (
    'term_sheet',
    'subscription_pack',
    'nda'
);
ALTER TYPE "public"."doc_package_kind_enum" OWNER TO "postgres";
CREATE TYPE "public"."doc_package_status_enum" AS ENUM (
    'draft',
    'sent',
    'signed',
    'cancelled'
);
ALTER TYPE "public"."doc_package_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."doc_provider_enum" AS ENUM (
    'dropbox_sign',
    'docusign',
    'server_pdf'
);
ALTER TYPE "public"."doc_provider_enum" OWNER TO "postgres";
CREATE TYPE "public"."fee_calc_method_enum" AS ENUM (
    'percent_of_investment',
    'percent_per_annum',
    'percent_of_profit',
    'per_unit_spread',
    'fixed',
    'percent_of_commitment',
    'percent_of_nav',
    'fixed_amount'
);
ALTER TYPE "public"."fee_calc_method_enum" OWNER TO "postgres";
CREATE TYPE "public"."fee_component_kind_enum" AS ENUM (
    'subscription',
    'management',
    'performance',
    'spread_markup',
    'flat',
    'other'
);
ALTER TYPE "public"."fee_component_kind_enum" OWNER TO "postgres";
CREATE TYPE "public"."fee_event_status_enum" AS ENUM (
    'accrued',
    'invoiced',
    'voided',
    'paid',
    'waived',
    'disputed',
    'cancelled'
);
ALTER TYPE "public"."fee_event_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."fee_frequency_enum" AS ENUM (
    'one_time',
    'annual',
    'quarterly',
    'monthly',
    'on_exit',
    'on_event'
);
ALTER TYPE "public"."fee_frequency_enum" OWNER TO "postgres";
CREATE TYPE "public"."invoice_status_enum" AS ENUM (
    'draft',
    'sent',
    'paid',
    'partially_paid',
    'cancelled',
    'overdue',
    'disputed'
);
ALTER TYPE "public"."invoice_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."message_type_enum" AS ENUM (
    'text',
    'system',
    'file'
);
ALTER TYPE "public"."message_type_enum" OWNER TO "postgres";
CREATE TYPE "public"."participant_role_enum" AS ENUM (
    'owner',
    'member',
    'viewer'
);
ALTER TYPE "public"."participant_role_enum" OWNER TO "postgres";
CREATE TYPE "public"."payment_status_enum" AS ENUM (
    'received',
    'applied',
    'refunded'
);
ALTER TYPE "public"."payment_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."report_status_enum" AS ENUM (
    'queued',
    'processing',
    'ready',
    'failed'
);
ALTER TYPE "public"."report_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."request_priority_enum" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);
ALTER TYPE "public"."request_priority_enum" OWNER TO "postgres";
CREATE TYPE "public"."request_status_enum" AS ENUM (
    'open',
    'assigned',
    'in_progress',
    'ready',
    'closed',
    'awaiting_info',
    'cancelled'
);
ALTER TYPE "public"."request_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."reservation_status_enum" AS ENUM (
    'pending',
    'approved',
    'expired',
    'cancelled'
);
ALTER TYPE "public"."reservation_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."user_role" AS ENUM (
    'investor',
    'staff_admin',
    'staff_ops',
    'staff_rm'
);
ALTER TYPE "public"."user_role" OWNER TO "postgres";
CREATE TYPE "public"."vehicle_type" AS ENUM (
    'fund',
    'spv',
    'securitization',
    'note',
    'other'
);
ALTER TYPE "public"."vehicle_type" OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."accrue_quarterly_management_fees"("p_deal_id" "uuid", "p_quarter_end_date" "date") RETURNS TABLE("investor_id" "uuid", "fee_amount" numeric, "fee_event_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_quarter_start date;
  v_days_in_quarter integer;
  v_allocation record;
  v_fee_plan record;
  v_component record;
  v_rate integer;
  v_base numeric;
  v_fee numeric;
  v_fee_event_id uuid;
BEGIN
  v_quarter_start := date_trunc('quarter', p_quarter_end_date)::date;
  v_days_in_quarter := (p_quarter_end_date - v_quarter_start) + 1;

  FOR v_allocation IN
    SELECT a.investor_id, a.units, a.status
    FROM public.allocations a
    WHERE a.deal_id = p_deal_id
      AND a.status IN ('approved','settled')
  LOOP
    SELECT * INTO v_fee_plan
    FROM public.get_applicable_fee_plan(v_allocation.investor_id, p_deal_id, p_quarter_end_date)
    LIMIT 1;

    IF FOUND THEN
      SELECT * INTO v_component
      FROM jsonb_to_recordset(v_fee_plan.components) AS x(
        id uuid,
        kind public.fee_component_kind_enum,
        rate_bps integer,
        calc_method public.fee_calc_method_enum,
        frequency public.fee_frequency_enum,
        base_calculation text
      )
      WHERE kind = 'management'
      LIMIT 1;

      IF FOUND THEN
        v_rate := COALESCE((v_fee_plan.overrides->>'management_rate_bps')::integer, v_component.rate_bps);
        v_base := 0;

        IF v_component.base_calculation = 'commitment' OR v_component.calc_method = 'percent_of_commitment' THEN
          SELECT COALESCE(dc.requested_amount, 0)
          INTO v_base
          FROM public.deal_commitments dc
          WHERE dc.deal_id = p_deal_id
            AND dc.investor_id = v_allocation.investor_id
          LIMIT 1;
        ELSE
          SELECT COALESCE(sum(pos.units * pos.last_nav), 0)
          INTO v_base
          FROM public.positions pos
          WHERE pos.vehicle_id = (SELECT deal.vehicle_id FROM public.deals deal WHERE deal.id = p_deal_id)
            AND pos.investor_id = v_allocation.investor_id;
        END IF;

        v_fee := public.calculate_management_fee(v_base, v_rate, v_days_in_quarter);

        INSERT INTO public.fee_events (
          deal_id,
          investor_id,
          fee_component_id,
          fee_type,
          event_date,
          period_start_date,
          period_end_date,
          base_amount,
          rate_bps,
          computed_amount,
          status
        )
        VALUES (
          p_deal_id,
          v_allocation.investor_id,
          v_component.id,
          'management',
          p_quarter_end_date,
          v_quarter_start,
          p_quarter_end_date,
          v_base,
          v_rate,
          v_fee,
          'accrued'
        )
        RETURNING id INTO v_fee_event_id;

        RETURN QUERY SELECT v_allocation.investor_id, v_fee, v_fee_event_id;
      END IF;
    END IF;
  END LOOP;
END;
$$;
ALTER FUNCTION "public"."accrue_quarterly_management_fees"("p_deal_id" "uuid", "p_quarter_end_date" "date") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."append_audit_hash"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_prev_hash bytea;
  v_hash bytea;
BEGIN
  SELECT hash
  INTO v_prev_hash
  FROM public.audit_log_hash_chain
  ORDER BY created_at DESC
  LIMIT 1;

  v_hash := digest((NEW.id::text || NEW.timestamp::text || coalesce(NEW.actor_id::text,'') || NEW.action)::bytea, 'sha256');

  INSERT INTO public.audit_log_hash_chain (audit_log_id, hash, prev_hash)
  VALUES (NEW.id, v_hash, v_prev_hash);

  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."append_audit_hash"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_match record;
BEGIN
  SELECT * INTO v_match FROM public.reconciliation_matches WHERE id = p_match_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  UPDATE public.reconciliation_matches
  SET status = 'approved', approved_by = p_approved_by, approved_at = now()
  WHERE id = p_match_id;

  UPDATE public.bank_transactions
  SET status = CASE
    WHEN v_match.match_type = 'partial' THEN 'partially_matched'
    ELSE 'matched'
  END,
  match_confidence = v_match.match_confidence,
  match_notes = v_match.match_reason,
  matched_invoice_ids = array_append(coalesce(matched_invoice_ids, '{}'), v_match.invoice_id)
  WHERE id = v_match.bank_transaction_id;

  UPDATE public.invoices
  SET paid_amount = coalesce(paid_amount, 0) + v_match.matched_amount,
      status = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN 'paid'
        ELSE 'partially_paid'
      END,
      match_status = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN 'matched'
        ELSE 'partially_matched'
      END,
      paid_at = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN now()
        ELSE paid_at
      END
  WHERE id = v_match.invoice_id;
END;
$$;
ALTER FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."auto_assign_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_assigned_to uuid;
  v_investor_id uuid;
BEGIN
  -- Only auto-assign on insert if not manually assigned
  IF TG_OP = 'INSERT' AND NEW.assigned_to IS NULL THEN

    -- Extract investor_id from entity_metadata if available
    IF NEW.entity_metadata ? 'investor_id' THEN
      v_investor_id := (NEW.entity_metadata->>'investor_id')::uuid;
    END IF;

    -- Route based on entity type
    IF NEW.entity_type IN ('commitment', 'deal_commitment', 'reservation', 'allocation') THEN
      -- Try to get investor's primary RM from related_investor_id
      IF NEW.related_investor_id IS NOT NULL THEN
        -- For now, assign to first available RM
        -- TODO: Add primary_rm field to investors table
        SELECT id INTO v_assigned_to
        FROM profiles
        WHERE role = 'staff_rm'
        ORDER BY random()
        LIMIT 1;
      END IF;

    ELSIF NEW.entity_type IN ('kyc_change', 'profile_update') THEN
      -- Assign to compliance team (round-robin by random for now)
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_admin' AND title = 'compliance'
      ORDER BY random()
      LIMIT 1;

    ELSIF NEW.entity_type = 'withdrawal' THEN
      -- Assign to bizops team
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE title = 'bizops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    -- Fallback: assign to any available ops staff
    IF v_assigned_to IS NULL THEN
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_ops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    NEW.assigned_to := v_assigned_to;
  END IF;

  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."auto_assign_approval"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."calculate_investor_kpis"("investor_ids" "uuid"[], "as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("current_nav" numeric, "total_contributed" numeric, "total_distributions" numeric, "unfunded_commitment" numeric, "total_commitment" numeric, "total_cost_basis" numeric, "unrealized_gain" numeric, "unrealized_gain_pct" numeric, "dpi" numeric, "tvpi" numeric, "irr_estimate" numeric, "total_positions" integer, "total_vehicles" integer)
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    calc_current_nav numeric(18,2) := 0;
    calc_total_contributed numeric(18,2) := 0;
    calc_total_distributions numeric(18,2) := 0;
    calc_total_commitment numeric(18,2) := 0;
    calc_total_cost_basis numeric(18,2) := 0;
    calc_unfunded_commitment numeric(18,2) := 0;
    calc_unrealized_gain numeric(18,2) := 0;
    calc_unrealized_gain_pct numeric(5,2) := 0;
    calc_dpi numeric(10,4) := 0;
    calc_tvpi numeric(10,4) := 0;
    calc_irr_estimate numeric(5,2) := 0;
    calc_total_positions int := 0;
    calc_total_vehicles int := 0;
BEGIN
    -- Calculate current NAV from positions with latest valuations
    SELECT COALESCE(SUM(
        CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END
    ), 0)
    INTO calc_current_nav
    FROM positions p
    LEFT JOIN get_latest_valuations() lv ON p.vehicle_id = lv.vehicle_id
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0;

    -- Calculate total cost basis from positions
    SELECT COALESCE(SUM(p.cost_basis), 0)
    INTO calc_total_cost_basis
    FROM positions p
    WHERE p.investor_id = ANY(investor_ids);

    -- Calculate total contributed capital from cashflows
    SELECT COALESCE(SUM(cf.amount), 0)
    INTO calc_total_contributed
    FROM cashflows cf
    WHERE cf.investor_id = ANY(investor_ids)
    AND cf.type = 'call'
    AND cf.date <= as_of_date;

    -- Calculate total distributions from cashflows
    SELECT COALESCE(SUM(cf.amount), 0)
    INTO calc_total_distributions
    FROM cashflows cf
    WHERE cf.investor_id = ANY(investor_ids)
    AND cf.type = 'distribution'
    AND cf.date <= as_of_date;

    -- Calculate total commitments from active subscriptions
    SELECT COALESCE(SUM(s.commitment), 0)
    INTO calc_total_commitment
    FROM subscriptions s
    WHERE s.investor_id = ANY(investor_ids)
    AND s.status IN ('active', 'pending');

    -- Calculate derived metrics
    calc_unfunded_commitment := GREATEST(calc_total_commitment - calc_total_contributed, 0);
    calc_unrealized_gain := calc_current_nav - calc_total_cost_basis;

    -- Calculate unrealized gain percentage (avoid division by zero)
    IF calc_total_cost_basis > 0 THEN
        calc_unrealized_gain_pct := (calc_unrealized_gain / calc_total_cost_basis) * 100;
    ELSE
        calc_unrealized_gain_pct := 0;
    END IF;

    -- Calculate DPI (Distributions to Paid-in Capital)
    IF calc_total_contributed > 0 THEN
        calc_dpi := calc_total_distributions / calc_total_contributed;
    ELSE
        calc_dpi := 0;
    END IF;

    -- Calculate TVPI (Total Value to Paid-in Capital)
    IF calc_total_contributed > 0 THEN
        calc_tvpi := (calc_current_nav + calc_total_distributions) / calc_total_contributed;
    ELSE
        calc_tvpi := 0;
    END IF;

    -- Simple IRR estimation (placeholder - complex calculation)
    -- For MVP, we'll use a simplified approach based on total return and time
    IF calc_total_contributed > 0 AND calc_tvpi > 1 THEN
        -- Estimate based on compound annual growth
        -- This is a simplified calculation - real IRR requires cashflow timing
        calc_irr_estimate := LEAST(GREATEST((calc_tvpi - 1) * 10, 0), 100);
    ELSE
        calc_irr_estimate := 0;
    END IF;

    -- Count positions and vehicles
    SELECT COUNT(*), COUNT(DISTINCT vehicle_id)
    INTO calc_total_positions, calc_total_vehicles
    FROM positions p
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0;

    -- Return all calculated values
    RETURN QUERY SELECT
        calc_current_nav,
        calc_total_contributed,
        calc_total_distributions,
        calc_unfunded_commitment,
        calc_total_commitment,
        calc_total_cost_basis,
        calc_unrealized_gain,
        calc_unrealized_gain_pct,
        calc_dpi,
        calc_tvpi,
        calc_irr_estimate,
        calc_total_positions,
        calc_total_vehicles;
END;
$$;
ALTER FUNCTION "public"."calculate_investor_kpis"("investor_ids" "uuid"[], "as_of_date" "date") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."calculate_investor_kpis_with_deals"("investor_ids" "uuid"[], "as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("current_nav" numeric, "total_contributed" numeric, "total_distributions" numeric, "unfunded_commitment" numeric, "total_commitment" numeric, "total_cost_basis" numeric, "unrealized_gain" numeric, "unrealized_gain_pct" numeric, "dpi" numeric, "tvpi" numeric, "irr_estimate" numeric, "total_positions" integer, "total_vehicles" integer, "total_deals" integer, "total_deal_value" numeric, "pending_allocations" integer)
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    calc_current_nav numeric(18,2) := 0;
    calc_total_contributed numeric(18,2) := 0;
    calc_total_distributions numeric(18,2) := 0;
    calc_total_commitment numeric(18,2) := 0;
    calc_total_cost_basis numeric(18,2) := 0;
    calc_unfunded_commitment numeric(18,2) := 0;
    calc_unrealized_gain numeric(18,2) := 0;
    calc_unrealized_gain_pct numeric(5,2) := 0;
    calc_dpi numeric(10,4) := 0;
    calc_tvpi numeric(10,4) := 0;
    calc_irr_estimate numeric(5,2) := 0;
    calc_total_positions int := 0;
    calc_total_vehicles int := 0;
    calc_total_deals int := 0;
    calc_total_deal_value numeric(18,2) := 0;
    calc_pending_allocations int := 0;
BEGIN
    -- Get base KPI calculations
    SELECT 
        base.current_nav,
        base.total_contributed,
        base.total_distributions,
        base.unfunded_commitment,
        base.total_commitment,
        base.total_cost_basis,
        base.unrealized_gain,
        base.unrealized_gain_pct,
        base.dpi,
        base.tvpi,
        base.irr_estimate,
        base.total_positions,
        base.total_vehicles
    INTO 
        calc_current_nav,
        calc_total_contributed,
        calc_total_distributions,
        calc_unfunded_commitment,
        calc_total_commitment,
        calc_total_cost_basis,
        calc_unrealized_gain,
        calc_unrealized_gain_pct,
        calc_dpi,
        calc_tvpi,
        calc_irr_estimate,
        calc_total_positions,
        calc_total_vehicles
    FROM calculate_investor_kpis(investor_ids, as_of_date) base;

    -- Count deal allocations if deals table exists
    BEGIN
        SELECT COUNT(*), COALESCE(SUM(a.amount), 0)
        INTO calc_total_deals, calc_total_deal_value
        FROM deal_allocations a
        INNER JOIN deals d ON a.deal_id = d.id
        WHERE a.investor_id = ANY(investor_ids);
        
        -- Count pending allocations
        SELECT COUNT(*)
        INTO calc_pending_allocations
        FROM deal_allocations a
        INNER JOIN deals d ON a.deal_id = d.id
        WHERE a.investor_id = ANY(investor_ids)
        AND d.status = 'pending';
        
    EXCEPTION WHEN undefined_table THEN
        -- If deals/deal_allocations tables don't exist, set to 0
        calc_total_deals := 0;
        calc_total_deal_value := 0;
        calc_pending_allocations := 0;
    END;

    -- Return all calculated values including deal metrics
    RETURN QUERY SELECT
        calc_current_nav,
        calc_total_contributed,
        calc_total_distributions,
        calc_unfunded_commitment,
        calc_total_commitment,
        calc_total_cost_basis,
        calc_unrealized_gain,
        calc_unrealized_gain_pct,
        calc_dpi,
        calc_tvpi,
        calc_irr_estimate,
        calc_total_positions,
        calc_total_vehicles,
        calc_total_deals,
        calc_total_deal_value,
        calc_pending_allocations;
END;
$$;
ALTER FUNCTION "public"."calculate_investor_kpis_with_deals"("investor_ids" "uuid"[], "as_of_date" "date") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."calculate_management_fee"("p_base_amount" numeric, "p_rate_bps" integer, "p_period_days" integer) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN round(p_base_amount * (p_rate_bps::numeric / 10000) * (p_period_days::numeric / 365), 2);
END;
$$;
ALTER FUNCTION "public"."calculate_management_fee"("p_base_amount" numeric, "p_rate_bps" integer, "p_period_days" integer) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."calculate_performance_fee"("p_contributed_capital" numeric, "p_exit_proceeds" numeric, "p_carry_rate_bps" integer, "p_hurdle_rate_bps" integer, "p_years_held" numeric) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_profit numeric;
  v_hurdle_return numeric;
  v_profit_above_hurdle numeric;
BEGIN
  v_profit := p_exit_proceeds - p_contributed_capital;
  IF v_profit <= 0 THEN
    RETURN 0;
  END IF;

  v_hurdle_return := p_contributed_capital * (p_hurdle_rate_bps::numeric / 10000) * p_years_held;
  v_profit_above_hurdle := v_profit - v_hurdle_return;

  IF v_profit_above_hurdle <= 0 THEN
    RETURN 0;
  END IF;

  RETURN round(v_profit_above_hurdle * (p_carry_rate_bps::numeric / 10000), 2);
END;
$$;
ALTER FUNCTION "public"."calculate_performance_fee"("p_contributed_capital" numeric, "p_exit_proceeds" numeric, "p_carry_rate_bps" integer, "p_hurdle_rate_bps" integer, "p_years_held" numeric) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."calculate_subscription_fee"("p_commitment_amount" numeric, "p_rate_bps" integer) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN round(p_commitment_amount * (p_rate_bps::numeric / 10000), 2);
END;
$$;
ALTER FUNCTION "public"."calculate_subscription_fee"("p_commitment_amount" numeric, "p_rate_bps" integer) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."check_auto_approval_criteria"("p_approval_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_approval record;
  v_investor record;
  v_previous_approvals int;
  v_recent_rejections int;
  v_commitment_amount numeric;
BEGIN
  -- Get approval details
  SELECT * INTO v_approval FROM approvals WHERE id = p_approval_id;

  -- Only auto-approve commitments
  IF v_approval.entity_type NOT IN ('commitment', 'deal_commitment') THEN
    RETURN false;
  END IF;

  -- Extract commitment amount from metadata
  IF v_approval.entity_metadata ? 'requested_amount' THEN
    v_commitment_amount := (v_approval.entity_metadata->>'requested_amount')::numeric;
  ELSIF v_approval.entity_metadata ? 'amount' THEN
    v_commitment_amount := (v_approval.entity_metadata->>'amount')::numeric;
  ELSE
    RETURN false; -- No amount data
  END IF;

  -- Check commitment amount threshold
  IF v_commitment_amount > 5000 THEN
    RETURN false;
  END IF;

  -- Get investor details if available
  IF v_approval.related_investor_id IS NOT NULL THEN
    SELECT * INTO v_investor FROM investors WHERE id = v_approval.related_investor_id;

    -- Check KYC status
    IF v_investor.kyc_status != 'completed' THEN
      RETURN false;
    END IF;

    -- Check previous successful approvals
    SELECT COUNT(*) INTO v_previous_approvals
    FROM approvals
    WHERE related_investor_id = v_approval.related_investor_id
      AND entity_type IN ('commitment', 'deal_commitment')
      AND status = 'approved';

    IF v_previous_approvals < 3 THEN
      RETURN false;
    END IF;

    -- Check recent rejections
    SELECT COUNT(*) INTO v_recent_rejections
    FROM approvals
    WHERE related_investor_id = v_approval.related_investor_id
      AND status = 'rejected'
      AND created_at >= CURRENT_DATE - INTERVAL '90 days';

    IF v_recent_rejections > 0 THEN
      RETURN false;
    END IF;
  ELSE
    -- No investor data, cannot auto-approve
    RETURN false;
  END IF;

  -- All criteria met
  RETURN true;
END;
$$;
ALTER FUNCTION "public"."check_auto_approval_criteria"("p_approval_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."create_commitment_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  v_priority text;
BEGIN
  -- Only create approval for submitted commitments
  IF NEW.status != 'submitted' THEN
    RETURN NEW;
  END IF;

  -- Calculate priority based on commitment amount
  v_priority := CASE
    WHEN NEW.requested_amount > 1000000 THEN 'critical'  -- >$1M
    WHEN NEW.requested_amount > 100000 THEN 'high'       -- >$100K
    WHEN NEW.requested_amount > 50000 THEN 'medium'      -- >$50K
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
    'deal_commitment',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'requested_amount', NEW.requested_amount,
      'requested_units', NEW.requested_units,
      'fee_plan_id', NEW.selected_fee_plan_id,
      'commitment_created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$_$;
ALTER FUNCTION "public"."create_commitment_approval"() OWNER TO "postgres";
COMMENT ON FUNCTION "public"."create_commitment_approval"() IS 'Automatically creates approval record when investor submits commitment. Priority is calculated based on commitment amount: >$1M=critical, >$100K=high, >$50K=medium, else low.';
CREATE OR REPLACE FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_vehicle_name text;
  v_root_folder_id uuid;
  v_category_names text[] := ARRAY['Agreements', 'KYC Documents', 'Position Statements', 'NDAs', 'Reports'];
  v_category_name text;
BEGIN
  -- Get vehicle name
  SELECT name INTO v_vehicle_name FROM vehicles WHERE id = p_vehicle_id;
  
  IF v_vehicle_name IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found: %', p_vehicle_id;
  END IF;
  
  -- Create root folder for vehicle
  INSERT INTO document_folders (name, path, vehicle_id, folder_type, created_by)
  VALUES (v_vehicle_name, '/' || v_vehicle_name, p_vehicle_id, 'vehicle_root', p_created_by)
  RETURNING id INTO v_root_folder_id;
  
  -- Create default category folders
  FOREACH v_category_name IN ARRAY v_category_names
  LOOP
    INSERT INTO document_folders (parent_folder_id, name, path, vehicle_id, folder_type, created_by)
    VALUES (
      v_root_folder_id,
      v_category_name,
      '/' || v_vehicle_name || '/' || v_category_name,
      p_vehicle_id,
      'category',
      p_created_by
    );
  END LOOP;
END;
$$;
ALTER FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."create_reservation_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  v_priority text;
  v_reservation_value numeric;
BEGIN
  -- Only create approval for pending reservations
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Calculate reservation value
  v_reservation_value := NEW.requested_units * COALESCE(NEW.proposed_unit_price, 0);

  -- Calculate priority based on reservation value
  v_priority := CASE
    WHEN v_reservation_value > 1000000 THEN 'critical'  -- >$1M
    WHEN v_reservation_value > 500000 THEN 'high'       -- >$500K
    WHEN v_reservation_value > 100000 THEN 'medium'     -- >$100K
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
    'reservation',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'requested_units', NEW.requested_units,
      'proposed_unit_price', NEW.proposed_unit_price,
      'reservation_value', v_reservation_value,
      'expires_at', NEW.expires_at,
      'reservation_created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$_$;
ALTER FUNCTION "public"."create_reservation_approval"() OWNER TO "postgres";
COMMENT ON FUNCTION "public"."create_reservation_approval"() IS 'Automatically creates approval record when reservation is created. Priority is calculated based on reservation value: >$1M=critical, >$500K=high, >$100K=medium, else low.';
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_user_id" "uuid",
    "kind" "text",
    "due_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text",
    "related_entity_type" "text",
    "related_entity_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "owner_investor_id" "uuid",
    "category" "text",
    "title" "text" DEFAULT 'Untitled Task'::"text",
    "description" "text",
    "priority" "text" DEFAULT 'medium'::"text",
    "estimated_minutes" integer,
    "completion_reason" "text",
    "completed_at" timestamp with time zone,
    "completed_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "started_at" timestamp with time zone,
    "instructions" "jsonb",
    CONSTRAINT "tasks_category_check" CHECK (("category" = ANY (ARRAY['onboarding'::"text", 'compliance'::"text", 'investment_setup'::"text"]))),
    CONSTRAINT "tasks_kind_check" CHECK (("kind" = ANY (ARRAY['onboarding_profile'::"text", 'onboarding_bank_details'::"text", 'kyc_individual'::"text", 'kyc_entity'::"text", 'kyc_aml_check'::"text", 'compliance_nda'::"text", 'compliance_subscription_agreement'::"text", 'compliance_tax_forms'::"text", 'investment_allocation_confirmation'::"text", 'investment_funding_instructions'::"text", 'investment_capital_call_response'::"text", 'deal_commitment_review'::"text", 'deal_nda_signature'::"text", 'other'::"text"]))),
    CONSTRAINT "tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "tasks_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'overdue'::"text", 'waived'::"text", 'blocked'::"text"])))
);
ALTER TABLE "public"."tasks" OWNER TO "postgres";
COMMENT ON COLUMN "public"."tasks"."started_at" IS 'Timestamp when task was marked as in_progress';
COMMENT ON COLUMN "public"."tasks"."instructions" IS 'Structured instructions and steps for completing the task';
CREATE OR REPLACE FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") RETURNS SETOF "public"."tasks"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  INSERT INTO tasks (
    owner_user_id, owner_investor_id, kind, category, title, description,
    priority, estimated_minutes, due_at, status
  )
  SELECT
    p_user_id, p_investor_id, tt.kind, tt.category, tt.title, tt.description,
    tt.priority, tt.estimated_minutes,
    CASE WHEN tt.default_due_days IS NOT NULL
      THEN now() + (tt.default_due_days || ' days')::interval
      ELSE NULL
    END,
    CASE WHEN tt.prerequisite_task_kinds IS NOT NULL AND array_length(tt.prerequisite_task_kinds, 1) > 0
      THEN 'blocked'
      ELSE 'pending'
    END
  FROM task_templates tt
  WHERE tt.trigger_event = p_trigger_event
    AND NOT EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.owner_user_id = p_user_id AND t.kind = tt.kind
        AND t.status NOT IN ('completed', 'waived')
    )
  RETURNING *;
END;
$$;
ALTER FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."ensure_message_read_receipt"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO message_reads (message_id, user_id, read_at)
  VALUES (NEW.id, NEW.sender_id, NEW.created_at)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."ensure_message_read_receipt"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."fn_compute_fee_events"("p_deal_id" "uuid", "p_as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_events_created integer := 0;
  v_term_record RECORD;
  v_component_record RECORD;
  v_invested_amount numeric(18,2);
  v_fee_amount numeric(18,2);
BEGIN
  -- For each active investor_terms in this deal
  FOR v_term_record IN
    SELECT 
      it.investor_id,
      it.selected_fee_plan_id,
      it.overrides
    FROM investor_terms it
    WHERE it.deal_id = p_deal_id
      AND it.status = 'active'
  LOOP
    -- Get invested amount from approved allocations
    SELECT COALESCE(SUM(units * unit_price), 0)
    INTO v_invested_amount
    FROM allocations
    WHERE deal_id = p_deal_id
      AND investor_id = v_term_record.investor_id
      AND status IN ('approved', 'settled');
    
    -- For each fee component in their plan
    FOR v_component_record IN
      SELECT *
      FROM fee_components fc
      WHERE fc.fee_plan_id = v_term_record.selected_fee_plan_id
    LOOP
      -- Calculate fee based on component type
      v_fee_amount := 0;
      
      CASE v_component_record.calc_method
        WHEN 'percent_of_investment' THEN
          v_fee_amount := v_invested_amount * (v_component_record.rate_bps / 10000.0);
          
        WHEN 'fixed' THEN
          v_fee_amount := v_component_record.flat_amount;
          
        WHEN 'percent_per_annum' THEN
          -- For management fees - calculate based on time period and NAV
          -- This is a simplified version - in practice you'd need current NAV
          v_fee_amount := v_invested_amount * (v_component_record.rate_bps / 10000.0) * 
            EXTRACT(DAYS FROM (p_as_of_date - current_date + interval '1 year')) / 365.0;
          
        -- Add other calculation methods as needed
        ELSE
          CONTINUE;  -- Skip unsupported calculation methods
      END CASE;
      
      -- Only create fee event if amount > 0 and not already exists
      IF v_fee_amount > 0 THEN
        INSERT INTO fee_events (
          deal_id,
          investor_id,
          fee_component_id,
          event_date,
          period_start,
          period_end,
          base_amount,
          computed_amount,
          currency,
          source_ref,
          status
        ) 
        SELECT 
          p_deal_id,
          v_term_record.investor_id,
          v_component_record.id,
          p_as_of_date,
          CASE 
            WHEN v_component_record.frequency = 'annual' THEN date_trunc('year', p_as_of_date)::date
            WHEN v_component_record.frequency = 'quarterly' THEN date_trunc('quarter', p_as_of_date)::date
            ELSE p_as_of_date
          END,
          CASE 
            WHEN v_component_record.frequency = 'annual' THEN (date_trunc('year', p_as_of_date) + interval '1 year' - interval '1 day')::date
            WHEN v_component_record.frequency = 'quarterly' THEN (date_trunc('quarter', p_as_of_date) + interval '3 months' - interval '1 day')::date
            ELSE p_as_of_date
          END,
          v_invested_amount,
          v_fee_amount,
          'USD',
          'allocation',
          'accrued'
        WHERE NOT EXISTS (
          -- Avoid duplicates
          SELECT 1 FROM fee_events fe
          WHERE fe.deal_id = p_deal_id
            AND fe.investor_id = v_term_record.investor_id
            AND fe.fee_component_id = v_component_record.id
            AND fe.event_date = p_as_of_date
            AND fe.status != 'voided'
        );
        
        IF FOUND THEN
          v_events_created := v_events_created + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN v_events_created;
END;
$$;
ALTER FUNCTION "public"."fn_compute_fee_events"("p_deal_id" "uuid", "p_as_of_date" "date") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."fn_deal_inventory_summary"("p_deal_id" "uuid") RETURNS TABLE("total_units" numeric, "available_units" numeric, "reserved_units" numeric, "allocated_units" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(sl.units_total), 0) as total_units,
    COALESCE(SUM(sl.units_remaining), 0) as available_units,
    COALESCE((
      SELECT SUM(r.requested_units) 
      FROM reservations r 
      WHERE r.deal_id = p_deal_id AND r.status = 'pending'
    ), 0) as reserved_units,
    COALESCE((
      SELECT SUM(a.units)
      FROM allocations a
      WHERE a.deal_id = p_deal_id AND a.status IN ('approved', 'settled')
    ), 0) as allocated_units
  FROM share_lots sl
  WHERE sl.deal_id = p_deal_id;
END;
$$;
ALTER FUNCTION "public"."fn_deal_inventory_summary"("p_deal_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."fn_expire_reservations"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_expired_count integer := 0;
  v_reservation_record RECORD;
  v_lot_item_record RECORD;
BEGIN
  -- Find reservations that are pending and expired
  FOR v_reservation_record IN
    SELECT id, deal_id
    FROM reservations 
    WHERE status = 'pending' 
      AND expires_at < now()
    FOR UPDATE SKIP LOCKED  -- Work lock per reservation
  LOOP
    -- Restore units_remaining for all lots in this reservation
    FOR v_lot_item_record IN
      SELECT lot_id, units
      FROM reservation_lot_items 
      WHERE reservation_id = v_reservation_record.id
    LOOP
      UPDATE share_lots 
      SET units_remaining = units_remaining + v_lot_item_record.units,
          status = CASE 
            WHEN status = 'exhausted' AND units_remaining + v_lot_item_record.units > 0 THEN 'available'
            ELSE status
          END
      WHERE id = v_lot_item_record.lot_id;
    END LOOP;
    
    -- Mark reservation as expired
    UPDATE reservations 
    SET status = 'expired'
    WHERE id = v_reservation_record.id
      AND status = 'pending';  -- Double-check status hasn't changed
    
    v_expired_count := v_expired_count + 1;
  END LOOP;
  
  RETURN v_expired_count;
END;
$$;
ALTER FUNCTION "public"."fn_expire_reservations"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."fn_finalize_allocation"("p_reservation_id" "uuid", "p_approver_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_allocation_id uuid;
  v_reservation_record RECORD;
  v_total_units numeric(28,8);
  v_weighted_cost numeric(18,6);
  v_spread_amount numeric(18,2);
  v_vehicle_id uuid;
BEGIN
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  
  -- Get reservation details
  SELECT 
    r.deal_id,
    r.investor_id, 
    r.proposed_unit_price,
    r.status,
    d.vehicle_id
  INTO v_reservation_record
  FROM reservations r
  JOIN deals d ON d.id = r.deal_id
  WHERE r.id = p_reservation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found: %', p_reservation_id;
  END IF;
  
  IF v_reservation_record.status != 'pending' THEN
    RAISE EXCEPTION 'Reservation is not pending. Status: %', v_reservation_record.status;
  END IF;
  
  -- TODO: Check for approval existence (implement when approvals system is ready)
  -- This would check the approvals table for approved status
  
  -- Calculate total units and weighted average cost
  SELECT 
    SUM(rli.units) as total_units,
    SUM(rli.units * sl.unit_cost) / SUM(rli.units) as weighted_cost
  INTO v_total_units, v_weighted_cost
  FROM reservation_lot_items rli
  JOIN share_lots sl ON sl.id = rli.lot_id
  WHERE rli.reservation_id = p_reservation_id;
  
  -- Create allocation
  v_allocation_id := gen_random_uuid();
  INSERT INTO allocations (
    id,
    deal_id,
    investor_id,
    unit_price,
    units,
    status,
    approved_by,
    approved_at
  ) VALUES (
    v_allocation_id,
    v_reservation_record.deal_id,
    v_reservation_record.investor_id,
    v_reservation_record.proposed_unit_price,
    v_total_units,
    'approved',
    p_approver_id,
    now()
  );
  
  -- Copy reservation_lot_items to allocation_lot_items
  INSERT INTO allocation_lot_items (allocation_id, lot_id, units)
  SELECT v_allocation_id, lot_id, units
  FROM reservation_lot_items
  WHERE reservation_id = p_reservation_id;
  
  -- Mark reservation as approved
  UPDATE reservations 
  SET status = 'approved'
  WHERE id = p_reservation_id;
  
  -- Update positions (upsert)
  IF v_reservation_record.vehicle_id IS NOT NULL THEN
    INSERT INTO positions (
      investor_id,
      vehicle_id,
      units,
      cost_basis,
      as_of_date
    ) VALUES (
      v_reservation_record.investor_id,
      v_reservation_record.vehicle_id,
      v_total_units,
      v_total_units * v_reservation_record.proposed_unit_price,
      current_date
    )
    ON CONFLICT (investor_id, vehicle_id) 
    DO UPDATE SET
      units = positions.units + EXCLUDED.units,
      cost_basis = positions.cost_basis + EXCLUDED.cost_basis,
      as_of_date = EXCLUDED.as_of_date;
  END IF;
  
  -- Calculate and record spread
  v_spread_amount := (v_reservation_record.proposed_unit_price - v_weighted_cost) * v_total_units;
  
  IF v_spread_amount > 0 THEN
    -- Create spread invoice line (will be attached to invoice later)
    INSERT INTO invoice_lines (
      invoice_id,
      kind,
      description,
      quantity,
      unit_price,
      amount
    ) VALUES (
      NULL,  -- Will be linked when invoice is created
      'spread',
      'Trading spread on allocation ' || v_allocation_id,
      v_total_units,
      v_reservation_record.proposed_unit_price - v_weighted_cost,
      v_spread_amount
    );
  END IF;
  
  RETURN v_allocation_id;
END;
$$;
ALTER FUNCTION "public"."fn_finalize_allocation"("p_reservation_id" "uuid", "p_approver_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."fn_invoice_fees"("p_deal_id" "uuid", "p_investor_id" "uuid" DEFAULT NULL::"uuid", "p_up_to_date" "date" DEFAULT CURRENT_DATE) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_invoice_id uuid;
  v_subtotal numeric(18,2) := 0;
  v_event_record RECORD;
  v_investor_filter uuid;
BEGIN
  -- If investor_id provided, filter to that investor, otherwise process all
  v_investor_filter := p_investor_id;
  
  -- Create invoice
  v_invoice_id := gen_random_uuid();
  
  -- Group uninvoiced fee_events and create invoice
  FOR v_event_record IN
    SELECT 
      fe.investor_id,
      SUM(fe.computed_amount) as total_amount,
      fe.currency
    FROM fee_events fe
    WHERE fe.deal_id = p_deal_id
      AND fe.status = 'accrued'
      AND fe.event_date <= p_up_to_date
      AND (v_investor_filter IS NULL OR fe.investor_id = v_investor_filter)
    GROUP BY fe.investor_id, fe.currency
    HAVING SUM(fe.computed_amount) > 0
  LOOP
    INSERT INTO invoices (
      id,
      investor_id,
      deal_id,
      due_date,
      currency,
      subtotal,
      tax,
      total,
      status,
      generated_from
    ) VALUES (
      v_invoice_id,
      v_event_record.investor_id,
      p_deal_id,
      current_date + interval '30 days',
      v_event_record.currency,
      v_event_record.total_amount,
      0,  -- No tax calculation in MVP
      v_event_record.total_amount,
      'draft',
      'fee_events'
    );
    
    -- Create invoice lines for each fee event
    INSERT INTO invoice_lines (
      invoice_id,
      kind,
      description,
      quantity,
      unit_price,
      amount,
      fee_event_id
    )
    SELECT 
      v_invoice_id,
      'fee',
      CONCAT(fc.kind, ' fee - ', fe.event_date),
      1,
      fe.computed_amount,
      fe.computed_amount,
      fe.id
    FROM fee_events fe
    JOIN fee_components fc ON fc.id = fe.fee_component_id
    WHERE fe.deal_id = p_deal_id
      AND fe.status = 'accrued'
      AND fe.event_date <= p_up_to_date
      AND fe.investor_id = v_event_record.investor_id
      AND (v_investor_filter IS NULL OR fe.investor_id = v_investor_filter);
    
    -- Mark fee events as invoiced
    UPDATE fee_events 
    SET status = 'invoiced'
    WHERE deal_id = p_deal_id
      AND status = 'accrued'
      AND event_date <= p_up_to_date
      AND investor_id = v_event_record.investor_id
      AND (v_investor_filter IS NULL OR investor_id = v_investor_filter);
      
    EXIT; -- Only create one invoice per call
  END LOOP;
  
  RETURN v_invoice_id;
END;
$$;
ALTER FUNCTION "public"."fn_invoice_fees"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_up_to_date" "date") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."fn_reserve_inventory"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_requested_units" numeric, "p_proposed_unit_price" numeric, "p_hold_minutes" integer DEFAULT 30) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_reservation_id uuid;
  v_deal_status text;
  v_remaining_units numeric(28,8);
  v_lot_record RECORD;
  v_allocated_units numeric(28,8) := 0;
  v_units_to_take numeric(28,8);
BEGIN
  -- Set transaction isolation level for consistency
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  
  -- 1. Validate deal status
  SELECT status INTO v_deal_status
  FROM deals 
  WHERE id = p_deal_id;
  
  IF v_deal_status IS NULL THEN
    RAISE EXCEPTION 'Deal not found: %', p_deal_id;
  END IF;
  
  IF v_deal_status NOT IN ('open', 'allocation_pending') THEN
    RAISE EXCEPTION 'Deal is not available for reservations. Status: %', v_deal_status;
  END IF;
  
  -- 2. Create reservation record first
  v_reservation_id := gen_random_uuid();
  INSERT INTO reservations (
    id,
    deal_id,
    investor_id,
    requested_units,
    proposed_unit_price,
    expires_at,
    status,
    created_by
  ) VALUES (
    v_reservation_id,
    p_deal_id,
    p_investor_id,
    p_requested_units,
    p_proposed_unit_price,
    now() + (p_hold_minutes || ' minutes')::interval,
    'pending',
    p_investor_id  -- Assuming investor creates their own reservation
  );
  
  -- 3. Select share_lots for the deal_id FOR UPDATE SKIP LOCKED, ordered by acquired_at (FIFO)
  FOR v_lot_record IN
    SELECT id, units_remaining, unit_cost
    FROM share_lots 
    WHERE deal_id = p_deal_id 
      AND status = 'available'
      AND units_remaining > 0
    ORDER BY acquired_at ASC, created_at ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Calculate how many units to take from this lot
    v_units_to_take := LEAST(
      v_lot_record.units_remaining, 
      p_requested_units - v_allocated_units
    );
    
    -- 4. Insert reservation_lot_items
    INSERT INTO reservation_lot_items (
      reservation_id,
      lot_id,
      units
    ) VALUES (
      v_reservation_id,
      v_lot_record.id,
      v_units_to_take
    );
    
    -- 5. Decrement share_lots.units_remaining
    UPDATE share_lots 
    SET units_remaining = units_remaining - v_units_to_take,
        status = CASE 
          WHEN units_remaining - v_units_to_take = 0 THEN 'exhausted'
          ELSE status
        END
    WHERE id = v_lot_record.id;
    
    v_allocated_units := v_allocated_units + v_units_to_take;
    
    -- Break if we've allocated enough
    EXIT WHEN v_allocated_units >= p_requested_units;
  END LOOP;
  
  -- Check if we were able to reserve enough units
  IF v_allocated_units < p_requested_units THEN
    RAISE EXCEPTION 'Insufficient inventory available. Requested: %, Available: %', 
      p_requested_units, v_allocated_units;
  END IF;
  
  -- 6. Return reservation_id
  RETURN v_reservation_id;
END;
$$;
ALTER FUNCTION "public"."fn_reserve_inventory"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_requested_units" numeric, "p_proposed_unit_price" numeric, "p_hold_minutes" integer) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("fee_plan_id" "uuid", "fee_plan_name" "text", "components" "jsonb", "overrides" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH investor_terms AS (
    SELECT
      it.base_fee_plan_id,
      it.overrides
    FROM public.investor_terms it
    WHERE it.investor_id = p_investor_id
      AND it.deal_id = p_deal_id
      AND it.status = 'active'
      AND it.effective_from <= p_as_of_date
      AND (it.effective_until IS NULL OR it.effective_until >= p_as_of_date)
    ORDER BY it.effective_from DESC
    LIMIT 1
  ),
  default_plan AS (
    SELECT
      fp.id AS fee_plan_id,
      fp.name AS fee_plan_name,
      jsonb_agg(
        jsonb_build_object(
          'id', fc.id,
          'kind', fc.kind,
          'rate_bps', fc.rate_bps,
          'calc_method', fc.calc_method,
          'frequency', fc.frequency,
          'base_calculation', fc.base_calculation,
          'hurdle_rate_bps', fc.hurdle_rate_bps
        ) ORDER BY fc.kind
      ) AS components
    FROM public.fee_plans fp
    JOIN public.fee_components fc ON fc.fee_plan_id = fp.id
    WHERE fp.deal_id = p_deal_id
      AND fp.is_default = true
      AND fp.is_active = true
    GROUP BY fp.id, fp.name
  )
  SELECT
    COALESCE(it.base_fee_plan_id, dp.fee_plan_id) AS fee_plan_id,
    dp.fee_plan_name,
    dp.components,
    COALESCE(it.overrides, '{}'::jsonb) AS overrides
  FROM default_plan dp
  LEFT JOIN investor_terms it ON true;
END;
$$;
ALTER FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("total_pending" integer, "overdue_count" integer, "avg_processing_time_hours" numeric, "approval_rate_24h" numeric, "total_approved_30d" integer, "total_rejected_30d" integer, "total_awaiting_info" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH approval_data AS (
    SELECT
      a.status,
      a.sla_breach_at,
      a.actual_processing_time_hours,
      a.created_at,
      a.resolved_at
    FROM approvals a
    WHERE (p_staff_id IS NULL OR a.assigned_to = p_staff_id)
      AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'
  )
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending')::int,
    COUNT(*) FILTER (WHERE status = 'pending' AND sla_breach_at < now())::int,
    COALESCE(AVG(actual_processing_time_hours) FILTER (
      WHERE status IN ('approved', 'rejected') AND actual_processing_time_hours IS NOT NULL
    ), 0)::numeric(10,2),
    COALESCE(
      (COUNT(*) FILTER (WHERE status = 'approved' AND actual_processing_time_hours <= 24)::numeric /
        NULLIF(COUNT(*) FILTER (WHERE status = 'approved'), 0) * 100
      ), 0
    )::numeric(5,2),
    COUNT(*) FILTER (WHERE status = 'approved')::int,
    COUNT(*) FILTER (WHERE status = 'rejected')::int,
    COUNT(*) FILTER (WHERE status = 'awaiting_info')::int
  FROM approval_data;
END;
$$;
ALTER FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) RETURNS TABLE("conversation_id" "uuid", "unread_count" bigint)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  IF p_conversation_ids IS NULL OR array_length(p_conversation_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id,
         COALESCE(
           (
             SELECT COUNT(*)
             FROM messages m
             WHERE m.conversation_id = c.id
               AND m.deleted_at IS NULL
               AND (m.created_at > COALESCE(cp.last_read_at, '-infinity'::timestamptz))
               AND (m.sender_id IS DISTINCT FROM p_user_id)
           ),
           0
         )::bigint AS unread_count
  FROM conversations c
  LEFT JOIN conversation_participants cp
    ON cp.conversation_id = c.id AND cp.user_id = p_user_id
  WHERE c.id = ANY(p_conversation_ids);
END;
$$;
ALTER FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) IS 'Returns unread message counts for specified conversations for a user';
CREATE OR REPLACE FUNCTION "public"."get_folder_path"("p_folder_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_path text;
BEGIN
  WITH RECURSIVE folder_path AS (
    SELECT id, name, parent_folder_id, name::text as path
    FROM document_folders
    WHERE id = p_folder_id
    
    UNION ALL
    
    SELECT f.id, f.name, f.parent_folder_id, f.name || '/' || fp.path
    FROM document_folders f
    INNER JOIN folder_path fp ON f.id = fp.parent_folder_id
  )
  SELECT '/' || path INTO v_path
  FROM folder_path
  WHERE parent_folder_id IS NULL;
  
  RETURN v_path;
END;
$$;
ALTER FUNCTION "public"."get_folder_path"("p_folder_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_investor_capital_summary"("p_investor_ids" "uuid"[]) RETURNS TABLE("investor_id" "uuid", "total_commitment" numeric, "total_contributed" numeric, "total_distributed" numeric, "unfunded_commitment" numeric, "current_nav" numeric, "vehicle_count" integer, "position_count" integer, "last_capital_call_date" "date", "last_distribution_date" "date")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    inv.id as investor_id,
    COALESCE(SUM(DISTINCT s.commitment), 0)::numeric as total_commitment,
    COALESCE(SUM(CASE WHEN cf.type = 'call' THEN cf.amount ELSE 0 END), 0)::numeric as total_contributed,
    COALESCE(SUM(CASE WHEN cf.type = 'distribution' THEN cf.amount ELSE 0 END), 0)::numeric as total_distributed,
    COALESCE(SUM(DISTINCT s.commitment), 0)::numeric - COALESCE(SUM(CASE WHEN cf.type = 'call' THEN cf.amount ELSE 0 END), 0)::numeric as unfunded_commitment,
    COALESCE(SUM(p.last_nav * p.units), 0)::numeric as current_nav,
    COUNT(DISTINCT s.vehicle_id)::int as vehicle_count,
    COUNT(DISTINCT p.id)::int as position_count,
    MAX(cc.due_date)::date as last_capital_call_date,
    MAX(d.date)::date as last_distribution_date
  FROM unnest(p_investor_ids) inv(id)
  LEFT JOIN subscriptions s ON s.investor_id = inv.id
  LEFT JOIN cashflows cf ON cf.investor_id = inv.id
  LEFT JOIN positions p ON p.investor_id = inv.id
  LEFT JOIN capital_calls cc ON cc.vehicle_id = s.vehicle_id
  LEFT JOIN distributions d ON d.vehicle_id = s.vehicle_id
  GROUP BY inv.id;
END;
$$;
ALTER FUNCTION "public"."get_investor_capital_summary"("p_investor_ids" "uuid"[]) OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_investor_capital_summary"("p_investor_ids" "uuid"[]) IS 'Calculate capital metrics for investors including commitments, contributions, distributions, NAV, and vehicle counts. Used by investor management page.';
CREATE OR REPLACE FUNCTION "public"."get_investor_kpi_details"("investor_ids" "uuid"[], "kpi_type" "text", "as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("id" "uuid", "name" "text", "type" "text", "value" numeric, "percentage" numeric, "metadata" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF kpi_type = 'nav_breakdown' THEN
        RETURN QUERY
        SELECT 
            pos.vehicle_id as id,
            v.name,
            v.type::text,
            CASE 
                WHEN pos.units > 0 AND val.nav_per_unit IS NOT NULL 
                THEN pos.units * val.nav_per_unit
                ELSE COALESCE(pos.cost_basis, 0)
            END as value,
            0.0 as percentage, -- Will calculate after getting total
            jsonb_build_object(
                'units', pos.units,
                'nav_per_unit', val.nav_per_unit,
                'cost_basis', pos.cost_basis,
                'last_valuation_date', val.as_of_date,
                'commitment', sub.commitment,
                'currency', sub.currency
            ) as metadata
        FROM positions pos
        JOIN vehicles v ON pos.vehicle_id = v.id
        JOIN subscriptions sub ON pos.investor_id = sub.investor_id AND pos.vehicle_id = sub.vehicle_id
        LEFT JOIN LATERAL (
            SELECT nav_per_unit, as_of_date
            FROM valuations val 
            WHERE val.vehicle_id = pos.vehicle_id 
              AND val.as_of_date <= as_of_date
            ORDER BY val.as_of_date DESC 
            LIMIT 1
        ) val ON true
        WHERE pos.investor_id = ANY(investor_ids)
        ORDER BY value DESC;

    ELSIF kpi_type = 'contributions_breakdown' THEN
        RETURN QUERY
        SELECT 
            pos.vehicle_id as id,
            v.name,
            v.type::text,
            COALESCE(cf.total_contributions, 0) as value,
            0.0 as percentage,
            jsonb_build_object(
                'commitment', sub.commitment,
                'contribution_count', cf.contribution_count,
                'last_contribution_date', cf.last_contribution_date,
                'currency', sub.currency
            ) as metadata
        FROM positions pos
        JOIN vehicles v ON pos.vehicle_id = v.id
        JOIN subscriptions sub ON pos.investor_id = sub.investor_id AND pos.vehicle_id = sub.vehicle_id
        LEFT JOIN LATERAL (
            SELECT 
                SUM(amount) as total_contributions,
                COUNT(*) as contribution_count,
                MAX(date) as last_contribution_date
            FROM cashflows cf
            WHERE cf.investor_id = pos.investor_id 
              AND cf.vehicle_id = pos.vehicle_id 
              AND cf.type = 'call'
              AND cf.date <= as_of_date
        ) cf ON true
        WHERE pos.investor_id = ANY(investor_ids)
          AND COALESCE(cf.total_contributions, 0) > 0
        ORDER BY value DESC;

    ELSIF kpi_type = 'distributions_breakdown' THEN
        RETURN QUERY
        SELECT 
            pos.vehicle_id as id,
            v.name,
            v.type::text,
            COALESCE(cf.total_distributions, 0) as value,
            0.0 as percentage,
            jsonb_build_object(
                'distribution_count', cf.distribution_count,
                'last_distribution_date', cf.last_distribution_date,
                'currency', sub.currency
            ) as metadata
        FROM positions pos
        JOIN vehicles v ON pos.vehicle_id = v.id
        JOIN subscriptions sub ON pos.investor_id = sub.investor_id AND pos.vehicle_id = sub.vehicle_id
        LEFT JOIN LATERAL (
            SELECT 
                SUM(amount) as total_distributions,
                COUNT(*) as distribution_count,
                MAX(date) as last_distribution_date
            FROM cashflows cf
            WHERE cf.investor_id = pos.investor_id 
              AND cf.vehicle_id = pos.vehicle_id 
              AND cf.type = 'distribution'
              AND cf.date <= as_of_date
        ) cf ON true
        WHERE pos.investor_id = ANY(investor_ids)
          AND COALESCE(cf.total_distributions, 0) > 0
        ORDER BY value DESC;

    ELSIF kpi_type = 'deal_breakdown' THEN
        RETURN QUERY
        SELECT 
            alloc.deal_id as id,
            deals.name,
            deals.deal_type::text as type,
            alloc.units * alloc.unit_price as value,
            0.0 as percentage,
            jsonb_build_object(
                'units', alloc.units,
                'unit_price', alloc.unit_price,
                'status', alloc.status,
                'approved_at', alloc.approved_at,
                'company_name', deals.company_name,
                'sector', deals.sector,
                'currency', deals.currency
            ) as metadata
        FROM allocations alloc
        JOIN deals ON alloc.deal_id = deals.id
        WHERE alloc.investor_id = ANY(investor_ids)
          AND alloc.status IN ('approved', 'settled')
        ORDER BY value DESC;

    END IF;
END;
$$;
ALTER FUNCTION "public"."get_investor_kpi_details"("investor_ids" "uuid"[], "kpi_type" "text", "as_of_date" "date") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_investor_vehicle_breakdown"("investor_ids" "uuid"[]) RETURNS TABLE("vehicle_id" "uuid", "vehicle_name" "text", "vehicle_type" "text", "current_value" numeric, "cost_basis" numeric, "units" numeric, "unrealized_gain" numeric, "unrealized_gain_pct" numeric, "commitment" numeric, "contributed" numeric, "distributed" numeric, "nav_per_unit" numeric, "last_valuation_date" "date")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.name,
        v.type::text,
        CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END::numeric(18,2) as current_value,
        COALESCE(p.cost_basis, 0),
        COALESCE(p.units, 0),
        (CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END - COALESCE(p.cost_basis, 0))::numeric(18,2) as unrealized_gain,
        CASE
            WHEN p.cost_basis > 0 THEN
                ((CASE
                    WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
                    WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
                    ELSE 0
                END - p.cost_basis) / p.cost_basis * 100)::numeric(5,2)
            ELSE 0
        END as unrealized_gain_pct,
        COALESCE(s.commitment, 0),
        COALESCE(contrib.total, 0) as contributed,
        COALESCE(distrib.total, 0) as distributed,
        COALESCE(lv.nav_per_unit, p.last_nav),
        lv.as_of_date
    FROM vehicles v
    LEFT JOIN positions p ON v.id = p.vehicle_id AND p.investor_id = ANY(investor_ids)
    LEFT JOIN subscriptions s ON v.id = s.vehicle_id AND s.investor_id = ANY(investor_ids)
    LEFT JOIN get_latest_valuations() lv ON v.id = lv.vehicle_id
    LEFT JOIN (
        SELECT vehicle_id, SUM(amount) as total
        FROM cashflows
        WHERE investor_id = ANY(investor_ids) AND type = 'call'
        GROUP BY vehicle_id
    ) contrib ON v.id = contrib.vehicle_id
    LEFT JOIN (
        SELECT vehicle_id, SUM(amount) as total
        FROM cashflows
        WHERE investor_id = ANY(investor_ids) AND type = 'distribution'
        GROUP BY vehicle_id
    ) distrib ON v.id = distrib.vehicle_id
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0
    ORDER BY current_value DESC;
END;
$$;
ALTER FUNCTION "public"."get_investor_vehicle_breakdown"("investor_ids" "uuid"[]) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_latest_valuations"() RETURNS TABLE("vehicle_id" "uuid", "nav_per_unit" numeric, "as_of_date" "date")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (v.vehicle_id)
        v.vehicle_id,
        v.nav_per_unit,
        v.as_of_date
    FROM valuations v
    WHERE v.nav_per_unit IS NOT NULL
    ORDER BY v.vehicle_id, v.as_of_date DESC;
END;
$$;
ALTER FUNCTION "public"."get_latest_valuations"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_my_investor_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select investor_id from investor_users where user_id = auth.uid();
$$;
ALTER FUNCTION "public"."get_my_investor_ids"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer DEFAULT 30) RETURNS TABLE("nav_change" numeric, "nav_change_pct" numeric, "performance_change" numeric, "period_days" integer)
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    current_kpis record;
    previous_kpis record;
    calc_nav_change numeric(18,2) := 0;
    calc_nav_change_pct numeric(5,2) := 0;
    calc_performance_change numeric(5,2) := 0;
BEGIN
    -- Get current KPIs
    SELECT * INTO current_kpis
    FROM calculate_investor_kpis(investor_ids, CURRENT_DATE);

    -- Get KPIs from days_back ago (simplified - uses current positions with older valuations)
    SELECT * INTO previous_kpis
    FROM calculate_investor_kpis(investor_ids, CURRENT_DATE - days_back);

    -- Calculate changes
    calc_nav_change := current_kpis.current_nav - previous_kpis.current_nav;

    IF previous_kpis.current_nav > 0 THEN
        calc_nav_change_pct := (calc_nav_change / previous_kpis.current_nav) * 100;
    END IF;

    calc_performance_change := current_kpis.unrealized_gain_pct - previous_kpis.unrealized_gain_pct;

    RETURN QUERY SELECT
        calc_nav_change,
        calc_nav_change_pct,
        calc_performance_change,
        days_back;
END;
$$;
ALTER FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_reconciliation_summary"() RETURNS TABLE("total_transactions" bigint, "matched_transactions" bigint, "unmatched_transactions" bigint, "match_rate" numeric, "reconciled_amount" numeric, "pending_amount" numeric)
    LANGUAGE "sql"
    AS $$
  WITH tx AS (
    SELECT
      count(*) AS total_transactions,
      count(*) FILTER (WHERE status = 'matched') AS matched_transactions,
      count(*) FILTER (WHERE status <> 'matched') AS unmatched_transactions,
      coalesce(sum(amount) FILTER (WHERE status = 'matched'), 0) AS reconciled_amount,
      coalesce(sum(amount) FILTER (WHERE status <> 'matched'), 0) AS pending_amount
    FROM public.bank_transactions
  )
  SELECT
    tx.total_transactions,
    tx.matched_transactions,
    tx.unmatched_transactions,
    CASE WHEN tx.total_transactions = 0 THEN 0 ELSE round(tx.matched_transactions::numeric / tx.total_transactions * 100, 1) END AS match_rate,
    tx.reconciled_amount,
    tx.pending_amount
  FROM tx;
$$;
ALTER FUNCTION "public"."get_reconciliation_summary"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_task_progress_by_category"("p_user_id" "uuid", "p_investor_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("category" "text", "total_tasks" bigint, "completed_tasks" bigint, "percentage" numeric)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    t.category,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE t.status IN ('completed', 'waived')) as completed_tasks,
    ROUND((COUNT(*) FILTER (WHERE t.status IN ('completed', 'waived'))::numeric / COUNT(*)::numeric) * 100, 0) as percentage
  FROM tasks t
  WHERE t.owner_user_id = p_user_id
    AND (p_investor_id IS NULL OR t.owner_investor_id = p_investor_id)
    AND t.category IS NOT NULL
  GROUP BY t.category;
$$;
ALTER FUNCTION "public"."get_task_progress_by_category"("p_user_id" "uuid", "p_investor_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_unread_message_count"("p_user_id" "uuid") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  unread_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages m
  JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
  WHERE cp.user_id = p_user_id
    AND m.created_at > cp.last_read_at
    AND m.sender_id != p_user_id
    AND m.deleted_at IS NULL;

  RETURN unread_count;
END;
$$;
ALTER FUNCTION "public"."get_unread_message_count"("p_user_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_role text;
  user_display_name text;
BEGIN
  -- Extract role from metadata, default to 'investor'
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'investor');
  
  -- Extract display name from metadata
  user_display_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  -- Insert profile with type cast
  INSERT INTO public.profiles (id, email, role, display_name, created_at)
  VALUES (
    new.id,
    new.email,
    user_role::user_role,
    user_display_name,
    NOW()
  );
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.email, SQLERRM;
    RETURN new;
END;
$$;
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."has_document_access"("p_document_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_doc documents%ROWTYPE;
BEGIN
  SELECT * INTO v_doc FROM documents WHERE id = p_document_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Staff always have access
  IF is_staff_user() THEN
    RETURN true;
  END IF;
  
  -- Document must be published for investors
  IF NOT v_doc.is_published THEN
    RETURN false;
  END IF;
  
  -- Check vehicle access
  IF v_doc.vehicle_id IS NOT NULL THEN
    RETURN has_vehicle_access(v_doc.vehicle_id);
  END IF;
  
  -- Check investor ownership
  IF v_doc.owner_investor_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM investor_users 
      WHERE investor_id = v_doc.owner_investor_id 
      AND user_id = auth.uid()
    );
  END IF;
  
  -- Check user ownership
  IF v_doc.owner_user_id IS NOT NULL THEN
    RETURN v_doc.owner_user_id = auth.uid();
  END IF;
  
  -- Check deal membership
  IF v_doc.deal_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM deal_memberships 
      WHERE deal_id = v_doc.deal_id 
      AND user_id = auth.uid()
    );
  END IF;
  
  RETURN false;
END;
$$;
ALTER FUNCTION "public"."has_document_access"("p_document_id" "uuid") OWNER TO "postgres";
COMMENT ON FUNCTION "public"."has_document_access"("p_document_id" "uuid") IS 'Check if current user has access to document';
CREATE OR REPLACE FUNCTION "public"."has_vehicle_access"("p_vehicle_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Staff always have access
  IF is_staff_user() THEN
    RETURN true;
  END IF;
  
  -- Check investor access
  RETURN EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = p_vehicle_id 
    AND iu.user_id = auth.uid()
  );
END;
$$;
ALTER FUNCTION "public"."has_vehicle_access"("p_vehicle_id" "uuid") OWNER TO "postgres";
COMMENT ON FUNCTION "public"."has_vehicle_access"("p_vehicle_id" "uuid") IS 'Check if current user has access to vehicle';
CREATE OR REPLACE FUNCTION "public"."is_staff_user"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role::text LIKE 'staff_%'
  );
END;
$$;
ALTER FUNCTION "public"."is_staff_user"() OWNER TO "postgres";
COMMENT ON FUNCTION "public"."is_staff_user"() IS 'Check if current user is staff member';
CREATE OR REPLACE FUNCTION "public"."log_approval_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_action text;
  v_actor_id uuid;
BEGIN
  -- Determine action type and actor
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_actor_id := NEW.requested_by;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := CASE NEW.status
        WHEN 'approved' THEN 'approved'
        WHEN 'rejected' THEN 'rejected'
        WHEN 'escalated' THEN 'escalated'
        WHEN 'awaiting_info' THEN 'info_requested'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'updated'
      END;
      v_actor_id := NEW.approved_by;

      -- Calculate processing time when resolved
      IF NEW.status IN ('approved', 'rejected') THEN
        NEW.resolved_at := now();

        -- Calculate actual time excluding paused periods
        IF NEW.sla_paused_at IS NOT NULL AND NEW.sla_resumed_at IS NOT NULL THEN
          -- Subtract paused duration
          NEW.actual_processing_time_hours :=
            EXTRACT(EPOCH FROM (
              (now() - NEW.created_at) -
              (NEW.sla_resumed_at - NEW.sla_paused_at)
            )) / 3600;
        ELSE
          NEW.actual_processing_time_hours :=
            EXTRACT(EPOCH FROM (now() - NEW.created_at)) / 3600;
        END IF;
      END IF;

    -- Assignment changes
    ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      v_action := 'reassigned';
      v_actor_id := NEW.assigned_to;

    -- Secondary approval
    ELSIF OLD.secondary_approved_at IS NULL AND NEW.secondary_approved_at IS NOT NULL THEN
      v_action := 'secondary_approved';
      v_actor_id := NEW.secondary_approved_by;
    ELSE
      -- Skip logging for minor updates
      RETURN NEW;
    END IF;

    -- Update the updated_at timestamp
    NEW.updated_at := now();
  END IF;

  -- Insert history record
  INSERT INTO approval_history (
    approval_id,
    action,
    actor_id,
    notes,
    metadata
  ) VALUES (
    NEW.id,
    v_action,
    COALESCE(v_actor_id, NEW.approved_by, NEW.assigned_to),
    NEW.notes,
    jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'old_assigned_to', OLD.assigned_to,
      'new_assigned_to', NEW.assigned_to
    )
  );

  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."log_approval_change"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."log_audit_event"("p_event_type" "text", "p_action" "text", "p_actor_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_name" "text", "p_action_details" "jsonb", "p_before" "jsonb", "p_after" "jsonb", "p_risk_level" "text", "p_compliance_flag" boolean, "p_retention_category" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_actor record;
  v_new_id uuid;
BEGIN
  IF p_actor_id IS NOT NULL THEN
    SELECT id, email, display_name, role
    INTO v_actor
    FROM public.profiles
    WHERE id = p_actor_id;
  END IF;

  INSERT INTO public.audit_logs (
    event_type,
    action,
    actor_id,
    actor_email,
    actor_name,
    actor_role,
    entity_type,
    entity_id,
    entity_name,
    action_details,
    before_value,
    after_value,
    risk_level,
    compliance_flag,
    retention_category,
    retention_expiry
  )
  VALUES (
    p_event_type,
    p_action,
    p_actor_id,
    v_actor.email,
    v_actor.display_name,
    v_actor.role,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_action_details,
    p_before,
    p_after,
    coalesce(p_risk_level, 'low'),
    coalesce(p_compliance_flag, false),
    coalesce(p_retention_category, 'operational'),
    CASE
      WHEN p_retention_category = 'operational' THEN current_date + interval '1 year'
      WHEN p_retention_category = 'financial' THEN current_date + interval '7 years'
      WHEN p_retention_category = 'legal_hold' THEN NULL
      ELSE current_date + interval '1 year'
    END
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;
ALTER FUNCTION "public"."log_audit_event"("p_event_type" "text", "p_action" "text", "p_actor_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_name" "text", "p_action_details" "jsonb", "p_before" "jsonb", "p_after" "jsonb", "p_risk_level" "text", "p_compliance_flag" boolean, "p_retention_category" "text") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."mark_compliance_review"("p_audit_log_id" "uuid", "p_reviewer_id" "uuid", "p_status" "text", "p_notes" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.audit_logs
  SET compliance_review_status = p_status,
      compliance_reviewer_id = p_reviewer_id,
      compliance_reviewed_at = now(),
      compliance_notes = p_notes
  WHERE id = p_audit_log_id;
END;
$$;
ALTER FUNCTION "public"."mark_compliance_review"("p_audit_log_id" "uuid", "p_reviewer_id" "uuid", "p_status" "text", "p_notes" "text") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."mark_conversation_read"("p_conversation_id" "uuid", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = greatest(coalesce(last_read_at, '-infinity'::timestamptz), now())
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$;
ALTER FUNCTION "public"."mark_conversation_read"("p_conversation_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."mark_overdue_tasks"() RETURNS TABLE("updated_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_count bigint;
BEGIN
  WITH updated AS (
    UPDATE tasks
    SET status = 'overdue'
    WHERE status IN ('pending', 'in_progress')
      AND due_at IS NOT NULL
      AND due_at < now()
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM updated;
  RETURN QUERY SELECT v_count;
END;
$$;
ALTER FUNCTION "public"."mark_overdue_tasks"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."prevent_audit_log_modification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$;
ALTER FUNCTION "public"."prevent_audit_log_modification"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."publish_scheduled_documents"() RETURNS TABLE("document_id" "uuid", "published_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update documents that should be published
  WITH to_publish AS (
    SELECT dps.document_id
    FROM document_publishing_schedule dps
    WHERE dps.publish_at <= now()
      AND NOT dps.published
  )
  UPDATE documents d
  SET 
    is_published = true,
    published_at = now(),
    status = 'published'
  FROM to_publish tp
  WHERE d.id = tp.document_id;
  
  -- Mark schedule entries as published
  UPDATE document_publishing_schedule
  SET published = true
  WHERE publish_at <= now()
    AND NOT published;
  
  -- Return results
  RETURN QUERY
  SELECT d.id, 1::int
  FROM documents d
  WHERE d.published_at >= now() - interval '1 minute';
END;
$$;
ALTER FUNCTION "public"."publish_scheduled_documents"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."run_auto_match"() RETURNS TABLE("transaction_id" "uuid", "invoice_id" "uuid", "confidence" integer, "reason" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_transaction record;
  v_invoice record;
  v_confidence int;
  v_reason text;
  v_amount_diff numeric;
BEGIN
  FOR v_transaction IN
    SELECT * FROM public.bank_transactions
    WHERE status = 'unmatched'
  LOOP
    FOR v_invoice IN
      SELECT i.id,
             i.total AS total_amount,
             i.balance_due,
             inv.legal_name,
             similarity(coalesce(v_transaction.counterparty,''), coalesce(inv.legal_name,'')) AS name_similarity
      FROM public.invoices i
      JOIN public.investors inv ON inv.id = i.investor_id
      WHERE i.status IN ('sent','partially_paid','overdue')
        AND i.currency = v_transaction.currency
        AND i.balance_due > 0
      ORDER BY ABS(i.balance_due - v_transaction.amount) ASC,
               name_similarity DESC
      LIMIT 1
    LOOP
      v_confidence := 0;
      v_reason := '';
      v_amount_diff := v_transaction.amount - v_invoice.balance_due;

      IF abs(v_amount_diff) <= 1 THEN
        v_confidence := v_confidence + 50;
        v_reason := 'Exact amount match';
      ELSIF abs(v_amount_diff) / NULLIF(v_invoice.balance_due,0) < 0.05 THEN
        v_confidence := v_confidence + 40;
        v_reason := 'Amount match within 5%';
      ELSIF abs(v_amount_diff) / NULLIF(v_invoice.balance_due,0) < 0.10 THEN
        v_confidence := v_confidence + 20;
        v_reason := 'Amount match within 10%';
      END IF;

      IF v_invoice.name_similarity > 0.8 THEN
        v_confidence := v_confidence + 40;
        v_reason := v_reason || ', strong counterparty match';
      ELSIF v_invoice.name_similarity > 0.6 THEN
        v_confidence := v_confidence + 25;
        v_reason := v_reason || ', good counterparty match';
      ELSIF v_invoice.name_similarity > 0.4 THEN
        v_confidence := v_confidence + 10;
        v_reason := v_reason || ', possible counterparty match';
      END IF;

      IF v_transaction.value_date BETWEEN current_date - interval '30 days' AND current_date + interval '1 day' THEN
        v_confidence := v_confidence + 10;
      END IF;

      IF v_confidence >= 50 THEN
        INSERT INTO public.suggested_matches (bank_transaction_id, invoice_id, confidence, match_reason, amount_difference)
        VALUES (v_transaction.id, v_invoice.id, v_confidence, v_reason, v_amount_diff)
        ON CONFLICT DO NOTHING;

        RETURN QUERY SELECT v_transaction.id, v_invoice.id, v_confidence, v_reason;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
ALTER FUNCTION "public"."run_auto_match"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."set_approval_sla_deadline"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_sla_hours int;
BEGIN
  -- Only set SLA on insert if not already set
  IF TG_OP = 'INSERT' AND NEW.sla_breach_at IS NULL THEN
    -- Calculate SLA hours based on priority
    v_sla_hours := CASE NEW.priority
      WHEN 'critical' THEN 2
      WHEN 'high' THEN 4
      WHEN 'medium' THEN 24
      WHEN 'low' THEN 72
      ELSE 24
    END;

    NEW.sla_breach_at := now() + (v_sla_hours || ' hours')::interval;
  END IF;

  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."set_approval_sla_deadline"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."set_workflows_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."set_workflows_updated_at"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."trg_conversation_set_owner"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  owner_exists boolean;
BEGIN
  IF NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT TRUE INTO owner_exists
  FROM conversation_participants
  WHERE conversation_id = NEW.id AND participant_role = 'owner'
  LIMIT 1;

  IF NOT owner_exists THEN
    INSERT INTO conversation_participants (conversation_id, user_id, participant_role, joined_at)
    VALUES (NEW.id, NEW.created_by, 'owner', COALESCE(NEW.created_at, now()))
    ON CONFLICT (conversation_id, user_id) DO UPDATE
      SET participant_role = EXCLUDED.participant_role;
  END IF;

  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."trg_conversation_set_owner"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."trg_refresh_conversation_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      last_message_id = NEW.id,
      preview = COALESCE(NULLIF(left(NEW.body, 320), ''), preview),
      updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."trg_refresh_conversation_metadata"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."trg_touch_conversation_participant"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."trg_touch_conversation_participant"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."unlock_dependent_tasks"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.status IN ('completed', 'waived') AND OLD.status NOT IN ('completed', 'waived') THEN
    UPDATE tasks t
    SET status = 'pending'
    WHERE t.id IN (
      SELECT td.task_id
      FROM task_dependencies td
      WHERE td.depends_on_task_id = NEW.id
        AND NOT EXISTS (
          SELECT 1 FROM task_dependencies td2
          JOIN tasks t2 ON t2.id = td2.depends_on_task_id
          WHERE td2.task_id = td.task_id
            AND td2.depends_on_task_id != NEW.id
            AND t2.status NOT IN ('completed', 'waived')
        )
    )
    AND t.status = 'blocked';
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."unlock_dependent_tasks"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."unpublish_expired_documents"() RETURNS TABLE("document_id" "uuid", "unpublished_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update documents that should be unpublished
  WITH to_unpublish AS (
    SELECT dps.document_id
    FROM document_publishing_schedule dps
    WHERE dps.unpublish_at IS NOT NULL
      AND dps.unpublish_at <= now()
      AND dps.published
  )
  UPDATE documents d
  SET 
    is_published = false,
    status = 'archived'
  FROM to_unpublish tu
  WHERE d.id = tu.document_id;
  
  -- Return results
  RETURN QUERY
  SELECT d.id, 1::int
  FROM documents d
  WHERE d.status = 'archived'
    AND d.updated_at >= now() - interval '1 minute';
END;
$$;
ALTER FUNCTION "public"."unpublish_expired_documents"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_conversation_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_conversation_last_message"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."user_has_deal_access"("target_deal_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- Check if user has direct access to the deal
  if exists (
    select 1 from deal_memberships dm
    where dm.deal_id = target_deal_id
      and dm.user_id = auth.uid()
  ) then
    return true;
  end if;

  -- Check if user's investor has access to the deal
  if exists (
    select 1 from deal_memberships dm
    join investor_users iu on iu.investor_id = dm.investor_id
    where dm.deal_id = target_deal_id
      and iu.user_id = auth.uid()
  ) then
    return true;
  end if;

  -- Check if user is staff
  if exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.role)::text like 'staff_%'
  ) then
    return true;
  end if;

  return false;
end;
$$;
ALTER FUNCTION "public"."user_has_deal_access"("target_deal_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."user_is_staff"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and (p.role)::text like 'staff_%'
  );
end;
$$;
ALTER FUNCTION "public"."user_is_staff"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."user_linked_to_investor"("target_investor_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return exists (
    select 1
    from investor_users iu
    where iu.investor_id = target_investor_id
      and iu.user_id = auth.uid()
  );
end;
$$;
ALTER FUNCTION "public"."user_linked_to_investor"("target_investor_id" "uuid") OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."activity_feed" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "activity_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "entity_id" "uuid",
    "entity_type" "text",
    "importance" "text" DEFAULT 'normal'::"text",
    "read_status" boolean DEFAULT false,
    "deal_id" "uuid",
    "vehicle_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "activity_feed_activity_type_check" CHECK (("activity_type" = ANY (ARRAY['document'::"text", 'task'::"text", 'message'::"text", 'valuation'::"text", 'distribution'::"text", 'capital_call'::"text", 'deal'::"text", 'allocation'::"text"]))),
    CONSTRAINT "activity_feed_importance_check" CHECK (("importance" = ANY (ARRAY['high'::"text", 'normal'::"text", 'low'::"text"])))
);
ALTER TABLE "public"."activity_feed" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."allocation_lot_items" (
    "allocation_id" "uuid" NOT NULL,
    "lot_id" "uuid" NOT NULL,
    "units" numeric(28,8) NOT NULL,
    CONSTRAINT "allocation_lot_items_units_check" CHECK (("units" > (0)::numeric))
);
ALTER TABLE "public"."allocation_lot_items" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."allocations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "investor_id" "uuid",
    "unit_price" numeric(18,6) NOT NULL,
    "units" numeric(28,8) NOT NULL,
    "status" "public"."allocation_status_enum" DEFAULT 'pending_review'::"public"."allocation_status_enum",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "allocations_units_check" CHECK (("units" > (0)::numeric))
);
ALTER TABLE "public"."allocations" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."approval_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "actor_id" "uuid" NOT NULL,
    "notes" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "approval_history_action_check" CHECK (("action" = ANY (ARRAY['created'::"text", 'assigned'::"text", 'reassigned'::"text", 'approved'::"text", 'rejected'::"text", 'escalated'::"text", 'info_requested'::"text", 'cancelled'::"text", 'secondary_approved'::"text"])))
);
ALTER TABLE "public"."approval_history" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "action" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "requested_by" "uuid",
    "assigned_to" "uuid",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "notes" "text",
    "priority" "text" DEFAULT 'medium'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "entity_metadata" "jsonb",
    "request_reason" "text",
    "rejection_reason" "text",
    "sla_breach_at" timestamp with time zone,
    "sla_paused_at" timestamp with time zone,
    "sla_resumed_at" timestamp with time zone,
    "actual_processing_time_hours" numeric(10,2),
    "requires_secondary_approval" boolean DEFAULT false,
    "secondary_approver_role" "text",
    "secondary_approved_by" "uuid",
    "secondary_approved_at" timestamp with time zone,
    "related_deal_id" "uuid",
    "related_investor_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone,
    CONSTRAINT "approvals_action_check" CHECK (("action" = ANY (ARRAY['approve'::"text", 'reject'::"text", 'revise'::"text"]))),
    CONSTRAINT "approvals_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "approvals_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'awaiting_info'::"text", 'escalated'::"text", 'cancelled'::"text"])))
);
ALTER TABLE "public"."approvals" OWNER TO "postgres";
COMMENT ON CONSTRAINT "approvals_priority_check" ON "public"."approvals" IS 'Ensures priority values match TypeScript types and SLA calculation logic: low(72h), medium(24h), high(4h), critical(2h)';
CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" bigint NOT NULL,
    "actor_user_id" "uuid",
    "action" "text",
    "entity" "text",
    "entity_id" "uuid",
    "ts" timestamp with time zone DEFAULT "now"(),
    "hash" "text",
    "prev_hash" "text"
);
ALTER TABLE "public"."audit_log" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."audit_log_hash_chain" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "audit_log_id" "uuid",
    "hash" "bytea" NOT NULL,
    "prev_hash" "bytea",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."audit_log_hash_chain" OWNER TO "postgres";
CREATE SEQUENCE IF NOT EXISTS "public"."audit_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "public"."audit_log_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "public"."audit_log_id_seq" OWNED BY "public"."audit_log"."id";
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_type" "text" NOT NULL,
    "action" "text" NOT NULL,
    "actor_id" "uuid",
    "actor_email" "text",
    "actor_name" "text",
    "actor_role" "text",
    "entity_type" "text",
    "entity_id" "uuid",
    "entity_name" "text",
    "action_details" "jsonb",
    "before_value" "jsonb",
    "after_value" "jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "session_id" "uuid",
    "risk_level" "text" DEFAULT 'low'::"text",
    "compliance_flag" boolean DEFAULT false,
    "compliance_review_status" "text" DEFAULT 'pending'::"text",
    "compliance_reviewer_id" "uuid",
    "compliance_reviewed_at" timestamp with time zone,
    "compliance_notes" "text",
    "retention_category" "text" DEFAULT 'operational'::"text",
    "retention_expiry" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_logs_compliance_review_status_check" CHECK (("compliance_review_status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'escalated'::"text"]))),
    CONSTRAINT "audit_logs_retention_category_check" CHECK (("retention_category" = ANY (ARRAY['operational'::"text", 'financial'::"text", 'legal_hold'::"text"]))),
    CONSTRAINT "audit_logs_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);
ALTER TABLE "public"."audit_logs" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."audit_report_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "report_type" "text" NOT NULL,
    "config" "jsonb" NOT NULL,
    "output_format" "text"[] DEFAULT ARRAY['pdf'::"text", 'csv'::"text"],
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_report_templates_report_type_check" CHECK (("report_type" = ANY (ARRAY['soc2'::"text", 'gdpr'::"text", 'sec'::"text", 'internal'::"text", 'custom'::"text"])))
);
ALTER TABLE "public"."audit_report_templates" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."bank_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_ref" "text",
    "amount" numeric(18,2),
    "currency" "text" DEFAULT 'USD'::"text",
    "value_date" "date",
    "memo" "text",
    "counterparty" "text",
    "import_batch_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "counterparty_account" "text",
    "bank_reference" "text",
    "status" "text" DEFAULT 'unmatched'::"text",
    "matched_invoice_ids" "uuid"[],
    "match_confidence" integer,
    "match_notes" "text",
    "match_group_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bank_transactions_status_check" CHECK (("status" = ANY (ARRAY['unmatched'::"text", 'partially_matched'::"text", 'matched'::"text"])))
);
ALTER TABLE "public"."bank_transactions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."capital_calls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "name" "text",
    "call_pct" numeric(7,4),
    "due_date" "date",
    "status" "text" DEFAULT 'draft'::"text"
);
ALTER TABLE "public"."capital_calls" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."cashflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "vehicle_id" "uuid",
    "type" "text",
    "amount" numeric(18,2),
    "date" "date",
    "ref_id" "uuid",
    CONSTRAINT "cashflows_type_check" CHECK (("type" = ANY (ARRAY['call'::"text", 'distribution'::"text"])))
);
ALTER TABLE "public"."cashflows" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."compliance_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "audit_log_id" "uuid",
    "alert_type" "text" NOT NULL,
    "severity" "text" DEFAULT 'medium'::"text",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'open'::"text",
    "assigned_to" "uuid",
    "resolution_notes" "text",
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "compliance_alerts_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "compliance_alerts_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'investigating'::"text", 'resolved'::"text", 'false_positive'::"text"])))
);
ALTER TABLE "public"."compliance_alerts" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "participant_role" "public"."participant_role_enum" DEFAULT 'member'::"public"."participant_role_enum" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_read_at" timestamp with time zone,
    "last_notified_at" timestamp with time zone,
    "is_muted" boolean DEFAULT false NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "conversation_participants_role_owner" CHECK (((("participant_role" = 'owner'::"public"."participant_role_enum") AND ("is_muted" = false)) OR ("participant_role" = ANY (ARRAY['member'::"public"."participant_role_enum", 'viewer'::"public"."participant_role_enum"]))))
);
ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";
COMMENT ON TABLE "public"."conversation_participants" IS 'Participants in a conversation with read state and preferences.';
COMMENT ON COLUMN "public"."conversation_participants"."participant_role" IS 'Role within the conversation (owner/member/viewer).';
COMMENT ON COLUMN "public"."conversation_participants"."last_read_at" IS 'Last time participant read the conversation.';
CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject" "text",
    "preview" "text",
    "type" "public"."conversation_type_enum" DEFAULT 'dm'::"public"."conversation_type_enum" NOT NULL,
    "visibility" "public"."conversation_visibility_enum" DEFAULT 'internal'::"public"."conversation_visibility_enum" NOT NULL,
    "owner_team" "text",
    "deal_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_message_at" timestamp with time zone,
    "last_message_id" "uuid",
    "archived_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);
ALTER TABLE "public"."conversations" OWNER TO "postgres";
COMMENT ON TABLE "public"."conversations" IS 'Conversation metadata for investor/staff messages and deal rooms.';
COMMENT ON COLUMN "public"."conversations"."preview" IS 'Latest text preview used for inbox listing.';
COMMENT ON COLUMN "public"."conversations"."visibility" IS 'Visibility scope used by staff filters (investor/internal/deal).';
COMMENT ON COLUMN "public"."conversations"."owner_team" IS 'Optional staff team identifier owning the conversation.';
COMMENT ON COLUMN "public"."conversations"."metadata" IS 'JSON metadata such as pinned flags, workflow bindings, or escalation status.';
CREATE TABLE IF NOT EXISTS "public"."counterparty_aliases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "alias_name" "text" NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."counterparty_aliases" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."dashboard_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "layout_config" "jsonb",
    "widget_order" "text"[],
    "custom_metrics" "jsonb",
    "notification_settings" "jsonb",
    "theme_settings" "jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."dashboard_preferences" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."deal_commitments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "investor_id" "uuid",
    "requested_units" numeric(28,8),
    "requested_amount" numeric(18,2),
    "selected_fee_plan_id" "uuid",
    "term_sheet_id" "uuid",
    "status" "text" DEFAULT 'submitted'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "deal_commitments_status_check" CHECK (("status" = ANY (ARRAY['submitted'::"text", 'under_review'::"text", 'approved'::"text", 'rejected'::"text", 'cancelled'::"text"])))
);
ALTER TABLE "public"."deal_commitments" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."deal_memberships" (
    "deal_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "investor_id" "uuid",
    "role" "public"."deal_member_role" NOT NULL,
    "invited_by" "uuid",
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "accepted_at" timestamp with time zone
);
ALTER TABLE "public"."deal_memberships" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."deals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "name" "text" NOT NULL,
    "deal_type" "public"."deal_type_enum" DEFAULT 'equity_secondary'::"public"."deal_type_enum",
    "status" "public"."deal_status_enum" DEFAULT 'open'::"public"."deal_status_enum",
    "currency" "text" DEFAULT 'USD'::"text",
    "open_at" timestamp with time zone,
    "close_at" timestamp with time zone,
    "terms_schema" "jsonb",
    "offer_unit_price" numeric(18,6),
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "investment_thesis" "text",
    "minimum_investment" numeric(18,2),
    "maximum_investment" numeric(18,2),
    "target_amount" numeric(18,2),
    "raised_amount" numeric(18,2) DEFAULT 0,
    "company_name" "text",
    "company_logo_url" "text",
    "sector" "text",
    "stage" "text",
    "location" "text"
);
ALTER TABLE "public"."deals" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."director_registry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "nationality" "text",
    "id_number" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_at" timestamp with time zone
);
ALTER TABLE "public"."director_registry" OWNER TO "postgres";
COMMENT ON TABLE "public"."director_registry" IS 'Master registry of all directors that can be assigned to entities';
COMMENT ON COLUMN "public"."director_registry"."id_number" IS 'Passport or National ID number';
CREATE TABLE IF NOT EXISTS "public"."distributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "name" "text",
    "amount" numeric(18,2),
    "date" "date",
    "classification" "text"
);
ALTER TABLE "public"."distributions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."doc_package_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "package_id" "uuid",
    "template_id" "uuid",
    "merge_data" "jsonb",
    "sort_order" integer
);
ALTER TABLE "public"."doc_package_items" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."doc_packages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "investor_id" "uuid",
    "kind" "public"."doc_package_kind_enum" NOT NULL,
    "status" "public"."doc_package_status_enum" DEFAULT 'draft'::"public"."doc_package_status_enum",
    "esign_envelope_id" "text",
    "final_doc_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."doc_packages" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."doc_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "provider" "public"."doc_provider_enum" NOT NULL,
    "file_key" "text",
    "schema" "jsonb"
);
ALTER TABLE "public"."doc_templates" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."document_approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "requested_by" "uuid",
    "reviewed_by" "uuid",
    "review_notes" "text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "document_approvals_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'changes_requested'::"text"])))
);
ALTER TABLE "public"."document_approvals" OWNER TO "postgres";
COMMENT ON TABLE "public"."document_approvals" IS 'Approval workflow for document publishing';
CREATE TABLE IF NOT EXISTS "public"."document_folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_folder_id" "uuid",
    "name" "text" NOT NULL,
    "path" "text" NOT NULL,
    "vehicle_id" "uuid",
    "folder_type" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "document_folders_folder_type_check" CHECK (("folder_type" = ANY (ARRAY['vehicle_root'::"text", 'category'::"text", 'custom'::"text"])))
);
ALTER TABLE "public"."document_folders" OWNER TO "postgres";
COMMENT ON TABLE "public"."document_folders" IS 'Hierarchical folder structure for organizing documents by vehicle and category';
COMMENT ON COLUMN "public"."document_folders"."path" IS 'Full path from root, e.g. /VERSO Fund I/Reports';
COMMENT ON COLUMN "public"."document_folders"."folder_type" IS 'Type: vehicle_root (top-level), category (Agreements/KYC/etc), custom (user-created)';
CREATE TABLE IF NOT EXISTS "public"."document_publishing_schedule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "publish_at" timestamp with time zone NOT NULL,
    "unpublish_at" timestamp with time zone,
    "published" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."document_publishing_schedule" OWNER TO "postgres";
COMMENT ON TABLE "public"."document_publishing_schedule" IS 'Scheduled publishing and unpublishing of documents';
CREATE TABLE IF NOT EXISTS "public"."document_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "version_number" integer NOT NULL,
    "file_key" "text" NOT NULL,
    "file_size_bytes" bigint,
    "mime_type" "text",
    "changes_description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."document_versions" OWNER TO "postgres";
COMMENT ON TABLE "public"."document_versions" IS 'Version history for documents with change tracking';
CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_investor_id" "uuid",
    "owner_user_id" "uuid",
    "vehicle_id" "uuid",
    "type" "text",
    "file_key" "text" NOT NULL,
    "watermark" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deal_id" "uuid",
    "entity_id" "uuid",
    "folder_id" "uuid",
    "name" "text",
    "description" "text",
    "tags" "text"[],
    "current_version" integer DEFAULT 1,
    "status" "text" DEFAULT 'draft'::"text",
    "file_size_bytes" bigint,
    "mime_type" "text",
    "is_published" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "documents_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending_approval'::"text", 'approved'::"text", 'published'::"text", 'archived'::"text"])))
);
ALTER TABLE "public"."documents" OWNER TO "postgres";
COMMENT ON COLUMN "public"."documents"."current_version" IS 'Current version number for display';
COMMENT ON COLUMN "public"."documents"."status" IS 'Workflow status: draft → pending_approval → approved → published → archived';
COMMENT ON COLUMN "public"."documents"."is_published" IS 'Whether document is visible to investors';
CREATE TABLE IF NOT EXISTS "public"."entity_directors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "full_name" "text" NOT NULL,
    "role" "text",
    "email" "text",
    "effective_from" "date" DEFAULT CURRENT_DATE,
    "effective_to" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."entity_directors" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."entity_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "event_type" "text" NOT NULL,
    "description" "text",
    "changed_by" "uuid",
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."entity_events" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."esign_envelopes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider" "public"."doc_provider_enum",
    "envelope_id" "text",
    "status" "text",
    "recipient_email" "public"."citext",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);
ALTER TABLE "public"."esign_envelopes" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."fee_components" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fee_plan_id" "uuid",
    "kind" "public"."fee_component_kind_enum" NOT NULL,
    "calc_method" "public"."fee_calc_method_enum",
    "rate_bps" integer,
    "flat_amount" numeric(18,2),
    "frequency" "public"."fee_frequency_enum" DEFAULT 'one_time'::"public"."fee_frequency_enum",
    "hurdle_rate_bps" integer,
    "notes" "text",
    "base_calculation" "text",
    "has_catchup" boolean DEFAULT false NOT NULL,
    "catchup_rate_bps" integer,
    "has_high_water_mark" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "fee_components_base_calculation_check" CHECK ((("base_calculation" IS NULL) OR ("base_calculation" = ANY (ARRAY['commitment'::"text", 'nav'::"text", 'profit'::"text", 'units'::"text", 'fixed'::"text"]))))
);
ALTER TABLE "public"."fee_components" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."fee_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "investor_id" "uuid",
    "fee_component_id" "uuid",
    "event_date" "date" NOT NULL,
    "base_amount" numeric(18,2),
    "computed_amount" numeric(18,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "source_ref" "text",
    "status" "public"."fee_event_status_enum" DEFAULT 'accrued'::"public"."fee_event_status_enum",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "fee_type" "public"."fee_component_kind_enum",
    "allocation_id" "uuid",
    "rate_bps" integer,
    "invoice_id" "uuid",
    "payment_id" "uuid",
    "processed_at" timestamp with time zone,
    "notes" "text",
    "period_start_date" "date",
    "period_end_date" "date"
);
ALTER TABLE "public"."fee_events" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."fee_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "vehicle_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "effective_from" "date" DEFAULT CURRENT_DATE NOT NULL,
    "effective_until" "date",
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."fee_plans" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."import_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bank_account_id" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "transaction_count" integer NOT NULL,
    "imported_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."import_batches" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."introducer_commissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "introducer_id" "uuid",
    "deal_id" "uuid",
    "investor_id" "uuid",
    "basis_type" "text",
    "rate_bps" integer NOT NULL,
    "accrual_amount" numeric(18,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "status" "text" DEFAULT 'accrued'::"text",
    "invoice_id" "uuid",
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "introduction_id" "uuid",
    "base_amount" numeric(18,2),
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "payment_due_date" "date",
    "payment_reference" "text",
    "notes" "text",
    CONSTRAINT "introducer_commissions_base_amount_check" CHECK ((("base_amount" IS NULL) OR ("base_amount" >= (0)::numeric))),
    CONSTRAINT "introducer_commissions_basis_type_check" CHECK (("basis_type" = ANY (ARRAY['invested_amount'::"text", 'spread'::"text", 'management_fee'::"text", 'performance_fee'::"text"]))),
    CONSTRAINT "introducer_commissions_status_check" CHECK (("status" = ANY (ARRAY['accrued'::"text", 'invoiced'::"text", 'paid'::"text", 'cancelled'::"text"])))
);
ALTER TABLE "public"."introducer_commissions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."introducers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "legal_name" "text",
    "agreement_doc_id" "uuid",
    "default_commission_bps" integer DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "contact_name" "text",
    "email" "text",
    "commission_cap_amount" numeric(18,2),
    "payment_terms" "text",
    "agreement_expiry_date" "date",
    "notes" "text",
    "created_by" "uuid",
    CONSTRAINT "introducers_default_commission_bps_check" CHECK ((("default_commission_bps" IS NULL) OR (("default_commission_bps" >= 0) AND ("default_commission_bps" <= 300)))),
    CONSTRAINT "introducers_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text"])))
);
ALTER TABLE "public"."introducers" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."introductions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "introducer_id" "uuid",
    "prospect_email" "public"."citext",
    "prospect_investor_id" "uuid",
    "deal_id" "uuid",
    "status" "text" DEFAULT 'invited'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "introduced_at" "date" DEFAULT CURRENT_DATE,
    "commission_rate_override_bps" integer,
    "notes" "text",
    "created_by" "uuid",
    CONSTRAINT "introductions_status_check" CHECK (("status" = ANY (ARRAY['invited'::"text", 'joined'::"text", 'allocated'::"text", 'lost'::"text", 'inactive'::"text"])))
);
ALTER TABLE "public"."introductions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."investor_terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "investor_id" "uuid",
    "selected_fee_plan_id" "uuid",
    "overrides" "jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "vehicle_id" "uuid",
    "base_fee_plan_id" "uuid",
    "justification" "text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "effective_from" "date" DEFAULT CURRENT_DATE NOT NULL,
    "effective_until" "date",
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "investor_terms_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'expired'::"text", 'superseded'::"text"])))
);
ALTER TABLE "public"."investor_terms" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."investor_users" (
    "investor_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);
ALTER TABLE "public"."investor_users" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."investors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "legal_name" "text" NOT NULL,
    "type" "text",
    "kyc_status" "text" DEFAULT 'pending'::"text",
    "country" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "display_name" "text",
    "email" "text",
    "phone" "text",
    "country_of_incorporation" "text",
    "tax_residency" "text",
    "entity_identifier" "text",
    "primary_rm" "uuid",
    "secondary_rm" "uuid",
    "status" "text" DEFAULT 'active'::"text",
    "onboarding_status" "text" DEFAULT 'pending'::"text",
    "kyc_completed_at" timestamp with time zone,
    "kyc_expiry_date" "date",
    "kyc_approved_by" "uuid",
    "aml_risk_rating" "text",
    "aml_last_reviewed_at" timestamp with time zone,
    "is_pep" boolean DEFAULT false,
    "is_sanctioned" boolean DEFAULT false,
    "is_professional_investor" boolean DEFAULT false,
    "is_qualified_purchaser" boolean DEFAULT false,
    "accreditation_expiry" "date",
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "archived_at" timestamp with time zone,
    CONSTRAINT "investors_aml_risk_rating_check" CHECK (("aml_risk_rating" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "investors_onboarding_status_check" CHECK (("onboarding_status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text"]))),
    CONSTRAINT "investors_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text", 'archived'::"text"])))
);
ALTER TABLE "public"."investors" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."invite_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "role" "public"."deal_member_role" NOT NULL,
    "token_hash" "text" NOT NULL,
    "expires_at" timestamp with time zone,
    "max_uses" integer DEFAULT 1,
    "used_count" integer DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."invite_links" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."invoice_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid",
    "kind" "text",
    "description" "text",
    "quantity" numeric(28,8),
    "unit_price" numeric(18,6),
    "amount" numeric(18,2) NOT NULL,
    "fee_event_id" "uuid",
    CONSTRAINT "invoice_lines_kind_check" CHECK (("kind" = ANY (ARRAY['fee'::"text", 'spread'::"text", 'other'::"text"])))
);
ALTER TABLE "public"."invoice_lines" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "deal_id" "uuid",
    "due_date" "date",
    "currency" "text" DEFAULT 'USD'::"text",
    "subtotal" numeric(18,2),
    "tax" numeric(18,2),
    "total" numeric(18,2),
    "status" "public"."invoice_status_enum" DEFAULT 'draft'::"public"."invoice_status_enum",
    "generated_from" "text",
    "doc_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "paid_amount" numeric(18,2) DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "balance_due" numeric(18,2) GENERATED ALWAYS AS (GREATEST(("total" - "paid_amount"), (0)::numeric)) STORED,
    "invoice_number" "text",
    "match_status" "text" DEFAULT 'unmatched'::"text",
    CONSTRAINT "invoices_match_status_check" CHECK (("match_status" = ANY (ARRAY['unmatched'::"text", 'partially_matched'::"text", 'matched'::"text"])))
);
ALTER TABLE "public"."invoices" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."message_reads" (
    "message_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."message_reads" OWNER TO "postgres";
COMMENT ON TABLE "public"."message_reads" IS 'Message-level read receipts for compliance and realtime indicators.';
CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid",
    "body" "text",
    "message_type" "public"."message_type_enum" DEFAULT 'text'::"public"."message_type_enum" NOT NULL,
    "file_key" "text",
    "reply_to_message_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "edited_at" timestamp with time zone,
    "deleted_at" timestamp with time zone
);
ALTER TABLE "public"."messages" OWNER TO "postgres";
COMMENT ON TABLE "public"."messages" IS 'Individual messages including attachments and system notices.';
COMMENT ON COLUMN "public"."messages"."message_type" IS 'text/system/file indicator for rendering and permissions.';
COMMENT ON COLUMN "public"."messages"."metadata" IS 'JSON metadata for reactions, attachments, or workflow references.';
CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "invoice_id" "uuid",
    "amount" numeric(18,2),
    "currency" "text" DEFAULT 'USD'::"text",
    "paid_at" timestamp with time zone,
    "method" "text",
    "bank_txn_id" "uuid",
    "status" "public"."payment_status_enum" DEFAULT 'received'::"public"."payment_status_enum",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."payments" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."performance_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "vehicle_id" "uuid",
    "snapshot_date" "date" NOT NULL,
    "nav_value" numeric(18,2),
    "contributed" numeric(18,2),
    "distributed" numeric(18,2),
    "dpi" numeric(10,4),
    "tvpi" numeric(10,4),
    "irr_gross" numeric(7,4),
    "irr_net" numeric(7,4),
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."performance_snapshots" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."positions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "vehicle_id" "uuid",
    "units" numeric(28,8),
    "cost_basis" numeric(18,2),
    "last_nav" numeric(18,6),
    "as_of_date" "date"
);
ALTER TABLE "public"."positions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'investor'::"public"."user_role" NOT NULL,
    "display_name" "text",
    "email" "public"."citext",
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."profiles" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."reconciliation_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bank_transaction_id" "uuid",
    "invoice_id" "uuid",
    "match_type" "text" NOT NULL,
    "matched_amount" numeric(18,2) NOT NULL,
    "match_confidence" integer,
    "match_reason" "text",
    "status" "text" DEFAULT 'suggested'::"text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reconciliation_matches_match_type_check" CHECK (("match_type" = ANY (ARRAY['exact'::"text", 'partial'::"text", 'combined'::"text", 'split'::"text", 'manual'::"text"]))),
    CONSTRAINT "reconciliation_matches_status_check" CHECK (("status" = ANY (ARRAY['suggested'::"text", 'approved'::"text", 'reversed'::"text"])))
);
ALTER TABLE "public"."reconciliation_matches" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."reconciliations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid",
    "bank_transaction_id" "uuid",
    "matched_amount" numeric(18,2),
    "matched_at" timestamp with time zone DEFAULT "now"(),
    "matched_by" "uuid"
);
ALTER TABLE "public"."reconciliations" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."report_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "vehicle_id" "uuid",
    "filters" "jsonb",
    "result_doc_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "public"."report_status_enum" DEFAULT 'queued'::"public"."report_status_enum"
);
ALTER TABLE "public"."report_requests" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."request_tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "created_by" "uuid",
    "category" "text",
    "subject" "text",
    "details" "text",
    "assigned_to" "uuid",
    "linked_workflow_run" "uuid",
    "result_doc_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deal_id" "uuid",
    "status" "public"."request_status_enum" DEFAULT 'open'::"public"."request_status_enum",
    "priority" "public"."request_priority_enum" DEFAULT 'normal'::"public"."request_priority_enum"
);
ALTER TABLE "public"."request_tickets" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."reservation_lot_items" (
    "reservation_id" "uuid" NOT NULL,
    "lot_id" "uuid" NOT NULL,
    "units" numeric(28,8) NOT NULL,
    CONSTRAINT "reservation_lot_items_units_check" CHECK (("units" > (0)::numeric))
);
ALTER TABLE "public"."reservation_lot_items" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."reservations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "investor_id" "uuid",
    "requested_units" numeric(28,8) NOT NULL,
    "proposed_unit_price" numeric(18,6) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "status" "public"."reservation_status_enum" DEFAULT 'pending'::"public"."reservation_status_enum",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reservations_requested_units_check" CHECK (("requested_units" > (0)::numeric))
);
ALTER TABLE "public"."reservations" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."share_lots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "source_id" "uuid",
    "units_total" numeric(28,8) NOT NULL,
    "unit_cost" numeric(18,6) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "acquired_at" "date",
    "lockup_until" "date",
    "units_remaining" numeric(28,8) NOT NULL,
    "status" "text" DEFAULT 'available'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "share_lots_status_check" CHECK (("status" = ANY (ARRAY['available'::"text", 'held'::"text", 'exhausted'::"text"]))),
    CONSTRAINT "share_lots_units_remaining_check" CHECK (("units_remaining" >= (0)::numeric)),
    CONSTRAINT "share_lots_units_total_check" CHECK (("units_total" >= (0)::numeric))
);
ALTER TABLE "public"."share_lots" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."share_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "kind" "text" NOT NULL,
    "counterparty_name" "text",
    "contract_doc_id" "uuid",
    "notes" "text",
    CONSTRAINT "share_sources_kind_check" CHECK (("kind" = ANY (ARRAY['company'::"text", 'fund'::"text", 'colleague'::"text", 'other'::"text"])))
);
ALTER TABLE "public"."share_sources" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "vehicle_id" "uuid",
    "commitment" numeric(18,2),
    "currency" "text" DEFAULT 'USD'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "signed_doc_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."subscriptions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."suggested_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bank_transaction_id" "uuid",
    "invoice_id" "uuid",
    "confidence" integer NOT NULL,
    "match_reason" "text" NOT NULL,
    "amount_difference" numeric(18,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "suggested_matches_confidence_check" CHECK ((("confidence" >= 0) AND ("confidence" <= 100)))
);
ALTER TABLE "public"."suggested_matches" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."task_actions" (
    "task_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_config" "jsonb",
    CONSTRAINT "task_actions_type_check" CHECK (("action_type" = ANY (ARRAY['url_redirect'::"text", 'document_upload'::"text", 'esign_flow'::"text", 'questionnaire'::"text", 'n8n_workflow'::"text"])))
);
ALTER TABLE "public"."task_actions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."task_dependencies" (
    "task_id" "uuid" NOT NULL,
    "depends_on_task_id" "uuid" NOT NULL,
    CONSTRAINT "no_self_dependency" CHECK (("task_id" <> "depends_on_task_id"))
);
ALTER TABLE "public"."task_dependencies" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."task_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "kind" "text" NOT NULL,
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "priority" "text" DEFAULT 'medium'::"text",
    "estimated_minutes" integer,
    "default_due_days" integer,
    "prerequisite_task_kinds" "text"[],
    "trigger_event" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "task_templates_category_check" CHECK (("category" = ANY (ARRAY['onboarding'::"text", 'compliance'::"text", 'investment_setup'::"text"]))),
    CONSTRAINT "task_templates_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);
ALTER TABLE "public"."task_templates" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."term_sheets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid",
    "investor_id" "uuid",
    "fee_plan_id" "uuid",
    "price_per_unit" numeric(18,6),
    "currency" "text" DEFAULT 'USD'::"text",
    "valid_until" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text",
    "version" integer DEFAULT 1,
    "supersedes_id" "uuid",
    "doc_id" "uuid",
    "terms_data" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "term_sheets_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'accepted'::"text", 'rejected'::"text", 'expired'::"text"])))
);
ALTER TABLE "public"."term_sheets" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."valuations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "as_of_date" "date" NOT NULL,
    "nav_total" numeric(18,2),
    "nav_per_unit" numeric(18,6)
);
ALTER TABLE "public"."valuations" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "domicile" "text",
    "currency" "text" DEFAULT 'USD'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type" "public"."vehicle_type",
    "formation_date" "date",
    "legal_jurisdiction" "text",
    "registration_number" "text",
    "notes" "text"
);
ALTER TABLE "public"."vehicles" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."workflow_run_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_run_id" "uuid" NOT NULL,
    "step_name" "text" NOT NULL,
    "step_status" "text",
    "log_level" "text" DEFAULT 'info'::"text",
    "message" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workflow_run_logs_log_level_check" CHECK (("log_level" = ANY (ARRAY['debug'::"text", 'info'::"text", 'warn'::"text", 'error'::"text"]))),
    CONSTRAINT "workflow_run_logs_step_status_check" CHECK (("step_status" = ANY (ARRAY['started'::"text", 'completed'::"text", 'failed'::"text", 'skipped'::"text"])))
);
ALTER TABLE "public"."workflow_run_logs" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."workflow_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "triggered_by" "uuid",
    "input_params" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'queued'::"text",
    "result_doc_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "workflow_key" "text",
    "entity_type" "text",
    "entity_id" "uuid",
    "output_data" "jsonb",
    "error_message" "text",
    "webhook_signature" "text",
    "idempotency_token" "text",
    "queued_at" timestamp with time zone DEFAULT "now"(),
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "duration_ms" integer,
    "created_tasks" "uuid"[]
);
ALTER TABLE "public"."workflow_runs" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "n8n_webhook_url" "text" NOT NULL,
    "input_schema" "jsonb" DEFAULT '{}'::"jsonb",
    "required_title" "text"[],
    "name" "text",
    "description" "text",
    "category" "text",
    "required_role" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "trigger_type" "text" DEFAULT 'manual'::"text",
    CONSTRAINT "workflows_trigger_type_check" CHECK (("trigger_type" = ANY (ARRAY['manual'::"text", 'scheduled'::"text", 'both'::"text"])))
);
ALTER TABLE "public"."workflows" OWNER TO "postgres";
ALTER TABLE ONLY "public"."audit_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."audit_log_id_seq"'::"regclass");
ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."allocation_lot_items"
    ADD CONSTRAINT "allocation_lot_items_pkey" PRIMARY KEY ("allocation_id", "lot_id");
ALTER TABLE ONLY "public"."allocations"
    ADD CONSTRAINT "allocations_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."audit_log_hash_chain"
    ADD CONSTRAINT "audit_log_hash_chain_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."audit_report_templates"
    ADD CONSTRAINT "audit_report_templates_name_key" UNIQUE ("name");
ALTER TABLE ONLY "public"."audit_report_templates"
    ADD CONSTRAINT "audit_report_templates_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."bank_transactions"
    ADD CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."capital_calls"
    ADD CONSTRAINT "capital_calls_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."cashflows"
    ADD CONSTRAINT "cashflows_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id", "user_id");
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."counterparty_aliases"
    ADD CONSTRAINT "counterparty_aliases_investor_id_alias_name_key" UNIQUE ("investor_id", "alias_name");
ALTER TABLE ONLY "public"."counterparty_aliases"
    ADD CONSTRAINT "counterparty_aliases_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."dashboard_preferences"
    ADD CONSTRAINT "dashboard_preferences_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."dashboard_preferences"
    ADD CONSTRAINT "dashboard_preferences_user_id_key" UNIQUE ("user_id");
ALTER TABLE ONLY "public"."deal_commitments"
    ADD CONSTRAINT "deal_commitments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_pkey" PRIMARY KEY ("deal_id", "user_id");
ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."director_registry"
    ADD CONSTRAINT "director_registry_full_name_email_key" UNIQUE ("full_name", "email");
ALTER TABLE ONLY "public"."director_registry"
    ADD CONSTRAINT "director_registry_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."doc_package_items"
    ADD CONSTRAINT "doc_package_items_package_id_sort_order_key" UNIQUE ("package_id", "sort_order");
ALTER TABLE ONLY "public"."doc_package_items"
    ADD CONSTRAINT "doc_package_items_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."doc_packages"
    ADD CONSTRAINT "doc_packages_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."doc_templates"
    ADD CONSTRAINT "doc_templates_key_key" UNIQUE ("key");
ALTER TABLE ONLY "public"."doc_templates"
    ADD CONSTRAINT "doc_templates_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."document_approvals"
    ADD CONSTRAINT "document_approvals_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."document_folders"
    ADD CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."document_publishing_schedule"
    ADD CONSTRAINT "document_publishing_schedule_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."entity_directors"
    ADD CONSTRAINT "entity_directors_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."entity_events"
    ADD CONSTRAINT "entity_events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."esign_envelopes"
    ADD CONSTRAINT "esign_envelopes_envelope_id_key" UNIQUE ("envelope_id");
ALTER TABLE ONLY "public"."esign_envelopes"
    ADD CONSTRAINT "esign_envelopes_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."fee_components"
    ADD CONSTRAINT "fee_components_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."fee_events"
    ADD CONSTRAINT "fee_events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."fee_plans"
    ADD CONSTRAINT "fee_plans_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."import_batches"
    ADD CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."introducer_commissions"
    ADD CONSTRAINT "introducer_commissions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."introducers"
    ADD CONSTRAINT "introducers_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."introductions"
    ADD CONSTRAINT "introductions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."introductions"
    ADD CONSTRAINT "introductions_unique_prospect_deal" UNIQUE ("prospect_email", "deal_id");
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."investor_users"
    ADD CONSTRAINT "investor_users_pkey" PRIMARY KEY ("investor_id", "user_id");
ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."invite_links"
    ADD CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."invite_links"
    ADD CONSTRAINT "invite_links_token_hash_key" UNIQUE ("token_hash");
ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_fee_event_id_key" UNIQUE ("fee_event_id");
ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");
ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."message_reads"
    ADD CONSTRAINT "message_reads_pkey" PRIMARY KEY ("message_id", "user_id");
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."performance_snapshots"
    ADD CONSTRAINT "performance_snapshots_investor_id_vehicle_id_snapshot_date_key" UNIQUE ("investor_id", "vehicle_id", "snapshot_date");
ALTER TABLE ONLY "public"."performance_snapshots"
    ADD CONSTRAINT "performance_snapshots_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_investor_id_vehicle_id_key" UNIQUE ("investor_id", "vehicle_id");
ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."reconciliation_matches"
    ADD CONSTRAINT "reconciliation_matches_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_invoice_id_bank_transaction_id_key" UNIQUE ("invoice_id", "bank_transaction_id");
ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."report_requests"
    ADD CONSTRAINT "report_requests_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."request_tickets"
    ADD CONSTRAINT "request_tickets_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."reservation_lot_items"
    ADD CONSTRAINT "reservation_lot_items_pkey" PRIMARY KEY ("reservation_id", "lot_id");
ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."share_lots"
    ADD CONSTRAINT "share_lots_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."share_sources"
    ADD CONSTRAINT "share_sources_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."suggested_matches"
    ADD CONSTRAINT "suggested_matches_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."task_actions"
    ADD CONSTRAINT "task_actions_pkey" PRIMARY KEY ("task_id");
ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("task_id", "depends_on_task_id");
ALTER TABLE ONLY "public"."task_templates"
    ADD CONSTRAINT "task_templates_kind_key" UNIQUE ("kind");
ALTER TABLE ONLY "public"."task_templates"
    ADD CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_deal_id_investor_id_version_key" UNIQUE ("deal_id", "investor_id", "version");
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."valuations"
    ADD CONSTRAINT "valuations_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."valuations"
    ADD CONSTRAINT "valuations_vehicle_id_as_of_date_key" UNIQUE ("vehicle_id", "as_of_date");
ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."workflow_run_logs"
    ADD CONSTRAINT "workflow_run_logs_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."workflow_runs"
    ADD CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."workflows"
    ADD CONSTRAINT "workflows_category_check" CHECK ((("category" IS NULL) OR ("category" = ANY (ARRAY['documents'::"text", 'compliance'::"text", 'communications'::"text", 'data_processing'::"text", 'multi_step'::"text"])))) NOT VALID;
ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_key_key" UNIQUE ("key");
ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_pkey" PRIMARY KEY ("id");
CREATE INDEX "cashflows_investor_id_vehicle_id_date_idx" ON "public"."cashflows" USING "btree" ("investor_id", "vehicle_id", "date");
CREATE INDEX "documents_owner_investor_id_vehicle_id_type_idx" ON "public"."documents" USING "btree" ("owner_investor_id", "vehicle_id", "type");
CREATE INDEX "idx_activity_feed_deal_id" ON "public"."activity_feed" USING "btree" ("deal_id", "created_at" DESC) WHERE ("deal_id" IS NOT NULL);
CREATE INDEX "idx_activity_feed_importance_unread" ON "public"."activity_feed" USING "btree" ("importance", "read_status", "created_at" DESC) WHERE ("read_status" = false);
CREATE INDEX "idx_activity_feed_investor_created" ON "public"."activity_feed" USING "btree" ("investor_id", "created_at" DESC);
CREATE INDEX "idx_allocations_deal_investor_status" ON "public"."allocations" USING "btree" ("deal_id", "investor_id", "status");
CREATE INDEX "idx_approval_history_actor" ON "public"."approval_history" USING "btree" ("actor_id", "created_at" DESC);
CREATE INDEX "idx_approval_history_approval" ON "public"."approval_history" USING "btree" ("approval_id", "created_at" DESC);
CREATE INDEX "idx_approvals_assigned" ON "public"."approvals" USING "btree" ("assigned_to", "status", "created_at" DESC);
CREATE INDEX "idx_approvals_assigned_status" ON "public"."approvals" USING "btree" ("assigned_to", "status");
CREATE INDEX "idx_approvals_entity" ON "public"."approvals" USING "btree" ("entity_type", "entity_id");
CREATE INDEX "idx_approvals_related_deal" ON "public"."approvals" USING "btree" ("related_deal_id") WHERE ("related_deal_id" IS NOT NULL);
CREATE INDEX "idx_approvals_related_investor" ON "public"."approvals" USING "btree" ("related_investor_id") WHERE ("related_investor_id" IS NOT NULL);
CREATE INDEX "idx_approvals_requester" ON "public"."approvals" USING "btree" ("requested_by", "created_at" DESC);
CREATE INDEX "idx_approvals_status_sla" ON "public"."approvals" USING "btree" ("status", "sla_breach_at") WHERE ("status" = 'pending'::"text");
CREATE INDEX "idx_audit_log_entity" ON "public"."audit_log" USING "btree" ("entity", "entity_id");
CREATE INDEX "idx_audit_logs_actor" ON "public"."audit_logs" USING "btree" ("actor_id", "timestamp" DESC);
CREATE INDEX "idx_audit_logs_compliance" ON "public"."audit_logs" USING "btree" ("compliance_flag", "timestamp" DESC) WHERE ("compliance_flag" = true);
CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id", "timestamp" DESC);
CREATE INDEX "idx_audit_logs_risk" ON "public"."audit_logs" USING "btree" ("risk_level", "timestamp" DESC) WHERE ("risk_level" = ANY (ARRAY['medium'::"text", 'high'::"text"]));
CREATE INDEX "idx_audit_logs_search" ON "public"."audit_logs" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((((((((COALESCE("actor_name", ''::"text") || ' '::"text") || COALESCE("actor_email", ''::"text")) || ' '::"text") || COALESCE("action", ''::"text")) || ' '::"text") || COALESCE("entity_name", ''::"text")) || ' '::"text") || COALESCE("compliance_notes", ''::"text"))));
CREATE INDEX "idx_audit_logs_timestamp" ON "public"."audit_logs" USING "btree" ("timestamp" DESC);
CREATE INDEX "idx_bank_transactions_account" ON "public"."bank_transactions" USING "btree" ("account_ref", "value_date" DESC);
CREATE INDEX "idx_bank_transactions_account_date_amount" ON "public"."bank_transactions" USING "btree" ("account_ref", "value_date", "amount");
CREATE INDEX "idx_bank_transactions_match_confidence" ON "public"."bank_transactions" USING "btree" ("match_confidence");
CREATE INDEX "idx_bank_transactions_status" ON "public"."bank_transactions" USING "btree" ("status", "value_date" DESC);
CREATE INDEX "idx_cashflows_investor_type_date" ON "public"."cashflows" USING "btree" ("investor_id", "type", "date");
CREATE INDEX "idx_cashflows_investor_vehicle_date" ON "public"."cashflows" USING "btree" ("investor_id", "vehicle_id", "date");
CREATE INDEX "idx_compliance_alerts_assigned" ON "public"."compliance_alerts" USING "btree" ("assigned_to", "status", "created_at" DESC);
CREATE INDEX "idx_compliance_alerts_status" ON "public"."compliance_alerts" USING "btree" ("status", "created_at" DESC);
CREATE INDEX "idx_conversation_participants_role" ON "public"."conversation_participants" USING "btree" ("participant_role");
CREATE INDEX "idx_conversation_participants_user" ON "public"."conversation_participants" USING "btree" ("user_id");
CREATE INDEX "idx_conversations_deal" ON "public"."conversations" USING "btree" ("deal_id") WHERE ("deal_id" IS NOT NULL);
CREATE INDEX "idx_conversations_last_message_at" ON "public"."conversations" USING "btree" ("last_message_at" DESC NULLS LAST);
CREATE INDEX "idx_conversations_type" ON "public"."conversations" USING "btree" ("type");
CREATE INDEX "idx_conversations_visibility" ON "public"."conversations" USING "btree" ("visibility");
CREATE INDEX "idx_counterparty_aliases_alias" ON "public"."counterparty_aliases" USING "gin" ("to_tsvector"('"english"'::"regconfig", "alias_name"));
CREATE INDEX "idx_counterparty_aliases_investor" ON "public"."counterparty_aliases" USING "btree" ("investor_id");
CREATE INDEX "idx_deal_memberships_investor" ON "public"."deal_memberships" USING "btree" ("investor_id");
CREATE INDEX "idx_deal_memberships_user" ON "public"."deal_memberships" USING "btree" ("user_id");
CREATE UNIQUE INDEX "idx_deal_room_per_deal" ON "public"."conversations" USING "btree" ("deal_id") WHERE (("type" = 'deal_room'::"public"."conversation_type_enum") AND ("archived_at" IS NULL));
CREATE INDEX "idx_deals_created_by" ON "public"."deals" USING "btree" ("created_by");
CREATE INDEX "idx_deals_status_type" ON "public"."deals" USING "btree" ("status", "deal_type");
CREATE INDEX "idx_deals_vehicle" ON "public"."deals" USING "btree" ("vehicle_id");
CREATE INDEX "idx_director_registry_email" ON "public"."director_registry" USING "btree" ("email");
CREATE INDEX "idx_director_registry_name" ON "public"."director_registry" USING "btree" ("full_name");
CREATE INDEX "idx_doc_approvals_doc" ON "public"."document_approvals" USING "btree" ("document_id");
CREATE INDEX "idx_doc_approvals_reviewer" ON "public"."document_approvals" USING "btree" ("reviewed_by", "status");
CREATE INDEX "idx_doc_approvals_status" ON "public"."document_approvals" USING "btree" ("status", "requested_at");
CREATE INDEX "idx_doc_schedule_doc" ON "public"."document_publishing_schedule" USING "btree" ("document_id");
CREATE INDEX "idx_doc_schedule_publish" ON "public"."document_publishing_schedule" USING "btree" ("publish_at") WHERE (NOT "published");
CREATE INDEX "idx_doc_schedule_unpublish" ON "public"."document_publishing_schedule" USING "btree" ("unpublish_at") WHERE ("published" AND ("unpublish_at" IS NOT NULL));
CREATE INDEX "idx_doc_versions_doc" ON "public"."document_versions" USING "btree" ("document_id", "version_number" DESC);
CREATE UNIQUE INDEX "idx_doc_versions_unique" ON "public"."document_versions" USING "btree" ("document_id", "version_number");
CREATE INDEX "idx_documents_entity_id" ON "public"."documents" USING "btree" ("entity_id");
CREATE INDEX "idx_documents_folder" ON "public"."documents" USING "btree" ("folder_id");
CREATE INDEX "idx_documents_name" ON "public"."documents" USING "btree" ("name");
CREATE INDEX "idx_documents_owner_investor_vehicle_deal_type" ON "public"."documents" USING "btree" ("owner_investor_id", "vehicle_id", "deal_id", "type");
CREATE INDEX "idx_documents_published" ON "public"."documents" USING "btree" ("is_published", "vehicle_id");
CREATE INDEX "idx_documents_status" ON "public"."documents" USING "btree" ("status");
CREATE INDEX "idx_documents_tags" ON "public"."documents" USING "gin" ("tags");
CREATE INDEX "idx_entity_directors_active" ON "public"."entity_directors" USING "btree" ("vehicle_id", "effective_to");
CREATE INDEX "idx_entity_directors_vehicle" ON "public"."entity_directors" USING "btree" ("vehicle_id");
CREATE INDEX "idx_entity_events_created" ON "public"."entity_events" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_entity_events_vehicle" ON "public"."entity_events" USING "btree" ("vehicle_id");
CREATE INDEX "idx_fee_events_deal_investor_status_date" ON "public"."fee_events" USING "btree" ("deal_id", "investor_id", "status", "event_date");
CREATE INDEX "idx_fee_events_fee_type_date" ON "public"."fee_events" USING "btree" ("fee_type", "event_date" DESC);
CREATE INDEX "idx_fee_events_investor_status_date" ON "public"."fee_events" USING "btree" ("investor_id", "status", "event_date" DESC);
CREATE INDEX "idx_folders_parent" ON "public"."document_folders" USING "btree" ("parent_folder_id");
CREATE INDEX "idx_folders_path" ON "public"."document_folders" USING "btree" ("path");
CREATE INDEX "idx_folders_type" ON "public"."document_folders" USING "btree" ("folder_type");
CREATE UNIQUE INDEX "idx_folders_unique_path" ON "public"."document_folders" USING "btree" ("path");
CREATE INDEX "idx_folders_vehicle" ON "public"."document_folders" USING "btree" ("vehicle_id");
CREATE INDEX "idx_introducer_commissions_deal_investor" ON "public"."introducer_commissions" USING "btree" ("deal_id", "investor_id");
CREATE INDEX "idx_introducer_commissions_introducer" ON "public"."introducer_commissions" USING "btree" ("introducer_id");
CREATE INDEX "idx_introducer_commissions_introduction" ON "public"."introducer_commissions" USING "btree" ("introduction_id");
CREATE INDEX "idx_introducers_created_by" ON "public"."introducers" USING "btree" ("created_by");
CREATE INDEX "idx_introductions_deal_investor" ON "public"."introductions" USING "btree" ("deal_id", "prospect_investor_id");
CREATE INDEX "idx_introductions_introduced_at" ON "public"."introductions" USING "btree" ("introduced_at" DESC);
CREATE INDEX "idx_introductions_introducer" ON "public"."introductions" USING "btree" ("introducer_id");
CREATE INDEX "idx_investors_created_at" ON "public"."investors" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_investors_email" ON "public"."investors" USING "btree" ("email") WHERE ("email" IS NOT NULL);
CREATE INDEX "idx_investors_kyc_expiry" ON "public"."investors" USING "btree" ("kyc_expiry_date") WHERE (("kyc_status" = 'completed'::"text") AND ("kyc_expiry_date" IS NOT NULL));
CREATE INDEX "idx_investors_kyc_status" ON "public"."investors" USING "btree" ("kyc_status") WHERE ("kyc_status" = ANY (ARRAY['pending'::"text", 'review'::"text"]));
CREATE INDEX "idx_investors_primary_rm" ON "public"."investors" USING "btree" ("primary_rm");
CREATE INDEX "idx_investors_search" ON "public"."investors" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((((COALESCE("legal_name", ''::"text") || ' '::"text") || COALESCE("display_name", ''::"text")) || ' '::"text") || COALESCE("email", ''::"text"))));
CREATE INDEX "idx_investors_secondary_rm" ON "public"."investors" USING "btree" ("secondary_rm");
CREATE INDEX "idx_investors_status" ON "public"."investors" USING "btree" ("status") WHERE ("status" = 'active'::"text");
CREATE INDEX "idx_investors_type" ON "public"."investors" USING "btree" ("type");
CREATE INDEX "idx_invoices_investor_deal_status" ON "public"."invoices" USING "btree" ("investor_id", "deal_id", "status");
CREATE INDEX "idx_message_reads_user" ON "public"."message_reads" USING "btree" ("user_id");
CREATE INDEX "idx_messages_conversation_created" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);
CREATE INDEX "idx_messages_reply_thread" ON "public"."messages" USING "btree" ("reply_to_message_id");
CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");
CREATE INDEX "idx_payments_invoice" ON "public"."payments" USING "btree" ("invoice_id");
CREATE INDEX "idx_performance_snapshots_investor_date" ON "public"."performance_snapshots" USING "btree" ("investor_id", "snapshot_date" DESC);
CREATE INDEX "idx_performance_snapshots_vehicle_date" ON "public"."performance_snapshots" USING "btree" ("vehicle_id", "snapshot_date" DESC);
CREATE INDEX "idx_positions_investor_vehicle" ON "public"."positions" USING "btree" ("investor_id", "vehicle_id");
CREATE INDEX "idx_reconciliation_matches_invoice" ON "public"."reconciliation_matches" USING "btree" ("invoice_id");
CREATE INDEX "idx_reconciliation_matches_status" ON "public"."reconciliation_matches" USING "btree" ("status");
CREATE INDEX "idx_reconciliation_matches_transaction" ON "public"."reconciliation_matches" USING "btree" ("bank_transaction_id");
CREATE INDEX "idx_request_tickets_deal_status" ON "public"."request_tickets" USING "btree" ("deal_id", "status");
CREATE INDEX "idx_reservations_deal_status_expires" ON "public"."reservations" USING "btree" ("deal_id", "status", "expires_at");
CREATE INDEX "idx_reservations_investor" ON "public"."reservations" USING "btree" ("investor_id");
CREATE INDEX "idx_share_lots_deal_status" ON "public"."share_lots" USING "btree" ("deal_id", "status");
CREATE INDEX "idx_share_lots_status_remaining" ON "public"."share_lots" USING "btree" ("status", "units_remaining");
CREATE INDEX "idx_subscriptions_investor_status" ON "public"."subscriptions" USING "btree" ("investor_id", "status");
CREATE INDEX "idx_suggested_matches_confidence" ON "public"."suggested_matches" USING "btree" ("confidence" DESC);
CREATE INDEX "idx_suggested_matches_transaction" ON "public"."suggested_matches" USING "btree" ("bank_transaction_id");
CREATE INDEX "idx_task_actions_task_id" ON "public"."task_actions" USING "btree" ("task_id");
CREATE INDEX "idx_task_dependencies_depends_on" ON "public"."task_dependencies" USING "btree" ("depends_on_task_id");
CREATE INDEX "idx_task_dependencies_task_id" ON "public"."task_dependencies" USING "btree" ("task_id");
CREATE INDEX "idx_task_templates_kind" ON "public"."task_templates" USING "btree" ("kind");
CREATE INDEX "idx_task_templates_trigger_event" ON "public"."task_templates" USING "btree" ("trigger_event");
CREATE INDEX "idx_tasks_category" ON "public"."tasks" USING "btree" ("category", "status");
CREATE INDEX "idx_tasks_owner_investor" ON "public"."tasks" USING "btree" ("owner_investor_id", "status");
CREATE INDEX "idx_tasks_owner_status" ON "public"."tasks" USING "btree" ("owner_user_id", "status");
CREATE INDEX "idx_tasks_priority_due" ON "public"."tasks" USING "btree" ("priority" DESC, "due_at");
CREATE INDEX "idx_tasks_related_entity" ON "public"."tasks" USING "btree" ("related_entity_type", "related_entity_id");
CREATE INDEX "idx_term_sheets_deal_investor" ON "public"."term_sheets" USING "btree" ("deal_id", "investor_id");
CREATE INDEX "idx_term_sheets_status" ON "public"."term_sheets" USING "btree" ("status");
CREATE INDEX "idx_valuations_vehicle_date" ON "public"."valuations" USING "btree" ("vehicle_id", "as_of_date" DESC);
CREATE INDEX "idx_workflow_run_logs_workflow_run_id" ON "public"."workflow_run_logs" USING "btree" ("workflow_run_id", "created_at");
CREATE INDEX "idx_workflow_runs_idempotency" ON "public"."workflow_runs" USING "btree" ("idempotency_token") WHERE ("idempotency_token" IS NOT NULL);
CREATE INDEX "idx_workflow_runs_status" ON "public"."workflow_runs" USING "btree" ("status", "created_at" DESC);
CREATE INDEX "idx_workflow_runs_triggered_by" ON "public"."workflow_runs" USING "btree" ("triggered_by", "created_at" DESC);
CREATE INDEX "idx_workflow_runs_workflow_key" ON "public"."workflow_runs" USING "btree" ("workflow_key", "created_at" DESC);
CREATE INDEX "idx_workflows_category" ON "public"."workflows" USING "btree" ("category");
CREATE INDEX "idx_workflows_key" ON "public"."workflows" USING "btree" ("key");
CREATE INDEX "idx_workflows_trigger_type" ON "public"."workflows" USING "btree" ("trigger_type") WHERE ("trigger_type" = ANY (ARRAY['scheduled'::"text", 'both'::"text"]));
CREATE INDEX "positions_investor_id_vehicle_id_idx" ON "public"."positions" USING "btree" ("investor_id", "vehicle_id");
CREATE UNIQUE INDEX "uniq_fee_plans_default_per_deal" ON "public"."fee_plans" USING "btree" ("deal_id") WHERE ("is_default" = true);
CREATE UNIQUE INDEX "uniq_investor_terms_active" ON "public"."investor_terms" USING "btree" ("deal_id", "investor_id") WHERE ("status" = 'active'::"text");
CREATE UNIQUE INDEX "uniq_investor_terms_effective" ON "public"."investor_terms" USING "btree" ("investor_id", "deal_id", "effective_from") WHERE ("status" = ANY (ARRAY['pending'::"text", 'active'::"text"]));
CREATE OR REPLACE TRIGGER "approvals_auto_assign" BEFORE INSERT ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."auto_assign_approval"();
CREATE OR REPLACE TRIGGER "approvals_log_changes" AFTER INSERT OR UPDATE ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."log_approval_change"();
CREATE OR REPLACE TRIGGER "approvals_set_sla" BEFORE INSERT ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."set_approval_sla_deadline"();
CREATE OR REPLACE TRIGGER "conversation_participants_touch" BEFORE UPDATE ON "public"."conversation_participants" FOR EACH ROW EXECUTE FUNCTION "public"."trg_touch_conversation_participant"();
CREATE OR REPLACE TRIGGER "conversations_owner_seed" AFTER INSERT ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."trg_conversation_set_owner"();
CREATE OR REPLACE TRIGGER "conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "messages_auto_read" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_message_read_receipt"();
CREATE OR REPLACE TRIGGER "messages_refresh_conversation" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."trg_refresh_conversation_metadata"();
CREATE OR REPLACE TRIGGER "on_commitment_create_approval" AFTER INSERT ON "public"."deal_commitments" FOR EACH ROW WHEN (("new"."status" = 'submitted'::"text")) EXECUTE FUNCTION "public"."create_commitment_approval"();
COMMENT ON TRIGGER "on_commitment_create_approval" ON "public"."deal_commitments" IS 'CRITICAL: Creates approval record for staff review when investor submits commitment';
CREATE OR REPLACE TRIGGER "on_reservation_create_approval" AFTER INSERT ON "public"."reservations" FOR EACH ROW WHEN (("new"."status" = 'pending'::"public"."reservation_status_enum")) EXECUTE FUNCTION "public"."create_reservation_approval"();
COMMENT ON TRIGGER "on_reservation_create_approval" ON "public"."reservations" IS 'CRITICAL: Creates approval record for staff review when reservation is created with pending status';
CREATE OR REPLACE TRIGGER "tasks_unlock_dependents" AFTER UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."unlock_dependent_tasks"();
CREATE OR REPLACE TRIGGER "tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "trg_audit_logs_hash_chain" AFTER INSERT ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."append_audit_hash"();
CREATE OR REPLACE TRIGGER "trg_audit_logs_no_delete" BEFORE DELETE ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_audit_log_modification"();
CREATE OR REPLACE TRIGGER "trg_audit_logs_no_update" BEFORE UPDATE ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_audit_log_modification"();
CREATE OR REPLACE TRIGGER "trg_bank_transactions_set_updated_at" BEFORE UPDATE ON "public"."bank_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "trg_fee_components_set_updated_at" BEFORE UPDATE ON "public"."fee_components" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "trg_fee_plans_set_updated_at" BEFORE UPDATE ON "public"."fee_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "trg_investor_terms_set_updated_at" BEFORE UPDATE ON "public"."investor_terms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_document_approvals_updated_at" BEFORE UPDATE ON "public"."document_approvals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_document_folders_updated_at" BEFORE UPDATE ON "public"."document_folders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_document_schedule_updated_at" BEFORE UPDATE ON "public"."document_publishing_schedule" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_documents_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "workflows_set_updated_at" BEFORE UPDATE ON "public"."workflows" FOR EACH ROW EXECUTE FUNCTION "public"."set_workflows_updated_at"();
ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");
ALTER TABLE ONLY "public"."allocation_lot_items"
    ADD CONSTRAINT "allocation_lot_items_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "public"."allocations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."allocation_lot_items"
    ADD CONSTRAINT "allocation_lot_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "public"."share_lots"("id");
ALTER TABLE ONLY "public"."allocations"
    ADD CONSTRAINT "allocations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."allocations"
    ADD CONSTRAINT "allocations_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."allocations"
    ADD CONSTRAINT "allocations_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_decided_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_related_deal_id_fkey" FOREIGN KEY ("related_deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_related_investor_id_fkey" FOREIGN KEY ("related_investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_secondary_approved_by_fkey" FOREIGN KEY ("secondary_approved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."audit_log_hash_chain"
    ADD CONSTRAINT "audit_log_hash_chain_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_logs"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_compliance_reviewer_id_fkey" FOREIGN KEY ("compliance_reviewer_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."audit_report_templates"
    ADD CONSTRAINT "audit_report_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."capital_calls"
    ADD CONSTRAINT "capital_calls_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."cashflows"
    ADD CONSTRAINT "cashflows_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."cashflows"
    ADD CONSTRAINT "cashflows_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_logs"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."counterparty_aliases"
    ADD CONSTRAINT "counterparty_aliases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."counterparty_aliases"
    ADD CONSTRAINT "counterparty_aliases_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."dashboard_preferences"
    ADD CONSTRAINT "dashboard_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."deal_commitments"
    ADD CONSTRAINT "deal_commitments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."deal_commitments"
    ADD CONSTRAINT "deal_commitments_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."deal_commitments"
    ADD CONSTRAINT "deal_commitments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");
ALTER TABLE ONLY "public"."director_registry"
    ADD CONSTRAINT "director_registry_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."doc_package_items"
    ADD CONSTRAINT "doc_package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."doc_packages"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."doc_package_items"
    ADD CONSTRAINT "doc_package_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."doc_templates"("id");
ALTER TABLE ONLY "public"."doc_packages"
    ADD CONSTRAINT "doc_packages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."doc_packages"
    ADD CONSTRAINT "doc_packages_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."doc_packages"
    ADD CONSTRAINT "doc_packages_final_doc_id_fkey" FOREIGN KEY ("final_doc_id") REFERENCES "public"."documents"("id");
ALTER TABLE ONLY "public"."doc_packages"
    ADD CONSTRAINT "doc_packages_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."document_approvals"
    ADD CONSTRAINT "document_approvals_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."document_approvals"
    ADD CONSTRAINT "document_approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."document_approvals"
    ADD CONSTRAINT "document_approvals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."document_folders"
    ADD CONSTRAINT "document_folders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."document_folders"
    ADD CONSTRAINT "document_folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "public"."document_folders"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."document_folders"
    ADD CONSTRAINT "document_folders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."document_publishing_schedule"
    ADD CONSTRAINT "document_publishing_schedule_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."document_publishing_schedule"
    ADD CONSTRAINT "document_publishing_schedule_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."vehicles"("id");
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folders"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_owner_investor_id_fkey" FOREIGN KEY ("owner_investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");
ALTER TABLE ONLY "public"."entity_directors"
    ADD CONSTRAINT "entity_directors_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."entity_events"
    ADD CONSTRAINT "entity_events_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."entity_events"
    ADD CONSTRAINT "entity_events_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."fee_components"
    ADD CONSTRAINT "fee_components_fee_plan_id_fkey" FOREIGN KEY ("fee_plan_id") REFERENCES "public"."fee_plans"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."fee_events"
    ADD CONSTRAINT "fee_events_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "public"."allocations"("id");
ALTER TABLE ONLY "public"."fee_events"
    ADD CONSTRAINT "fee_events_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."fee_events"
    ADD CONSTRAINT "fee_events_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "public"."fee_components"("id");
ALTER TABLE ONLY "public"."fee_events"
    ADD CONSTRAINT "fee_events_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."fee_events"
    ADD CONSTRAINT "fee_events_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id");
ALTER TABLE ONLY "public"."fee_events"
    ADD CONSTRAINT "fee_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id");
ALTER TABLE ONLY "public"."fee_plans"
    ADD CONSTRAINT "fee_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."fee_plans"
    ADD CONSTRAINT "fee_plans_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."fee_plans"
    ADD CONSTRAINT "fee_plans_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");
ALTER TABLE ONLY "public"."import_batches"
    ADD CONSTRAINT "import_batches_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."introducer_commissions"
    ADD CONSTRAINT "introducer_commissions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."introducer_commissions"
    ADD CONSTRAINT "introducer_commissions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."introducer_commissions"
    ADD CONSTRAINT "introducer_commissions_introducer_id_fkey" FOREIGN KEY ("introducer_id") REFERENCES "public"."introducers"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."introducer_commissions"
    ADD CONSTRAINT "introducer_commissions_introduction_id_fkey" FOREIGN KEY ("introduction_id") REFERENCES "public"."introductions"("id");
ALTER TABLE ONLY "public"."introducer_commissions"
    ADD CONSTRAINT "introducer_commissions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."introducers"
    ADD CONSTRAINT "introducers_agreement_doc_id_fkey" FOREIGN KEY ("agreement_doc_id") REFERENCES "public"."documents"("id");
ALTER TABLE ONLY "public"."introducers"
    ADD CONSTRAINT "introducers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."introducers"
    ADD CONSTRAINT "introducers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."introductions"
    ADD CONSTRAINT "introductions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."introductions"
    ADD CONSTRAINT "introductions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."introductions"
    ADD CONSTRAINT "introductions_introducer_id_fkey" FOREIGN KEY ("introducer_id") REFERENCES "public"."introducers"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."introductions"
    ADD CONSTRAINT "introductions_prospect_investor_id_fkey" FOREIGN KEY ("prospect_investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_base_fee_plan_id_fkey" FOREIGN KEY ("base_fee_plan_id") REFERENCES "public"."fee_plans"("id");
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_selected_fee_plan_id_fkey" FOREIGN KEY ("selected_fee_plan_id") REFERENCES "public"."fee_plans"("id");
ALTER TABLE ONLY "public"."investor_terms"
    ADD CONSTRAINT "investor_terms_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");
ALTER TABLE ONLY "public"."investor_users"
    ADD CONSTRAINT "investor_users_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."investor_users"
    ADD CONSTRAINT "investor_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_kyc_approved_by_fkey" FOREIGN KEY ("kyc_approved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_primary_rm_fkey" FOREIGN KEY ("primary_rm") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_secondary_rm_fkey" FOREIGN KEY ("secondary_rm") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."invite_links"
    ADD CONSTRAINT "invite_links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."invite_links"
    ADD CONSTRAINT "invite_links_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_fee_event_id_fkey" FOREIGN KEY ("fee_event_id") REFERENCES "public"."fee_events"("id");
ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "public"."documents"("id");
ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."message_reads"
    ADD CONSTRAINT "message_reads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."message_reads"
    ADD CONSTRAINT "message_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id");
ALTER TABLE ONLY "public"."performance_snapshots"
    ADD CONSTRAINT "performance_snapshots_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."performance_snapshots"
    ADD CONSTRAINT "performance_snapshots_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."reconciliation_matches"
    ADD CONSTRAINT "reconciliation_matches_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."reconciliation_matches"
    ADD CONSTRAINT "reconciliation_matches_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "public"."bank_transactions"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."reconciliation_matches"
    ADD CONSTRAINT "reconciliation_matches_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "public"."bank_transactions"("id");
ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id");
ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_matched_by_fkey" FOREIGN KEY ("matched_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."report_requests"
    ADD CONSTRAINT "report_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."report_requests"
    ADD CONSTRAINT "report_requests_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."report_requests"
    ADD CONSTRAINT "report_requests_result_doc_id_fkey" FOREIGN KEY ("result_doc_id") REFERENCES "public"."documents"("id");
ALTER TABLE ONLY "public"."report_requests"
    ADD CONSTRAINT "report_requests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");
ALTER TABLE ONLY "public"."request_tickets"
    ADD CONSTRAINT "request_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."request_tickets"
    ADD CONSTRAINT "request_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."request_tickets"
    ADD CONSTRAINT "request_tickets_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");
ALTER TABLE ONLY "public"."request_tickets"
    ADD CONSTRAINT "request_tickets_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."request_tickets"
    ADD CONSTRAINT "request_tickets_result_doc_id_fkey" FOREIGN KEY ("result_doc_id") REFERENCES "public"."documents"("id");
ALTER TABLE ONLY "public"."reservation_lot_items"
    ADD CONSTRAINT "reservation_lot_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "public"."share_lots"("id");
ALTER TABLE ONLY "public"."reservation_lot_items"
    ADD CONSTRAINT "reservation_lot_items_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."share_lots"
    ADD CONSTRAINT "share_lots_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."share_lots"
    ADD CONSTRAINT "share_lots_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."share_sources"("id");
ALTER TABLE ONLY "public"."share_sources"
    ADD CONSTRAINT "share_sources_contract_doc_id_fkey" FOREIGN KEY ("contract_doc_id") REFERENCES "public"."documents"("id");
ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."suggested_matches"
    ADD CONSTRAINT "suggested_matches_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "public"."bank_transactions"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."suggested_matches"
    ADD CONSTRAINT "suggested_matches_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."task_actions"
    ADD CONSTRAINT "task_actions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_depends_on_task_id_fkey" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."task_dependencies"
    ADD CONSTRAINT "task_dependencies_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_owner_investor_id_fkey" FOREIGN KEY ("owner_investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "public"."documents"("id");
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_fee_plan_id_fkey" FOREIGN KEY ("fee_plan_id") REFERENCES "public"."fee_plans"("id");
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");
ALTER TABLE ONLY "public"."term_sheets"
    ADD CONSTRAINT "term_sheets_supersedes_id_fkey" FOREIGN KEY ("supersedes_id") REFERENCES "public"."term_sheets"("id");
ALTER TABLE ONLY "public"."valuations"
    ADD CONSTRAINT "valuations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."workflow_run_logs"
    ADD CONSTRAINT "workflow_run_logs_workflow_run_id_fkey" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."workflow_runs"
    ADD CONSTRAINT "workflow_runs_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."workflow_runs"
    ADD CONSTRAINT "workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id");
ALTER TABLE "public"."activity_feed" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_feed_investor_read" ON "public"."activity_feed" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "activity_feed"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_ops'::"public"."user_role")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_rm'::"public"."user_role"))))));
ALTER TABLE "public"."allocation_lot_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allocation_lot_items_read" ON "public"."allocation_lot_items" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."allocations" "a"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "a"."investor_id")))
  WHERE (("a"."id" = "allocation_lot_items"."allocation_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."allocations" "a"
     JOIN "public"."deal_memberships" "dm" ON (("dm"."deal_id" = "a"."deal_id")))
  WHERE (("a"."id" = "allocation_lot_items"."allocation_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
ALTER TABLE "public"."allocations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allocations_read" ON "public"."allocations" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "allocations"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "allocations"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "allocations_staff_delete" ON "public"."allocations" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "allocations_staff_insert" ON "public"."allocations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "allocations_staff_update" ON "public"."allocations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."approvals" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals_requester_read" ON "public"."document_approvals" FOR SELECT TO "authenticated" USING (("requested_by" = "auth"."uid"()));
CREATE POLICY "approvals_staff" ON "public"."approvals" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "approvals_staff_all" ON "public"."document_approvals" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_staff_read" ON "public"."audit_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_admin_read" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));
CREATE POLICY "audit_logs_insert" ON "public"."audit_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."audit_report_templates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_report_templates_staff_read" ON "public"."audit_report_templates" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));
ALTER TABLE "public"."bank_transactions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bank_transactions_admin_write" ON "public"."bank_transactions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))));
CREATE POLICY "bank_transactions_staff" ON "public"."bank_transactions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "bank_transactions_staff_access" ON "public"."bank_transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "can_insert_own_profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));
CREATE POLICY "can_read_own_profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));
CREATE POLICY "can_update_own_profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));
ALTER TABLE "public"."capital_calls" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "capital_calls_read" ON "public"."capital_calls" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "capital_calls"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "cashflows_read" ON "public"."cashflows" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "cashflows"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "commissions_staff" ON "public"."introducer_commissions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."compliance_alerts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compliance_alerts_admin" ON "public"."compliance_alerts" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));
ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversation_participants_delete" ON "public"."conversation_participants" FOR DELETE USING ((("auth"."uid"() IN ( SELECT "conversations"."created_by"
   FROM "public"."conversations"
  WHERE ("conversations"."id" = "conversation_participants"."conversation_id"))) OR ("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "conversation_participants_insert" ON "public"."conversation_participants" FOR INSERT WITH CHECK ((("auth"."uid"() IN ( SELECT "conversations"."created_by"
   FROM "public"."conversations"
  WHERE ("conversations"."id" = "conversation_participants"."conversation_id"))) OR ("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "conversation_participants_select" ON "public"."conversation_participants" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "conversation_participants_update" ON "public"."conversation_participants" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR ("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_insert" ON "public"."conversations" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));
CREATE POLICY "conversations_select" ON "public"."conversations" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversations"."id") AND ("cp"."user_id" = "auth"."uid"())))) OR (("deal_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "conversations"."deal_id") AND ("dm"."user_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "conversations_update" ON "public"."conversations" FOR UPDATE USING ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))))) WITH CHECK ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
ALTER TABLE "public"."counterparty_aliases" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "counterparty_aliases_admin_write" ON "public"."counterparty_aliases" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))));
CREATE POLICY "counterparty_aliases_staff_access" ON "public"."counterparty_aliases" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."dashboard_preferences" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dashboard_preferences_self_manage" ON "public"."dashboard_preferences" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));
ALTER TABLE "public"."deal_commitments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deal_commitments_create" ON "public"."deal_commitments" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "deal_commitments"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "deal_commitments_read" ON "public"."deal_commitments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "deal_commitments"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "deal_commitments"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "deal_commitments_staff_delete" ON "public"."deal_commitments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "deal_commitments_staff_update" ON "public"."deal_commitments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "deal_create" ON "public"."deals" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."deal_memberships" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deal_read" ON "public"."deals" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "deals"."id") AND (("dm"."user_id" = "auth"."uid"()) OR ("dm"."investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids")))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "deal_update" ON "public"."deals" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."director_registry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "director_registry_staff_read" ON "public"."director_registry" FOR SELECT USING ("public"."user_is_staff"());
CREATE POLICY "director_registry_staff_write" ON "public"."director_registry" USING ("public"."user_is_staff"()) WITH CHECK ("public"."user_is_staff"());
ALTER TABLE "public"."distributions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "distributions_read" ON "public"."distributions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "distributions"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "dm_manage" ON "public"."deal_memberships" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "dm_read" ON "public"."deal_memberships" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids")) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
ALTER TABLE "public"."doc_package_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doc_package_items_read" ON "public"."doc_package_items" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."doc_packages" "dp"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "dp"."investor_id")))
  WHERE (("dp"."id" = "doc_package_items"."package_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."doc_packages" "dp"
     JOIN "public"."deal_memberships" "dm" ON (("dm"."deal_id" = "dp"."deal_id")))
  WHERE (("dp"."id" = "doc_package_items"."package_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
ALTER TABLE "public"."doc_packages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doc_packages_read" ON "public"."doc_packages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "doc_packages"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "doc_packages"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "doc_packages_staff_delete" ON "public"."doc_packages" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "doc_packages_staff_insert" ON "public"."doc_packages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "doc_packages_staff_update" ON "public"."doc_packages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."doc_templates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doc_templates_staff" ON "public"."doc_templates" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."document_approvals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."document_folders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."document_publishing_schedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."document_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_investor_published" ON "public"."documents" FOR SELECT TO "authenticated" USING ((("is_published" = true) AND ((("vehicle_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "documents"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"()))))) OR (("owner_investor_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "documents"."owner_investor_id") AND ("iu"."user_id" = "auth"."uid"()))))) OR ("owner_user_id" = "auth"."uid"()) OR (("deal_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "documents"."deal_id") AND ("dm"."user_id" = "auth"."uid"()))))))));
CREATE POLICY "documents_read" ON "public"."documents" FOR SELECT USING (((("entity_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM ("public"."positions" "p"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "p"."investor_id")))
  WHERE (("p"."vehicle_id" = "documents"."entity_id") AND ("iu"."user_id" = "auth"."uid"()))))) OR (("vehicle_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM ("public"."positions" "p"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "p"."investor_id")))
  WHERE (("p"."vehicle_id" = "documents"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"()))))) OR (("deal_id" IS NOT NULL) AND "public"."user_has_deal_access"("deal_id")) OR "public"."user_is_staff"()));
CREATE POLICY "documents_staff_all" ON "public"."documents" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."entity_directors" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_directors_staff_read" ON "public"."entity_directors" FOR SELECT USING ("public"."user_is_staff"());
CREATE POLICY "entity_directors_staff_write" ON "public"."entity_directors" USING ("public"."user_is_staff"()) WITH CHECK ("public"."user_is_staff"());
ALTER TABLE "public"."entity_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_events_staff_read" ON "public"."entity_events" FOR SELECT USING ("public"."user_is_staff"());
CREATE POLICY "entity_events_staff_write" ON "public"."entity_events" USING ("public"."user_is_staff"()) WITH CHECK ("public"."user_is_staff"());
ALTER TABLE "public"."esign_envelopes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "esign_envelopes_staff" ON "public"."esign_envelopes" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."fee_components" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_components_admin_write" ON "public"."fee_components" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))));
CREATE POLICY "fee_components_read" ON "public"."fee_components" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."fee_plans" "fp"
     JOIN "public"."deal_memberships" "dm" ON (("dm"."deal_id" = "fp"."deal_id")))
  WHERE (("fp"."id" = "fee_components"."fee_plan_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "fee_components_read_entitled" ON "public"."fee_components" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."fee_plans" "fp"
  WHERE ("fp"."id" = "fee_components"."fee_plan_id"))));
CREATE POLICY "fee_components_staff_delete" ON "public"."fee_components" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_components_staff_insert" ON "public"."fee_components" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_components_staff_read" ON "public"."fee_components" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_components_staff_update" ON "public"."fee_components" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."fee_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_events_admin_write" ON "public"."fee_events" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))));
CREATE POLICY "fee_events_read" ON "public"."fee_events" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "fee_events"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "fee_events_staff_delete" ON "public"."fee_events" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_events_staff_insert" ON "public"."fee_events" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_events_staff_read" ON "public"."fee_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_events_staff_update" ON "public"."fee_events" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."fee_plans" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_plans_admin_write" ON "public"."fee_plans" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))));
CREATE POLICY "fee_plans_read" ON "public"."fee_plans" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "fee_plans"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "fee_plans_read_entitled" ON "public"."fee_plans" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."deals" "d"
     JOIN "public"."deal_memberships" "dm" ON (("d"."id" = "dm"."deal_id")))
  WHERE (("d"."id" = "fee_plans"."deal_id") AND (("dm"."user_id" = "auth"."uid"()) OR ("dm"."investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids")))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "fee_plans_staff_delete" ON "public"."fee_plans" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_plans_staff_insert" ON "public"."fee_plans" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_plans_staff_read" ON "public"."fee_plans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "fee_plans_staff_update" ON "public"."fee_plans" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "folders_investor_read" ON "public"."document_folders" FOR SELECT TO "authenticated" USING ((("vehicle_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "document_folders"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"()))))));
CREATE POLICY "folders_staff_all" ON "public"."document_folders" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."import_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."introducer_commissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."introducers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "introducers_self" ON "public"."introducers" FOR SELECT USING (("user_id" = "auth"."uid"()));
CREATE POLICY "introducers_staff" ON "public"."introducers" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."introductions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "introductions_staff" ON "public"."introductions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."investor_terms" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor_terms_admin_write" ON "public"."investor_terms" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))));
CREATE POLICY "investor_terms_read" ON "public"."investor_terms" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_terms"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "investor_terms"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "investor_terms_staff_access" ON "public"."investor_terms" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "investor_terms_staff_delete" ON "public"."investor_terms" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "investor_terms_staff_insert" ON "public"."investor_terms" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "investor_terms_staff_update" ON "public"."investor_terms" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "investor_users_read" ON "public"."investors" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investors"."id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
ALTER TABLE "public"."investors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invite_links" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invite_links_staff" ON "public"."invite_links" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."invoice_lines" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_lines_read" ON "public"."invoice_lines" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."invoices" "i"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "i"."investor_id")))
  WHERE (("i"."id" = "invoice_lines"."invoice_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_read" ON "public"."invoices" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "invoices"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "invoices_staff_delete" ON "public"."invoices" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "invoices_staff_insert" ON "public"."invoices" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "invoices_staff_update" ON "public"."invoices" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."message_reads" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "message_reads_insert" ON "public"."message_reads" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));
CREATE POLICY "message_reads_select" ON "public"."message_reads" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = ( SELECT "messages"."conversation_id"
           FROM "public"."messages"
          WHERE ("messages"."id" = "message_reads"."message_id"))) AND ("cp"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_insert" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))))));
CREATE POLICY "messages_select" ON "public"."messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "messages_update" ON "public"."messages" FOR UPDATE USING ((("sender_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))))) WITH CHECK ((("sender_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_read" ON "public"."payments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "payments"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "payments_staff_delete" ON "public"."payments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "payments_staff_insert" ON "public"."payments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "payments_staff_update" ON "public"."payments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."performance_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "performance_snapshots_investor_read" ON "public"."performance_snapshots" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "performance_snapshots"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_ops'::"public"."user_role")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_rm'::"public"."user_role"))))));
CREATE POLICY "positions_investor_read" ON "public"."positions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "positions"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
ALTER TABLE "public"."reconciliation_matches" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reconciliation_matches_admin_write" ON "public"."reconciliation_matches" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role")))));
CREATE POLICY "reconciliation_matches_staff_access" ON "public"."reconciliation_matches" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."reconciliations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reconciliations_staff" ON "public"."reconciliations" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."report_requests" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_requests_read" ON "public"."report_requests" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "report_requests"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR ("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
ALTER TABLE "public"."request_tickets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "request_tickets_insert_creator" ON "public"."request_tickets" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));
CREATE POLICY "request_tickets_read" ON "public"."request_tickets" FOR SELECT USING ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "request_tickets_update_staff" ON "public"."request_tickets" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."reservation_lot_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservation_lot_items_read" ON "public"."reservation_lot_items" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."reservations" "r"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "r"."investor_id")))
  WHERE (("r"."id" = "reservation_lot_items"."reservation_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."reservations" "r"
     JOIN "public"."deal_memberships" "dm" ON (("dm"."deal_id" = "r"."deal_id")))
  WHERE (("r"."id" = "reservation_lot_items"."reservation_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
ALTER TABLE "public"."reservations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_create" ON "public"."reservations" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "reservations"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "reservations_read" ON "public"."reservations" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "reservations"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "reservations"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "reservations_staff_delete" ON "public"."reservations" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "reservations_staff_update" ON "public"."reservations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "schedule_staff_all" ON "public"."document_publishing_schedule" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."share_lots" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "share_lots_read" ON "public"."share_lots" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "share_lots"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "share_lots_staff_delete" ON "public"."share_lots" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "share_lots_staff_insert" ON "public"."share_lots" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "share_lots_staff_update" ON "public"."share_lots" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."share_sources" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "share_sources_staff" ON "public"."share_sources" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "subscriptions_read" ON "public"."subscriptions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "subscriptions"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
ALTER TABLE "public"."suggested_matches" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suggested_matches_staff_access" ON "public"."suggested_matches" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."task_actions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_actions_read" ON "public"."task_actions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."tasks" "t"
  WHERE (("t"."id" = "task_actions"."task_id") AND (("t"."owner_user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."investor_users" "iu"
          WHERE (("iu"."investor_id" = "t"."owner_investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
           FROM "public"."profiles" "p"
          WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))))))));
CREATE POLICY "task_actions_staff_write" ON "public"."task_actions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."task_dependencies" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_dependencies_read" ON "public"."task_dependencies" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."tasks" "t"
  WHERE (("t"."id" = "task_dependencies"."task_id") AND (("t"."owner_user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."investor_users" "iu"
          WHERE (("iu"."investor_id" = "t"."owner_investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
           FROM "public"."profiles" "p"
          WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))))))));
CREATE POLICY "task_dependencies_staff_write" ON "public"."task_dependencies" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."task_templates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_templates_read" ON "public"."task_templates" FOR SELECT USING (("auth"."uid"() IS NOT NULL));
CREATE POLICY "task_templates_staff_write" ON "public"."task_templates" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_investor_read" ON "public"."tasks" FOR SELECT USING ((("owner_user_id" = "auth"."uid"()) OR (("owner_investor_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "tasks"."owner_investor_id") AND ("iu"."user_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "tasks_read" ON "public"."tasks" FOR SELECT USING ((("owner_user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "tasks_staff_delete" ON "public"."tasks" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));
CREATE POLICY "tasks_staff_insert" ON "public"."tasks" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));
CREATE POLICY "tasks_update" ON "public"."tasks" FOR UPDATE USING ((("owner_user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "tasks"."owner_investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
ALTER TABLE "public"."term_sheets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "term_sheets_read" ON "public"."term_sheets" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "term_sheets"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "term_sheets"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))));
CREATE POLICY "term_sheets_staff_delete" ON "public"."term_sheets" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "term_sheets_staff_insert" ON "public"."term_sheets" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
CREATE POLICY "term_sheets_staff_update" ON "public"."term_sheets" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));
ALTER TABLE "public"."valuations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "valuations_read" ON "public"."valuations" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "valuations"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
ALTER TABLE "public"."vehicles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_investor_read" ON "public"."vehicles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."positions" "p"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "p"."investor_id")))
  WHERE (("p"."vehicle_id" = "vehicles"."id") AND ("iu"."user_id" = "auth"."uid"())))));
CREATE POLICY "vehicles_read" ON "public"."vehicles" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "vehicles"."id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "vehicles_read_entitled" ON "public"."vehicles" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."deals" "d"
     JOIN "public"."deal_memberships" "dm" ON (("d"."id" = "dm"."deal_id")))
  WHERE (("d"."vehicle_id" = "vehicles"."id") AND (("dm"."user_id" = "auth"."uid"()) OR ("dm"."investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids")))))) OR (EXISTS ( SELECT 1
   FROM "public"."subscriptions" "s"
  WHERE (("s"."vehicle_id" = "vehicles"."id") AND ("s"."investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids"))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));
CREATE POLICY "vehicles_staff_read" ON "public"."vehicles" FOR SELECT USING ("public"."user_is_staff"());
CREATE POLICY "vehicles_staff_write" ON "public"."vehicles" USING ("public"."user_is_staff"()) WITH CHECK ("public"."user_is_staff"());
CREATE POLICY "versions_investor_read" ON "public"."document_versions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."documents" "d"
  WHERE (("d"."id" = "document_versions"."document_id") AND ("d"."is_published" = true) AND ((("d"."vehicle_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM ("public"."subscriptions" "s"
             JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
          WHERE (("s"."vehicle_id" = "d"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"()))))) OR (("d"."owner_investor_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM "public"."investor_users" "iu"
          WHERE (("iu"."investor_id" = "d"."owner_investor_id") AND ("iu"."user_id" = "auth"."uid"()))))) OR ("d"."owner_user_id" = "auth"."uid"()) OR (("d"."deal_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM "public"."deal_memberships" "dm"
          WHERE (("dm"."deal_id" = "d"."deal_id") AND ("dm"."user_id" = "auth"."uid"()))))))))));
CREATE POLICY "versions_staff_all" ON "public"."document_versions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));
ALTER TABLE "public"."workflow_runs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workflow_runs_insert_allowed" ON "public"."workflow_runs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."workflows" "w"
     JOIN "public"."profiles" "p" ON (("p"."id" = "auth"."uid"())))
  WHERE (("w"."id" = "workflow_runs"."workflow_id") AND (("p"."role")::"text" ~~ 'staff_%'::"text") AND (("w"."required_title" IS NULL) OR ("w"."required_title" @> ARRAY["p"."title"]))))));
ALTER TABLE "public"."workflows" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workflows_read_staff" ON "public"."workflows" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."accrue_quarterly_management_fees"("p_deal_id" "uuid", "p_quarter_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."accrue_quarterly_management_fees"("p_deal_id" "uuid", "p_quarter_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accrue_quarterly_management_fees"("p_deal_id" "uuid", "p_quarter_end_date" "date") TO "service_role";
GRANT ALL ON FUNCTION "public"."append_audit_hash"() TO "anon";
GRANT ALL ON FUNCTION "public"."append_audit_hash"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."append_audit_hash"() TO "service_role";
GRANT ALL ON FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."auto_assign_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_assign_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_assign_approval"() TO "service_role";
GRANT ALL ON FUNCTION "public"."calculate_investor_kpis"("investor_ids" "uuid"[], "as_of_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_investor_kpis"("investor_ids" "uuid"[], "as_of_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_investor_kpis"("investor_ids" "uuid"[], "as_of_date" "date") TO "service_role";
GRANT ALL ON FUNCTION "public"."calculate_investor_kpis_with_deals"("investor_ids" "uuid"[], "as_of_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_investor_kpis_with_deals"("investor_ids" "uuid"[], "as_of_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_investor_kpis_with_deals"("investor_ids" "uuid"[], "as_of_date" "date") TO "service_role";
GRANT ALL ON FUNCTION "public"."calculate_management_fee"("p_base_amount" numeric, "p_rate_bps" integer, "p_period_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_management_fee"("p_base_amount" numeric, "p_rate_bps" integer, "p_period_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_management_fee"("p_base_amount" numeric, "p_rate_bps" integer, "p_period_days" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."calculate_performance_fee"("p_contributed_capital" numeric, "p_exit_proceeds" numeric, "p_carry_rate_bps" integer, "p_hurdle_rate_bps" integer, "p_years_held" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_performance_fee"("p_contributed_capital" numeric, "p_exit_proceeds" numeric, "p_carry_rate_bps" integer, "p_hurdle_rate_bps" integer, "p_years_held" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_performance_fee"("p_contributed_capital" numeric, "p_exit_proceeds" numeric, "p_carry_rate_bps" integer, "p_hurdle_rate_bps" integer, "p_years_held" numeric) TO "service_role";
GRANT ALL ON FUNCTION "public"."calculate_subscription_fee"("p_commitment_amount" numeric, "p_rate_bps" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_subscription_fee"("p_commitment_amount" numeric, "p_rate_bps" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_subscription_fee"("p_commitment_amount" numeric, "p_rate_bps" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."check_auto_approval_criteria"("p_approval_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_auto_approval_criteria"("p_approval_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_auto_approval_criteria"("p_approval_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."create_commitment_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_commitment_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_commitment_approval"() TO "service_role";
GRANT ALL ON FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."create_reservation_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_reservation_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_reservation_approval"() TO "service_role";
GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";
GRANT ALL ON FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."ensure_message_read_receipt"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_message_read_receipt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_message_read_receipt"() TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_compute_fee_events"("p_deal_id" "uuid", "p_as_of_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_compute_fee_events"("p_deal_id" "uuid", "p_as_of_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_compute_fee_events"("p_deal_id" "uuid", "p_as_of_date" "date") TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_deal_inventory_summary"("p_deal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_deal_inventory_summary"("p_deal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_deal_inventory_summary"("p_deal_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_expire_reservations"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_expire_reservations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_expire_reservations"() TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_finalize_allocation"("p_reservation_id" "uuid", "p_approver_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_finalize_allocation"("p_reservation_id" "uuid", "p_approver_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_finalize_allocation"("p_reservation_id" "uuid", "p_approver_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_invoice_fees"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_up_to_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_invoice_fees"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_up_to_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_invoice_fees"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_up_to_date" "date") TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_reserve_inventory"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_requested_units" numeric, "p_proposed_unit_price" numeric, "p_hold_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fn_reserve_inventory"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_requested_units" numeric, "p_proposed_unit_price" numeric, "p_hold_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_reserve_inventory"("p_deal_id" "uuid", "p_investor_id" "uuid", "p_requested_units" numeric, "p_proposed_unit_price" numeric, "p_hold_minutes" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_folder_path"("p_folder_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_folder_path"("p_folder_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_folder_path"("p_folder_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_investor_capital_summary"("p_investor_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_investor_capital_summary"("p_investor_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_investor_capital_summary"("p_investor_ids" "uuid"[]) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_investor_kpi_details"("investor_ids" "uuid"[], "kpi_type" "text", "as_of_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_investor_kpi_details"("investor_ids" "uuid"[], "kpi_type" "text", "as_of_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_investor_kpi_details"("investor_ids" "uuid"[], "kpi_type" "text", "as_of_date" "date") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_investor_vehicle_breakdown"("investor_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_investor_vehicle_breakdown"("investor_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_investor_vehicle_breakdown"("investor_ids" "uuid"[]) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_latest_valuations"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_valuations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_valuations"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_my_investor_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_investor_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_investor_ids"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_reconciliation_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_reconciliation_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reconciliation_summary"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_task_progress_by_category"("p_user_id" "uuid", "p_investor_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_task_progress_by_category"("p_user_id" "uuid", "p_investor_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_task_progress_by_category"("p_user_id" "uuid", "p_investor_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"("p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."has_document_access"("p_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_document_access"("p_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_document_access"("p_document_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."has_vehicle_access"("p_vehicle_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_vehicle_access"("p_vehicle_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_vehicle_access"("p_vehicle_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."log_approval_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_approval_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_approval_change"() TO "service_role";
GRANT ALL ON FUNCTION "public"."log_audit_event"("p_event_type" "text", "p_action" "text", "p_actor_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_name" "text", "p_action_details" "jsonb", "p_before" "jsonb", "p_after" "jsonb", "p_risk_level" "text", "p_compliance_flag" boolean, "p_retention_category" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_audit_event"("p_event_type" "text", "p_action" "text", "p_actor_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_name" "text", "p_action_details" "jsonb", "p_before" "jsonb", "p_after" "jsonb", "p_risk_level" "text", "p_compliance_flag" boolean, "p_retention_category" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_audit_event"("p_event_type" "text", "p_action" "text", "p_actor_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_name" "text", "p_action_details" "jsonb", "p_before" "jsonb", "p_after" "jsonb", "p_risk_level" "text", "p_compliance_flag" boolean, "p_retention_category" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."mark_compliance_review"("p_audit_log_id" "uuid", "p_reviewer_id" "uuid", "p_status" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_compliance_review"("p_audit_log_id" "uuid", "p_reviewer_id" "uuid", "p_status" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_compliance_review"("p_audit_log_id" "uuid", "p_reviewer_id" "uuid", "p_status" "text", "p_notes" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."mark_conversation_read"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_conversation_read"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_conversation_read"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."mark_overdue_tasks"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_overdue_tasks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_overdue_tasks"() TO "service_role";
GRANT ALL ON FUNCTION "public"."prevent_audit_log_modification"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_audit_log_modification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_audit_log_modification"() TO "service_role";
GRANT ALL ON FUNCTION "public"."publish_scheduled_documents"() TO "anon";
GRANT ALL ON FUNCTION "public"."publish_scheduled_documents"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."publish_scheduled_documents"() TO "service_role";
GRANT ALL ON FUNCTION "public"."run_auto_match"() TO "anon";
GRANT ALL ON FUNCTION "public"."run_auto_match"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_auto_match"() TO "service_role";
GRANT ALL ON FUNCTION "public"."set_approval_sla_deadline"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_approval_sla_deadline"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_approval_sla_deadline"() TO "service_role";
GRANT ALL ON FUNCTION "public"."set_workflows_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_workflows_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_workflows_updated_at"() TO "service_role";
GRANT ALL ON FUNCTION "public"."trg_conversation_set_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_conversation_set_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_conversation_set_owner"() TO "service_role";
GRANT ALL ON FUNCTION "public"."trg_refresh_conversation_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_refresh_conversation_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_refresh_conversation_metadata"() TO "service_role";
GRANT ALL ON FUNCTION "public"."trg_touch_conversation_participant"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_touch_conversation_participant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_touch_conversation_participant"() TO "service_role";
GRANT ALL ON FUNCTION "public"."unlock_dependent_tasks"() TO "anon";
GRANT ALL ON FUNCTION "public"."unlock_dependent_tasks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unlock_dependent_tasks"() TO "service_role";
GRANT ALL ON FUNCTION "public"."unpublish_expired_documents"() TO "anon";
GRANT ALL ON FUNCTION "public"."unpublish_expired_documents"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unpublish_expired_documents"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
GRANT ALL ON FUNCTION "public"."user_has_deal_access"("target_deal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_deal_access"("target_deal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_deal_access"("target_deal_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."user_is_staff"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_staff"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_staff"() TO "service_role";
GRANT ALL ON FUNCTION "public"."user_linked_to_investor"("target_investor_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_linked_to_investor"("target_investor_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_linked_to_investor"("target_investor_id" "uuid") TO "service_role";
GRANT ALL ON TABLE "public"."activity_feed" TO "anon";
GRANT ALL ON TABLE "public"."activity_feed" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_feed" TO "service_role";
GRANT ALL ON TABLE "public"."allocation_lot_items" TO "anon";
GRANT ALL ON TABLE "public"."allocation_lot_items" TO "authenticated";
GRANT ALL ON TABLE "public"."allocation_lot_items" TO "service_role";
GRANT ALL ON TABLE "public"."allocations" TO "anon";
GRANT ALL ON TABLE "public"."allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."allocations" TO "service_role";
GRANT ALL ON TABLE "public"."approval_history" TO "anon";
GRANT ALL ON TABLE "public"."approval_history" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_history" TO "service_role";
GRANT ALL ON TABLE "public"."approvals" TO "anon";
GRANT ALL ON TABLE "public"."approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."approvals" TO "service_role";
GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";
GRANT ALL ON TABLE "public"."audit_log_hash_chain" TO "anon";
GRANT ALL ON TABLE "public"."audit_log_hash_chain" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log_hash_chain" TO "service_role";
GRANT ALL ON SEQUENCE "public"."audit_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."audit_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."audit_log_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";
GRANT ALL ON TABLE "public"."audit_report_templates" TO "anon";
GRANT ALL ON TABLE "public"."audit_report_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_report_templates" TO "service_role";
GRANT ALL ON TABLE "public"."bank_transactions" TO "anon";
GRANT ALL ON TABLE "public"."bank_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_transactions" TO "service_role";
GRANT ALL ON TABLE "public"."capital_calls" TO "anon";
GRANT ALL ON TABLE "public"."capital_calls" TO "authenticated";
GRANT ALL ON TABLE "public"."capital_calls" TO "service_role";
GRANT ALL ON TABLE "public"."cashflows" TO "anon";
GRANT ALL ON TABLE "public"."cashflows" TO "authenticated";
GRANT ALL ON TABLE "public"."cashflows" TO "service_role";
GRANT ALL ON TABLE "public"."compliance_alerts" TO "anon";
GRANT ALL ON TABLE "public"."compliance_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_alerts" TO "service_role";
GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";
GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";
GRANT ALL ON TABLE "public"."counterparty_aliases" TO "anon";
GRANT ALL ON TABLE "public"."counterparty_aliases" TO "authenticated";
GRANT ALL ON TABLE "public"."counterparty_aliases" TO "service_role";
GRANT ALL ON TABLE "public"."dashboard_preferences" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_preferences" TO "service_role";
GRANT ALL ON TABLE "public"."deal_commitments" TO "anon";
GRANT ALL ON TABLE "public"."deal_commitments" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_commitments" TO "service_role";
GRANT ALL ON TABLE "public"."deal_memberships" TO "anon";
GRANT ALL ON TABLE "public"."deal_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_memberships" TO "service_role";
GRANT ALL ON TABLE "public"."deals" TO "anon";
GRANT ALL ON TABLE "public"."deals" TO "authenticated";
GRANT ALL ON TABLE "public"."deals" TO "service_role";
GRANT ALL ON TABLE "public"."director_registry" TO "anon";
GRANT ALL ON TABLE "public"."director_registry" TO "authenticated";
GRANT ALL ON TABLE "public"."director_registry" TO "service_role";
GRANT ALL ON TABLE "public"."distributions" TO "anon";
GRANT ALL ON TABLE "public"."distributions" TO "authenticated";
GRANT ALL ON TABLE "public"."distributions" TO "service_role";
GRANT ALL ON TABLE "public"."doc_package_items" TO "anon";
GRANT ALL ON TABLE "public"."doc_package_items" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_package_items" TO "service_role";
GRANT ALL ON TABLE "public"."doc_packages" TO "anon";
GRANT ALL ON TABLE "public"."doc_packages" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_packages" TO "service_role";
GRANT ALL ON TABLE "public"."doc_templates" TO "anon";
GRANT ALL ON TABLE "public"."doc_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_templates" TO "service_role";
GRANT ALL ON TABLE "public"."document_approvals" TO "anon";
GRANT ALL ON TABLE "public"."document_approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."document_approvals" TO "service_role";
GRANT ALL ON TABLE "public"."document_folders" TO "anon";
GRANT ALL ON TABLE "public"."document_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."document_folders" TO "service_role";
GRANT ALL ON TABLE "public"."document_publishing_schedule" TO "anon";
GRANT ALL ON TABLE "public"."document_publishing_schedule" TO "authenticated";
GRANT ALL ON TABLE "public"."document_publishing_schedule" TO "service_role";
GRANT ALL ON TABLE "public"."document_versions" TO "anon";
GRANT ALL ON TABLE "public"."document_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."document_versions" TO "service_role";
GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";
GRANT ALL ON TABLE "public"."entity_directors" TO "anon";
GRANT ALL ON TABLE "public"."entity_directors" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_directors" TO "service_role";
GRANT ALL ON TABLE "public"."entity_events" TO "anon";
GRANT ALL ON TABLE "public"."entity_events" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_events" TO "service_role";
GRANT ALL ON TABLE "public"."esign_envelopes" TO "anon";
GRANT ALL ON TABLE "public"."esign_envelopes" TO "authenticated";
GRANT ALL ON TABLE "public"."esign_envelopes" TO "service_role";
GRANT ALL ON TABLE "public"."fee_components" TO "anon";
GRANT ALL ON TABLE "public"."fee_components" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_components" TO "service_role";
GRANT ALL ON TABLE "public"."fee_events" TO "anon";
GRANT ALL ON TABLE "public"."fee_events" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_events" TO "service_role";
GRANT ALL ON TABLE "public"."fee_plans" TO "anon";
GRANT ALL ON TABLE "public"."fee_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_plans" TO "service_role";
GRANT ALL ON TABLE "public"."import_batches" TO "anon";
GRANT ALL ON TABLE "public"."import_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."import_batches" TO "service_role";
GRANT ALL ON TABLE "public"."introducer_commissions" TO "anon";
GRANT ALL ON TABLE "public"."introducer_commissions" TO "authenticated";
GRANT ALL ON TABLE "public"."introducer_commissions" TO "service_role";
GRANT ALL ON TABLE "public"."introducers" TO "anon";
GRANT ALL ON TABLE "public"."introducers" TO "authenticated";
GRANT ALL ON TABLE "public"."introducers" TO "service_role";
GRANT ALL ON TABLE "public"."introductions" TO "anon";
GRANT ALL ON TABLE "public"."introductions" TO "authenticated";
GRANT ALL ON TABLE "public"."introductions" TO "service_role";
GRANT ALL ON TABLE "public"."investor_terms" TO "anon";
GRANT ALL ON TABLE "public"."investor_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_terms" TO "service_role";
GRANT ALL ON TABLE "public"."investor_users" TO "anon";
GRANT ALL ON TABLE "public"."investor_users" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_users" TO "service_role";
GRANT ALL ON TABLE "public"."investors" TO "anon";
GRANT ALL ON TABLE "public"."investors" TO "authenticated";
GRANT ALL ON TABLE "public"."investors" TO "service_role";
GRANT ALL ON TABLE "public"."invite_links" TO "anon";
GRANT ALL ON TABLE "public"."invite_links" TO "authenticated";
GRANT ALL ON TABLE "public"."invite_links" TO "service_role";
GRANT ALL ON TABLE "public"."invoice_lines" TO "anon";
GRANT ALL ON TABLE "public"."invoice_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_lines" TO "service_role";
GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";
GRANT ALL ON TABLE "public"."message_reads" TO "anon";
GRANT ALL ON TABLE "public"."message_reads" TO "authenticated";
GRANT ALL ON TABLE "public"."message_reads" TO "service_role";
GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";
GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";
GRANT ALL ON TABLE "public"."performance_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."performance_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_snapshots" TO "service_role";
GRANT ALL ON TABLE "public"."positions" TO "anon";
GRANT ALL ON TABLE "public"."positions" TO "authenticated";
GRANT ALL ON TABLE "public"."positions" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."reconciliation_matches" TO "anon";
GRANT ALL ON TABLE "public"."reconciliation_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."reconciliation_matches" TO "service_role";
GRANT ALL ON TABLE "public"."reconciliations" TO "anon";
GRANT ALL ON TABLE "public"."reconciliations" TO "authenticated";
GRANT ALL ON TABLE "public"."reconciliations" TO "service_role";
GRANT ALL ON TABLE "public"."report_requests" TO "anon";
GRANT ALL ON TABLE "public"."report_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."report_requests" TO "service_role";
GRANT ALL ON TABLE "public"."request_tickets" TO "anon";
GRANT ALL ON TABLE "public"."request_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."request_tickets" TO "service_role";
GRANT ALL ON TABLE "public"."reservation_lot_items" TO "anon";
GRANT ALL ON TABLE "public"."reservation_lot_items" TO "authenticated";
GRANT ALL ON TABLE "public"."reservation_lot_items" TO "service_role";
GRANT ALL ON TABLE "public"."reservations" TO "anon";
GRANT ALL ON TABLE "public"."reservations" TO "authenticated";
GRANT ALL ON TABLE "public"."reservations" TO "service_role";
GRANT ALL ON TABLE "public"."share_lots" TO "anon";
GRANT ALL ON TABLE "public"."share_lots" TO "authenticated";
GRANT ALL ON TABLE "public"."share_lots" TO "service_role";
GRANT ALL ON TABLE "public"."share_sources" TO "anon";
GRANT ALL ON TABLE "public"."share_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."share_sources" TO "service_role";
GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";
GRANT ALL ON TABLE "public"."suggested_matches" TO "anon";
GRANT ALL ON TABLE "public"."suggested_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."suggested_matches" TO "service_role";
GRANT ALL ON TABLE "public"."task_actions" TO "anon";
GRANT ALL ON TABLE "public"."task_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."task_actions" TO "service_role";
GRANT ALL ON TABLE "public"."task_dependencies" TO "anon";
GRANT ALL ON TABLE "public"."task_dependencies" TO "authenticated";
GRANT ALL ON TABLE "public"."task_dependencies" TO "service_role";
GRANT ALL ON TABLE "public"."task_templates" TO "anon";
GRANT ALL ON TABLE "public"."task_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."task_templates" TO "service_role";
GRANT ALL ON TABLE "public"."term_sheets" TO "anon";
GRANT ALL ON TABLE "public"."term_sheets" TO "authenticated";
GRANT ALL ON TABLE "public"."term_sheets" TO "service_role";
GRANT ALL ON TABLE "public"."valuations" TO "anon";
GRANT ALL ON TABLE "public"."valuations" TO "authenticated";
GRANT ALL ON TABLE "public"."valuations" TO "service_role";
GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";
GRANT ALL ON TABLE "public"."workflow_run_logs" TO "anon";
GRANT ALL ON TABLE "public"."workflow_run_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_run_logs" TO "service_role";
GRANT ALL ON TABLE "public"."workflow_runs" TO "anon";
GRANT ALL ON TABLE "public"."workflow_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_runs" TO "service_role";
GRANT ALL ON TABLE "public"."workflows" TO "anon";
GRANT ALL ON TABLE "public"."workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."workflows" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
RESET ALL;
