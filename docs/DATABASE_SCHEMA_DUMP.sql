


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'Backfill migration completed: All existing vehicles now have default folder structures';



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


CREATE TYPE "public"."entity_status" AS ENUM (
    'LIVE',
    'CLOSED',
    'TBD'
);


ALTER TYPE "public"."entity_status" OWNER TO "postgres";


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
    'other',
    'bd_fee',
    'finra_fee'
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


CREATE TYPE "public"."flag_severity" AS ENUM (
    'critical',
    'warning',
    'info',
    'success'
);


ALTER TYPE "public"."flag_severity" OWNER TO "postgres";


CREATE TYPE "public"."flag_type" AS ENUM (
    'compliance_issue',
    'missing_documents',
    'expiring_documents',
    'reporting_due',
    'approval_required',
    'action_required',
    'information_needed',
    'review_required'
);


ALTER TYPE "public"."flag_type" OWNER TO "postgres";


CREATE TYPE "public"."folder_type" AS ENUM (
    'kyc',
    'legal',
    'redemption_closure',
    'financial_statements',
    'tax_documents',
    'board_minutes',
    'investor_agreements',
    'compliance',
    'correspondence',
    'other'
);


ALTER TYPE "public"."folder_type" OWNER TO "postgres";


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


CREATE TYPE "public"."reporting_type" AS ENUM (
    'Not Required',
    'Company Only',
    'Online only',
    'Company + Online'
);


ALTER TYPE "public"."reporting_type" OWNER TO "postgres";


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


CREATE TYPE "public"."stakeholder_role" AS ENUM (
    'lawyer',
    'accountant',
    'administrator',
    'auditor',
    'strategic_partner',
    'director',
    'other'
);


ALTER TYPE "public"."stakeholder_role" OWNER TO "postgres";


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
    'other',
    'real_estate',
    'private_equity',
    'venture_capital'
);


ALTER TYPE "public"."vehicle_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accrue_quarterly_management_fees"("p_deal_id" "uuid", "p_quarter_end_date" "date") RETURNS TABLE("investor_id" "uuid", "fee_amount" numeric, "fee_event_id" "uuid")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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

        -- FIXED: Removed deal_commitments reference, use allocation units * unit_price instead
        IF v_component.base_calculation = 'commitment' OR v_component.calc_method = 'percent_of_commitment' THEN
          -- Use allocation amount as base since commitments table is deprecated
          SELECT COALESCE(a.units * a.unit_price, 0)
          INTO v_base
          FROM public.allocations a
          WHERE a.deal_id = p_deal_id
            AND a.investor_id = v_allocation.investor_id
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


COMMENT ON FUNCTION "public"."accrue_quarterly_management_fees"("p_deal_id" "uuid", "p_quarter_end_date" "date") IS 'Accrues quarterly management fees. Updated to remove dependency on deprecated deal_commitments table.';



CREATE OR REPLACE FUNCTION "public"."aggregate_fee_events_by_date"("start_date" timestamp with time zone) RETURNS TABLE("date" "text", "amount" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT 
    DATE(created_at)::text as date,
    SUM(computed_amount) as amount
  FROM fee_events
  WHERE created_at >= start_date
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) ASC;
$$;


ALTER FUNCTION "public"."aggregate_fee_events_by_date"("start_date" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."aggregate_fee_events_by_date"("start_date" timestamp with time zone) IS 'Aggregates fee events by date only, summing all amounts per day regardless of type';



CREATE OR REPLACE FUNCTION "public"."aggregate_subscriptions_by_date"("start_date" timestamp with time zone) RETURNS TABLE("date" "text", "amount" numeric)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT 
    DATE(created_at)::text as date,
    SUM(commitment) as amount
  FROM subscriptions
  WHERE created_at >= start_date
    AND commitment IS NOT NULL
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) ASC;
$$;


ALTER FUNCTION "public"."aggregate_subscriptions_by_date"("start_date" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."aggregate_subscriptions_by_date"("start_date" timestamp with time zone) IS 'Aggregates subscriptions by date only, summing all commitments per day regardless of status';



CREATE OR REPLACE FUNCTION "public"."append_audit_hash"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_match record;
  v_invoice record;
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
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN 'paid'::invoice_status_enum
        ELSE 'partially_paid'::invoice_status_enum
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
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_assigned_to uuid;
  v_investor_id uuid;
  v_julien_id uuid := '44965e29-c986-4d2e-84e2-4965ed27bd8f'; -- Julien Machot (cto@versoholdings.com)
BEGIN
  -- Only auto-assign on insert if not manually assigned
  IF TG_OP = 'INSERT' AND NEW.assigned_to IS NULL THEN

    -- Extract investor_id from entity_metadata if available
    IF NEW.entity_metadata ? 'investor_id' THEN
      v_investor_id := (NEW.entity_metadata->>'investor_id')::uuid;
    END IF;

    -- SPECIAL CASE: Always assign deal interests and deal subscriptions to Julien
    IF NEW.entity_type IN ('deal_interest', 'deal_subscription') THEN
      NEW.assigned_to := v_julien_id;
      RETURN NEW;
    END IF;

    -- Relationship-driven items route to the relationship management pod
    IF NEW.entity_type IN (
      'commitment',
      'deal_commitment',
      'reservation',
      'allocation'
    ) THEN
      -- Try to get an RM (round-robin via random until account ownership lands)
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_rm'
      ORDER BY random()
      LIMIT 1;

    -- Compliance profile/KYC changes
    ELSIF NEW.entity_type IN ('kyc_change', 'profile_update') THEN
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_admin' AND title = 'compliance'
      ORDER BY random()
      LIMIT 1;

    -- Liquidity / cash flow events
    ELSIF NEW.entity_type = 'withdrawal' THEN
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE title = 'bizops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    -- Fallback: assign to ops pool
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


COMMENT ON FUNCTION "public"."auto_assign_approval"() IS 'Auto-assigns approvals based on entity type. Deal interests and subscriptions → Julien Machot. Other types use role-based assignment.';



CREATE OR REPLACE FUNCTION "public"."auto_commit_subscription_on_task_complete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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

  -- Get subscription ID from task instructions or related_entity_id
  v_subscription_id := COALESCE(
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
      action_details
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


ALTER FUNCTION "public"."auto_commit_subscription_on_task_complete"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_commit_subscription_on_task_complete"() IS 'Automatically changes subscription status to committed when contract signing task is completed';



CREATE OR REPLACE FUNCTION "public"."auto_create_deal_folder"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_vehicle_name text;
  v_vehicle_root_folder_id uuid;
  v_deals_folder_id uuid;
  v_deal_root_folder_id uuid;
  v_deal_subfolders text[] := ARRAY['Term Sheets', 'Data Room', 'Subscription Documents', 'Legal Documents', 'Financial Reports', 'Due Diligence'];
  v_subfolder text;
BEGIN
  -- Only proceed if deal has a vehicle_id
  IF NEW.vehicle_id IS NULL THEN
    RAISE NOTICE 'Deal % has no vehicle_id, skipping folder creation', NEW.id;
    RETURN NEW;
  END IF;

  -- Get vehicle name
  SELECT name INTO v_vehicle_name
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  IF v_vehicle_name IS NULL THEN
    RAISE WARNING 'Vehicle not found for deal %', NEW.id;
    RETURN NEW;
  END IF;

  -- Find the vehicle's root folder
  SELECT id INTO v_vehicle_root_folder_id
  FROM document_folders
  WHERE vehicle_id = NEW.vehicle_id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  -- If vehicle doesn't have folders yet, create them first
  IF v_vehicle_root_folder_id IS NULL THEN
    PERFORM auto_create_vehicle_folders_for_existing(NEW.vehicle_id, NEW.created_by);

    -- Get the newly created root folder
    SELECT id INTO v_vehicle_root_folder_id
    FROM document_folders
    WHERE vehicle_id = NEW.vehicle_id
      AND folder_type = 'vehicle_root'
    LIMIT 1;
  END IF;

  -- Find the "Deals" folder for this vehicle
  SELECT id INTO v_deals_folder_id
  FROM document_folders
  WHERE vehicle_id = NEW.vehicle_id
    AND parent_folder_id = v_vehicle_root_folder_id
    AND name = 'Deals'
    AND folder_type = 'category'
  LIMIT 1;

  -- If "Deals" folder doesn't exist, create it
  IF v_deals_folder_id IS NULL THEN
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_vehicle_root_folder_id,
      'Deals',
      '/' || v_vehicle_name || '/Deals',
      NEW.vehicle_id,
      'category',
      NEW.created_by,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_deals_folder_id;
  END IF;

  -- Check if deal folder already exists (prevent duplicates)
  SELECT id INTO v_deal_root_folder_id
  FROM document_folders
  WHERE parent_folder_id = v_deals_folder_id
    AND name = NEW.name
  LIMIT 1;

  IF v_deal_root_folder_id IS NOT NULL THEN
    RAISE NOTICE 'Deal folder already exists for: %', NEW.name;
    RETURN NEW;
  END IF;

  -- Create deal-specific folder under /Deals
  INSERT INTO document_folders (
    id,
    parent_folder_id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_deals_folder_id,
    NEW.name,
    '/' || v_vehicle_name || '/Deals/' || NEW.name,
    NEW.vehicle_id,
    'custom',  -- Deal folders are custom type
    NEW.created_by,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_deal_root_folder_id;

  -- Create deal subfolders
  FOREACH v_subfolder IN ARRAY v_deal_subfolders
  LOOP
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_deal_root_folder_id,
      v_subfolder,
      '/' || v_vehicle_name || '/Deals/' || NEW.name || '/' || v_subfolder,
      NEW.vehicle_id,
      'custom',
      NEW.created_by,
      NOW(),
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Created folder structure for deal: %', NEW.name;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_deal_folder"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_create_deal_folder"() IS 'Trigger function that creates deal-specific folder structure when a new deal is inserted';



CREATE OR REPLACE FUNCTION "public"."auto_create_deal_folder_for_existing"("p_deal_id" "uuid", "p_created_by" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_deal_name text;
  v_vehicle_id uuid;
  v_vehicle_name text;
  v_vehicle_root_folder_id uuid;
  v_deals_folder_id uuid;
  v_deal_root_folder_id uuid;
  v_deal_subfolders text[] := ARRAY['Term Sheets', 'Data Room', 'Subscription Documents', 'Legal Documents', 'Financial Reports', 'Due Diligence'];
  v_subfolder text;
  v_creator_id uuid;
BEGIN
  -- Get deal details
  SELECT name, vehicle_id, created_by INTO v_deal_name, v_vehicle_id, v_creator_id
  FROM deals
  WHERE id = p_deal_id;

  IF v_deal_name IS NULL THEN
    RAISE EXCEPTION 'Deal not found: %', p_deal_id;
  END IF;

  IF v_vehicle_id IS NULL THEN
    RAISE NOTICE 'Deal % has no vehicle_id, skipping folder creation', p_deal_id;
    RETURN;
  END IF;

  -- Use provided creator or deal's creator
  v_creator_id := COALESCE(p_created_by, v_creator_id);

  -- Get vehicle name
  SELECT name INTO v_vehicle_name
  FROM vehicles
  WHERE id = v_vehicle_id;

  -- Find the vehicle's root folder
  SELECT id INTO v_vehicle_root_folder_id
  FROM document_folders
  WHERE vehicle_id = v_vehicle_id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  -- If vehicle doesn't have folders yet, create them first
  IF v_vehicle_root_folder_id IS NULL THEN
    PERFORM auto_create_vehicle_folders_for_existing(v_vehicle_id, v_creator_id);

    -- Get the newly created root folder
    SELECT id INTO v_vehicle_root_folder_id
    FROM document_folders
    WHERE vehicle_id = v_vehicle_id
      AND folder_type = 'vehicle_root'
    LIMIT 1;
  END IF;

  -- Find or create "Deals" container folder
  SELECT id INTO v_deals_folder_id
  FROM document_folders
  WHERE vehicle_id = v_vehicle_id
    AND parent_folder_id = v_vehicle_root_folder_id
    AND name = 'Deals'
    AND folder_type = 'category';

  IF v_deals_folder_id IS NULL THEN
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_vehicle_root_folder_id,
      'Deals',
      '/' || v_vehicle_name || '/Deals',
      v_vehicle_id,
      'category',
      v_creator_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_deals_folder_id;
  END IF;

  -- Check if deal folder already exists
  SELECT id INTO v_deal_root_folder_id
  FROM document_folders
  WHERE parent_folder_id = v_deals_folder_id
    AND name = v_deal_name;

  IF v_deal_root_folder_id IS NOT NULL THEN
    RAISE NOTICE 'Deal folder already exists: %', v_deal_name;
    RETURN;
  END IF;

  -- Create deal folder
  INSERT INTO document_folders (
    id,
    parent_folder_id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_deals_folder_id,
    v_deal_name,
    '/' || v_vehicle_name || '/Deals/' || v_deal_name,
    v_vehicle_id,
    'custom',
    v_creator_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_deal_root_folder_id;

  -- Create subfolders
  FOREACH v_subfolder IN ARRAY v_deal_subfolders
  LOOP
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_deal_root_folder_id,
      v_subfolder,
      '/' || v_vehicle_name || '/Deals/' || v_deal_name || '/' || v_subfolder,
      v_vehicle_id,
      'custom',
      v_creator_id,
      NOW(),
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Created deal folder: %', v_deal_name;
END;
$$;


ALTER FUNCTION "public"."auto_create_deal_folder_for_existing"("p_deal_id" "uuid", "p_created_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_create_deal_folder_for_existing"("p_deal_id" "uuid", "p_created_by" "uuid") IS 'Helper function to manually create folders for existing deals that do not have folders yet';



CREATE OR REPLACE FUNCTION "public"."auto_create_entity_investor"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Auto-create entity_investor link when subscription is created
  -- Uses ON CONFLICT DO NOTHING to link to first subscription only
  INSERT INTO entity_investors (
    vehicle_id,
    investor_id,
    allocation_status
  )
  VALUES (
    NEW.vehicle_id,
    NEW.investor_id,
    NEW.status
  )
  ON CONFLICT (vehicle_id, investor_id) 
  DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_entity_investor"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_create_entity_investor"() IS 'Auto-creates entity_investor record when subscription is inserted - fixed to remove non-existent subscription_id column';



CREATE OR REPLACE FUNCTION "public"."auto_create_introducer_commission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_introducer_id uuid;
  v_introduction_id uuid;
  v_rate_bps integer;
  v_base_amount numeric;
  v_commission_amount numeric;
  v_currency text;
  v_deal_id uuid;
  v_investor_id uuid;
BEGIN
  -- Only proceed if subscription has introducer/introduction reference
  IF NEW.introducer_id IS NULL AND NEW.introduction_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get introducer and introduction IDs
  v_introducer_id := NEW.introducer_id;
  v_introduction_id := NEW.introduction_id;
  v_investor_id := NEW.investor_id;
  v_currency := COALESCE(NEW.currency, 'USD');
  
  -- Get deal_id from introduction (if introduction_id exists)
  -- Otherwise leave it NULL
  IF v_introduction_id IS NOT NULL THEN
    SELECT deal_id INTO v_deal_id
    FROM introductions
    WHERE id = v_introduction_id;
  END IF;

  -- If introduction_id is provided but introducer_id is not, get introducer from introduction
  IF v_introduction_id IS NOT NULL AND v_introducer_id IS NULL THEN
    SELECT introducer_id INTO v_introducer_id
    FROM introductions
    WHERE id = v_introduction_id;
  END IF;

  -- Get commission rate (use override if exists, else default)
  IF v_introduction_id IS NOT NULL THEN
    SELECT 
      COALESCE(intro.commission_rate_override_bps, introducer.default_commission_bps, 100)
    INTO v_rate_bps
    FROM introductions intro
    JOIN introducers introducer ON introducer.id = intro.introducer_id
    WHERE intro.id = v_introduction_id;
  ELSE
    SELECT COALESCE(default_commission_bps, 100)
    INTO v_rate_bps
    FROM introducers
    WHERE id = v_introducer_id;
  END IF;

  -- Calculate commission based on commitment
  v_base_amount := COALESCE(NEW.commitment, 0);
  v_commission_amount := ROUND((v_base_amount * v_rate_bps / 10000.0), 2);

  -- Only create if commission would be positive and introducer exists
  IF v_commission_amount > 0 AND v_introducer_id IS NOT NULL THEN
    -- Check if commission already exists for this introduction
    IF NOT EXISTS (
      SELECT 1 FROM introducer_commissions
      WHERE introduction_id = v_introduction_id
      AND introducer_id = v_introducer_id
    ) THEN
      -- Create commission record
      INSERT INTO introducer_commissions (
        introducer_id,
        introduction_id,
        deal_id,
        investor_id,
        basis_type,
        rate_bps,
        base_amount,
        accrual_amount,
        currency,
        status,
        created_at
      ) VALUES (
        v_introducer_id,
        v_introduction_id,
        v_deal_id,
        v_investor_id,
        'invested_amount',
        v_rate_bps,
        v_base_amount,
        v_commission_amount,
        v_currency,
        'accrued',
        NOW()
      );

      RAISE NOTICE 'Auto-created commission: % for introducer % on subscription %', 
        v_commission_amount, v_introducer_id, NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_introducer_commission"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_create_introducer_commission"() IS 'Automatically creates introducer commission when subscription is created with introducer/introduction reference. Fixed to correctly lookup deal_id from introductions table.';



CREATE OR REPLACE FUNCTION "public"."auto_create_position_from_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  calc_units numeric;
  calc_cost_basis numeric;
  calc_last_nav numeric;
  latest_nav_per_unit numeric;
  position_exists boolean;
BEGIN
  -- Only proceed if status changed to 'active'
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    
    -- Check if position already exists for this investor + vehicle
    SELECT EXISTS (
      SELECT 1 FROM positions 
      WHERE investor_id = NEW.investor_id 
        AND vehicle_id = NEW.vehicle_id
    ) INTO position_exists;
    
    -- Only create position if it doesn't exist
    IF NOT position_exists THEN
      
      -- Calculate units (prefer units field, fallback to num_shares)
      calc_units := COALESCE(NEW.units, NEW.num_shares, 0);
      
      -- If units is zero but we have commitment and price_per_share, calculate units
      IF calc_units = 0 AND NEW.price_per_share IS NOT NULL AND NEW.price_per_share > 0 THEN
        calc_units := COALESCE(NEW.commitment, NEW.funded_amount, 0) / NEW.price_per_share;
      END IF;
      
      -- Calculate cost basis (prefer funded_amount, fallback to commitment)
      calc_cost_basis := COALESCE(NEW.funded_amount, NEW.commitment, 0);
      
      -- Get latest NAV per unit from valuations table for this vehicle
      SELECT nav_per_unit INTO latest_nav_per_unit
      FROM valuations
      WHERE vehicle_id = NEW.vehicle_id
      ORDER BY as_of_date DESC
      LIMIT 1;
      
      -- Calculate last_nav (prefer latest valuation, fallback to price_per_share)
      calc_last_nav := COALESCE(latest_nav_per_unit, NEW.price_per_share, 0);
      
      -- Only create position if we have meaningful data
      IF calc_units > 0 AND calc_cost_basis > 0 THEN
        INSERT INTO positions (
          investor_id,
          vehicle_id,
          units,
          cost_basis,
          last_nav,
          as_of_date
        ) VALUES (
          NEW.investor_id,
          NEW.vehicle_id,
          calc_units,
          calc_cost_basis,
          calc_last_nav,
          CURRENT_DATE
        );
        
        RAISE NOTICE 'Auto-created position for investor % in vehicle % with % units',
          NEW.investor_id, NEW.vehicle_id, calc_units;
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_position_from_subscription"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_create_position_from_subscription"() IS 'Automatically creates a position record when a subscription status changes to active. 
   Calculates units from subscription.units or num_shares, cost_basis from funded_amount or commitment, 
   and last_nav from latest valuation or price_per_share.';



CREATE OR REPLACE FUNCTION "public"."auto_create_vehicle_folders"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_vehicle_name text;
  v_root_folder_id uuid;
  v_default_categories text[] := ARRAY['Agreements', 'KYC Documents', 'Legal', 'Investor Documents', 'Position Statements', 'Reports', 'NDAs'];
  v_category text;
BEGIN
  -- Get vehicle name
  v_vehicle_name := NEW.name;

  -- Check if root folder already exists (prevent duplicates)
  SELECT id INTO v_root_folder_id
  FROM document_folders
  WHERE vehicle_id = NEW.id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  -- If folder already exists, exit early
  IF v_root_folder_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Create root folder for vehicle
  -- NOTE: created_by is NULL because vehicles table doesn't track created_by
  INSERT INTO document_folders (
    id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_vehicle_name,
    '/' || v_vehicle_name,
    NEW.id,
    'vehicle_root',
    NULL,  -- vehicles table has no created_by column
    NOW(),
    NOW()
  )
  RETURNING id INTO v_root_folder_id;

  -- Create default category folders
  FOREACH v_category IN ARRAY v_default_categories
  LOOP
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_root_folder_id,
      v_category,
      '/' || v_vehicle_name || '/' || v_category,
      NEW.id,
      'category',
      NULL,  -- vehicles table has no created_by column
      NOW(),
      NOW()
    );
  END LOOP;

  -- Create "Deals" subfolder under root (for deal-specific documents)
  INSERT INTO document_folders (
    id,
    parent_folder_id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_root_folder_id,
    'Deals',
    '/' || v_vehicle_name || '/Deals',
    NEW.id,
    'category',  -- Deals folder is a category folder
    NULL,  -- vehicles table has no created_by column
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_vehicle_folders"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_create_vehicle_folders"() IS 'Trigger function that creates default folder structure when a new vehicle is inserted';



CREATE OR REPLACE FUNCTION "public"."auto_create_vehicle_folders_for_existing"("p_vehicle_id" "uuid", "p_created_by" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_vehicle_name text;
  v_root_folder_id uuid;
  v_default_categories text[] := ARRAY['Agreements', 'KYC Documents', 'Legal', 'Investor Documents', 'Position Statements', 'Reports', 'NDAs'];
  v_category text;
BEGIN
  -- Get vehicle name (no created_by in vehicles table)
  SELECT name INTO v_vehicle_name
  FROM vehicles
  WHERE id = p_vehicle_id;

  IF v_vehicle_name IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found: %', p_vehicle_id;
  END IF;

  -- Check if root folder already exists
  SELECT id INTO v_root_folder_id
  FROM document_folders
  WHERE vehicle_id = p_vehicle_id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  IF v_root_folder_id IS NOT NULL THEN
    RAISE NOTICE 'Folders already exist for vehicle: %', v_vehicle_name;
    RETURN;
  END IF;

  -- Create root folder (created_by will be NULL or provided value)
  INSERT INTO document_folders (
    id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_vehicle_name,
    '/' || v_vehicle_name,
    p_vehicle_id,
    'vehicle_root',
    p_created_by,  -- Use provided value or NULL
    NOW(),
    NOW()
  )
  RETURNING id INTO v_root_folder_id;

  -- Create category folders
  FOREACH v_category IN ARRAY v_default_categories
  LOOP
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_root_folder_id,
      v_category,
      '/' || v_vehicle_name || '/' || v_category,
      p_vehicle_id,
      'category',
      p_created_by,  -- Use provided value or NULL
      NOW(),
      NOW()
    );
  END LOOP;

  -- Create Deals container folder
  INSERT INTO document_folders (
    id,
    parent_folder_id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_root_folder_id,
    'Deals',
    '/' || v_vehicle_name || '/Deals',
    p_vehicle_id,
    'category',
    p_created_by,  -- Use provided value or NULL
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created folders for vehicle: %', v_vehicle_name;
END;
$$;


ALTER FUNCTION "public"."auto_create_vehicle_folders_for_existing"("p_vehicle_id" "uuid", "p_created_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_create_vehicle_folders_for_existing"("p_vehicle_id" "uuid", "p_created_by" "uuid") IS 'Helper function to manually create folders for existing vehicles that do not have folders yet';



CREATE OR REPLACE FUNCTION "public"."calculate_investor_kpis"("investor_ids" "uuid"[], "as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("current_nav" numeric, "total_contributed" numeric, "total_distributions" numeric, "unfunded_commitment" numeric, "total_commitment" numeric, "total_cost_basis" numeric, "unrealized_gain" numeric, "unrealized_gain_pct" numeric, "dpi" numeric, "tvpi" numeric, "irr_estimate" numeric, "total_positions" integer, "total_vehicles" integer)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN round(p_base_amount * (p_rate_bps::numeric / 10000) * (p_period_days::numeric / 365), 2);
END;
$$;


ALTER FUNCTION "public"."calculate_management_fee"("p_base_amount" numeric, "p_rate_bps" integer, "p_period_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_performance_fee"("p_contributed_capital" numeric, "p_exit_proceeds" numeric, "p_carry_rate_bps" integer, "p_hurdle_rate_bps" integer, "p_years_held" numeric) RETURNS numeric
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN round(p_commitment_amount * (p_rate_bps::numeric / 10000), 2);
END;
$$;


ALTER FUNCTION "public"."calculate_subscription_fee"("p_commitment_amount" numeric, "p_rate_bps" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_auto_approval_criteria"("p_approval_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."check_entity_compliance"() RETURNS TABLE("vehicle_id" "uuid", "issues_found" integer)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- This can be expanded to automatically check for various compliance issues
    -- For now, it's a placeholder that can be called manually or via a scheduled job
    RETURN QUERY
    SELECT v.id, 0
    FROM vehicles v
    WHERE v.entity_code IS NOT NULL;
END;
$$;


ALTER FUNCTION "public"."check_entity_compliance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_deal_interest_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."create_deal_interest_approval"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_deal_interest_approval"() IS 'Automatically creates approval when investor expresses interest in a deal';



CREATE OR REPLACE FUNCTION "public"."create_deal_subscription_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_priority text := 'high';
  v_amount numeric;
  v_approval_id uuid;
  v_entity_data jsonb := NULL;
BEGIN
  -- Only create approval if status is pending_review
  IF NEW.status <> 'pending_review' THEN
    RETURN NEW;
  END IF;

  -- Calculate subscription amount
  v_amount := get_subscription_amount(NEW.payload_json);

  -- Set priority based on amount
  IF v_amount IS NOT NULL THEN
    v_priority := CASE
      WHEN v_amount >= 5000000 THEN 'critical'
      WHEN v_amount >= 1000000 THEN 'high'
      WHEN v_amount >= 250000 THEN 'medium'
      ELSE 'low'
    END;
  END IF;

  -- Fetch counterparty entity details INCLUDING KYC STATUS if this is an entity subscription
  IF NEW.subscription_type = 'entity' AND NEW.counterparty_entity_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', id,
      'entity_type', entity_type,
      'legal_name', legal_name,
      'registration_number', registration_number,
      'jurisdiction', jurisdiction,
      'tax_id', tax_id,
      'registered_address', registered_address,
      'representative_name', representative_name,
      'representative_title', representative_title,
      'kyc_status', kyc_status,
      'kyc_completed_at', kyc_completed_at,
      'kyc_expiry_date', kyc_expiry_date,
      'kyc_notes', kyc_notes
    )
    INTO v_entity_data
    FROM investor_counterparty
    WHERE id = NEW.counterparty_entity_id;
  END IF;

  -- Create the approval record
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,  -- FIXED: Changed from decision_type to action
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  )
  VALUES (
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
      'submitted_at', NEW.submitted_at,
      'investor_id', NEW.investor_id,
      'deal_id', NEW.deal_id,
      'derived_amount', v_amount,
      'subscription_type', COALESCE(NEW.subscription_type, 'personal'),
      'counterparty_entity_id', NEW.counterparty_entity_id,
      'counterparty_entity', v_entity_data
    )
  )
  RETURNING id INTO v_approval_id;

  -- Link the approval back to the submission
  UPDATE deal_subscription_submissions
  SET approval_id = v_approval_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_deal_subscription_approval"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_deal_subscription_approval"() IS 'Auto-creates an approval when an investor submits a subscription pack. Priority scales with derived subscription amount. FIXED: Uses action column instead of non-existent decision_type column.';



CREATE OR REPLACE FUNCTION "public"."create_default_entity_folders"("p_vehicle_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO entity_folders (vehicle_id, folder_type, folder_name, is_default) VALUES
        (p_vehicle_id, 'kyc', 'KYC Documents', true),
        (p_vehicle_id, 'legal', 'Legal Documents', true),
        (p_vehicle_id, 'redemption_closure', 'Redemption & Closure', true),
        (p_vehicle_id, 'financial_statements', 'Financial Statements', true),
        (p_vehicle_id, 'tax_documents', 'Tax Documents', true),
        (p_vehicle_id, 'board_minutes', 'Board Minutes', true),
        (p_vehicle_id, 'investor_agreements', 'Investor Agreements', true),
        (p_vehicle_id, 'compliance', 'Compliance', true),
        (p_vehicle_id, 'correspondence', 'Correspondence', true)
    ON CONFLICT (vehicle_id, folder_type, folder_name) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."create_default_entity_folders"("p_vehicle_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."create_investor_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO activity_feed (
    activity_type,
    entity_id,
    investor_id,
    title,
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
$$;


ALTER FUNCTION "public"."create_investor_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_subscription_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO activity_feed (
    activity_type,
    entity_id,
    investor_id,
    title,
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
$$;


ALTER FUNCTION "public"."create_subscription_activity"() OWNER TO "postgres";

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
    CONSTRAINT "tasks_kind_check" CHECK (("kind" = ANY (ARRAY['onboarding_profile'::"text", 'onboarding_bank_details'::"text", 'kyc_individual'::"text", 'kyc_entity'::"text", 'kyc_aml_check'::"text", 'compliance_nda'::"text", 'compliance_subscription_agreement'::"text", 'compliance_tax_forms'::"text", 'investment_allocation_confirmation'::"text", 'investment_funding_instructions'::"text", 'investment_capital_call_response'::"text", 'deal_commitment_review'::"text", 'deal_nda_signature'::"text", 'subscription_pack_signature'::"text", 'countersignature'::"text", 'other'::"text"]))),
    CONSTRAINT "tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "tasks_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'overdue'::"text", 'waived'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


COMMENT ON COLUMN "public"."tasks"."kind" IS '
Task types:
- Onboarding: onboarding_profile, onboarding_bank_details
- KYC: kyc_individual
- Compliance: compliance_nda, compliance_subscription_agreement, compliance_tax_forms
- Deals: deal_nda_signature
- Investment: investment_allocation_confirmation, investment_capital_call_response
- Signatures: subscription_pack_signature (investor signs), countersignature (staff signs)
- Other: other (generic tasks)
';



COMMENT ON COLUMN "public"."tasks"."started_at" IS 'Timestamp when task was marked as in_progress';



COMMENT ON COLUMN "public"."tasks"."instructions" IS 'Structured instructions and steps for completing the task';



COMMENT ON CONSTRAINT "tasks_kind_check" ON "public"."tasks" IS 'Updated to include signature-related task kinds: subscription_pack_signature and countersignature';



CREATE OR REPLACE FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") RETURNS SETOF "public"."tasks"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."ensure_entity_default_folders"("p_vehicle_id" "uuid", "p_actor" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  folder_names text[] := array['KYC','Legal','Redemption','Operations'];
  folder text;
begin
  foreach folder in array folder_names
  loop
    insert into public.document_folders (vehicle_id, name, path, folder_type, created_by)
    values (p_vehicle_id, folder, concat('/', folder), 'category', p_actor)
    on conflict (vehicle_id, name) do nothing;
  end loop;
end;
$$;


ALTER FUNCTION "public"."ensure_entity_default_folders"("p_vehicle_id" "uuid", "p_actor" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_message_read_receipt"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO message_reads (message_id, user_id, read_at)
  VALUES (NEW.id, NEW.sender_id, NEW.created_at)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_message_read_receipt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_check_onboarding_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_investor_id uuid;
  v_pending_count int;
BEGIN
  -- Only process when task status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Only for onboarding category tasks
    IF NEW.category = 'onboarding' THEN
      v_investor_id := NEW.owner_investor_id;
      
      -- If no investor_id, skip
      IF v_investor_id IS NULL THEN
        RETURN NEW;
      END IF;
      
      -- Count pending onboarding tasks for this investor
      SELECT COUNT(*) INTO v_pending_count
      FROM tasks
      WHERE owner_investor_id = v_investor_id
        AND category = 'onboarding'
        AND status != 'completed';
      
      -- If no pending tasks, mark onboarding as completed
      IF v_pending_count = 0 THEN
        UPDATE investors
        SET onboarding_status = 'completed',
            updated_at = now()
        WHERE id = v_investor_id
          AND onboarding_status != 'completed';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_check_onboarding_completion"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fn_check_onboarding_completion"() IS 'Auto-updates investor.onboarding_status to completed when all onboarding tasks are done';



CREATE OR REPLACE FUNCTION "public"."fn_compute_fee_events"("p_deal_id" "uuid", "p_as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
  
  -- REMOVED: Copy to allocation_lot_items - table deleted
  -- The lot tracking is now handled via reservation_lot_items only
  
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


COMMENT ON FUNCTION "public"."fn_finalize_allocation"("p_reservation_id" "uuid", "p_approver_id" "uuid") IS 'Finalizes allocation from reservation. Updated to remove dependency on deprecated allocation_lot_items table.';



CREATE OR REPLACE FUNCTION "public"."fn_invoice_fees"("p_deal_id" "uuid", "p_investor_id" "uuid" DEFAULT NULL::"uuid", "p_up_to_date" "date" DEFAULT CURRENT_DATE) RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."fn_reset_onboarding_on_new_task"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- When a new pending onboarding task is created
  IF NEW.category = 'onboarding' AND NEW.status = 'pending' AND NEW.owner_investor_id IS NOT NULL THEN
    -- Set onboarding_status back to in_progress if it was completed
    UPDATE investors
    SET onboarding_status = 'in_progress',
        updated_at = now()
    WHERE id = NEW.owner_investor_id
      AND onboarding_status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_reset_onboarding_on_new_task"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fn_reset_onboarding_on_new_task"() IS 'Resets investor.onboarding_status to in_progress when new onboarding task is added';



CREATE OR REPLACE FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("fee_plan_id" "uuid", "fee_plan_name" "text", "components" "jsonb", "overrides" "jsonb")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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



CREATE OR REPLACE FUNCTION "public"."get_dashboard_counts"("month_start" timestamp with time zone) RETURNS TABLE("active_lps" bigint, "pending_kyc" bigint, "high_priority_kyc" bigint, "workflow_runs_mtd" bigint, "total_investors" bigint, "compliant_investors" bigint, "active_workflows" bigint, "active_deals" bigint, "active_requests" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT
    (SELECT COUNT(*) FROM investors WHERE status = 'active')::bigint,
    (SELECT COUNT(*) FROM investors WHERE kyc_status IN ('pending', 'review', 'completed'))::bigint,
    (SELECT COUNT(*) FROM tasks 
     WHERE kind IN ('kyc_individual', 'kyc_entity', 'kyc_aml_check', 'onboarding_profile', 'compliance_tax_forms')
       AND status IN ('pending', 'in_progress')
       AND priority = 'high')::bigint,
    (SELECT COUNT(*) FROM workflow_runs WHERE created_at >= month_start)::bigint,
    (SELECT COUNT(*) FROM investors)::bigint,
    (SELECT COUNT(*) FROM investors WHERE kyc_status = 'approved')::bigint,
    (SELECT COUNT(*) FROM workflows WHERE is_active = true)::bigint,
    (SELECT COUNT(*) FROM deals WHERE status IN ('open', 'allocation_pending', 'draft'))::bigint,
    (SELECT COUNT(*) FROM request_tickets WHERE status IN ('open', 'assigned', 'in_progress'))::bigint;
$$;


ALTER FUNCTION "public"."get_dashboard_counts"("month_start" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_dashboard_counts"("month_start" timestamp with time zone) IS 'Returns all dashboard KPI counts in a single optimized query to reduce round trips';



CREATE OR REPLACE FUNCTION "public"."get_folder_path"("p_folder_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."get_investor_vehicle_breakdown"("investor_ids" "uuid"[]) RETURNS TABLE("id" "uuid", "name" "text", "type" "text", "logo_url" "text", "current_value" numeric, "cost_basis" numeric, "units" numeric, "unrealized_gain" numeric, "unrealized_gain_pct" numeric, "commitment" numeric, "contributed" numeric, "distributed" numeric, "nav_per_unit" numeric, "as_of_date" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.name,
        v.type::text,
        v.logo_url,
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
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."get_or_create_investor"("p_name" "text", "p_type" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM investors WHERE UPPER(TRIM(legal_name)) = UPPER(TRIM(p_name));
    IF v_id IS NULL THEN
        INSERT INTO investors (legal_name, type)
        VALUES (p_name, p_type)
        RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_investor"("p_name" "text", "p_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_vehicle"("p_code" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM vehicles WHERE entity_code = p_code;
    IF v_id IS NULL THEN
        INSERT INTO vehicles (entity_code, name, type)
        VALUES (p_code, 'VERSO Capital Series ' || p_code, 'fund')
        RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_vehicle"("p_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer DEFAULT 30) RETURNS TABLE("nav_change" numeric, "nav_change_pct" numeric, "performance_change" numeric, "period_days" integer)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."get_subscription_amount"("p_payload" "jsonb") RETURNS numeric
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_amount numeric;
BEGIN
  IF p_payload ? 'amount' AND jsonb_typeof(p_payload->'amount') = 'number' THEN
    v_amount := (p_payload->>'amount')::numeric;
  ELSIF p_payload ? 'subscription_amount' AND jsonb_typeof(p_payload->'subscription_amount') = 'number' THEN
    v_amount := (p_payload->>'subscription_amount')::numeric;
  ELSIF p_payload ? 'commitment_amount' AND jsonb_typeof(p_payload->'commitment_amount') = 'number' THEN
    v_amount := (p_payload->>'commitment_amount')::numeric;
  ELSIF p_payload ? 'investment_amount' AND jsonb_typeof(p_payload->'investment_amount') = 'number' THEN
    v_amount := (p_payload->>'investment_amount')::numeric;
  END IF;

  RETURN v_amount;
END;
$$;


ALTER FUNCTION "public"."get_subscription_amount"("p_payload" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_subscription_amount"("p_payload" "jsonb") IS 'Best-effort parser that extracts a numeric amount from subscription payload JSON.';



CREATE OR REPLACE FUNCTION "public"."get_task_progress_by_category"("p_user_id" "uuid", "p_investor_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("category" "text", "total_tasks" bigint, "completed_tasks" bigint, "percentage" numeric)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$;


ALTER FUNCTION "public"."prevent_audit_log_modification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_role_self_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- If role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if this is a self-update (user updating their own profile)
    IF auth.uid() = OLD.id THEN
      -- Only allow if executed by service role (admin operations)
      IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Cannot modify your own role. Contact an administrator.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_role_self_update"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."prevent_role_self_update"() IS 'Security function: Prevents users from changing their own role. Only service role (admin operations) can modify roles.';



CREATE OR REPLACE FUNCTION "public"."publish_scheduled_documents"() RETURNS TABLE("document_id" "uuid", "published_count" integer)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    -- Clear stale suggestions before generating new ones
    DELETE FROM public.suggested_matches
    WHERE bank_transaction_id = v_transaction.id;

    DELETE FROM public.reconciliation_matches
    WHERE bank_transaction_id = v_transaction.id
      AND status = 'suggested';

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
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."set_subscription_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- If subscription_number is not provided or is default 1, calculate the next number
  IF NEW.subscription_number IS NULL OR NEW.subscription_number = 1 THEN
    -- Get the max subscription_number for this investor-vehicle pair and add 1
    SELECT COALESCE(MAX(subscription_number), 0) + 1
    INTO NEW.subscription_number
    FROM subscriptions
    WHERE investor_id = NEW.investor_id 
      AND vehicle_id = NEW.vehicle_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_subscription_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_workflows_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_workflows_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_conversation_set_owner"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_touch_conversation_participant"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_investor_user_onboarding_tasks"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_task_count int;
BEGIN
  -- Create onboarding tasks for the newly linked user
  SELECT COUNT(*) INTO v_task_count
  FROM create_tasks_from_templates(
    NEW.user_id,
    NEW.investor_id,
    'investor_created'
  );

  -- Log the action for debugging
  RAISE NOTICE 'Created % onboarding tasks for user % linked to investor %',
    v_task_count, NEW.user_id, NEW.investor_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user linking operation
    RAISE WARNING 'Failed to create onboarding tasks: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_investor_user_onboarding_tasks"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."trigger_investor_user_onboarding_tasks"() IS 'Automatically creates onboarding tasks when a user is linked to an investor entity. Fires on investor_users INSERT and calls create_tasks_from_templates with trigger_event=investor_created.';



CREATE OR REPLACE FUNCTION "public"."unlock_dependent_tasks"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
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
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_conversation_last_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_investor_counterparty_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_investor_counterparty_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_investor_legal_entities_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_investor_legal_entities_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_kyc_submissions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_kyc_submissions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_signature_requests_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_signature_requests_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_staff_filter_views_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_staff_filter_views_updated_at"() OWNER TO "postgres";


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
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM deal_memberships dm
    WHERE dm.deal_id = target_deal_id
      AND dm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM deal_memberships dm
    JOIN investor_users iu ON iu.investor_id = dm.investor_id
    WHERE dm.deal_id = target_deal_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND (p.role)::text LIKE 'staff_%'
  );
$$;


ALTER FUNCTION "public"."user_has_deal_access"("target_deal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_is_staff"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND (p.role)::text LIKE 'staff_%'
  );
$$;


ALTER FUNCTION "public"."user_is_staff"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_is_staff"() IS 'Checks if the current user has a staff role.
Uses SECURITY DEFINER to bypass RLS and prevent infinite recursion.
Changed to SQL language for better performance and to avoid plpgsql overhead.';



CREATE OR REPLACE FUNCTION "public"."user_linked_to_investor"("target_investor_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
    "activity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "investor_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "activity_feed_activity_type_check" CHECK (("activity_type" = ANY (ARRAY['subscription'::"text", 'capital_call'::"text", 'distribution'::"text", 'kyc'::"text", 'document'::"text", 'message'::"text", 'profile'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."activity_feed" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_feed" IS 'Tracks all activities and interactions for audit and timeline.';



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

ALTER TABLE ONLY "public"."approval_history" FORCE ROW LEVEL SECURITY;


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



CREATE TABLE IF NOT EXISTS "public"."arranger_entities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "legal_name" "text" NOT NULL,
    "registration_number" "text",
    "tax_id" "text",
    "regulator" "text",
    "license_number" "text",
    "license_type" "text",
    "license_expiry_date" "date",
    "email" "text",
    "phone" "text",
    "address" "text",
    "kyc_status" "text" DEFAULT 'draft'::"text",
    "kyc_approved_at" timestamp with time zone,
    "kyc_approved_by" "uuid",
    "kyc_expires_at" timestamp with time zone,
    "kyc_notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid"
);


ALTER TABLE "public"."arranger_entities" OWNER TO "postgres";


COMMENT ON TABLE "public"."arranger_entities" IS 'Regulated financial entities (arrangers/advisors) that structure deals and manage vehicles';



COMMENT ON COLUMN "public"."arranger_entities"."metadata" IS 'Flexible JSONB field for beneficial owners, key personnel, insurance details, etc.';



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
    "ip_address" "inet",
    "user_agent" "text",
    "risk_level" "text",
    "compliance_flag" boolean DEFAULT false,
    "compliance_review_status" "text",
    "compliance_reviewer_id" "uuid",
    "compliance_reviewed_at" timestamp with time zone,
    "compliance_notes" "text",
    "retention_category" "text",
    "retention_expiry" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "audit_logs_compliance_review_status_check" CHECK (("compliance_review_status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'flagged'::"text", 'resolved'::"text"]))),
    CONSTRAINT "audit_logs_retention_category_check" CHECK (("retention_category" = ANY (ARRAY['operational'::"text", 'financial'::"text", 'legal_hold'::"text"]))),
    CONSTRAINT "audit_logs_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"])))
);

ALTER TABLE ONLY "public"."audit_logs" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Immutable audit trail for all system activities with rich metadata. Replaced legacy audit_log table on 2025-11-15.';



COMMENT ON COLUMN "public"."audit_logs"."event_type" IS 'High-level event category';



COMMENT ON COLUMN "public"."audit_logs"."action" IS 'Specific action performed';



COMMENT ON COLUMN "public"."audit_logs"."risk_level" IS 'Risk assessment of the action';



COMMENT ON COLUMN "public"."audit_logs"."compliance_flag" IS 'Whether this event requires compliance review';



COMMENT ON COLUMN "public"."audit_logs"."retention_category" IS 'Data retention category determining how long to keep this record';



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


CREATE TABLE IF NOT EXISTS "public"."automation_webhook_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "related_deal_id" "uuid",
    "related_investor_id" "uuid",
    "payload" "jsonb" NOT NULL,
    "received_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."automation_webhook_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."automation_webhook_events" IS 'Audit log of inbound automation webhooks (n8n).';



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
    "matched_subscription_id" "uuid",
    "discrepancy_amount" numeric(15,2),
    "resolution_notes" "text",
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    CONSTRAINT "bank_transactions_status_check" CHECK (("status" = ANY (ARRAY['unmatched'::"text", 'partially_matched'::"text", 'matched'::"text"])))
);


ALTER TABLE "public"."bank_transactions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bank_transactions"."match_confidence" IS 'Confidence score 0-100 from auto-matching algorithm';



COMMENT ON COLUMN "public"."bank_transactions"."matched_subscription_id" IS 'Links to the subscription this transaction was matched to';



COMMENT ON COLUMN "public"."bank_transactions"."discrepancy_amount" IS 'Expected amount - actual amount (for flagging differences)';



COMMENT ON COLUMN "public"."bank_transactions"."resolution_notes" IS 'User notes explaining how discrepancy was resolved';



COMMENT ON COLUMN "public"."bank_transactions"."resolved_by" IS 'Staff member who resolved the discrepancy';



COMMENT ON COLUMN "public"."bank_transactions"."resolved_at" IS 'When the discrepancy was resolved';



CREATE TABLE IF NOT EXISTS "public"."capital_call_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "capital_call_id" "uuid" NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "called_amount" numeric(15,2) NOT NULL,
    "paid_amount" numeric(15,2) DEFAULT 0 NOT NULL,
    "balance_due" numeric(15,2) GENERATED ALWAYS AS (("called_amount" - "paid_amount")) STORED,
    "due_date" "date" NOT NULL,
    "paid_date" "date",
    "status" "text" DEFAULT 'pending'::"text",
    "bank_transaction_ids" "uuid"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "capital_call_items_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'partially_paid'::"text", 'paid'::"text", 'overdue'::"text", 'waived'::"text"])))
);


ALTER TABLE "public"."capital_call_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."capital_call_items" IS 'Per-investor capital call payment tracking for reconciliation';



COMMENT ON COLUMN "public"."capital_call_items"."called_amount" IS 'Amount this investor owes for this capital call';



COMMENT ON COLUMN "public"."capital_call_items"."paid_amount" IS 'Amount paid so far (sum of matched bank transactions)';



COMMENT ON COLUMN "public"."capital_call_items"."balance_due" IS 'Remaining amount owed (auto-calculated)';



COMMENT ON COLUMN "public"."capital_call_items"."bank_transaction_ids" IS 'Array of bank_transactions.id that were matched to this item';



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

ALTER TABLE ONLY "public"."cashflows" FORCE ROW LEVEL SECURITY;


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



CREATE TABLE IF NOT EXISTS "public"."counterparty_entity_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "counterparty_entity_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "role_title" "text",
    "email" "text",
    "phone" "text",
    "residential_street" "text",
    "residential_city" "text",
    "residential_state" "text",
    "residential_postal_code" "text",
    "residential_country" "text",
    "nationality" "text",
    "id_type" "text",
    "id_number" "text",
    "id_expiry_date" "date",
    "ownership_percentage" numeric(5,2),
    "is_beneficial_owner" boolean DEFAULT false,
    "kyc_status" "text" DEFAULT 'pending'::"text",
    "kyc_approved_at" timestamp with time zone,
    "kyc_approved_by" "uuid",
    "kyc_expiry_date" "date",
    "is_active" boolean DEFAULT true,
    "effective_from" "date" DEFAULT CURRENT_DATE,
    "effective_to" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "counterparty_entity_members_id_type_check" CHECK ((("id_type" IS NULL) OR ("id_type" = ANY (ARRAY['passport'::"text", 'national_id'::"text", 'drivers_license'::"text", 'other'::"text"])))),
    CONSTRAINT "counterparty_entity_members_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['pending'::"text", 'submitted'::"text", 'approved'::"text", 'rejected'::"text", 'expired'::"text"]))),
    CONSTRAINT "counterparty_entity_members_ownership_percentage_check" CHECK ((("ownership_percentage" IS NULL) OR (("ownership_percentage" >= (0)::numeric) AND ("ownership_percentage" <= (100)::numeric)))),
    CONSTRAINT "counterparty_entity_members_role_check" CHECK (("role" = ANY (ARRAY['director'::"text", 'shareholder'::"text", 'beneficial_owner'::"text", 'trustee'::"text", 'beneficiary'::"text", 'managing_member'::"text", 'general_partner'::"text", 'limited_partner'::"text", 'authorized_signatory'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."counterparty_entity_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."counterparty_entity_members" IS 'Members (directors, trustees, partners) of counterparty entities that investors invest through';



COMMENT ON COLUMN "public"."counterparty_entity_members"."counterparty_entity_id" IS 'References investor_counterparty table';



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


CREATE TABLE IF NOT EXISTS "public"."deal_activity_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "investor_id" "uuid",
    "event_type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."deal_activity_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_activity_events" IS 'Captures analytics events for the deal workflow (interest approvals, NDA completion, subscription funding, etc.).';



CREATE TABLE IF NOT EXISTS "public"."deal_data_room_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "revoked_at" timestamp with time zone,
    "revoked_by" "uuid",
    "auto_granted" boolean DEFAULT false NOT NULL,
    "notes" "text",
    "last_warning_sent_at" timestamp with time zone
);


ALTER TABLE "public"."deal_data_room_access" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_data_room_access" IS 'Controls which investors can see data room documents and for how long.';



COMMENT ON COLUMN "public"."deal_data_room_access"."last_warning_sent_at" IS 'Timestamp of last expiry warning notification sent to investor to prevent spam';



CREATE TABLE IF NOT EXISTS "public"."deal_data_room_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "folder" "text",
    "file_key" "text",
    "file_name" "text",
    "visible_to_investors" boolean DEFAULT false NOT NULL,
    "metadata_json" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tags" "text"[],
    "document_expires_at" timestamp with time zone,
    "document_notes" "text",
    "version" integer DEFAULT 1 NOT NULL,
    "replaced_by_id" "uuid",
    "file_size_bytes" bigint,
    "mime_type" "text",
    "external_link" "text",
    "is_featured" boolean DEFAULT false
);


ALTER TABLE "public"."deal_data_room_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_data_room_documents" IS 'Documents made available in the investor data room with visibility flags.';



COMMENT ON COLUMN "public"."deal_data_room_documents"."tags" IS 'Array of tags for document categorization and search';



COMMENT ON COLUMN "public"."deal_data_room_documents"."document_expires_at" IS 'Optional expiry timestamp for time-limited documents';



COMMENT ON COLUMN "public"."deal_data_room_documents"."document_notes" IS 'Internal notes about the document';



COMMENT ON COLUMN "public"."deal_data_room_documents"."version" IS 'Document version number, increments with replacements';



COMMENT ON COLUMN "public"."deal_data_room_documents"."replaced_by_id" IS 'ID of the document that replaced this version (forms version chain)';



COMMENT ON COLUMN "public"."deal_data_room_documents"."file_size_bytes" IS 'File size in bytes for display and validation';



COMMENT ON COLUMN "public"."deal_data_room_documents"."mime_type" IS 'MIME type of the uploaded file';



COMMENT ON COLUMN "public"."deal_data_room_documents"."external_link" IS 'External link to document (e.g., Google Drive link) instead of uploaded file';



COMMENT ON COLUMN "public"."deal_data_room_documents"."is_featured" IS 'When true, document appears in featured section at top of data room';



CREATE TABLE IF NOT EXISTS "public"."deal_faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "deal_faqs_answer_check" CHECK (("length"(TRIM(BOTH FROM "answer")) > 0)),
    CONSTRAINT "deal_faqs_question_check" CHECK (("length"(TRIM(BOTH FROM "question")) > 0))
);


ALTER TABLE "public"."deal_faqs" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_faqs" IS 'Frequently asked questions for deals, managed by staff and viewable by investors with active data room access';



COMMENT ON COLUMN "public"."deal_faqs"."deal_id" IS 'The deal this FAQ belongs to';



COMMENT ON COLUMN "public"."deal_faqs"."question" IS 'The FAQ question text';



COMMENT ON COLUMN "public"."deal_faqs"."answer" IS 'The FAQ answer text';



COMMENT ON COLUMN "public"."deal_faqs"."display_order" IS 'Order in which FAQs appear (lower numbers first). Auto-assigned based on creation order.';



COMMENT ON COLUMN "public"."deal_faqs"."created_by" IS 'Staff member who created this FAQ';



COMMENT ON COLUMN "public"."deal_faqs"."updated_by" IS 'Staff member who last updated this FAQ';



CREATE TABLE IF NOT EXISTS "public"."deal_fee_structures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "term_sheet_date" "date",
    "transaction_type" "text",
    "opportunity_summary" "text",
    "issuer" "text",
    "vehicle" "text",
    "exclusive_arranger" "text",
    "purchaser" "text",
    "seller" "text",
    "structure" "text",
    "allocation_up_to" numeric(18,2),
    "price_per_share_text" "text",
    "minimum_ticket" numeric(18,2),
    "maximum_ticket" numeric(18,2),
    "subscription_fee_percent" numeric(7,4),
    "management_fee_percent" numeric(7,4),
    "carried_interest_percent" numeric(7,4),
    "legal_counsel" "text",
    "interest_confirmation_deadline" timestamp with time zone,
    "capital_call_timeline" "text",
    "completion_date_text" "text",
    "in_principle_approval_text" "text",
    "subscription_pack_note" "text",
    "share_certificates_note" "text",
    "subject_to_change_note" "text",
    "validity_date" timestamp with time zone,
    "term_sheet_html" "text",
    "term_sheet_attachment_key" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "effective_at" timestamp with time zone,
    "published_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "wire_bank_name" "text",
    "wire_bank_address" "text",
    "wire_account_holder" "text",
    "wire_escrow_agent" "text",
    "wire_law_firm_address" "text",
    "wire_iban" "text",
    "wire_bic" "text",
    "wire_reference_format" "text",
    "wire_description_format" "text",
    "wire_contact_email" "text",
    "management_fee_clause" "text",
    "performance_fee_clause" "text",
    "escrow_fee_text" "text",
    "recital_b_html" "text",
    "payment_deadline_days" integer DEFAULT 10,
    "issue_within_business_days" integer DEFAULT 5,
    "arranger_person_name" "text",
    "arranger_person_title" "text",
    "issuer_signatory_name" "text",
    "issuer_signatory_title" "text",
    CONSTRAINT "deal_fee_structures_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."deal_fee_structures" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_fee_structures" IS 'Structured term sheet data for each deal version (draft/published/archived).';



COMMENT ON COLUMN "public"."deal_fee_structures"."wire_bank_name" IS 'Escrow bank name';



COMMENT ON COLUMN "public"."deal_fee_structures"."wire_iban" IS 'Escrow account IBAN';



COMMENT ON COLUMN "public"."deal_fee_structures"."wire_bic" IS 'Bank BIC/SWIFT code';



COMMENT ON COLUMN "public"."deal_fee_structures"."management_fee_clause" IS 'Full legal text for management fee clause';



COMMENT ON COLUMN "public"."deal_fee_structures"."performance_fee_clause" IS 'Full legal text for performance/carried interest clause';



COMMENT ON COLUMN "public"."deal_fee_structures"."recital_b_html" IS 'HTML for Recital B describing the investment';



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


CREATE TABLE IF NOT EXISTS "public"."deal_subscription_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "payload_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending_review'::"text" NOT NULL,
    "approval_id" "uuid",
    "created_by" "uuid",
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "decided_at" timestamp with time zone,
    "decided_by" "uuid",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "rejected_by" "uuid",
    "rejected_at" timestamp with time zone,
    "rejection_reason" "text",
    "subscription_type" "text" DEFAULT 'personal'::"text",
    "counterparty_entity_id" "uuid",
    "formal_subscription_id" "uuid",
    CONSTRAINT "deal_subscription_submissions_status_check" CHECK (("status" = ANY (ARRAY['pending_review'::"text", 'approved'::"text", 'rejected'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "deal_subscription_submissions_subscription_type_check" CHECK (("subscription_type" = ANY (ARRAY['personal'::"text", 'entity'::"text"])))
);


ALTER TABLE "public"."deal_subscription_submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_subscription_submissions" IS 'Post-NDA subscription submissions awaiting staff approval.';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."approved_by" IS 'Staff member who approved the subscription';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."approved_at" IS 'Timestamp when subscription was approved';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."rejected_by" IS 'Staff member who rejected the subscription';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."rejected_at" IS 'Timestamp when subscription was rejected';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."rejection_reason" IS 'Reason for rejection';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."subscription_type" IS 'Whether investor is subscribing personally or through a counterparty entity';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."counterparty_entity_id" IS 'The counterparty entity used for subscription (if subscription_type = entity)';



COMMENT ON COLUMN "public"."deal_subscription_submissions"."formal_subscription_id" IS 'Links to the formal subscription record created when this submission is approved';



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
    "location" "text",
    "company_website" "text",
    "arranger_entity_id" "uuid"
);


ALTER TABLE "public"."deals" OWNER TO "postgres";


COMMENT ON COLUMN "public"."deals"."arranger_entity_id" IS 'Regulated entity that arranged/structured this deal';



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



CREATE TABLE IF NOT EXISTS "public"."distribution_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "distribution_id" "uuid" NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "distribution_amount" numeric(15,2) NOT NULL,
    "sent_amount" numeric(15,2) DEFAULT 0 NOT NULL,
    "balance_pending" numeric(15,2) GENERATED ALWAYS AS (("distribution_amount" - "sent_amount")) STORED,
    "sent_date" "date",
    "wire_reference" "text",
    "confirmed_date" "date",
    "status" "text" DEFAULT 'pending'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "distribution_items_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'sent'::"text", 'confirmed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."distribution_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."distribution_items" IS 'Per-investor distribution payment tracking';



COMMENT ON COLUMN "public"."distribution_items"."distribution_amount" IS 'Amount this investor should receive';



COMMENT ON COLUMN "public"."distribution_items"."sent_amount" IS 'Amount sent so far';



COMMENT ON COLUMN "public"."distribution_items"."wire_reference" IS 'Wire confirmation number or reference';



CREATE TABLE IF NOT EXISTS "public"."distributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "name" "text",
    "amount" numeric(18,2),
    "date" "date",
    "classification" "text"
);


ALTER TABLE "public"."distributions" OWNER TO "postgres";


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
    "external_url" "text",
    "link_type" "text",
    "subscription_id" "uuid",
    "subscription_submission_id" "uuid",
    "ready_for_signature" boolean DEFAULT false,
    "signature_workflow_run_id" "uuid",
    "arranger_entity_id" "uuid",
    CONSTRAINT "documents_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending_approval'::"text", 'approved'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


COMMENT ON COLUMN "public"."documents"."vehicle_id" IS 'Vehicle this document belongs to. Auto-populated from deal.vehicle_id when document is uploaded to a deal.';



COMMENT ON COLUMN "public"."documents"."deal_id" IS 'Deal this document belongs to. When set, entity_id and vehicle_id are auto-populated from deal.vehicle_id.';



COMMENT ON COLUMN "public"."documents"."entity_id" IS 'Entity (vehicle) this document belongs to. Auto-populated from deal.vehicle_id when document is uploaded to a deal.';



COMMENT ON COLUMN "public"."documents"."current_version" IS 'Current version number for display';



COMMENT ON COLUMN "public"."documents"."status" IS 'Workflow status: draft → pending_approval → approved → published → archived';



COMMENT ON COLUMN "public"."documents"."is_published" IS 'Whether document is visible to investors';



COMMENT ON COLUMN "public"."documents"."subscription_id" IS 'Links document to a formal subscription record';



COMMENT ON COLUMN "public"."documents"."subscription_submission_id" IS 'Links document to the original submission/approval';



COMMENT ON COLUMN "public"."documents"."ready_for_signature" IS 'Indicates if document is ready to be sent for signatures';



COMMENT ON COLUMN "public"."documents"."signature_workflow_run_id" IS 'Links to the workflow run that manages the signature process';



COMMENT ON COLUMN "public"."documents"."arranger_entity_id" IS 'Documents uploaded for arranger entity (KYC, licenses, certificates)';



CREATE TABLE IF NOT EXISTS "public"."entity_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "flag_type" "public"."flag_type" NOT NULL,
    "severity" "public"."flag_severity" DEFAULT 'warning'::"public"."flag_severity" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "is_resolved" boolean DEFAULT false,
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    "resolution_notes" "text",
    "due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'open'::"text"
);


ALTER TABLE "public"."entity_flags" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_flags" IS 'Tracks red/yellow/green flags and action items for the entity action center';



COMMENT ON COLUMN "public"."entity_flags"."flag_type" IS 'Type of flag: compliance_issue, missing_documents, expiring_documents, reporting_due, etc.';



COMMENT ON COLUMN "public"."entity_flags"."severity" IS 'Severity level: critical (red), warning (yellow), info (blue), success (green)';



COMMENT ON COLUMN "public"."entity_flags"."is_resolved" IS 'Whether this flag has been resolved/cleared';



COMMENT ON COLUMN "public"."entity_flags"."due_date" IS 'Optional due date for resolving this flag';



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
    "notes" "text",
    "entity_code" "text",
    "platform" "text",
    "investment_name" "text",
    "former_entity" "text",
    "status" "public"."entity_status" DEFAULT 'LIVE'::"public"."entity_status",
    "reporting_type" "public"."reporting_type" DEFAULT 'Not Required'::"public"."reporting_type",
    "requires_reporting" boolean DEFAULT false,
    "logo_url" "text",
    "website_url" "text",
    "series_number" "text",
    "series_short_title" "text",
    "issuer_gp_name" "text",
    "issuer_gp_rcc_number" "text",
    "issuer_rcc_number" "text",
    "issuer_website" "text",
    "arranger_entity_id" "uuid"
);


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."vehicles"."entity_code" IS 'Reference code like VC101, VC106, IN101, RE1, used for identification';



COMMENT ON COLUMN "public"."vehicles"."platform" IS 'Platform identifier: VC1SCSP, VC2SCSP, REC, VCL';



COMMENT ON COLUMN "public"."vehicles"."investment_name" IS 'The actual investment name (e.g., CRANS, USDC INDIA, REVOLUT)';



COMMENT ON COLUMN "public"."vehicles"."former_entity" IS 'Legacy entity name for tracking history';



COMMENT ON COLUMN "public"."vehicles"."status" IS 'Current status of the entity: LIVE, CLOSED, or TBD';



COMMENT ON COLUMN "public"."vehicles"."reporting_type" IS 'Type of reporting required for this entity';



COMMENT ON COLUMN "public"."vehicles"."requires_reporting" IS 'Whether this entity requires regular reporting';



COMMENT ON COLUMN "public"."vehicles"."series_number" IS 'Series identifier (e.g., VC203, VC204)';



COMMENT ON COLUMN "public"."vehicles"."series_short_title" IS 'Short name for series (e.g., XAI, Revolut)';



COMMENT ON COLUMN "public"."vehicles"."issuer_gp_name" IS 'General Partner legal entity name';



COMMENT ON COLUMN "public"."vehicles"."issuer_gp_rcc_number" IS 'GP registration/RCC number';



COMMENT ON COLUMN "public"."vehicles"."issuer_rcc_number" IS 'Vehicle RCC/registration number';



COMMENT ON COLUMN "public"."vehicles"."issuer_website" IS 'Issuer website URL';



COMMENT ON COLUMN "public"."vehicles"."arranger_entity_id" IS 'Regulated entity that manages this vehicle/fund';



CREATE OR REPLACE VIEW "public"."entity_action_center_summary" WITH ("security_invoker"='true') AS
 SELECT "v"."id" AS "vehicle_id",
    "v"."name" AS "vehicle_name",
    "v"."entity_code",
    "v"."platform",
    "v"."status" AS "vehicle_status",
    "count"(
        CASE
            WHEN (("ef"."severity" = 'critical'::"public"."flag_severity") AND ("ef"."is_resolved" = false)) THEN 1
            ELSE NULL::integer
        END) AS "critical_flags",
    "count"(
        CASE
            WHEN (("ef"."severity" = 'warning'::"public"."flag_severity") AND ("ef"."is_resolved" = false)) THEN 1
            ELSE NULL::integer
        END) AS "warning_flags",
    "count"(
        CASE
            WHEN (("ef"."severity" = 'info'::"public"."flag_severity") AND ("ef"."is_resolved" = false)) THEN 1
            ELSE NULL::integer
        END) AS "info_flags",
    "count"(
        CASE
            WHEN ("ef"."is_resolved" = false) THEN 1
            ELSE NULL::integer
        END) AS "total_unresolved_flags",
    "min"(
        CASE
            WHEN (("ef"."due_date" IS NOT NULL) AND ("ef"."is_resolved" = false)) THEN "ef"."due_date"
            ELSE NULL::"date"
        END) AS "earliest_due_date",
    "max"("ef"."updated_at") AS "last_flag_update"
   FROM ("public"."vehicles" "v"
     LEFT JOIN "public"."entity_flags" "ef" ON (("ef"."vehicle_id" = "v"."id")))
  WHERE ("v"."entity_code" IS NOT NULL)
  GROUP BY "v"."id", "v"."name", "v"."entity_code", "v"."platform", "v"."status";


ALTER VIEW "public"."entity_action_center_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."entity_action_center_summary" IS 'Summary of entity flags per vehicle with SECURITY INVOKER for proper RLS enforcement';



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


CREATE TABLE IF NOT EXISTS "public"."entity_folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "folder_type" "public"."folder_type" NOT NULL,
    "folder_name" "text" NOT NULL,
    "description" "text",
    "is_default" boolean DEFAULT false,
    "parent_folder_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."entity_folders" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_folders" IS 'Document folder structure for organizing entity/vehicle documents';



COMMENT ON COLUMN "public"."entity_folders"."folder_type" IS 'Type of folder: kyc, legal, redemption_closure, financial_statements, etc.';



COMMENT ON COLUMN "public"."entity_folders"."is_default" IS 'Whether this is a system-created default folder';



COMMENT ON COLUMN "public"."entity_folders"."parent_folder_id" IS 'Optional parent folder for creating folder hierarchies';



CREATE TABLE IF NOT EXISTS "public"."entity_investors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid",
    "investor_id" "uuid",
    "relationship_role" "text",
    "allocation_status" "text" DEFAULT 'pending'::"text",
    "invite_sent_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text"
);


ALTER TABLE "public"."entity_investors" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_investors" IS 'Links investors to vehicles (funds/SPVs). Multiple subscriptions per investor-vehicle pair are supported. Subscriptions are fetched via JOIN on (vehicle_id, investor_id), not via subscription_id FK.';



CREATE TABLE IF NOT EXISTS "public"."entity_stakeholders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "role" "public"."stakeholder_role" NOT NULL,
    "company_name" "text",
    "contact_person" "text",
    "email" "text",
    "phone" "text",
    "effective_from" "date",
    "effective_to" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."entity_stakeholders" OWNER TO "postgres";


COMMENT ON TABLE "public"."entity_stakeholders" IS 'Tracks all stakeholders (lawyers, accountants, auditors, etc.) associated with each entity/vehicle';



COMMENT ON COLUMN "public"."entity_stakeholders"."role" IS 'Type of stakeholder: lawyer, accountant, administrator, auditor, strategic_partner, director, other';



COMMENT ON COLUMN "public"."entity_stakeholders"."effective_from" IS 'Date when this stakeholder relationship became active';



COMMENT ON COLUMN "public"."entity_stakeholders"."effective_to" IS 'Date when this stakeholder relationship ended (NULL if still active)';



CREATE TABLE IF NOT EXISTS "public"."esign_envelopes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
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
    "duration_periods" integer,
    "duration_unit" "text",
    "payment_schedule" "text" DEFAULT 'recurring'::"text",
    "tier_threshold_multiplier" numeric(10,2),
    "next_tier_component_id" "uuid",
    CONSTRAINT "fee_components_base_calculation_check" CHECK ((("base_calculation" IS NULL) OR ("base_calculation" = ANY (ARRAY['commitment'::"text", 'nav'::"text", 'profit'::"text", 'units'::"text", 'fixed'::"text"])))),
    CONSTRAINT "fee_components_duration_unit_check" CHECK (("duration_unit" = ANY (ARRAY['years'::"text", 'months'::"text", 'quarters'::"text", 'life_of_vehicle'::"text"]))),
    CONSTRAINT "fee_components_payment_schedule_check" CHECK (("payment_schedule" = ANY (ARRAY['upfront'::"text", 'recurring'::"text", 'on_demand'::"text"])))
);


ALTER TABLE "public"."fee_components" OWNER TO "postgres";


COMMENT ON COLUMN "public"."fee_components"."duration_periods" IS 'Number of periods the fee applies (e.g., 3 for "3 years"). NULL = indefinite/life of vehicle';



COMMENT ON COLUMN "public"."fee_components"."duration_unit" IS 'Unit for duration_periods: years, months, quarters, or life_of_vehicle';



COMMENT ON COLUMN "public"."fee_components"."payment_schedule" IS 'upfront = all periods paid at once, recurring = invoiced per period, on_demand = manual';



COMMENT ON COLUMN "public"."fee_components"."tier_threshold_multiplier" IS 'Threshold for this tier (e.g., 10.00 for "10x return"). NULL = no threshold';



COMMENT ON COLUMN "public"."fee_components"."next_tier_component_id" IS 'Link to next tier fee component for tiered performance fees';



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
    "period_end_date" "date",
    "allocation_type" "text"
);


ALTER TABLE "public"."fee_events" OWNER TO "postgres";


COMMENT ON COLUMN "public"."fee_events"."allocation_id" IS 'Polymorphic reference: stores either allocations.id OR subscriptions.id. No FK constraint to allow both uses. Check allocation_type column to determine which table is referenced.';



COMMENT ON COLUMN "public"."fee_events"."allocation_type" IS 'Indicates whether allocation_id references allocations or subscriptions table. Used for polymorphic relationship tracking.';



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


CREATE TABLE IF NOT EXISTS "public"."fee_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fee_component_id" "uuid" NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "deal_id" "uuid",
    "allocation_id" "uuid",
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "total_periods" integer NOT NULL,
    "completed_periods" integer DEFAULT 0,
    "next_due_date" "date",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "fee_schedules_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'cancelled'::"text", 'paused'::"text"]))),
    CONSTRAINT "valid_periods" CHECK (("completed_periods" <= "total_periods"))
);


ALTER TABLE "public"."fee_schedules" OWNER TO "postgres";


COMMENT ON TABLE "public"."fee_schedules" IS 'Tracks recurring fee schedules for automatic generation';



COMMENT ON COLUMN "public"."fee_schedules"."total_periods" IS 'Total number of fee periods (e.g., 3 for "3 years")';



COMMENT ON COLUMN "public"."fee_schedules"."completed_periods" IS 'Number of periods already invoiced';



COMMENT ON COLUMN "public"."fee_schedules"."next_due_date" IS 'Date when next fee event should be generated';



CREATE OR REPLACE VIEW "public"."folder_hierarchy" WITH ("security_invoker"='true') AS
 WITH RECURSIVE "folder_tree" AS (
         SELECT "document_folders"."id",
            "document_folders"."name",
            "document_folders"."path",
            "document_folders"."vehicle_id",
            "document_folders"."folder_type",
            "document_folders"."parent_folder_id",
            0 AS "depth",
            "document_folders"."name" AS "full_path"
           FROM "public"."document_folders"
          WHERE ("document_folders"."parent_folder_id" IS NULL)
        UNION ALL
         SELECT "df"."id",
            "df"."name",
            "df"."path",
            "df"."vehicle_id",
            "df"."folder_type",
            "df"."parent_folder_id",
            ("ft"."depth" + 1),
            (("ft"."full_path" || ' > '::"text") || "df"."name") AS "full_path"
           FROM ("public"."document_folders" "df"
             JOIN "folder_tree" "ft" ON (("df"."parent_folder_id" = "ft"."id")))
        )
 SELECT "id",
    ("repeat"('  '::"text", "depth") || "name") AS "indented_name",
    "path",
    "folder_type",
    "vehicle_id",
    "depth",
    "full_path"
   FROM "folder_tree"
  ORDER BY "vehicle_id", "path";


ALTER VIEW "public"."folder_hierarchy" OWNER TO "postgres";


COMMENT ON VIEW "public"."folder_hierarchy" IS 'Hierarchical view of document folders with SECURITY INVOKER for proper RLS enforcement';



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


CREATE TABLE IF NOT EXISTS "public"."investor_counterparty" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "legal_name" "text" NOT NULL,
    "registration_number" "text",
    "jurisdiction" "text",
    "tax_id" "text",
    "formation_date" "date",
    "registered_address" "jsonb",
    "representative_name" "text",
    "representative_title" "text",
    "representative_email" "text",
    "representative_phone" "text",
    "kyc_status" "text" DEFAULT 'pending'::"text",
    "kyc_completed_at" timestamp with time zone,
    "kyc_expiry_date" "date",
    "kyc_notes" "text",
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "investor_counterparty_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['trust'::"text", 'llc'::"text", 'partnership'::"text", 'family_office'::"text", 'law_firm'::"text", 'investment_bank'::"text", 'fund'::"text", 'corporation'::"text", 'other'::"text"]))),
    CONSTRAINT "investor_counterparty_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['pending'::"text", 'under_review'::"text", 'completed'::"text", 'rejected'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."investor_counterparty" OWNER TO "postgres";


COMMENT ON TABLE "public"."investor_counterparty" IS 'Stores investor-related entities (Trust, LLC, etc.) used for subscriptions';



CREATE TABLE IF NOT EXISTS "public"."investor_deal_holdings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "subscription_submission_id" "uuid",
    "approval_id" "uuid",
    "status" "text" DEFAULT 'pending_funding'::"text" NOT NULL,
    "subscribed_amount" numeric(18,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "effective_date" "date",
    "funding_due_at" timestamp with time zone,
    "funded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "investor_deal_holdings_status_check" CHECK (("status" = ANY (ARRAY['pending_funding'::"text", 'funded'::"text", 'active'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."investor_deal_holdings" OWNER TO "postgres";


COMMENT ON TABLE "public"."investor_deal_holdings" IS 'Tracks per-investor holdings/allocations for each deal once subscriptions are confirmed.';



CREATE TABLE IF NOT EXISTS "public"."investor_deal_interest" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "created_by" "uuid",
    "indicative_amount" numeric(18,2),
    "indicative_currency" "text",
    "notes" "text",
    "status" "text" DEFAULT 'pending_review'::"text" NOT NULL,
    "approval_id" "uuid",
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "approved_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_post_close" boolean DEFAULT false NOT NULL,
    CONSTRAINT "investor_deal_interest_post_close_must_be_approved" CHECK (((NOT "is_post_close") OR ("is_post_close" AND ("status" = 'approved'::"text")))),
    CONSTRAINT "investor_deal_interest_status_check" CHECK (("status" = ANY (ARRAY['pending_review'::"text", 'approved'::"text", 'rejected'::"text", 'withdrawn'::"text"])))
);


ALTER TABLE "public"."investor_deal_interest" OWNER TO "postgres";


COMMENT ON TABLE "public"."investor_deal_interest" IS 'Investor expressions of interest captured prior to formal commitments.';



COMMENT ON COLUMN "public"."investor_deal_interest"."is_post_close" IS 'True if this interest was expressed for a closed deal (future similar opportunities). Post-close interests are auto-approved and do not trigger the approval workflow.';



COMMENT ON CONSTRAINT "investor_deal_interest_post_close_must_be_approved" ON "public"."investor_deal_interest" IS 'Ensures that post-close interests (future similar opportunities) are always marked as approved since they bypass the approval workflow.';



CREATE TABLE IF NOT EXISTS "public"."investor_interest_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "deal_id" "uuid" NOT NULL,
    "signal_type" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."investor_interest_signals" OWNER TO "postgres";


COMMENT ON TABLE "public"."investor_interest_signals" IS 'Signals captured when investors express general interest in closed deals.';



CREATE TABLE IF NOT EXISTS "public"."investor_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "role_title" "text",
    "email" "text",
    "phone" "text",
    "residential_street" "text",
    "residential_city" "text",
    "residential_state" "text",
    "residential_postal_code" "text",
    "residential_country" "text",
    "nationality" "text",
    "id_type" "text",
    "id_number" "text",
    "id_expiry_date" "date",
    "ownership_percentage" numeric(5,2),
    "is_beneficial_owner" boolean DEFAULT false,
    "kyc_status" "text" DEFAULT 'pending'::"text",
    "kyc_approved_at" timestamp with time zone,
    "kyc_approved_by" "uuid",
    "kyc_expiry_date" "date",
    "is_active" boolean DEFAULT true,
    "effective_from" "date" DEFAULT CURRENT_DATE,
    "effective_to" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "investor_members_id_type_check" CHECK ((("id_type" IS NULL) OR ("id_type" = ANY (ARRAY['passport'::"text", 'national_id'::"text", 'drivers_license'::"text", 'other'::"text"])))),
    CONSTRAINT "investor_members_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['pending'::"text", 'submitted'::"text", 'approved'::"text", 'rejected'::"text", 'expired'::"text"]))),
    CONSTRAINT "investor_members_ownership_percentage_check" CHECK ((("ownership_percentage" IS NULL) OR (("ownership_percentage" >= (0)::numeric) AND ("ownership_percentage" <= (100)::numeric)))),
    CONSTRAINT "investor_members_role_check" CHECK (("role" = ANY (ARRAY['director'::"text", 'shareholder'::"text", 'beneficial_owner'::"text", 'authorized_signatory'::"text", 'officer'::"text", 'partner'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."investor_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."investor_members" IS 'Members (directors, shareholders, beneficial owners) of entity-type investors';



COMMENT ON COLUMN "public"."investor_members"."investor_id" IS 'References investors where type IN (entity, institution)';



CREATE TABLE IF NOT EXISTS "public"."investor_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "investor_id" "uuid",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "link" "text",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."investor_notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."investor_notifications" IS 'Stores notification entries delivered to investors and staff for deal workflow events.';



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

ALTER TABLE ONLY "public"."investor_users" FORCE ROW LEVEL SECURITY;


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
    "registered_address" "text",
    "city" "text",
    "representative_name" "text",
    "representative_title" "text",
    "residential_street" "text",
    "residential_city" "text",
    "residential_state" "text",
    "residential_postal_code" "text",
    "residential_country" "text",
    "phone_mobile" "text",
    "phone_office" "text",
    CONSTRAINT "investors_aml_risk_rating_check" CHECK (("aml_risk_rating" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "investors_onboarding_status_check" CHECK (("onboarding_status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text"]))),
    CONSTRAINT "investors_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."investors" OWNER TO "postgres";


COMMENT ON COLUMN "public"."investors"."registered_address" IS 'Registered address of the investor entity';



COMMENT ON COLUMN "public"."investors"."city" IS 'City for NDA Party A (City, Country Code format)';



COMMENT ON COLUMN "public"."investors"."representative_name" IS 'Name of authorized representative for corporate entities';



COMMENT ON COLUMN "public"."investors"."representative_title" IS 'Title of authorized representative';



COMMENT ON COLUMN "public"."investors"."residential_street" IS 'Residential address street (required for contracts)';



COMMENT ON COLUMN "public"."investors"."residential_city" IS 'Residential address city';



COMMENT ON COLUMN "public"."investors"."residential_state" IS 'Residential address state/province';



COMMENT ON COLUMN "public"."investors"."residential_postal_code" IS 'Residential address postal/zip code';



COMMENT ON COLUMN "public"."investors"."residential_country" IS 'Residential address country';



COMMENT ON COLUMN "public"."investors"."phone_mobile" IS 'Mobile phone number (primary contact)';



COMMENT ON COLUMN "public"."investors"."phone_office" IS 'Office/work phone number';



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
    "reminder_task_id" "uuid",
    "auto_send_enabled" boolean DEFAULT false,
    "reminder_days_before" integer DEFAULT 7,
    CONSTRAINT "invoices_match_status_check" CHECK (("match_status" = ANY (ARRAY['unmatched'::"text", 'partially_matched'::"text", 'matched'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


COMMENT ON COLUMN "public"."invoices"."reminder_task_id" IS 'Task created for invoice reminder';



COMMENT ON COLUMN "public"."invoices"."auto_send_enabled" IS 'Whether this invoice should be auto-sent on due date';



COMMENT ON COLUMN "public"."invoices"."reminder_days_before" IS 'Days before due_date to send reminder';



CREATE TABLE IF NOT EXISTS "public"."kyc_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "document_type" "text" NOT NULL,
    "document_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "rejection_reason" "text",
    "expiry_date" "date",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "previous_submission_id" "uuid",
    "counterparty_entity_id" "uuid",
    "custom_label" "text",
    "investor_member_id" "uuid",
    "counterparty_member_id" "uuid",
    CONSTRAINT "kyc_submission_owner_check" CHECK (((("investor_id" IS NOT NULL) AND ("counterparty_entity_id" IS NULL)) OR (("investor_id" IS NULL) AND ("counterparty_entity_id" IS NOT NULL)))),
    CONSTRAINT "kyc_submissions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'under_review'::"text", 'approved'::"text", 'rejected'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."kyc_submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."kyc_submissions" IS 'Tracks KYC document submissions from investors and their approval status';



COMMENT ON COLUMN "public"."kyc_submissions"."document_type" IS 'Document type identifier. Can be predefined type (government_id, proof_of_address, etc.) or custom type. When custom_label is set, that label should be displayed instead.';



COMMENT ON COLUMN "public"."kyc_submissions"."status" IS 'Approval status: pending, under_review, approved, rejected, expired';



COMMENT ON COLUMN "public"."kyc_submissions"."metadata" IS 'Additional metadata like file_size, mime_type, original_filename';



COMMENT ON COLUMN "public"."kyc_submissions"."version" IS 'Version number of this submission (increments with each re-upload for same document type)';



COMMENT ON COLUMN "public"."kyc_submissions"."previous_submission_id" IS 'Reference to the previous version of this submission (if this is a re-upload)';



COMMENT ON COLUMN "public"."kyc_submissions"."counterparty_entity_id" IS 'Link to counterparty entity for entity-specific KYC documents';



COMMENT ON COLUMN "public"."kyc_submissions"."custom_label" IS 'User-provided label for custom document types. When set, this overrides the display of document_type for user-facing labels.';



COMMENT ON COLUMN "public"."kyc_submissions"."investor_member_id" IS 'Links KYC doc to specific member of entity-type investor';



COMMENT ON COLUMN "public"."kyc_submissions"."counterparty_member_id" IS 'Links KYC doc to specific member of counterparty entity';



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

ALTER TABLE ONLY "public"."positions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."positions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'investor'::"public"."user_role" NOT NULL,
    "display_name" "text",
    "email" "public"."citext",
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "avatar_url" "text",
    "phone" "text",
    "office_location" "text",
    "bio" "text",
    "last_login_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "has_seen_intro_video" boolean DEFAULT false,
    "password_set" boolean DEFAULT false,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."avatar_url" IS 'URL to profile avatar image in storage bucket';



COMMENT ON COLUMN "public"."profiles"."phone" IS 'User phone number (mainly for staff)';



COMMENT ON COLUMN "public"."profiles"."office_location" IS 'Office location (mainly for staff)';



COMMENT ON COLUMN "public"."profiles"."bio" IS 'User biography or description';



COMMENT ON COLUMN "public"."profiles"."last_login_at" IS 'Timestamp of last login';



COMMENT ON COLUMN "public"."profiles"."updated_at" IS 'Timestamp of last profile update';



COMMENT ON COLUMN "public"."profiles"."has_seen_intro_video" IS 'Tracks whether user has seen the intro video on first login. Once true, never shows again.';



COMMENT ON COLUMN "public"."profiles"."password_set" IS 'Tracks if user has set password after invitation. False for invited users until they set password.';



COMMENT ON COLUMN "public"."profiles"."deleted_at" IS 'Soft delete timestamp - null means active, populated means deactivated';



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
    "priority" "public"."request_priority_enum" DEFAULT 'normal'::"public"."request_priority_enum",
    "due_date" timestamp with time zone
);


ALTER TABLE "public"."request_tickets" OWNER TO "postgres";


COMMENT ON COLUMN "public"."request_tickets"."due_date" IS 'Deadline for completing the request';



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


CREATE TABLE IF NOT EXISTS "public"."signature_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_run_id" "uuid",
    "investor_id" "uuid",
    "signer_email" "text" NOT NULL,
    "signer_name" "text" NOT NULL,
    "document_type" "text" NOT NULL,
    "signing_token" "text" NOT NULL,
    "token_expires_at" timestamp with time zone NOT NULL,
    "google_drive_file_id" "text",
    "google_drive_url" "text",
    "unsigned_pdf_path" "text",
    "unsigned_pdf_size" integer,
    "signed_pdf_path" "text",
    "signed_pdf_size" integer,
    "signature_data_url" "text",
    "signature_timestamp" timestamp with time zone,
    "signature_ip_address" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "email_sent_at" timestamp with time zone,
    "email_opened_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "signer_role" "text" NOT NULL,
    "signature_position" "text" NOT NULL,
    "email_message_id" "text",
    "email_error" "text",
    "subscription_id" "uuid",
    "document_id" "uuid",
    CONSTRAINT "signature_requests_document_type_check" CHECK (("document_type" = ANY (ARRAY['nda'::"text", 'subscription'::"text", 'amendment'::"text", 'other'::"text"]))),
    CONSTRAINT "signature_requests_signature_position_check" CHECK (("signature_position" = ANY (ARRAY['party_a'::"text", 'party_b'::"text"]))),
    CONSTRAINT "signature_requests_signer_role_check" CHECK (("signer_role" = ANY (ARRAY['investor'::"text", 'admin'::"text"]))),
    CONSTRAINT "signature_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'signed'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."signature_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."signature_requests" IS 'Tracks e-signature requests for NDAs, subscription agreements, and other documents';



COMMENT ON COLUMN "public"."signature_requests"."workflow_run_id" IS 'Optional workflow run ID - only populated for n8n generated documents. NULL for manually uploaded documents.';



COMMENT ON COLUMN "public"."signature_requests"."signing_token" IS 'Cryptographically secure random token for signing URL';



COMMENT ON COLUMN "public"."signature_requests"."token_expires_at" IS 'Token expiration timestamp (default 7 days from creation)';



COMMENT ON COLUMN "public"."signature_requests"."google_drive_file_id" IS 'Source file ID from Google Drive (from n8n workflow)';



COMMENT ON COLUMN "public"."signature_requests"."unsigned_pdf_path" IS 'Supabase Storage path for unsigned PDF';



COMMENT ON COLUMN "public"."signature_requests"."signed_pdf_path" IS 'Supabase Storage path for signed PDF with stamped signature';



COMMENT ON COLUMN "public"."signature_requests"."signature_data_url" IS 'Base64 encoded signature image from canvas';



COMMENT ON COLUMN "public"."signature_requests"."status" IS 'Current status: pending, signed, expired, cancelled';



COMMENT ON COLUMN "public"."signature_requests"."signer_role" IS 'Role of the signer: investor or admin';



COMMENT ON COLUMN "public"."signature_requests"."signature_position" IS 'Position in signature table: party_a (left) or party_b (right)';



COMMENT ON COLUMN "public"."signature_requests"."email_message_id" IS 'Resend message ID for tracking email delivery';



COMMENT ON COLUMN "public"."signature_requests"."email_error" IS 'Error message if email send failed';



COMMENT ON COLUMN "public"."signature_requests"."subscription_id" IS 'Direct link to subscription for manually uploaded subscription packs';



COMMENT ON COLUMN "public"."signature_requests"."document_id" IS 'Direct link to document being signed';



CREATE TABLE IF NOT EXISTS "public"."staff_filter_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "filters" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "staff_filter_views_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['investor'::"text", 'subscription'::"text", 'deal'::"text", 'vehicle'::"text"])))
);


ALTER TABLE "public"."staff_filter_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."staff_filter_views" IS 'Stores saved filter combinations for staff users.';



CREATE TABLE IF NOT EXISTS "public"."staff_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "permission" "text" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    CONSTRAINT "staff_permissions_permission_check" CHECK (("permission" = ANY (ARRAY['manage_staff'::"text", 'view_financials'::"text", 'trigger_workflows'::"text", 'manage_investors'::"text", 'manage_deals'::"text", 'view_audit_logs'::"text", 'manage_system_config'::"text", 'manage_api_keys'::"text", 'manage_feature_flags'::"text", 'export_data'::"text", 'super_admin'::"text"])))
);


ALTER TABLE "public"."staff_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."staff_permissions" IS 'Granular permission system for staff users';



CREATE TABLE IF NOT EXISTS "public"."subscription_fingerprints" (
    "fingerprint" "text" NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fingerprint_format_check" CHECK (("length"("fingerprint") = 64))
);

ALTER TABLE ONLY "public"."subscription_fingerprints" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_fingerprints" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscription_fingerprints" IS 'Tracks SHA256 fingerprints of imported subscriptions for idempotency. Fingerprint = hash(investor_id:vehicle_id:commitment:effective_date). Allows safe re-runs of migration scripts - duplicates are skipped, legitimate follow-on investments are imported.';



COMMENT ON COLUMN "public"."subscription_fingerprints"."fingerprint" IS 'SHA256 hash of investor_id:vehicle_id:commitment:effective_date. Used to detect exact duplicate imports.';



COMMENT ON COLUMN "public"."subscription_fingerprints"."subscription_id" IS 'Reference to the subscription this fingerprint represents. Cascades on delete.';



CREATE TABLE IF NOT EXISTS "public"."subscription_import_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "subscription_id" "uuid",
    "entity_investor_id" "uuid",
    "investor_deal_holding_id" "uuid",
    "investor_id" "uuid" NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."subscription_import_results" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_import_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_workbook_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_filename" "text" NOT NULL,
    "source_hash" "text",
    "dry_run" boolean DEFAULT false,
    "executed_by" "text",
    "run_state" "text" DEFAULT 'importing'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "subscription_workbook_runs_run_state_check" CHECK (("run_state" = ANY (ARRAY['importing'::"text", 'loaded'::"text", 'failed'::"text"])))
);

ALTER TABLE ONLY "public"."subscription_workbook_runs" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_workbook_runs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subscriptions_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."subscriptions_number_seq" OWNER TO "postgres";


COMMENT ON SEQUENCE "public"."subscriptions_number_seq" IS 'Auto-incrementing sequence for subscription numbers';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid",
    "vehicle_id" "uuid",
    "commitment" numeric(18,2),
    "currency" "text" DEFAULT 'USD'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "signed_doc_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "committed_at" timestamp with time zone,
    "effective_date" "date",
    "funding_due_at" "date",
    "units" numeric(28,8),
    "acknowledgement_notes" "text",
    "subscription_number" integer DEFAULT "nextval"('"public"."subscriptions_number_seq"'::"regclass") NOT NULL,
    "price_per_share" numeric,
    "cost_per_share" numeric,
    "num_shares" numeric,
    "spread_per_share" numeric,
    "spread_fee_amount" numeric,
    "subscription_fee_percent" numeric,
    "subscription_fee_amount" numeric,
    "bd_fee_percent" numeric,
    "bd_fee_amount" numeric,
    "finra_fee_amount" numeric,
    "performance_fee_tier1_percent" numeric,
    "performance_fee_tier1_threshold" numeric,
    "performance_fee_tier2_percent" numeric,
    "performance_fee_tier2_threshold" numeric,
    "opportunity_name" "text",
    "contract_date" "date",
    "sourcing_contract_ref" "text",
    "introducer_id" "uuid",
    "introduction_id" "uuid",
    "funded_amount" numeric DEFAULT 0,
    "outstanding_amount" numeric,
    "capital_calls_total" numeric DEFAULT 0,
    "distributions_total" numeric DEFAULT 0,
    "current_nav" numeric,
    "fee_plan_id" "uuid",
    "management_fee_percent" numeric(7,4),
    "management_fee_amount" numeric(18,2),
    "management_fee_frequency" "text",
    "deal_id" "uuid",
    "subscription_date" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_management_fee_frequency_check" CHECK (("management_fee_frequency" = ANY (ARRAY['one_time'::"text", 'monthly'::"text", 'quarterly'::"text", 'annual'::"text", 'on_exit'::"text"]))),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'committed'::"text", 'active'::"text", 'closed'::"text", 'cancelled'::"text"])))
);

ALTER TABLE ONLY "public"."subscriptions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."subscriptions"."subscription_number" IS 'Sequential number for multiple subscriptions per investor-vehicle pair. First subscription is #1, follow-on investments are #2, #3, etc. Auto-assigned by trigger on INSERT.';



COMMENT ON COLUMN "public"."subscriptions"."price_per_share" IS 'Price per share that investor paid (entry price)';



COMMENT ON COLUMN "public"."subscriptions"."cost_per_share" IS 'Cost per share that VERSO paid to acquire';



COMMENT ON COLUMN "public"."subscriptions"."num_shares" IS 'Number of shares invested';



COMMENT ON COLUMN "public"."subscriptions"."spread_per_share" IS 'Spread per share (price_per_share - cost_per_share)';



COMMENT ON COLUMN "public"."subscriptions"."spread_fee_amount" IS 'Total spread fees earned (spread_per_share * num_shares) - PRIMARY REVENUE';



COMMENT ON COLUMN "public"."subscriptions"."subscription_fee_percent" IS 'Subscription fee percentage charged to investor';



COMMENT ON COLUMN "public"."subscriptions"."subscription_fee_amount" IS 'Total subscription fee amount';



COMMENT ON COLUMN "public"."subscriptions"."bd_fee_percent" IS 'Business development / introducer commission percentage';



COMMENT ON COLUMN "public"."subscriptions"."bd_fee_amount" IS 'Total BD/introducer commission amount';



COMMENT ON COLUMN "public"."subscriptions"."finra_fee_amount" IS 'FINRA regulatory fees';



COMMENT ON COLUMN "public"."subscriptions"."performance_fee_tier1_percent" IS 'Performance fee tier 1 percentage (carry)';



COMMENT ON COLUMN "public"."subscriptions"."performance_fee_tier1_threshold" IS 'Threshold for tier 1 performance fee';



COMMENT ON COLUMN "public"."subscriptions"."performance_fee_tier2_percent" IS 'Performance fee tier 2 percentage (carry)';



COMMENT ON COLUMN "public"."subscriptions"."performance_fee_tier2_threshold" IS 'Threshold for tier 2 performance fee';



COMMENT ON COLUMN "public"."subscriptions"."opportunity_name" IS 'Name of the investment opportunity/deal';



COMMENT ON COLUMN "public"."subscriptions"."contract_date" IS 'Date of subscription contract';



COMMENT ON COLUMN "public"."subscriptions"."sourcing_contract_ref" IS 'Reference to sourcing contract document';



COMMENT ON COLUMN "public"."subscriptions"."introducer_id" IS 'Foreign key to introducers table if subscription came through introducer';



COMMENT ON COLUMN "public"."subscriptions"."introduction_id" IS 'Foreign key to introductions table linking to specific introduction record';



COMMENT ON COLUMN "public"."subscriptions"."funded_amount" IS 'Amount actually funded by investor (may differ from commitment)';



COMMENT ON COLUMN "public"."subscriptions"."outstanding_amount" IS 'Calculated: commitment - funded_amount';



COMMENT ON COLUMN "public"."subscriptions"."capital_calls_total" IS 'Total capital calls issued to this investor';



COMMENT ON COLUMN "public"."subscriptions"."distributions_total" IS 'Total distributions paid to this investor';



COMMENT ON COLUMN "public"."subscriptions"."current_nav" IS 'Current net asset value of this subscription position';



COMMENT ON COLUMN "public"."subscriptions"."fee_plan_id" IS 'References the fee plan that was used to populate this subscription fees';



COMMENT ON COLUMN "public"."subscriptions"."management_fee_percent" IS 'Management fee as percentage (e.g., 2.5 for 2.5%)';



COMMENT ON COLUMN "public"."subscriptions"."management_fee_amount" IS 'Fixed management fee amount if applicable';



COMMENT ON COLUMN "public"."subscriptions"."management_fee_frequency" IS 'How often management fees are charged';



COMMENT ON COLUMN "public"."subscriptions"."deal_id" IS 'The deal that led to this subscription (for tracking deal flow to committed subscriptions)';



COMMENT ON COLUMN "public"."subscriptions"."subscription_date" IS 'Date when the subscription was formally created/approved';



CREATE TABLE IF NOT EXISTS "public"."suggested_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bank_transaction_id" "uuid",
    "invoice_id" "uuid",
    "confidence" integer NOT NULL,
    "match_reason" "text" NOT NULL,
    "amount_difference" numeric(18,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "subscription_id" "uuid",
    CONSTRAINT "suggested_matches_confidence_check" CHECK ((("confidence" >= 0) AND ("confidence" <= 100)))
);


ALTER TABLE "public"."suggested_matches" OWNER TO "postgres";


COMMENT ON COLUMN "public"."suggested_matches"."subscription_id" IS 'Match suggestion for subscription-based reconciliation';



CREATE TABLE IF NOT EXISTS "public"."system_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_type" "text" NOT NULL,
    "value" numeric NOT NULL,
    "unit" "text",
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "system_metrics_metric_type_check" CHECK (("metric_type" = ANY (ARRAY['api_response_time'::"text", 'error_rate'::"text", 'uptime'::"text", 'request_volume'::"text", 'active_sessions'::"text", 'database_connections'::"text"])))
);


ALTER TABLE "public"."system_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."system_metrics" IS 'Real-time system performance metrics for super admin dashboard';



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

ALTER TABLE ONLY "public"."workflow_run_logs" FORCE ROW LEVEL SECURITY;


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
    "created_tasks" "uuid"[],
    "signing_in_progress" boolean,
    "signing_locked_by" "uuid",
    "signing_locked_at" timestamp with time zone,
    CONSTRAINT "workflow_signing_lock_consistency" CHECK (((("signing_in_progress" = true) AND ("signing_locked_by" IS NOT NULL) AND ("signing_locked_at" IS NOT NULL)) OR ((("signing_in_progress" IS NULL) OR ("signing_in_progress" = false)) AND ("signing_locked_by" IS NULL) AND ("signing_locked_at" IS NULL))))
);


ALTER TABLE "public"."workflow_runs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."workflow_runs"."signing_in_progress" IS 'Lock flag for progressive signing. TRUE when a signature is being processed, NULL when available. Used to prevent race conditions.';



COMMENT ON COLUMN "public"."workflow_runs"."signing_locked_by" IS 'References the signature_request that currently holds the lock. NULL when unlocked. FK constraint ensures referential integrity.';



COMMENT ON COLUMN "public"."workflow_runs"."signing_locked_at" IS 'Timestamp when the lock was acquired. Used for detecting stale locks and debugging race conditions.';



COMMENT ON CONSTRAINT "workflow_signing_lock_consistency" ON "public"."workflow_runs" IS 'Ensures workflow signing lock fields are consistent: either all locked fields are set, or all are NULL/false. Prevents orphaned lock states.';



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


ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."allocations"
    ADD CONSTRAINT "allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_history"
    ADD CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."arranger_entities"
    ADD CONSTRAINT "arranger_entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_report_templates"
    ADD CONSTRAINT "audit_report_templates_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."audit_report_templates"
    ADD CONSTRAINT "audit_report_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_webhook_events"
    ADD CONSTRAINT "automation_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_transactions"
    ADD CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."capital_call_items"
    ADD CONSTRAINT "capital_call_items_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."counterparty_entity_members"
    ADD CONSTRAINT "counterparty_entity_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboard_preferences"
    ADD CONSTRAINT "dashboard_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboard_preferences"
    ADD CONSTRAINT "dashboard_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."deal_activity_events"
    ADD CONSTRAINT "deal_activity_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_data_room_access"
    ADD CONSTRAINT "deal_data_room_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_data_room_documents"
    ADD CONSTRAINT "deal_data_room_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_faqs"
    ADD CONSTRAINT "deal_faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_fee_structures"
    ADD CONSTRAINT "deal_fee_structures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_pkey" PRIMARY KEY ("deal_id", "user_id");



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."director_registry"
    ADD CONSTRAINT "director_registry_full_name_email_key" UNIQUE ("full_name", "email");



ALTER TABLE ONLY "public"."director_registry"
    ADD CONSTRAINT "director_registry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."distribution_items"
    ADD CONSTRAINT "distribution_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."entity_flags"
    ADD CONSTRAINT "entity_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_folders"
    ADD CONSTRAINT "entity_folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_folders"
    ADD CONSTRAINT "entity_folders_vehicle_id_folder_type_folder_name_key" UNIQUE ("vehicle_id", "folder_type", "folder_name");



ALTER TABLE ONLY "public"."entity_investors"
    ADD CONSTRAINT "entity_investors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entity_investors"
    ADD CONSTRAINT "entity_investors_vehicle_id_investor_id_key" UNIQUE ("vehicle_id", "investor_id");



ALTER TABLE ONLY "public"."entity_stakeholders"
    ADD CONSTRAINT "entity_stakeholders_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."fee_schedules"
    ADD CONSTRAINT "fee_schedules_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."investor_counterparty"
    ADD CONSTRAINT "investor_counterparty_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_deal_holdings"
    ADD CONSTRAINT "investor_deal_holdings_investor_id_deal_id_key" UNIQUE ("investor_id", "deal_id");



ALTER TABLE ONLY "public"."investor_deal_holdings"
    ADD CONSTRAINT "investor_deal_holdings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_deal_interest"
    ADD CONSTRAINT "investor_deal_interest_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_interest_signals"
    ADD CONSTRAINT "investor_interest_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_members"
    ADD CONSTRAINT "investor_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_notifications"
    ADD CONSTRAINT "investor_notifications_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."share_lots"
    ADD CONSTRAINT "share_lots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."share_sources"
    ADD CONSTRAINT "share_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signature_requests"
    ADD CONSTRAINT "signature_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signature_requests"
    ADD CONSTRAINT "signature_requests_signing_token_key" UNIQUE ("signing_token");



ALTER TABLE ONLY "public"."staff_filter_views"
    ADD CONSTRAINT "staff_filter_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_permissions"
    ADD CONSTRAINT "staff_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_permissions"
    ADD CONSTRAINT "staff_permissions_user_id_permission_key" UNIQUE ("user_id", "permission");



ALTER TABLE ONLY "public"."subscription_fingerprints"
    ADD CONSTRAINT "subscription_fingerprints_pkey" PRIMARY KEY ("fingerprint");



ALTER TABLE ONLY "public"."subscription_import_results"
    ADD CONSTRAINT "subscription_import_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_workbook_runs"
    ADD CONSTRAINT "subscription_workbook_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_number_unique" UNIQUE ("subscription_number");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suggested_matches"
    ADD CONSTRAINT "suggested_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_metrics"
    ADD CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."deal_data_room_access"
    ADD CONSTRAINT "unique_deal_investor_access" UNIQUE ("deal_id", "investor_id");



COMMENT ON CONSTRAINT "unique_deal_investor_access" ON "public"."deal_data_room_access" IS 'Ensures only one access record exists per investor per deal. Prevents automation and manual processes from creating duplicates.';



ALTER TABLE ONLY "public"."valuations"
    ADD CONSTRAINT "valuations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."valuations"
    ADD CONSTRAINT "valuations_vehicle_id_as_of_date_key" UNIQUE ("vehicle_id", "as_of_date");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_entity_code_key" UNIQUE ("entity_code");



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



CREATE INDEX "activity_feed_created_at_idx" ON "public"."activity_feed" USING "btree" ("created_at" DESC);



CREATE INDEX "activity_feed_created_by_idx" ON "public"."activity_feed" USING "btree" ("created_by");



CREATE INDEX "activity_feed_entity_type_idx" ON "public"."activity_feed" USING "btree" ("activity_type");



CREATE INDEX "activity_feed_investor_entity_idx" ON "public"."activity_feed" USING "btree" ("investor_id", "activity_type");



CREATE INDEX "activity_feed_investor_id_idx" ON "public"."activity_feed" USING "btree" ("investor_id");



CREATE INDEX "arranger_entities_created_at_idx" ON "public"."arranger_entities" USING "btree" ("created_at" DESC);



CREATE INDEX "arranger_entities_kyc_status_idx" ON "public"."arranger_entities" USING "btree" ("kyc_status");



CREATE INDEX "arranger_entities_legal_name_idx" ON "public"."arranger_entities" USING "btree" ("legal_name");



CREATE INDEX "arranger_entities_status_idx" ON "public"."arranger_entities" USING "btree" ("status");



CREATE INDEX "cashflows_investor_id_vehicle_id_date_idx" ON "public"."cashflows" USING "btree" ("investor_id", "vehicle_id", "date");



CREATE INDEX "deals_arranger_entity_id_idx" ON "public"."deals" USING "btree" ("arranger_entity_id");



CREATE UNIQUE INDEX "document_folders_vehicle_name_idx" ON "public"."document_folders" USING "btree" ("vehicle_id", "name");



CREATE INDEX "documents_arranger_entity_id_idx" ON "public"."documents" USING "btree" ("arranger_entity_id");



CREATE INDEX "documents_entity_idx" ON "public"."documents" USING "btree" ("entity_id");



CREATE INDEX "documents_owner_investor_id_vehicle_id_type_idx" ON "public"."documents" USING "btree" ("owner_investor_id", "vehicle_id", "type");



CREATE INDEX "documents_vehicle_idx" ON "public"."documents" USING "btree" ("vehicle_id");



CREATE INDEX "entity_flags_severity_idx" ON "public"."entity_flags" USING "btree" ("severity");



CREATE INDEX "entity_flags_status_idx" ON "public"."entity_flags" USING "btree" ("status");



CREATE INDEX "entity_flags_vehicle_idx" ON "public"."entity_flags" USING "btree" ("vehicle_id");



CREATE INDEX "entity_investors_investor_idx" ON "public"."entity_investors" USING "btree" ("investor_id");



CREATE INDEX "entity_investors_status_idx" ON "public"."entity_investors" USING "btree" ("allocation_status");



CREATE INDEX "entity_investors_vehicle_idx" ON "public"."entity_investors" USING "btree" ("vehicle_id");



CREATE INDEX "entity_stakeholders_role_idx" ON "public"."entity_stakeholders" USING "btree" ("role");



CREATE INDEX "entity_stakeholders_vehicle_idx" ON "public"."entity_stakeholders" USING "btree" ("vehicle_id");



CREATE INDEX "idx_allocations_approved_by" ON "public"."allocations" USING "btree" ("approved_by");



CREATE INDEX "idx_allocations_deal_investor_status" ON "public"."allocations" USING "btree" ("deal_id", "investor_id", "status");



CREATE INDEX "idx_approval_history_actor" ON "public"."approval_history" USING "btree" ("actor_id", "created_at" DESC);



CREATE INDEX "idx_approval_history_approval" ON "public"."approval_history" USING "btree" ("approval_id", "created_at" DESC);



CREATE INDEX "idx_approvals_approved_by" ON "public"."approvals" USING "btree" ("approved_by");



CREATE INDEX "idx_approvals_assigned" ON "public"."approvals" USING "btree" ("assigned_to", "status", "created_at" DESC);



CREATE INDEX "idx_approvals_assigned_status" ON "public"."approvals" USING "btree" ("assigned_to", "status");



CREATE INDEX "idx_approvals_entity" ON "public"."approvals" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_approvals_related_deal" ON "public"."approvals" USING "btree" ("related_deal_id") WHERE ("related_deal_id" IS NOT NULL);



CREATE INDEX "idx_approvals_related_investor" ON "public"."approvals" USING "btree" ("related_investor_id") WHERE ("related_investor_id" IS NOT NULL);



CREATE INDEX "idx_approvals_requester" ON "public"."approvals" USING "btree" ("requested_by", "created_at" DESC);



CREATE INDEX "idx_approvals_secondary_approved_by" ON "public"."approvals" USING "btree" ("secondary_approved_by");



CREATE INDEX "idx_approvals_status_sla" ON "public"."approvals" USING "btree" ("status", "sla_breach_at") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_actor_id" ON "public"."audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_logs_compliance_flag" ON "public"."audit_logs" USING "btree" ("compliance_flag") WHERE ("compliance_flag" = true);



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_logs_risk_level" ON "public"."audit_logs" USING "btree" ("risk_level");



CREATE INDEX "idx_audit_logs_timestamp" ON "public"."audit_logs" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_automation_webhook_events_type" ON "public"."automation_webhook_events" USING "btree" ("event_type", "received_at" DESC);



CREATE INDEX "idx_bank_transactions_account" ON "public"."bank_transactions" USING "btree" ("account_ref", "value_date" DESC);



CREATE INDEX "idx_bank_transactions_account_date_amount" ON "public"."bank_transactions" USING "btree" ("account_ref", "value_date", "amount");



CREATE INDEX "idx_bank_transactions_match_confidence" ON "public"."bank_transactions" USING "btree" ("match_confidence");



CREATE INDEX "idx_bank_transactions_status" ON "public"."bank_transactions" USING "btree" ("status", "value_date" DESC);



CREATE INDEX "idx_bank_txns_match_status" ON "public"."bank_transactions" USING "btree" ("status", "value_date" DESC);



CREATE INDEX "idx_bank_txns_matched_subscription" ON "public"."bank_transactions" USING "btree" ("matched_subscription_id") WHERE ("matched_subscription_id" IS NOT NULL);



CREATE INDEX "idx_capital_call_items_call" ON "public"."capital_call_items" USING "btree" ("capital_call_id", "status");



CREATE INDEX "idx_capital_call_items_investor" ON "public"."capital_call_items" USING "btree" ("investor_id");



CREATE INDEX "idx_capital_call_items_status_due" ON "public"."capital_call_items" USING "btree" ("status", "due_date") WHERE ("status" = ANY (ARRAY['pending'::"text", 'partially_paid'::"text", 'overdue'::"text"]));



CREATE INDEX "idx_capital_call_items_subscription" ON "public"."capital_call_items" USING "btree" ("subscription_id");



CREATE INDEX "idx_capital_calls_vehicle_id" ON "public"."capital_calls" USING "btree" ("vehicle_id");



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



CREATE INDEX "idx_counterparty_entity_members_active" ON "public"."counterparty_entity_members" USING "btree" ("counterparty_entity_id") WHERE ("is_active" = true);



CREATE INDEX "idx_counterparty_entity_members_email" ON "public"."counterparty_entity_members" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "idx_counterparty_entity_members_entity_id" ON "public"."counterparty_entity_members" USING "btree" ("counterparty_entity_id");



CREATE INDEX "idx_deal_activity_events_deal" ON "public"."deal_activity_events" USING "btree" ("deal_id", "event_type", "occurred_at" DESC);



CREATE INDEX "idx_deal_data_room_access_deal_investor" ON "public"."deal_data_room_access" USING "btree" ("deal_id", "investor_id");



CREATE INDEX "idx_deal_data_room_access_expires" ON "public"."deal_data_room_access" USING "btree" ("expires_at");



CREATE INDEX "idx_deal_data_room_access_expires_at" ON "public"."deal_data_room_access" USING "btree" ("expires_at") WHERE ("revoked_at" IS NULL);



CREATE INDEX "idx_deal_data_room_access_expiry_warnings" ON "public"."deal_data_room_access" USING "btree" ("expires_at", "last_warning_sent_at") WHERE (("revoked_at" IS NULL) AND ("expires_at" IS NOT NULL));



CREATE INDEX "idx_deal_data_room_access_granted_by" ON "public"."deal_data_room_access" USING "btree" ("granted_by");



CREATE INDEX "idx_deal_data_room_access_revoked_by" ON "public"."deal_data_room_access" USING "btree" ("revoked_by");



CREATE INDEX "idx_deal_data_room_documents_deal" ON "public"."deal_data_room_documents" USING "btree" ("deal_id", "folder");



CREATE INDEX "idx_deal_data_room_documents_expires" ON "public"."deal_data_room_documents" USING "btree" ("document_expires_at") WHERE (("document_expires_at" IS NOT NULL) AND ("visible_to_investors" = true));



CREATE INDEX "idx_deal_data_room_documents_replaced_by" ON "public"."deal_data_room_documents" USING "btree" ("replaced_by_id") WHERE ("replaced_by_id" IS NOT NULL);



CREATE INDEX "idx_deal_data_room_documents_tags" ON "public"."deal_data_room_documents" USING "gin" ("tags") WHERE ("tags" IS NOT NULL);



CREATE INDEX "idx_deal_data_room_documents_visibility" ON "public"."deal_data_room_documents" USING "btree" ("visible_to_investors");



CREATE INDEX "idx_deal_faqs_created_at" ON "public"."deal_faqs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_deal_faqs_deal_id" ON "public"."deal_faqs" USING "btree" ("deal_id", "display_order");



CREATE INDEX "idx_deal_fee_structures_deal_status" ON "public"."deal_fee_structures" USING "btree" ("deal_id", "status");



CREATE INDEX "idx_deal_fee_structures_effective" ON "public"."deal_fee_structures" USING "btree" ("deal_id", "effective_at" DESC);



CREATE INDEX "idx_deal_memberships_investor" ON "public"."deal_memberships" USING "btree" ("investor_id");



CREATE INDEX "idx_deal_memberships_user" ON "public"."deal_memberships" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_deal_room_per_deal" ON "public"."conversations" USING "btree" ("deal_id") WHERE (("type" = 'deal_room'::"public"."conversation_type_enum") AND ("archived_at" IS NULL));



CREATE INDEX "idx_deal_subscription_submissions_deal" ON "public"."deal_subscription_submissions" USING "btree" ("deal_id");



CREATE INDEX "idx_deal_subscription_submissions_entity" ON "public"."deal_subscription_submissions" USING "btree" ("counterparty_entity_id");



CREATE INDEX "idx_deal_subscription_submissions_investor" ON "public"."deal_subscription_submissions" USING "btree" ("investor_id");



CREATE INDEX "idx_deal_subscription_submissions_status" ON "public"."deal_subscription_submissions" USING "btree" ("status");



CREATE INDEX "idx_deals_created_by" ON "public"."deals" USING "btree" ("created_by");



CREATE INDEX "idx_deals_status" ON "public"."deals" USING "btree" ("status") WHERE ("status" = ANY (ARRAY['open'::"public"."deal_status_enum", 'allocation_pending'::"public"."deal_status_enum", 'draft'::"public"."deal_status_enum"]));



CREATE INDEX "idx_deals_status_type" ON "public"."deals" USING "btree" ("status", "deal_type");



CREATE INDEX "idx_deals_vehicle" ON "public"."deals" USING "btree" ("vehicle_id");



CREATE INDEX "idx_director_registry_email" ON "public"."director_registry" USING "btree" ("email");



CREATE INDEX "idx_director_registry_name" ON "public"."director_registry" USING "btree" ("full_name");



CREATE INDEX "idx_distribution_items_distribution" ON "public"."distribution_items" USING "btree" ("distribution_id");



CREATE INDEX "idx_distribution_items_investor" ON "public"."distribution_items" USING "btree" ("investor_id");



CREATE INDEX "idx_distribution_items_status" ON "public"."distribution_items" USING "btree" ("status", "sent_date");



CREATE INDEX "idx_distribution_items_subscription" ON "public"."distribution_items" USING "btree" ("subscription_id");



CREATE INDEX "idx_doc_approvals_doc" ON "public"."document_approvals" USING "btree" ("document_id");



CREATE INDEX "idx_doc_approvals_reviewer" ON "public"."document_approvals" USING "btree" ("reviewed_by", "status");



CREATE INDEX "idx_doc_approvals_status" ON "public"."document_approvals" USING "btree" ("status", "requested_at");



CREATE INDEX "idx_doc_schedule_doc" ON "public"."document_publishing_schedule" USING "btree" ("document_id");



CREATE INDEX "idx_doc_schedule_publish" ON "public"."document_publishing_schedule" USING "btree" ("publish_at") WHERE (NOT "published");



CREATE INDEX "idx_doc_schedule_unpublish" ON "public"."document_publishing_schedule" USING "btree" ("unpublish_at") WHERE ("published" AND ("unpublish_at" IS NOT NULL));



CREATE INDEX "idx_doc_versions_doc" ON "public"."document_versions" USING "btree" ("document_id", "version_number" DESC);



CREATE UNIQUE INDEX "idx_doc_versions_unique" ON "public"."document_versions" USING "btree" ("document_id", "version_number");



CREATE INDEX "idx_document_folders_folder_type" ON "public"."document_folders" USING "btree" ("folder_type");



CREATE INDEX "idx_document_folders_parent_folder_id" ON "public"."document_folders" USING "btree" ("parent_folder_id");



CREATE INDEX "idx_document_folders_path" ON "public"."document_folders" USING "btree" ("path");



CREATE INDEX "idx_document_folders_vehicle_id" ON "public"."document_folders" USING "btree" ("vehicle_id");



CREATE INDEX "idx_documents_created_by" ON "public"."documents" USING "btree" ("created_by");



CREATE INDEX "idx_documents_entity_id" ON "public"."documents" USING "btree" ("entity_id");



CREATE INDEX "idx_documents_folder" ON "public"."documents" USING "btree" ("folder_id");



CREATE INDEX "idx_documents_name" ON "public"."documents" USING "btree" ("name");



CREATE INDEX "idx_documents_owner_investor_vehicle_deal_type" ON "public"."documents" USING "btree" ("owner_investor_id", "vehicle_id", "deal_id", "type");



CREATE INDEX "idx_documents_owner_user_id" ON "public"."documents" USING "btree" ("owner_user_id");



CREATE INDEX "idx_documents_published" ON "public"."documents" USING "btree" ("is_published", "vehicle_id");



CREATE INDEX "idx_documents_signature_workflow" ON "public"."documents" USING "btree" ("signature_workflow_run_id");



CREATE INDEX "idx_documents_status" ON "public"."documents" USING "btree" ("status");



CREATE INDEX "idx_documents_subscription_id" ON "public"."documents" USING "btree" ("subscription_id");



CREATE INDEX "idx_documents_subscription_submission_id" ON "public"."documents" USING "btree" ("subscription_submission_id");



CREATE INDEX "idx_documents_tags" ON "public"."documents" USING "gin" ("tags");



CREATE INDEX "idx_entity_directors_active" ON "public"."entity_directors" USING "btree" ("vehicle_id", "effective_to");



CREATE INDEX "idx_entity_directors_vehicle" ON "public"."entity_directors" USING "btree" ("vehicle_id");



CREATE INDEX "idx_entity_events_created" ON "public"."entity_events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_entity_events_vehicle" ON "public"."entity_events" USING "btree" ("vehicle_id");



CREATE INDEX "idx_entity_flags_due_date" ON "public"."entity_flags" USING "btree" ("due_date") WHERE (("due_date" IS NOT NULL) AND ("is_resolved" = false));



CREATE INDEX "idx_entity_flags_severity" ON "public"."entity_flags" USING "btree" ("severity");



CREATE INDEX "idx_entity_flags_type" ON "public"."entity_flags" USING "btree" ("flag_type");



CREATE INDEX "idx_entity_flags_unresolved" ON "public"."entity_flags" USING "btree" ("vehicle_id", "is_resolved") WHERE ("is_resolved" = false);



CREATE INDEX "idx_entity_flags_vehicle" ON "public"."entity_flags" USING "btree" ("vehicle_id");



CREATE INDEX "idx_entity_folders_parent" ON "public"."entity_folders" USING "btree" ("parent_folder_id");



CREATE INDEX "idx_entity_folders_type" ON "public"."entity_folders" USING "btree" ("folder_type");



CREATE INDEX "idx_entity_folders_vehicle" ON "public"."entity_folders" USING "btree" ("vehicle_id");



CREATE INDEX "idx_entity_stakeholders_role" ON "public"."entity_stakeholders" USING "btree" ("role");



CREATE INDEX "idx_entity_stakeholders_vehicle" ON "public"."entity_stakeholders" USING "btree" ("vehicle_id");



CREATE INDEX "idx_entity_stakeholders_vehicle_role" ON "public"."entity_stakeholders" USING "btree" ("vehicle_id", "role");



CREATE INDEX "idx_fee_events_allocation_id" ON "public"."fee_events" USING "btree" ("allocation_id") WHERE ("allocation_id" IS NOT NULL);



CREATE INDEX "idx_fee_events_allocation_type" ON "public"."fee_events" USING "btree" ("allocation_type");



CREATE INDEX "idx_fee_events_created_at" ON "public"."fee_events" USING "btree" ("created_at", "fee_type");



CREATE INDEX "idx_fee_events_deal_investor_status_date" ON "public"."fee_events" USING "btree" ("deal_id", "investor_id", "status", "event_date");



CREATE INDEX "idx_fee_events_fee_type_date" ON "public"."fee_events" USING "btree" ("fee_type", "event_date" DESC);



CREATE INDEX "idx_fee_events_investor_status_date" ON "public"."fee_events" USING "btree" ("investor_id", "status", "event_date" DESC);



CREATE INDEX "idx_fee_schedules_component" ON "public"."fee_schedules" USING "btree" ("fee_component_id");



CREATE INDEX "idx_fee_schedules_deal" ON "public"."fee_schedules" USING "btree" ("deal_id");



CREATE INDEX "idx_fee_schedules_investor" ON "public"."fee_schedules" USING "btree" ("investor_id");



CREATE INDEX "idx_fee_schedules_next_due" ON "public"."fee_schedules" USING "btree" ("next_due_date") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_fee_schedules_status" ON "public"."fee_schedules" USING "btree" ("status");



CREATE INDEX "idx_folders_parent" ON "public"."document_folders" USING "btree" ("parent_folder_id");



CREATE INDEX "idx_folders_path" ON "public"."document_folders" USING "btree" ("path");



CREATE INDEX "idx_folders_type" ON "public"."document_folders" USING "btree" ("folder_type");



CREATE UNIQUE INDEX "idx_folders_unique_path" ON "public"."document_folders" USING "btree" ("path");



CREATE INDEX "idx_folders_vehicle" ON "public"."document_folders" USING "btree" ("vehicle_id");



CREATE INDEX "idx_interest_signals_deal" ON "public"."investor_interest_signals" USING "btree" ("deal_id", "created_at" DESC);



CREATE INDEX "idx_interest_signals_investor" ON "public"."investor_interest_signals" USING "btree" ("investor_id", "created_at" DESC);



CREATE INDEX "idx_introducer_commissions_deal_investor" ON "public"."introducer_commissions" USING "btree" ("deal_id", "investor_id");



CREATE INDEX "idx_introducer_commissions_introducer" ON "public"."introducer_commissions" USING "btree" ("introducer_id");



CREATE INDEX "idx_introducer_commissions_introduction" ON "public"."introducer_commissions" USING "btree" ("introduction_id");



CREATE INDEX "idx_introducers_created_by" ON "public"."introducers" USING "btree" ("created_by");



CREATE INDEX "idx_introductions_deal_investor" ON "public"."introductions" USING "btree" ("deal_id", "prospect_investor_id");



CREATE INDEX "idx_introductions_introduced_at" ON "public"."introductions" USING "btree" ("introduced_at" DESC);



CREATE INDEX "idx_introductions_introducer" ON "public"."introductions" USING "btree" ("introducer_id");



CREATE INDEX "idx_investor_counterparty_active" ON "public"."investor_counterparty" USING "btree" ("investor_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_investor_counterparty_investor" ON "public"."investor_counterparty" USING "btree" ("investor_id");



CREATE INDEX "idx_investor_counterparty_kyc_status" ON "public"."investor_counterparty" USING "btree" ("kyc_status");



CREATE INDEX "idx_investor_deal_holdings_deal" ON "public"."investor_deal_holdings" USING "btree" ("deal_id");



CREATE INDEX "idx_investor_deal_holdings_investor" ON "public"."investor_deal_holdings" USING "btree" ("investor_id");



CREATE INDEX "idx_investor_deal_interest_approval_id" ON "public"."investor_deal_interest" USING "btree" ("approval_id");



CREATE INDEX "idx_investor_deal_interest_created_by" ON "public"."investor_deal_interest" USING "btree" ("created_by");



CREATE INDEX "idx_investor_deal_interest_deal" ON "public"."investor_deal_interest" USING "btree" ("deal_id");



CREATE INDEX "idx_investor_deal_interest_investor" ON "public"."investor_deal_interest" USING "btree" ("investor_id");



CREATE INDEX "idx_investor_deal_interest_post_close" ON "public"."investor_deal_interest" USING "btree" ("deal_id", "is_post_close");



CREATE INDEX "idx_investor_deal_interest_status" ON "public"."investor_deal_interest" USING "btree" ("status");



CREATE INDEX "idx_investor_members_active" ON "public"."investor_members" USING "btree" ("investor_id") WHERE ("is_active" = true);



CREATE INDEX "idx_investor_members_email" ON "public"."investor_members" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "idx_investor_members_investor_id" ON "public"."investor_members" USING "btree" ("investor_id");



CREATE INDEX "idx_investor_notifications_user_read" ON "public"."investor_notifications" USING "btree" ("user_id", "read_at");



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



CREATE INDEX "idx_kyc_submissions_counterparty_member" ON "public"."kyc_submissions" USING "btree" ("counterparty_member_id") WHERE ("counterparty_member_id" IS NOT NULL);



CREATE INDEX "idx_kyc_submissions_document" ON "public"."kyc_submissions" USING "btree" ("document_id");



CREATE INDEX "idx_kyc_submissions_entity" ON "public"."kyc_submissions" USING "btree" ("counterparty_entity_id");



CREATE INDEX "idx_kyc_submissions_investor" ON "public"."kyc_submissions" USING "btree" ("investor_id");



CREATE INDEX "idx_kyc_submissions_investor_member" ON "public"."kyc_submissions" USING "btree" ("investor_member_id") WHERE ("investor_member_id" IS NOT NULL);



CREATE INDEX "idx_kyc_submissions_previous" ON "public"."kyc_submissions" USING "btree" ("previous_submission_id");



CREATE INDEX "idx_kyc_submissions_status" ON "public"."kyc_submissions" USING "btree" ("status");



CREATE INDEX "idx_kyc_submissions_version" ON "public"."kyc_submissions" USING "btree" ("investor_id", "document_type", "version" DESC);



CREATE INDEX "idx_message_reads_user" ON "public"."message_reads" USING "btree" ("user_id");



CREATE INDEX "idx_messages_conversation_created" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "idx_messages_reply_thread" ON "public"."messages" USING "btree" ("reply_to_message_id");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_payments_invoice" ON "public"."payments" USING "btree" ("invoice_id");



CREATE INDEX "idx_performance_snapshots_investor_date" ON "public"."performance_snapshots" USING "btree" ("investor_id", "snapshot_date" DESC);



CREATE INDEX "idx_performance_snapshots_vehicle_date" ON "public"."performance_snapshots" USING "btree" ("vehicle_id", "snapshot_date" DESC);



CREATE INDEX "idx_positions_investor_vehicle" ON "public"."positions" USING "btree" ("investor_id", "vehicle_id");



CREATE INDEX "idx_profiles_deleted_at" ON "public"."profiles" USING "btree" ("deleted_at");



CREATE INDEX "idx_profiles_updated_at" ON "public"."profiles" USING "btree" ("updated_at");



CREATE INDEX "idx_reconciliation_matches_invoice" ON "public"."reconciliation_matches" USING "btree" ("invoice_id");



CREATE INDEX "idx_reconciliation_matches_status" ON "public"."reconciliation_matches" USING "btree" ("status");



CREATE INDEX "idx_reconciliation_matches_transaction" ON "public"."reconciliation_matches" USING "btree" ("bank_transaction_id");



CREATE INDEX "idx_request_tickets_deal_status" ON "public"."request_tickets" USING "btree" ("deal_id", "status");



CREATE INDEX "idx_request_tickets_status" ON "public"."request_tickets" USING "btree" ("status") WHERE ("status" = ANY (ARRAY['open'::"public"."request_status_enum", 'assigned'::"public"."request_status_enum", 'in_progress'::"public"."request_status_enum"]));



CREATE INDEX "idx_share_lots_deal_status" ON "public"."share_lots" USING "btree" ("deal_id", "status");



CREATE INDEX "idx_share_lots_status_remaining" ON "public"."share_lots" USING "btree" ("status", "units_remaining");



CREATE INDEX "idx_signature_requests_created_at" ON "public"."signature_requests" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_signature_requests_document_id" ON "public"."signature_requests" USING "btree" ("document_id");



CREATE INDEX "idx_signature_requests_investor_id" ON "public"."signature_requests" USING "btree" ("investor_id");



CREATE INDEX "idx_signature_requests_signing_token" ON "public"."signature_requests" USING "btree" ("signing_token");



CREATE INDEX "idx_signature_requests_status" ON "public"."signature_requests" USING "btree" ("status");



CREATE INDEX "idx_signature_requests_subscription_id" ON "public"."signature_requests" USING "btree" ("subscription_id");



CREATE INDEX "idx_signature_requests_workflow_run_id" ON "public"."signature_requests" USING "btree" ("workflow_run_id");



CREATE INDEX "idx_staff_permissions_expires" ON "public"."staff_permissions" USING "btree" ("user_id", "permission", "expires_at");



CREATE INDEX "idx_staff_permissions_user" ON "public"."staff_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_submissions_formal_subscription" ON "public"."deal_subscription_submissions" USING "btree" ("formal_subscription_id");



CREATE INDEX "idx_subscription_fingerprints_subscription_id" ON "public"."subscription_fingerprints" USING "btree" ("subscription_id");



CREATE INDEX "idx_subscriptions_contract_date" ON "public"."subscriptions" USING "btree" ("contract_date");



CREATE INDEX "idx_subscriptions_created_at" ON "public"."subscriptions" USING "btree" ("created_at", "status");



CREATE INDEX "idx_subscriptions_deal_id" ON "public"."subscriptions" USING "btree" ("deal_id");



CREATE INDEX "idx_subscriptions_fee_plan_id" ON "public"."subscriptions" USING "btree" ("fee_plan_id");



CREATE INDEX "idx_subscriptions_introducer_id" ON "public"."subscriptions" USING "btree" ("introducer_id");



CREATE INDEX "idx_subscriptions_introduction_id" ON "public"."subscriptions" USING "btree" ("introduction_id");



CREATE INDEX "idx_subscriptions_investor_status" ON "public"."subscriptions" USING "btree" ("investor_id", "status");



CREATE INDEX "idx_subscriptions_opportunity_name" ON "public"."subscriptions" USING "btree" ("opportunity_name");



CREATE INDEX "idx_subscriptions_vehicle_id" ON "public"."subscriptions" USING "btree" ("vehicle_id");



CREATE INDEX "idx_suggested_matches_confidence" ON "public"."suggested_matches" USING "btree" ("confidence" DESC);



CREATE INDEX "idx_suggested_matches_subscription" ON "public"."suggested_matches" USING "btree" ("subscription_id");



CREATE INDEX "idx_suggested_matches_transaction" ON "public"."suggested_matches" USING "btree" ("bank_transaction_id");



CREATE INDEX "idx_system_metrics_timestamp" ON "public"."system_metrics" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_system_metrics_type_timestamp" ON "public"."system_metrics" USING "btree" ("metric_type", "timestamp" DESC);



CREATE INDEX "idx_task_actions_task_id" ON "public"."task_actions" USING "btree" ("task_id");



CREATE INDEX "idx_task_dependencies_depends_on" ON "public"."task_dependencies" USING "btree" ("depends_on_task_id");



CREATE INDEX "idx_task_dependencies_task_id" ON "public"."task_dependencies" USING "btree" ("task_id");



CREATE INDEX "idx_task_templates_kind" ON "public"."task_templates" USING "btree" ("kind");



CREATE INDEX "idx_task_templates_trigger_event" ON "public"."task_templates" USING "btree" ("trigger_event");



CREATE INDEX "idx_tasks_category" ON "public"."tasks" USING "btree" ("category", "status");



CREATE INDEX "idx_tasks_completed_by" ON "public"."tasks" USING "btree" ("completed_by");



CREATE INDEX "idx_tasks_kyc_pipeline" ON "public"."tasks" USING "btree" ("kind", "status", "priority") WHERE ("kind" = ANY (ARRAY['kyc_individual'::"text", 'kyc_entity'::"text", 'kyc_aml_check'::"text", 'onboarding_profile'::"text", 'compliance_tax_forms'::"text"]));



CREATE INDEX "idx_tasks_owner_investor" ON "public"."tasks" USING "btree" ("owner_investor_id", "status");



CREATE INDEX "idx_tasks_owner_status" ON "public"."tasks" USING "btree" ("owner_user_id", "status");



CREATE INDEX "idx_tasks_priority_due" ON "public"."tasks" USING "btree" ("priority" DESC, "due_at");



CREATE INDEX "idx_tasks_related_entity" ON "public"."tasks" USING "btree" ("related_entity_type", "related_entity_id");



CREATE INDEX "idx_term_sheets_deal_investor" ON "public"."term_sheets" USING "btree" ("deal_id", "investor_id");



CREATE INDEX "idx_term_sheets_status" ON "public"."term_sheets" USING "btree" ("status");



CREATE INDEX "idx_valuations_vehicle_date" ON "public"."valuations" USING "btree" ("vehicle_id", "as_of_date" DESC);



CREATE INDEX "idx_vehicles_entity_code" ON "public"."vehicles" USING "btree" ("entity_code");



CREATE INDEX "idx_vehicles_platform" ON "public"."vehicles" USING "btree" ("platform");



CREATE INDEX "idx_vehicles_status" ON "public"."vehicles" USING "btree" ("status");



CREATE INDEX "idx_workflow_run_logs_workflow_run_id" ON "public"."workflow_run_logs" USING "btree" ("workflow_run_id", "created_at");



CREATE INDEX "idx_workflow_runs_created_at" ON "public"."workflow_runs" USING "btree" ("created_at");



CREATE INDEX "idx_workflow_runs_idempotency" ON "public"."workflow_runs" USING "btree" ("idempotency_token") WHERE ("idempotency_token" IS NOT NULL);



CREATE INDEX "idx_workflow_runs_signing_lock" ON "public"."workflow_runs" USING "btree" ("signing_in_progress", "signing_locked_at") WHERE ("signing_in_progress" IS NOT NULL);



CREATE INDEX "idx_workflow_runs_status" ON "public"."workflow_runs" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_workflow_runs_triggered_by" ON "public"."workflow_runs" USING "btree" ("triggered_by", "created_at" DESC);



CREATE INDEX "idx_workflow_runs_workflow_key" ON "public"."workflow_runs" USING "btree" ("workflow_key", "created_at" DESC);



CREATE INDEX "idx_workflows_category" ON "public"."workflows" USING "btree" ("category");



CREATE INDEX "idx_workflows_key" ON "public"."workflows" USING "btree" ("key");



CREATE INDEX "idx_workflows_trigger_type" ON "public"."workflows" USING "btree" ("trigger_type") WHERE ("trigger_type" = ANY (ARRAY['scheduled'::"text", 'both'::"text"]));



CREATE INDEX "positions_investor_id_vehicle_id_idx" ON "public"."positions" USING "btree" ("investor_id", "vehicle_id");



CREATE UNIQUE INDEX "signature_requests_document_signer_unique_idx" ON "public"."signature_requests" USING "btree" ("document_id", "signer_role") WHERE (("document_id" IS NOT NULL) AND ("status" <> ALL (ARRAY['cancelled'::"text", 'expired'::"text"])));



COMMENT ON INDEX "public"."signature_requests_document_signer_unique_idx" IS 'Prevents duplicate signature requests for the same document and signer role. Only applies to active requests (not cancelled/expired).';



CREATE UNIQUE INDEX "signature_requests_workflow_signer_unique_idx" ON "public"."signature_requests" USING "btree" ("workflow_run_id", "signer_role") WHERE (("workflow_run_id" IS NOT NULL) AND ("status" <> ALL (ARRAY['cancelled'::"text", 'expired'::"text"])));



COMMENT ON INDEX "public"."signature_requests_workflow_signer_unique_idx" IS 'Prevents duplicate signature requests for NDA workflows (uses workflow_run_id). Complements signature_requests_document_signer_unique_idx which protects subscription packs (uses document_id).';



CREATE INDEX "staff_filter_views_entity_type_idx" ON "public"."staff_filter_views" USING "btree" ("entity_type");



CREATE UNIQUE INDEX "staff_filter_views_unique_name_idx" ON "public"."staff_filter_views" USING "btree" ("user_id", "entity_type", "name");



CREATE INDEX "staff_filter_views_user_entity_idx" ON "public"."staff_filter_views" USING "btree" ("user_id", "entity_type");



CREATE INDEX "staff_filter_views_user_id_idx" ON "public"."staff_filter_views" USING "btree" ("user_id");



CREATE INDEX "subscription_import_results_run_idx" ON "public"."subscription_import_results" USING "btree" ("run_id");



CREATE UNIQUE INDEX "uniq_fee_plans_default_per_deal" ON "public"."fee_plans" USING "btree" ("deal_id") WHERE ("is_default" = true);



CREATE UNIQUE INDEX "uniq_investor_terms_active" ON "public"."investor_terms" USING "btree" ("deal_id", "investor_id") WHERE ("status" = 'active'::"text");



CREATE UNIQUE INDEX "uniq_investor_terms_effective" ON "public"."investor_terms" USING "btree" ("investor_id", "deal_id", "effective_from") WHERE ("status" = ANY (ARRAY['pending'::"text", 'active'::"text"]));



CREATE UNIQUE INDEX "unique_default_fee_plan_per_deal" ON "public"."fee_plans" USING "btree" ("deal_id") WHERE (("is_default" = true) AND ("is_active" = true));



COMMENT ON INDEX "public"."unique_default_fee_plan_per_deal" IS 'Ensures only one active default fee plan exists per deal. Multiple active fee plans are allowed for different investor classes, but only one can be the default.';



CREATE UNIQUE INDEX "unique_published_term_sheet_per_deal" ON "public"."deal_fee_structures" USING "btree" ("deal_id") WHERE ("status" = 'published'::"text");



COMMENT ON INDEX "public"."unique_published_term_sheet_per_deal" IS 'Ensures only one published term sheet exists per deal. Required for term sheet ↔ fee plan sync to work correctly.';



CREATE INDEX "vehicles_arranger_entity_id_idx" ON "public"."vehicles" USING "btree" ("arranger_entity_id");



CREATE OR REPLACE TRIGGER "approvals_auto_assign" BEFORE INSERT ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."auto_assign_approval"();



CREATE OR REPLACE TRIGGER "approvals_log_changes" AFTER INSERT OR UPDATE ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."log_approval_change"();



CREATE OR REPLACE TRIGGER "approvals_set_sla" BEFORE INSERT ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."set_approval_sla_deadline"();



CREATE OR REPLACE TRIGGER "auto_create_entity_investor_trigger" AFTER INSERT ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_entity_investor"();



CREATE OR REPLACE TRIGGER "conversation_participants_touch" BEFORE UPDATE ON "public"."conversation_participants" FOR EACH ROW EXECUTE FUNCTION "public"."trg_touch_conversation_participant"();



CREATE OR REPLACE TRIGGER "conversations_owner_seed" AFTER INSERT ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."trg_conversation_set_owner"();



CREATE OR REPLACE TRIGGER "conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "counterparty_entity_members_updated_at" BEFORE UPDATE ON "public"."counterparty_entity_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "entity_flags_set_updated_at" BEFORE UPDATE ON "public"."entity_flags" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "entity_investors_set_updated_at" BEFORE UPDATE ON "public"."entity_investors" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "investor_members_updated_at" BEFORE UPDATE ON "public"."investor_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "investor_users_create_onboarding_tasks" AFTER INSERT ON "public"."investor_users" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_investor_user_onboarding_tasks"();



COMMENT ON TRIGGER "investor_users_create_onboarding_tasks" ON "public"."investor_users" IS 'Auto-generates onboarding tasks (KYC, profile completion, banking details, etc.) for newly invited or linked investor users.';



CREATE OR REPLACE TRIGGER "kyc_submissions_updated_at" BEFORE UPDATE ON "public"."kyc_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_kyc_submissions_updated_at"();



CREATE OR REPLACE TRIGGER "messages_auto_read" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_message_read_receipt"();



CREATE OR REPLACE TRIGGER "messages_refresh_conversation" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."trg_refresh_conversation_metadata"();



CREATE OR REPLACE TRIGGER "on_deal_interest_create_approval" AFTER INSERT ON "public"."investor_deal_interest" FOR EACH ROW WHEN (("new"."status" = 'pending_review'::"text")) EXECUTE FUNCTION "public"."create_deal_interest_approval"();



CREATE OR REPLACE TRIGGER "on_deal_subscription_create_approval" AFTER INSERT ON "public"."deal_subscription_submissions" FOR EACH ROW WHEN (("new"."status" = 'pending_review'::"text")) EXECUTE FUNCTION "public"."create_deal_subscription_approval"();



COMMENT ON TRIGGER "on_deal_subscription_create_approval" ON "public"."deal_subscription_submissions" IS 'Auto-creates approval when subscription is submitted with status=pending_review. See create_deal_subscription_approval()';



CREATE OR REPLACE TRIGGER "on_task_complete_commit_subscription" AFTER UPDATE ON "public"."tasks" FOR EACH ROW WHEN ((("new"."status" = 'completed'::"text") AND ("old"."status" <> 'completed'::"text"))) EXECUTE FUNCTION "public"."auto_commit_subscription_on_task_complete"();



CREATE OR REPLACE TRIGGER "prevent_audit_log_modification_trigger" BEFORE DELETE OR UPDATE ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_audit_log_modification"();



CREATE OR REPLACE TRIGGER "profiles_prevent_role_escalation" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_role_self_update"();



CREATE OR REPLACE TRIGGER "signature_requests_updated_at" BEFORE UPDATE ON "public"."signature_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_signature_requests_updated_at"();



CREATE OR REPLACE TRIGGER "staff_filter_views_updated_at" BEFORE UPDATE ON "public"."staff_filter_views" FOR EACH ROW EXECUTE FUNCTION "public"."update_staff_filter_views_updated_at"();



CREATE OR REPLACE TRIGGER "tasks_unlock_dependents" AFTER UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."unlock_dependent_tasks"();



CREATE OR REPLACE TRIGGER "tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_bank_transactions_set_updated_at" BEFORE UPDATE ON "public"."bank_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_capital_call_items_updated_at" BEFORE UPDATE ON "public"."capital_call_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_check_onboarding_completion" AFTER UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."fn_check_onboarding_completion"();



CREATE OR REPLACE TRIGGER "trg_check_onboarding_completion_insert" AFTER INSERT ON "public"."tasks" FOR EACH ROW WHEN ((("new"."status" = 'completed'::"text") AND ("new"."category" = 'onboarding'::"text"))) EXECUTE FUNCTION "public"."fn_check_onboarding_completion"();



CREATE OR REPLACE TRIGGER "trg_distribution_items_updated_at" BEFORE UPDATE ON "public"."distribution_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_fee_components_set_updated_at" BEFORE UPDATE ON "public"."fee_components" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_fee_plans_set_updated_at" BEFORE UPDATE ON "public"."fee_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_investor_terms_set_updated_at" BEFORE UPDATE ON "public"."investor_terms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_reset_onboarding_on_new_task" AFTER INSERT ON "public"."tasks" FOR EACH ROW WHEN ((("new"."status" = 'pending'::"text") AND ("new"."category" = 'onboarding'::"text"))) EXECUTE FUNCTION "public"."fn_reset_onboarding_on_new_task"();



CREATE OR REPLACE TRIGGER "trigger_auto_create_deal_folder" AFTER INSERT ON "public"."deals" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_deal_folder"();



COMMENT ON TRIGGER "trigger_auto_create_deal_folder" ON "public"."deals" IS 'Automatically creates a folder structure for every new deal within its vehicle Deals folder';



CREATE OR REPLACE TRIGGER "trigger_auto_create_introducer_commission" AFTER INSERT ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_introducer_commission"();



CREATE OR REPLACE TRIGGER "trigger_auto_create_position" AFTER INSERT OR UPDATE OF "status" ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_position_from_subscription"();



CREATE OR REPLACE TRIGGER "trigger_auto_create_vehicle_folders" AFTER INSERT ON "public"."vehicles" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_vehicle_folders"();



COMMENT ON TRIGGER "trigger_auto_create_vehicle_folders" ON "public"."vehicles" IS 'Automatically creates a default folder structure for every new vehicle, including root folder and category folders for documents';



CREATE OR REPLACE TRIGGER "trigger_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_subscription_number" BEFORE INSERT ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."set_subscription_number"();



CREATE OR REPLACE TRIGGER "trigger_update_investor_counterparty_updated_at" BEFORE UPDATE ON "public"."investor_counterparty" FOR EACH ROW EXECUTE FUNCTION "public"."update_investor_counterparty_updated_at"();



CREATE OR REPLACE TRIGGER "update_deal_faqs_updated_at" BEFORE UPDATE ON "public"."deal_faqs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_document_approvals_updated_at" BEFORE UPDATE ON "public"."document_approvals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_document_folders_updated_at" BEFORE UPDATE ON "public"."document_folders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_document_schedule_updated_at" BEFORE UPDATE ON "public"."document_publishing_schedule" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_documents_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "workflows_set_updated_at" BEFORE UPDATE ON "public"."workflows" FOR EACH ROW EXECUTE FUNCTION "public"."set_workflows_updated_at"();



ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_feed"
    ADD CONSTRAINT "activity_feed_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."arranger_entities"
    ADD CONSTRAINT "arranger_entities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."arranger_entities"
    ADD CONSTRAINT "arranger_entities_kyc_approved_by_fkey" FOREIGN KEY ("kyc_approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."arranger_entities"
    ADD CONSTRAINT "arranger_entities_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_compliance_reviewer_id_fkey" FOREIGN KEY ("compliance_reviewer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audit_report_templates"
    ADD CONSTRAINT "audit_report_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."automation_webhook_events"
    ADD CONSTRAINT "automation_webhook_events_related_deal_id_fkey" FOREIGN KEY ("related_deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_webhook_events"
    ADD CONSTRAINT "automation_webhook_events_related_investor_id_fkey" FOREIGN KEY ("related_investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bank_transactions"
    ADD CONSTRAINT "bank_transactions_matched_subscription_id_fkey" FOREIGN KEY ("matched_subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."bank_transactions"
    ADD CONSTRAINT "bank_transactions_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."capital_call_items"
    ADD CONSTRAINT "capital_call_items_capital_call_id_fkey" FOREIGN KEY ("capital_call_id") REFERENCES "public"."capital_calls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."capital_call_items"
    ADD CONSTRAINT "capital_call_items_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."capital_call_items"
    ADD CONSTRAINT "capital_call_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."capital_calls"
    ADD CONSTRAINT "capital_calls_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cashflows"
    ADD CONSTRAINT "cashflows_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cashflows"
    ADD CONSTRAINT "cashflows_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id");



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



ALTER TABLE ONLY "public"."counterparty_entity_members"
    ADD CONSTRAINT "counterparty_entity_members_counterparty_entity_id_fkey" FOREIGN KEY ("counterparty_entity_id") REFERENCES "public"."investor_counterparty"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."counterparty_entity_members"
    ADD CONSTRAINT "counterparty_entity_members_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."counterparty_entity_members"
    ADD CONSTRAINT "counterparty_entity_members_kyc_approved_by_fkey" FOREIGN KEY ("kyc_approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."dashboard_preferences"
    ADD CONSTRAINT "dashboard_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_activity_events"
    ADD CONSTRAINT "deal_activity_events_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_activity_events"
    ADD CONSTRAINT "deal_activity_events_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_data_room_access"
    ADD CONSTRAINT "deal_data_room_access_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_data_room_access"
    ADD CONSTRAINT "deal_data_room_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_data_room_access"
    ADD CONSTRAINT "deal_data_room_access_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_data_room_access"
    ADD CONSTRAINT "deal_data_room_access_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_data_room_documents"
    ADD CONSTRAINT "deal_data_room_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_data_room_documents"
    ADD CONSTRAINT "deal_data_room_documents_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_data_room_documents"
    ADD CONSTRAINT "deal_data_room_documents_replaced_by_id_fkey" FOREIGN KEY ("replaced_by_id") REFERENCES "public"."deal_data_room_documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_faqs"
    ADD CONSTRAINT "deal_faqs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_faqs"
    ADD CONSTRAINT "deal_faqs_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_faqs"
    ADD CONSTRAINT "deal_faqs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_fee_structures"
    ADD CONSTRAINT "deal_fee_structures_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_fee_structures"
    ADD CONSTRAINT "deal_fee_structures_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id");



ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_memberships"
    ADD CONSTRAINT "deal_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_counterparty_entity_id_fkey" FOREIGN KEY ("counterparty_entity_id") REFERENCES "public"."investor_counterparty"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_formal_subscription_id_fkey" FOREIGN KEY ("formal_subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_subscription_submissions"
    ADD CONSTRAINT "deal_subscription_submissions_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_arranger_entity_id_fkey" FOREIGN KEY ("arranger_entity_id") REFERENCES "public"."arranger_entities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");



ALTER TABLE ONLY "public"."director_registry"
    ADD CONSTRAINT "director_registry_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."distribution_items"
    ADD CONSTRAINT "distribution_items_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "public"."distributions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."distribution_items"
    ADD CONSTRAINT "distribution_items_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."distribution_items"
    ADD CONSTRAINT "distribution_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."distributions"
    ADD CONSTRAINT "distributions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "documents_arranger_entity_id_fkey" FOREIGN KEY ("arranger_entity_id") REFERENCES "public"."arranger_entities"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "documents_signature_workflow_run_id_fkey" FOREIGN KEY ("signature_workflow_run_id") REFERENCES "public"."workflow_runs"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_subscription_submission_id_fkey" FOREIGN KEY ("subscription_submission_id") REFERENCES "public"."deal_subscription_submissions"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id");



ALTER TABLE ONLY "public"."entity_directors"
    ADD CONSTRAINT "entity_directors_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_events"
    ADD CONSTRAINT "entity_events_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."entity_events"
    ADD CONSTRAINT "entity_events_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_flags"
    ADD CONSTRAINT "entity_flags_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."entity_flags"
    ADD CONSTRAINT "entity_flags_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_folders"
    ADD CONSTRAINT "entity_folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "public"."entity_folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_folders"
    ADD CONSTRAINT "entity_folders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_investors"
    ADD CONSTRAINT "entity_investors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."entity_investors"
    ADD CONSTRAINT "entity_investors_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_investors"
    ADD CONSTRAINT "entity_investors_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entity_stakeholders"
    ADD CONSTRAINT "entity_stakeholders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fee_components"
    ADD CONSTRAINT "fee_components_fee_plan_id_fkey" FOREIGN KEY ("fee_plan_id") REFERENCES "public"."fee_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fee_components"
    ADD CONSTRAINT "fee_components_next_tier_component_id_fkey" FOREIGN KEY ("next_tier_component_id") REFERENCES "public"."fee_components"("id") ON DELETE SET NULL;



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



ALTER TABLE ONLY "public"."fee_schedules"
    ADD CONSTRAINT "fee_schedules_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fee_schedules"
    ADD CONSTRAINT "fee_schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."fee_schedules"
    ADD CONSTRAINT "fee_schedules_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fee_schedules"
    ADD CONSTRAINT "fee_schedules_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "public"."fee_components"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fee_schedules"
    ADD CONSTRAINT "fee_schedules_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "fk_kyc_submissions_previous" FOREIGN KEY ("previous_submission_id") REFERENCES "public"."kyc_submissions"("id") ON DELETE SET NULL;



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



ALTER TABLE ONLY "public"."investor_counterparty"
    ADD CONSTRAINT "investor_counterparty_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."investor_counterparty"
    ADD CONSTRAINT "investor_counterparty_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_deal_holdings"
    ADD CONSTRAINT "investor_deal_holdings_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."investor_deal_holdings"
    ADD CONSTRAINT "investor_deal_holdings_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_deal_holdings"
    ADD CONSTRAINT "investor_deal_holdings_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_deal_holdings"
    ADD CONSTRAINT "investor_deal_holdings_subscription_submission_id_fkey" FOREIGN KEY ("subscription_submission_id") REFERENCES "public"."deal_subscription_submissions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."investor_deal_interest"
    ADD CONSTRAINT "investor_deal_interest_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."investor_deal_interest"
    ADD CONSTRAINT "investor_deal_interest_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."investor_deal_interest"
    ADD CONSTRAINT "investor_deal_interest_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_deal_interest"
    ADD CONSTRAINT "investor_deal_interest_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_interest_signals"
    ADD CONSTRAINT "investor_interest_signals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."investor_interest_signals"
    ADD CONSTRAINT "investor_interest_signals_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_interest_signals"
    ADD CONSTRAINT "investor_interest_signals_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_members"
    ADD CONSTRAINT "investor_members_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."investor_members"
    ADD CONSTRAINT "investor_members_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_members"
    ADD CONSTRAINT "investor_members_kyc_approved_by_fkey" FOREIGN KEY ("kyc_approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."investor_notifications"
    ADD CONSTRAINT "investor_notifications_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."investor_notifications"
    ADD CONSTRAINT "investor_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_reminder_task_id_fkey" FOREIGN KEY ("reminder_task_id") REFERENCES "public"."tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_counterparty_entity_id_fkey" FOREIGN KEY ("counterparty_entity_id") REFERENCES "public"."investor_counterparty"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_counterparty_member_id_fkey" FOREIGN KEY ("counterparty_member_id") REFERENCES "public"."counterparty_entity_members"("id");



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_investor_member_id_fkey" FOREIGN KEY ("investor_member_id") REFERENCES "public"."investor_members"("id");



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");



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



ALTER TABLE ONLY "public"."share_lots"
    ADD CONSTRAINT "share_lots_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."share_lots"
    ADD CONSTRAINT "share_lots_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."share_sources"("id");



ALTER TABLE ONLY "public"."share_sources"
    ADD CONSTRAINT "share_sources_contract_doc_id_fkey" FOREIGN KEY ("contract_doc_id") REFERENCES "public"."documents"("id");



ALTER TABLE ONLY "public"."signature_requests"
    ADD CONSTRAINT "signature_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."signature_requests"
    ADD CONSTRAINT "signature_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."signature_requests"
    ADD CONSTRAINT "signature_requests_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signature_requests"
    ADD CONSTRAINT "signature_requests_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."signature_requests"
    ADD CONSTRAINT "signature_requests_workflow_run_id_fkey" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."staff_filter_views"
    ADD CONSTRAINT "staff_filter_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_permissions"
    ADD CONSTRAINT "staff_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."staff_permissions"
    ADD CONSTRAINT "staff_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."subscription_fingerprints"
    ADD CONSTRAINT "subscription_fingerprints_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_import_results"
    ADD CONSTRAINT "subscription_import_results_entity_investor_id_fkey" FOREIGN KEY ("entity_investor_id") REFERENCES "public"."entity_investors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_import_results"
    ADD CONSTRAINT "subscription_import_results_investor_deal_holding_id_fkey" FOREIGN KEY ("investor_deal_holding_id") REFERENCES "public"."investor_deal_holdings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_import_results"
    ADD CONSTRAINT "subscription_import_results_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."subscription_workbook_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_import_results"
    ADD CONSTRAINT "subscription_import_results_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_fee_plan_id_fkey" FOREIGN KEY ("fee_plan_id") REFERENCES "public"."fee_plans"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_introducer_id_fkey" FOREIGN KEY ("introducer_id") REFERENCES "public"."introducers"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_introduction_id_fkey" FOREIGN KEY ("introduction_id") REFERENCES "public"."introductions"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suggested_matches"
    ADD CONSTRAINT "suggested_matches_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "public"."bank_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suggested_matches"
    ADD CONSTRAINT "suggested_matches_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suggested_matches"
    ADD CONSTRAINT "suggested_matches_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_arranger_entity_id_fkey" FOREIGN KEY ("arranger_entity_id") REFERENCES "public"."arranger_entities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workflow_run_logs"
    ADD CONSTRAINT "workflow_run_logs_workflow_run_id_fkey" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_runs"
    ADD CONSTRAINT "workflow_runs_signing_locked_by_fkey" FOREIGN KEY ("signing_locked_by") REFERENCES "public"."signature_requests"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workflow_runs"
    ADD CONSTRAINT "workflow_runs_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."workflow_runs"
    ADD CONSTRAINT "workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id");



CREATE POLICY "Investors can view own activity" ON "public"."activity_feed" FOR SELECT TO "authenticated" USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Investors can view their own signature requests" ON "public"."signature_requests" FOR SELECT TO "authenticated" USING (("investor_id" IN ( SELECT "investors"."id"
   FROM "public"."investors"
  WHERE ("investors"."created_by" = "auth"."uid"()))));



CREATE POLICY "Prevent audit log deletions" ON "public"."audit_logs" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "Prevent audit log modifications" ON "public"."audit_logs" FOR UPDATE TO "authenticated" USING (false);



CREATE POLICY "Staff admin can delete arrangers" ON "public"."arranger_entities" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



CREATE POLICY "Staff admin can insert arrangers" ON "public"."arranger_entities" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



CREATE POLICY "Staff admin can update arrangers" ON "public"."arranger_entities" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



CREATE POLICY "Staff can create own filter views" ON "public"."staff_filter_views" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND "public"."user_is_staff"()));



CREATE POLICY "Staff can create signature requests" ON "public"."signature_requests" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can delete own filter views" ON "public"."staff_filter_views" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND "public"."user_is_staff"()));



CREATE POLICY "Staff can insert activity" ON "public"."activity_feed" FOR INSERT TO "authenticated" WITH CHECK ("public"."user_is_staff"());



CREATE POLICY "Staff can manage flags" ON "public"."entity_flags" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can manage folders" ON "public"."entity_folders" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can manage stakeholders" ON "public"."entity_stakeholders" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can update own filter views" ON "public"."staff_filter_views" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND "public"."user_is_staff"()));



CREATE POLICY "Staff can update signature requests" ON "public"."signature_requests" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can view all activity" ON "public"."activity_feed" FOR SELECT TO "authenticated" USING ("public"."user_is_staff"());



CREATE POLICY "Staff can view all arrangers" ON "public"."arranger_entities" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));



CREATE POLICY "Staff can view all audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can view all flags" ON "public"."entity_flags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can view all folders" ON "public"."entity_folders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can view all signature requests" ON "public"."signature_requests" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can view all stakeholders" ON "public"."entity_stakeholders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "Staff can view own filter views" ON "public"."staff_filter_views" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND "public"."user_is_staff"()));



CREATE POLICY "System can insert activity" ON "public"."activity_feed" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "System can insert audit logs" ON "public"."audit_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



ALTER TABLE "public"."activity_feed" ENABLE ROW LEVEL SECURITY;


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



ALTER TABLE "public"."approval_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "approval_history_staff_read" ON "public"."approval_history" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "approval_history_system_insert" ON "public"."approval_history" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



ALTER TABLE "public"."approvals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "approvals_requester_read" ON "public"."document_approvals" FOR SELECT TO "authenticated" USING (("requested_by" = "auth"."uid"()));



CREATE POLICY "approvals_staff" ON "public"."approvals" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "approvals_staff_all" ON "public"."document_approvals" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));



ALTER TABLE "public"."arranger_entities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_report_templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_report_templates_staff_read" ON "public"."audit_report_templates" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



ALTER TABLE "public"."automation_webhook_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "automation_webhook_events_staff" ON "public"."automation_webhook_events" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



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



ALTER TABLE "public"."capital_call_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "capital_call_items_admin_write" ON "public"."capital_call_items" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



CREATE POLICY "capital_call_items_investor_read" ON "public"."capital_call_items" FOR SELECT USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "capital_call_items_staff_read" ON "public"."capital_call_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."capital_calls" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "capital_calls_read" ON "public"."capital_calls" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "capital_calls"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "capital_calls_staff_delete" ON "public"."capital_calls" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



COMMENT ON POLICY "capital_calls_staff_delete" ON "public"."capital_calls" IS 'Allow staff admin to delete capital calls';



CREATE POLICY "capital_calls_staff_insert" ON "public"."capital_calls" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "capital_calls_staff_insert" ON "public"."capital_calls" IS 'Allow staff admin and ops to create capital calls';



CREATE POLICY "capital_calls_staff_update" ON "public"."capital_calls" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "capital_calls_staff_update" ON "public"."capital_calls" IS 'Allow staff admin and ops to update capital calls';



ALTER TABLE "public"."cashflows" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cashflows_investor_select" ON "public"."cashflows" FOR SELECT TO "authenticated" USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



COMMENT ON POLICY "cashflows_investor_select" ON "public"."cashflows" IS 'Investors can only view their own cashflow records';



CREATE POLICY "cashflows_staff_delete" ON "public"."cashflows" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



COMMENT ON POLICY "cashflows_staff_delete" ON "public"."cashflows" IS 'Only staff admins can delete cashflows';



CREATE POLICY "cashflows_staff_insert" ON "public"."cashflows" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "cashflows_staff_insert" ON "public"."cashflows" IS 'Only staff can create new cashflows';



CREATE POLICY "cashflows_staff_select" ON "public"."cashflows" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



COMMENT ON POLICY "cashflows_staff_select" ON "public"."cashflows" IS 'Staff members can view all cashflow records';



CREATE POLICY "cashflows_staff_update" ON "public"."cashflows" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "cashflows_staff_update" ON "public"."cashflows" IS 'Only staff can update cashflow records';



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



CREATE POLICY "conversation_participants_insert" ON "public"."conversation_participants" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "conversation_participants"."conversation_id") AND ("c"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



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



ALTER TABLE "public"."counterparty_entity_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "counterparty_entity_members_investor_read" ON "public"."counterparty_entity_members" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."investor_counterparty" "ic"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "ic"."investor_id")))
  WHERE (("ic"."id" = "counterparty_entity_members"."counterparty_entity_id") AND ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "counterparty_entity_members_investor_write" ON "public"."counterparty_entity_members" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."investor_counterparty" "ic"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "ic"."investor_id")))
  WHERE (("ic"."id" = "counterparty_entity_members"."counterparty_entity_id") AND ("iu"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."investor_counterparty" "ic"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "ic"."investor_id")))
  WHERE (("ic"."id" = "counterparty_entity_members"."counterparty_entity_id") AND ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "counterparty_entity_members_staff_read" ON "public"."counterparty_entity_members" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "counterparty_entity_members_staff_write" ON "public"."counterparty_entity_members" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."dashboard_preferences" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dashboard_preferences_self_manage" ON "public"."dashboard_preferences" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."deal_activity_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_activity_events_insert_staff" ON "public"."deal_activity_events" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



CREATE POLICY "deal_activity_events_staff_select" ON "public"."deal_activity_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



CREATE POLICY "deal_create" ON "public"."deals" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."deal_data_room_access" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_data_room_access_select" ON "public"."deal_data_room_access" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "deal_data_room_access"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "deal_data_room_access_staff_modify" ON "public"."deal_data_room_access" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



ALTER TABLE "public"."deal_data_room_documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_data_room_documents_investor_select" ON "public"."deal_data_room_documents" FOR SELECT USING ((("visible_to_investors" AND (EXISTS ( SELECT 1
   FROM ("public"."investor_users" "iu"
     JOIN "public"."deal_data_room_access" "access" ON ((("access"."investor_id" = "iu"."investor_id") AND ("access"."deal_id" = "deal_data_room_documents"."deal_id"))))
  WHERE (("iu"."user_id" = "auth"."uid"()) AND ("access"."revoked_at" IS NULL) AND (("access"."expires_at" IS NULL) OR ("access"."expires_at" > "now"())))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "deal_data_room_documents_staff_modify" ON "public"."deal_data_room_documents" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



ALTER TABLE "public"."deal_faqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_fee_structures" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_fee_structures_staff_modify" ON "public"."deal_fee_structures" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



CREATE POLICY "deal_fee_structures_staff_select" ON "public"."deal_fee_structures" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))) OR (("status" = 'published'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "deal_fee_structures"."deal_id") AND ("dm"."user_id" = "auth"."uid"())))))));



ALTER TABLE "public"."deal_memberships" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_read" ON "public"."deals" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."deal_memberships" "dm"
  WHERE (("dm"."deal_id" = "deals"."id") AND (("dm"."user_id" = "auth"."uid"()) OR ("dm"."investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids")))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



ALTER TABLE "public"."deal_subscription_submissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_subscription_submissions_insert_investor" ON "public"."deal_subscription_submissions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "deal_subscription_submissions"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "deal_subscription_submissions_select" ON "public"."deal_subscription_submissions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "deal_subscription_submissions"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "deal_subscription_submissions_staff_modify" ON "public"."deal_subscription_submissions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



CREATE POLICY "deal_update" ON "public"."deals" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."deals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."director_registry" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "director_registry_staff_read" ON "public"."director_registry" FOR SELECT USING ("public"."user_is_staff"());



CREATE POLICY "director_registry_staff_write" ON "public"."director_registry" USING ("public"."user_is_staff"()) WITH CHECK ("public"."user_is_staff"());



ALTER TABLE "public"."distribution_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "distribution_items_admin_write" ON "public"."distribution_items" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



CREATE POLICY "distribution_items_investor_read" ON "public"."distribution_items" FOR SELECT USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "distribution_items_staff_read" ON "public"."distribution_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."distributions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "distributions_read" ON "public"."distributions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."subscriptions" "s"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "s"."investor_id")))
  WHERE (("s"."vehicle_id" = "distributions"."vehicle_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "distributions_staff_delete" ON "public"."distributions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



COMMENT ON POLICY "distributions_staff_delete" ON "public"."distributions" IS 'Allow staff admin to delete distributions';



CREATE POLICY "distributions_staff_insert" ON "public"."distributions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "distributions_staff_insert" ON "public"."distributions" IS 'Allow staff admin and ops to create distributions';



CREATE POLICY "distributions_staff_update" ON "public"."distributions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "distributions_staff_update" ON "public"."distributions" IS 'Allow staff admin and ops to update distributions';



CREATE POLICY "dm_manage" ON "public"."deal_memberships" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "dm_read" ON "public"."deal_memberships" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids")) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



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



ALTER TABLE "public"."entity_flags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entity_flags_investor_read" ON "public"."entity_flags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."entity_investors" "ei"
  WHERE (("ei"."vehicle_id" = "entity_flags"."vehicle_id") AND ("ei"."investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids"))))));



CREATE POLICY "entity_flags_staff_all" ON "public"."entity_flags" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



ALTER TABLE "public"."entity_folders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entity_investors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entity_investors_investor_read" ON "public"."entity_investors" FOR SELECT USING (("investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids")));



CREATE POLICY "entity_investors_staff_all" ON "public"."entity_investors" TO "authenticated" USING ("public"."user_is_staff"()) WITH CHECK ("public"."user_is_staff"());



ALTER TABLE "public"."entity_stakeholders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "entity_stakeholders_investor_read" ON "public"."entity_stakeholders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."entity_investors" "ei"
  WHERE (("ei"."vehicle_id" = "entity_stakeholders"."vehicle_id") AND ("ei"."investor_id" IN ( SELECT "public"."get_my_investor_ids"() AS "get_my_investor_ids"))))));



CREATE POLICY "entity_stakeholders_staff_all" ON "public"."entity_stakeholders" TO "authenticated" USING ("public"."user_is_staff"()) WITH CHECK ("public"."user_is_staff"());



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



ALTER TABLE "public"."fee_schedules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fee_schedules_investor_read" ON "public"."fee_schedules" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "fee_schedules"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "fee_schedules_staff_all" ON "public"."fee_schedules" USING ((EXISTS ( SELECT 1
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



ALTER TABLE "public"."investor_counterparty" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_counterparty_delete_own" ON "public"."investor_counterparty" FOR DELETE USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "investor_counterparty_insert_own" ON "public"."investor_counterparty" FOR INSERT WITH CHECK (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "investor_counterparty_select_own" ON "public"."investor_counterparty" FOR SELECT USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "investor_counterparty_staff_all" ON "public"."investor_counterparty" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



CREATE POLICY "investor_counterparty_update_own" ON "public"."investor_counterparty" FOR UPDATE USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."investor_deal_holdings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_deal_holdings_investor_select" ON "public"."investor_deal_holdings" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_deal_holdings"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "investor_deal_holdings_staff_all" ON "public"."investor_deal_holdings" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



ALTER TABLE "public"."investor_deal_interest" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_deal_interest_insert_investor" ON "public"."investor_deal_interest" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_deal_interest"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "investor_deal_interest_select" ON "public"."investor_deal_interest" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_deal_interest"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "investor_deal_interest_staff_all" ON "public"."investor_deal_interest" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



ALTER TABLE "public"."investor_interest_signals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_interest_signals_insert" ON "public"."investor_interest_signals" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_interest_signals"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "investor_interest_signals_select" ON "public"."investor_interest_signals" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_interest_signals"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "investor_interest_signals_staff_update" ON "public"."investor_interest_signals" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



ALTER TABLE "public"."investor_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_members_investor_read" ON "public"."investor_members" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_members"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "investor_members_investor_write" ON "public"."investor_members" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_members"."investor_id") AND ("iu"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investor_members"."investor_id") AND ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "investor_members_staff_read" ON "public"."investor_members" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "investor_members_staff_write" ON "public"."investor_members" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."investor_notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_notifications_insert_service" ON "public"."investor_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "investor_notifications_self" ON "public"."investor_notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "investor_notifications_staff" ON "public"."investor_notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text")))));



CREATE POLICY "investor_read_with_data_room" ON "public"."deal_faqs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."deal_data_room_access" "dra"
     JOIN "public"."investor_users" "iu" ON (("iu"."investor_id" = "dra"."investor_id")))
  WHERE (("dra"."deal_id" = "deal_faqs"."deal_id") AND ("iu"."user_id" = "auth"."uid"()) AND ("dra"."revoked_at" IS NULL) AND (("dra"."expires_at" IS NULL) OR ("dra"."expires_at" > "now"()))))));



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



ALTER TABLE "public"."investor_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_users_own_read" ON "public"."investor_users" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "investor_users_read" ON "public"."investors" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."investor_users" "iu"
  WHERE (("iu"."investor_id" = "investors"."id") AND ("iu"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



CREATE POLICY "investor_users_staff_all" ON "public"."investor_users" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



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



ALTER TABLE "public"."kyc_submissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "kyc_submissions_insert_own" ON "public"."kyc_submissions" FOR INSERT WITH CHECK ((("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))) OR ("counterparty_entity_id" IN ( SELECT "ic"."id"
   FROM ("public"."investor_counterparty" "ic"
     JOIN "public"."investor_users" "iu" ON (("ic"."investor_id" = "iu"."investor_id")))
  WHERE ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "kyc_submissions_investor_insert" ON "public"."kyc_submissions" FOR INSERT TO "authenticated" WITH CHECK (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "kyc_submissions_investor_read" ON "public"."kyc_submissions" FOR SELECT TO "authenticated" USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "kyc_submissions_select_own" ON "public"."kyc_submissions" FOR SELECT USING ((("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))) OR ("counterparty_entity_id" IN ( SELECT "ic"."id"
   FROM ("public"."investor_counterparty" "ic"
     JOIN "public"."investor_users" "iu" ON (("ic"."investor_id" = "iu"."investor_id")))
  WHERE ("iu"."user_id" = "auth"."uid"())))));



CREATE POLICY "kyc_submissions_staff_all" ON "public"."kyc_submissions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role")::"text" ~~ 'staff_%'::"text")))));



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


CREATE POLICY "messages_insert" ON "public"."messages" FOR INSERT WITH CHECK (("sender_id" = "auth"."uid"()));



CREATE POLICY "messages_select" ON "public"."messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (("p"."role")::"text" ~~ 'staff_%'::"text"))))));



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



ALTER TABLE "public"."positions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "positions_investor_select" ON "public"."positions" FOR SELECT TO "authenticated" USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



COMMENT ON POLICY "positions_investor_select" ON "public"."positions" IS 'Investors can only view their own position records';



CREATE POLICY "positions_staff_delete" ON "public"."positions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



COMMENT ON POLICY "positions_staff_delete" ON "public"."positions" IS 'Only staff admins can delete positions';



CREATE POLICY "positions_staff_insert" ON "public"."positions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "positions_staff_insert" ON "public"."positions" IS 'Only staff can create new positions';



CREATE POLICY "positions_staff_select" ON "public"."positions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



COMMENT ON POLICY "positions_staff_select" ON "public"."positions" IS 'Staff members can view all position records';



CREATE POLICY "positions_staff_update" ON "public"."positions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "positions_staff_update" ON "public"."positions" IS 'Only staff can update position records';



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR "public"."user_is_staff"()));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



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



ALTER TABLE "public"."signature_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "staff_all_access" ON "public"."deal_faqs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."staff_filter_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "staff_permissions_select_own" ON "public"."staff_permissions" FOR SELECT USING (("user_id" = "auth"."uid"()));



COMMENT ON POLICY "staff_permissions_select_own" ON "public"."staff_permissions" IS 'Allow users to read their own permissions';



ALTER TABLE "public"."subscription_fingerprints" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscription_fingerprints_staff_all" ON "public"."subscription_fingerprints" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



ALTER TABLE "public"."subscription_import_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscription_import_results_staff_all" ON "public"."subscription_import_results" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



ALTER TABLE "public"."subscription_workbook_runs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscription_workbook_runs_staff_all" ON "public"."subscription_workbook_runs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions_investor_select" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (("investor_id" IN ( SELECT "investor_users"."investor_id"
   FROM "public"."investor_users"
  WHERE ("investor_users"."user_id" = "auth"."uid"()))));



COMMENT ON POLICY "subscriptions_investor_select" ON "public"."subscriptions" IS 'Investors can only view their own subscription records';



CREATE POLICY "subscriptions_staff_delete" ON "public"."subscriptions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'staff_admin'::"public"."user_role")))));



COMMENT ON POLICY "subscriptions_staff_delete" ON "public"."subscriptions" IS 'Only staff admins can delete subscriptions';



CREATE POLICY "subscriptions_staff_insert" ON "public"."subscriptions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "subscriptions_staff_insert" ON "public"."subscriptions" IS 'Only staff can create new subscriptions';



CREATE POLICY "subscriptions_staff_select" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



COMMENT ON POLICY "subscriptions_staff_select" ON "public"."subscriptions" IS 'Staff members can view all subscription records';



CREATE POLICY "subscriptions_staff_update" ON "public"."subscriptions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



COMMENT ON POLICY "subscriptions_staff_update" ON "public"."subscriptions" IS 'Only staff can update subscription records';



ALTER TABLE "public"."suggested_matches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "suggested_matches_staff_access" ON "public"."suggested_matches" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



CREATE POLICY "suggested_matches_staff_delete" ON "public"."suggested_matches" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role", 'staff_rm'::"public"."user_role"]))))));



ALTER TABLE "public"."system_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "system_metrics_admin_only" ON "public"."system_metrics" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'staff_admin'::"public"."user_role") AND (EXISTS ( SELECT 1
           FROM "public"."staff_permissions" "sp"
          WHERE (("sp"."user_id" = "p"."id") AND ("sp"."permission" = 'super_admin'::"text") AND (("sp"."expires_at" IS NULL) OR ("sp"."expires_at" > "now"())))))))));



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



ALTER TABLE "public"."workflow_run_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "workflow_run_logs_staff_read" ON "public"."workflow_run_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['staff_admin'::"public"."user_role", 'staff_ops'::"public"."user_role"]))))));



CREATE POLICY "workflow_run_logs_system_insert" ON "public"."workflow_run_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



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



GRANT ALL ON FUNCTION "public"."aggregate_fee_events_by_date"("start_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_fee_events_by_date"("start_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_fee_events_by_date"("start_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."aggregate_subscriptions_by_date"("start_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_subscriptions_by_date"("start_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_subscriptions_by_date"("start_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."append_audit_hash"() TO "anon";
GRANT ALL ON FUNCTION "public"."append_audit_hash"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."append_audit_hash"() TO "service_role";



GRANT ALL ON FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_match"("p_match_id" "uuid", "p_approved_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_assign_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_assign_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_assign_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_commit_subscription_on_task_complete"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_commit_subscription_on_task_complete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_commit_subscription_on_task_complete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_deal_folder"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_deal_folder"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_deal_folder"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_deal_folder_for_existing"("p_deal_id" "uuid", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_deal_folder_for_existing"("p_deal_id" "uuid", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_deal_folder_for_existing"("p_deal_id" "uuid", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_entity_investor"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_entity_investor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_entity_investor"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_introducer_commission"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_introducer_commission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_introducer_commission"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_position_from_subscription"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_position_from_subscription"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_position_from_subscription"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_vehicle_folders"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_vehicle_folders"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_vehicle_folders"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_vehicle_folders_for_existing"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_vehicle_folders_for_existing"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_vehicle_folders_for_existing"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."check_entity_compliance"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_entity_compliance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_entity_compliance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_deal_interest_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_deal_interest_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_deal_interest_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_deal_subscription_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_deal_subscription_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_deal_subscription_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_entity_folders"("p_vehicle_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_entity_folders"("p_vehicle_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_entity_folders"("p_vehicle_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_vehicle_folders"("p_vehicle_id" "uuid", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_investor_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_investor_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_investor_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_subscription_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_subscription_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_subscription_activity"() TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_tasks_from_templates"("p_user_id" "uuid", "p_investor_id" "uuid", "p_trigger_event" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_entity_default_folders"("p_vehicle_id" "uuid", "p_actor" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_entity_default_folders"("p_vehicle_id" "uuid", "p_actor" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_entity_default_folders"("p_vehicle_id" "uuid", "p_actor" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_message_read_receipt"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_message_read_receipt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_message_read_receipt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_check_onboarding_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_check_onboarding_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_check_onboarding_completion"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."fn_reset_onboarding_on_new_task"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_reset_onboarding_on_new_task"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_reset_onboarding_on_new_task"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_applicable_fee_plan"("p_investor_id" "uuid", "p_deal_id" "uuid", "p_as_of_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_approval_stats"("p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_conversation_unread_counts"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_counts"("month_start" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_counts"("month_start" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_counts"("month_start" timestamp with time zone) TO "service_role";



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



GRANT ALL ON FUNCTION "public"."get_or_create_investor"("p_name" "text", "p_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_investor"("p_name" "text", "p_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_investor"("p_name" "text", "p_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_vehicle"("p_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_vehicle"("p_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_vehicle"("p_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_portfolio_trends"("investor_ids" "uuid"[], "days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reconciliation_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_reconciliation_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reconciliation_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription_amount"("p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription_amount"("p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription_amount"("p_payload" "jsonb") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."prevent_role_self_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_role_self_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_role_self_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."publish_scheduled_documents"() TO "anon";
GRANT ALL ON FUNCTION "public"."publish_scheduled_documents"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."publish_scheduled_documents"() TO "service_role";



GRANT ALL ON FUNCTION "public"."run_auto_match"() TO "anon";
GRANT ALL ON FUNCTION "public"."run_auto_match"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_auto_match"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_approval_sla_deadline"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_approval_sla_deadline"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_approval_sla_deadline"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_subscription_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_subscription_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_subscription_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."trigger_investor_user_onboarding_tasks"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_investor_user_onboarding_tasks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_investor_user_onboarding_tasks"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unlock_dependent_tasks"() TO "anon";
GRANT ALL ON FUNCTION "public"."unlock_dependent_tasks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unlock_dependent_tasks"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unpublish_expired_documents"() TO "anon";
GRANT ALL ON FUNCTION "public"."unpublish_expired_documents"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unpublish_expired_documents"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_investor_counterparty_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_investor_counterparty_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_investor_counterparty_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_investor_legal_entities_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_investor_legal_entities_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_investor_legal_entities_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_kyc_submissions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_kyc_submissions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_kyc_submissions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_signature_requests_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_signature_requests_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_signature_requests_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_staff_filter_views_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_staff_filter_views_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_staff_filter_views_updated_at"() TO "service_role";



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



GRANT ALL ON TABLE "public"."allocations" TO "anon";
GRANT ALL ON TABLE "public"."allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."allocations" TO "service_role";



GRANT ALL ON TABLE "public"."approval_history" TO "anon";
GRANT ALL ON TABLE "public"."approval_history" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_history" TO "service_role";



GRANT ALL ON TABLE "public"."approvals" TO "anon";
GRANT ALL ON TABLE "public"."approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."approvals" TO "service_role";



GRANT ALL ON TABLE "public"."arranger_entities" TO "anon";
GRANT ALL ON TABLE "public"."arranger_entities" TO "authenticated";
GRANT ALL ON TABLE "public"."arranger_entities" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."audit_report_templates" TO "anon";
GRANT ALL ON TABLE "public"."audit_report_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_report_templates" TO "service_role";



GRANT ALL ON TABLE "public"."automation_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."automation_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."bank_transactions" TO "anon";
GRANT ALL ON TABLE "public"."bank_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."capital_call_items" TO "anon";
GRANT ALL ON TABLE "public"."capital_call_items" TO "authenticated";
GRANT ALL ON TABLE "public"."capital_call_items" TO "service_role";



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



GRANT ALL ON TABLE "public"."counterparty_entity_members" TO "anon";
GRANT ALL ON TABLE "public"."counterparty_entity_members" TO "authenticated";
GRANT ALL ON TABLE "public"."counterparty_entity_members" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_preferences" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."deal_activity_events" TO "anon";
GRANT ALL ON TABLE "public"."deal_activity_events" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_activity_events" TO "service_role";



GRANT ALL ON TABLE "public"."deal_data_room_access" TO "anon";
GRANT ALL ON TABLE "public"."deal_data_room_access" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_data_room_access" TO "service_role";



GRANT ALL ON TABLE "public"."deal_data_room_documents" TO "anon";
GRANT ALL ON TABLE "public"."deal_data_room_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_data_room_documents" TO "service_role";



GRANT ALL ON TABLE "public"."deal_faqs" TO "anon";
GRANT ALL ON TABLE "public"."deal_faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_faqs" TO "service_role";



GRANT ALL ON TABLE "public"."deal_fee_structures" TO "anon";
GRANT ALL ON TABLE "public"."deal_fee_structures" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_fee_structures" TO "service_role";



GRANT ALL ON TABLE "public"."deal_memberships" TO "anon";
GRANT ALL ON TABLE "public"."deal_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."deal_subscription_submissions" TO "anon";
GRANT ALL ON TABLE "public"."deal_subscription_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_subscription_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."deals" TO "anon";
GRANT ALL ON TABLE "public"."deals" TO "authenticated";
GRANT ALL ON TABLE "public"."deals" TO "service_role";



GRANT ALL ON TABLE "public"."director_registry" TO "anon";
GRANT ALL ON TABLE "public"."director_registry" TO "authenticated";
GRANT ALL ON TABLE "public"."director_registry" TO "service_role";



GRANT ALL ON TABLE "public"."distribution_items" TO "anon";
GRANT ALL ON TABLE "public"."distribution_items" TO "authenticated";
GRANT ALL ON TABLE "public"."distribution_items" TO "service_role";



GRANT ALL ON TABLE "public"."distributions" TO "anon";
GRANT ALL ON TABLE "public"."distributions" TO "authenticated";
GRANT ALL ON TABLE "public"."distributions" TO "service_role";



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



GRANT ALL ON TABLE "public"."entity_flags" TO "anon";
GRANT ALL ON TABLE "public"."entity_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_flags" TO "service_role";



GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";



GRANT ALL ON TABLE "public"."entity_action_center_summary" TO "anon";
GRANT ALL ON TABLE "public"."entity_action_center_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_action_center_summary" TO "service_role";



GRANT ALL ON TABLE "public"."entity_directors" TO "anon";
GRANT ALL ON TABLE "public"."entity_directors" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_directors" TO "service_role";



GRANT ALL ON TABLE "public"."entity_events" TO "anon";
GRANT ALL ON TABLE "public"."entity_events" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_events" TO "service_role";



GRANT ALL ON TABLE "public"."entity_folders" TO "anon";
GRANT ALL ON TABLE "public"."entity_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_folders" TO "service_role";



GRANT ALL ON TABLE "public"."entity_investors" TO "anon";
GRANT ALL ON TABLE "public"."entity_investors" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_investors" TO "service_role";



GRANT ALL ON TABLE "public"."entity_stakeholders" TO "anon";
GRANT ALL ON TABLE "public"."entity_stakeholders" TO "authenticated";
GRANT ALL ON TABLE "public"."entity_stakeholders" TO "service_role";



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



GRANT ALL ON TABLE "public"."fee_schedules" TO "anon";
GRANT ALL ON TABLE "public"."fee_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."folder_hierarchy" TO "anon";
GRANT ALL ON TABLE "public"."folder_hierarchy" TO "authenticated";
GRANT ALL ON TABLE "public"."folder_hierarchy" TO "service_role";



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



GRANT ALL ON TABLE "public"."investor_counterparty" TO "anon";
GRANT ALL ON TABLE "public"."investor_counterparty" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_counterparty" TO "service_role";



GRANT ALL ON TABLE "public"."investor_deal_holdings" TO "anon";
GRANT ALL ON TABLE "public"."investor_deal_holdings" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_deal_holdings" TO "service_role";



GRANT ALL ON TABLE "public"."investor_deal_interest" TO "anon";
GRANT ALL ON TABLE "public"."investor_deal_interest" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_deal_interest" TO "service_role";



GRANT ALL ON TABLE "public"."investor_interest_signals" TO "anon";
GRANT ALL ON TABLE "public"."investor_interest_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_interest_signals" TO "service_role";



GRANT ALL ON TABLE "public"."investor_members" TO "anon";
GRANT ALL ON TABLE "public"."investor_members" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_members" TO "service_role";



GRANT ALL ON TABLE "public"."investor_notifications" TO "anon";
GRANT ALL ON TABLE "public"."investor_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_notifications" TO "service_role";



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



GRANT ALL ON TABLE "public"."kyc_submissions" TO "anon";
GRANT ALL ON TABLE "public"."kyc_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."kyc_submissions" TO "service_role";



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



GRANT ALL ON TABLE "public"."share_lots" TO "anon";
GRANT ALL ON TABLE "public"."share_lots" TO "authenticated";
GRANT ALL ON TABLE "public"."share_lots" TO "service_role";



GRANT ALL ON TABLE "public"."share_sources" TO "anon";
GRANT ALL ON TABLE "public"."share_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."share_sources" TO "service_role";



GRANT ALL ON TABLE "public"."signature_requests" TO "anon";
GRANT ALL ON TABLE "public"."signature_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."signature_requests" TO "service_role";



GRANT ALL ON TABLE "public"."staff_filter_views" TO "anon";
GRANT ALL ON TABLE "public"."staff_filter_views" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_filter_views" TO "service_role";



GRANT ALL ON TABLE "public"."staff_permissions" TO "anon";
GRANT ALL ON TABLE "public"."staff_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_fingerprints" TO "anon";
GRANT ALL ON TABLE "public"."subscription_fingerprints" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_fingerprints" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_import_results" TO "anon";
GRANT ALL ON TABLE "public"."subscription_import_results" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_import_results" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_workbook_runs" TO "anon";
GRANT ALL ON TABLE "public"."subscription_workbook_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_workbook_runs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subscriptions_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscriptions_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscriptions_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."suggested_matches" TO "anon";
GRANT ALL ON TABLE "public"."suggested_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."suggested_matches" TO "service_role";



GRANT ALL ON TABLE "public"."system_metrics" TO "anon";
GRANT ALL ON TABLE "public"."system_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."system_metrics" TO "service_role";



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







