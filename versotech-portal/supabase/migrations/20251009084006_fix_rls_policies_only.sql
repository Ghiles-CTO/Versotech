-- Force drop and recreate ALL problematic RLS policies

-- 1. Fix conversation_participants policies (REMOVE RECURSION)
DROP POLICY IF EXISTS conversation_participants_read ON conversation_participants;
DROP POLICY IF EXISTS conversation_participants_insert ON conversation_participants;
DROP POLICY IF EXISTS conversation_participants_update ON conversation_participants;

-- Simple, non-recursive policies
CREATE POLICY conversation_participants_read ON conversation_participants FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

CREATE POLICY conversation_participants_insert ON conversation_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
        )
      )
  )
);

CREATE POLICY conversation_participants_update ON conversation_participants FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);;
