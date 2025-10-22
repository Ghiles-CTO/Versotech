ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_read ON conversations;
CREATE POLICY conversations_read ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
  )
  OR (
    visibility IN ('internal', 'deal') AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin','staff_ops','staff_rm')
    )
  )
);

DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS conversations_update ON conversations;
CREATE POLICY conversations_update ON conversations FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin','staff_ops','staff_rm')
  )
)
WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin','staff_ops','staff_rm')
  )
);

DROP POLICY IF EXISTS conversation_participants_read ON conversation_participants;
CREATE POLICY conversation_participants_read ON conversation_participants FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin','staff_ops','staff_rm')
  )
);

DROP POLICY IF EXISTS conversation_participants_insert ON conversation_participants;
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
            AND p.role IN ('staff_admin','staff_ops','staff_rm')
        )
      )
  )
);

DROP POLICY IF EXISTS conversation_participants_update ON conversation_participants;
CREATE POLICY conversation_participants_update ON conversation_participants FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin','staff_ops','staff_rm')
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin','staff_ops','staff_rm')
  )
);
;
