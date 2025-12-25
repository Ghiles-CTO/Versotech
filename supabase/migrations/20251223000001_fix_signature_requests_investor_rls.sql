-- Fix investor signature request policy to use investor_users junction table.

DROP POLICY IF EXISTS "Investors can view their own signature requests" ON public.signature_requests;

CREATE POLICY "Investors can view their own signature requests"
ON public.signature_requests
FOR SELECT
TO authenticated
USING (
  investor_id IN (
    SELECT investor_id
    FROM investor_users
    WHERE user_id = auth.uid()
  )
);
