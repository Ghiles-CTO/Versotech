-- Ensure CEO users are treated as staff in data room access and storage policies.
-- This keeps role handling consistent across:
--   - public.deal_data_room_access
--   - public.deal_data_room_documents (already included CEO)
--   - storage.objects policy for deal-documents reads

DROP POLICY IF EXISTS deal_data_room_access_select ON public.deal_data_room_access;
CREATE POLICY deal_data_room_access_select ON public.deal_data_room_access
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.investor_users iu
    WHERE iu.investor_id = deal_data_room_access.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        (p.role)::text LIKE 'staff_%'
        OR p.role = 'ceo'::public.user_role
      )
  )
);

DROP POLICY IF EXISTS deal_data_room_access_staff_modify ON public.deal_data_room_access;
CREATE POLICY deal_data_room_access_staff_modify ON public.deal_data_room_access
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        (p.role)::text LIKE 'staff_%'
        OR p.role = 'ceo'::public.user_role
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        (p.role)::text LIKE 'staff_%'
        OR p.role = 'ceo'::public.user_role
      )
  )
);

DROP POLICY IF EXISTS "Investors with access can read deal documents" ON storage.objects;
CREATE POLICY "Investors with access can read deal documents" ON storage.objects
FOR SELECT
TO authenticated
USING (
  (bucket_id = 'deal-documents')
  AND (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (
          (profiles.role)::text LIKE 'staff_%'
          OR profiles.role = 'ceo'::public.user_role
        )
    )
    OR EXISTS (
      SELECT 1
      FROM (
        public.deal_data_room_access dra
        JOIN public.investor_users iu ON iu.investor_id = dra.investor_id
      )
      WHERE iu.user_id = auth.uid()
        AND dra.revoked_at IS NULL
        AND (dra.expires_at IS NULL OR dra.expires_at > now())
        AND (dra.deal_id)::text = (string_to_array(storage.objects.name, '/'::text))[2]
    )
  )
);
