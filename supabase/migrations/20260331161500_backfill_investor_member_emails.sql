-- Ensure linked investor_members always carry the linked profile email.
-- Why:
-- - auto_create_investor_member() previously created rows without an email.
-- - staged subscription signing depends on member signers having a resolvable email.
-- - existing linked rows with blank email must be backfilled from profiles.

CREATE OR REPLACE FUNCTION public.auto_create_investor_member()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  SELECT
    COALESCE(NULLIF(trim(display_name), ''), NULLIF(split_part(email, '@', 1), ''), 'Unknown'),
    NULLIF(trim(email), '')
  INTO user_name, user_email
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
      email,
      kyc_status,
      is_active,
      created_at
    ) VALUES (
      NEW.investor_id,
      NEW.user_id,
      'other',
      user_name,
      user_email,
      'pending',
      true,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE public.investor_members AS member
SET
  email = NULLIF(trim(profile.email), ''),
  updated_at = NOW()
FROM public.profiles AS profile
WHERE member.linked_user_id = profile.id
  AND member.is_active = true
  AND (member.email IS NULL OR trim(member.email) = '')
  AND profile.email IS NOT NULL
  AND trim(profile.email) <> '';
