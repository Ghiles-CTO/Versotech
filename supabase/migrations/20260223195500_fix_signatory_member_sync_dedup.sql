-- Prevent duplicate investor_members rows when signatory access is granted.
-- Problem:
-- - auto_create_investor_member() creates a linked row on investor_users insert.
-- - sync_investor_user_to_member() could create a second row because it only matched by email.
-- Fix:
-- - First try to reuse existing member by linked_user_id (preferred) or email (fallback).
-- - Update that row as signatory instead of inserting a duplicate.
-- - Only insert when no reusable member row exists.

CREATE OR REPLACE FUNCTION public.sync_investor_user_to_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_investor_type text;
  v_user_profile record;
  v_existing_member_id uuid;
BEGIN
  -- Only process signatory-capable links.
  IF NEW.can_sign IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  -- Only entity-like investors use member rows.
  SELECT type INTO v_investor_type
  FROM investors
  WHERE id = NEW.investor_id;

  IF v_investor_type NOT IN ('entity', 'institution', 'institutional', 'corporate') THEN
    RETURN NEW;
  END IF;

  -- Resolve user identity once.
  SELECT id, email, display_name
  INTO v_user_profile
  FROM profiles
  WHERE id = NEW.user_id;

  IF v_user_profile.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Reuse existing member row:
  -- 1) exact linked_user_id match
  -- 2) same email fallback
  SELECT id
  INTO v_existing_member_id
  FROM investor_members
  WHERE investor_id = NEW.investor_id
    AND is_active = true
    AND (
      linked_user_id = NEW.user_id
      OR (
        v_user_profile.email IS NOT NULL
        AND lower(email) = lower(v_user_profile.email)
      )
    )
  ORDER BY
    CASE
      WHEN linked_user_id = NEW.user_id THEN 0
      WHEN v_user_profile.email IS NOT NULL AND lower(email) = lower(v_user_profile.email) THEN 1
      ELSE 2
    END,
    created_at ASC
  LIMIT 1;

  IF v_existing_member_id IS NOT NULL THEN
    UPDATE investor_members
    SET
      is_signatory = true,
      can_sign = true,
      linked_user_id = COALESCE(linked_user_id, NEW.user_id),
      email = COALESCE(email, v_user_profile.email),
      full_name = COALESCE(
        NULLIF(trim(full_name), ''),
        COALESCE(v_user_profile.display_name, v_user_profile.email)
      ),
      role = CASE
        WHEN role IS NULL OR trim(role) = '' OR role = 'other' THEN 'authorized_signatory'
        ELSE role
      END,
      updated_at = NOW()
    WHERE id = v_existing_member_id;

    RAISE NOTICE 'Updated investor_member % to signatory for user %', v_existing_member_id, NEW.user_id;
  ELSE
    INSERT INTO investor_members (
      investor_id,
      linked_user_id,
      full_name,
      email,
      role,
      is_signatory,
      can_sign,
      is_active,
      kyc_status,
      created_by
    ) VALUES (
      NEW.investor_id,
      NEW.user_id,
      COALESCE(v_user_profile.display_name, v_user_profile.email),
      v_user_profile.email,
      'authorized_signatory',
      true,
      true,
      true,
      'pending',
      NEW.user_id
    );

    RAISE NOTICE 'Created investor_member for % with is_signatory=true', v_user_profile.email;
  END IF;

  RETURN NEW;
END;
$function$;

