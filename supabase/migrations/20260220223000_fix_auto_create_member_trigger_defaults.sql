-- Fix auto-create member trigger functions to satisfy current member schemas.
-- Why: member tables now require full_name and role values that differ from *_users role values.
-- Without this, inserting *_users rows can fail and block invitation acceptance flows.

CREATE OR REPLACE FUNCTION public.auto_create_investor_member()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  SELECT COALESCE(NULLIF(trim(display_name), ''), NULLIF(split_part(email, '@', 1), ''), 'Unknown')
  INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.investor_members
    WHERE investor_id = NEW.investor_id
      AND linked_user_id = NEW.user_id
      AND is_active = true
  ) THEN
    INSERT INTO public.investor_members (
      investor_id,
      linked_user_id,
      role,
      full_name,
      kyc_status,
      is_active,
      created_at
    ) VALUES (
      NEW.investor_id,
      NEW.user_id,
      'other',
      user_name,
      'pending',
      true,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auto_create_partner_member()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  SELECT COALESCE(NULLIF(trim(display_name), ''), NULLIF(split_part(email, '@', 1), ''), 'Unknown')
  INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.partner_members
    WHERE partner_id = NEW.partner_id
      AND linked_user_id = NEW.user_id
      AND is_active = true
  ) THEN
    INSERT INTO public.partner_members (
      partner_id,
      linked_user_id,
      role,
      full_name,
      kyc_status,
      is_active,
      created_at
    ) VALUES (
      NEW.partner_id,
      NEW.user_id,
      'other',
      user_name,
      'pending',
      true,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auto_create_introducer_member()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  SELECT COALESCE(NULLIF(trim(display_name), ''), NULLIF(split_part(email, '@', 1), ''), 'Unknown')
  INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.introducer_members
    WHERE introducer_id = NEW.introducer_id
      AND linked_user_id = NEW.user_id
      AND is_active = true
  ) THEN
    INSERT INTO public.introducer_members (
      introducer_id,
      linked_user_id,
      role,
      full_name,
      kyc_status,
      is_active,
      created_at
    ) VALUES (
      NEW.introducer_id,
      NEW.user_id,
      'other',
      user_name,
      'pending',
      true,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auto_create_lawyer_member()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  SELECT COALESCE(NULLIF(trim(display_name), ''), NULLIF(split_part(email, '@', 1), ''), 'Unknown')
  INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.lawyer_members
    WHERE lawyer_id = NEW.lawyer_id
      AND linked_user_id = NEW.user_id
      AND is_active = true
  ) THEN
    INSERT INTO public.lawyer_members (
      lawyer_id,
      linked_user_id,
      role,
      full_name,
      kyc_status,
      is_active,
      created_at
    ) VALUES (
      NEW.lawyer_id,
      NEW.user_id,
      'other',
      user_name,
      'pending',
      true,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auto_create_commercial_partner_member()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  SELECT COALESCE(NULLIF(trim(display_name), ''), NULLIF(split_part(email, '@', 1), ''), 'Unknown')
  INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.commercial_partner_members
    WHERE commercial_partner_id = NEW.commercial_partner_id
      AND linked_user_id = NEW.user_id
      AND is_active = true
  ) THEN
    INSERT INTO public.commercial_partner_members (
      commercial_partner_id,
      linked_user_id,
      role,
      full_name,
      kyc_status,
      is_active,
      created_at
    ) VALUES (
      NEW.commercial_partner_id,
      NEW.user_id,
      'other',
      user_name,
      'pending',
      true,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auto_create_arranger_member()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  SELECT COALESCE(NULLIF(trim(display_name), ''), NULLIF(split_part(email, '@', 1), ''), 'Unknown')
  INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.arranger_members
    WHERE arranger_id = NEW.arranger_id
      AND linked_user_id = NEW.user_id
      AND is_active = true
  ) THEN
    INSERT INTO public.arranger_members (
      arranger_id,
      linked_user_id,
      role,
      full_name,
      kyc_status,
      is_active,
      created_at
    ) VALUES (
      NEW.arranger_id,
      NEW.user_id,
      'other',
      user_name,
      'pending',
      true,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
