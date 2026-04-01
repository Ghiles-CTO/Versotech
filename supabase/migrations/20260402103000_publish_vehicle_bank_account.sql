-- Publish a vehicle bank account in one transaction so the live account cannot disappear mid-switch.

CREATE OR REPLACE FUNCTION public.publish_vehicle_bank_account(
  p_vehicle_id uuid,
  p_account_id uuid,
  p_actor_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_published_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.vehicle_bank_accounts
    WHERE id = p_account_id
      AND vehicle_id = p_vehicle_id
  ) THEN
    RAISE EXCEPTION 'Bank account not found';
  END IF;

  PERFORM 1
  FROM public.vehicle_bank_accounts
  WHERE vehicle_id = p_vehicle_id
  FOR UPDATE;

  UPDATE public.vehicle_bank_accounts
  SET
    status = 'archived',
    updated_by = p_actor_id
  WHERE vehicle_id = p_vehicle_id
    AND status = 'active'
    AND id <> p_account_id;

  UPDATE public.vehicle_bank_accounts
  SET
    status = 'active',
    published_at = COALESCE(published_at, now()),
    published_by = COALESCE(published_by, p_actor_id),
    updated_by = p_actor_id
  WHERE id = p_account_id
    AND vehicle_id = p_vehicle_id
  RETURNING id INTO v_published_id;

  IF v_published_id IS NULL THEN
    RAISE EXCEPTION 'Failed to publish bank account';
  END IF;

  RETURN v_published_id;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_vehicle_bank_account(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_vehicle_bank_account(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_vehicle_bank_account(uuid, uuid, uuid) TO service_role;
