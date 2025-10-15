ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_participants_insert ON conversation_participants;
CREATE POLICY conversation_participants_insert ON conversation_participants FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversations c
    WHERE c.id = conversation_participants.conversation_id
  )
);

DROP POLICY IF EXISTS conversation_participants_update ON conversation_participants;
CREATE POLICY conversation_participants_update ON conversation_participants FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
  OR user_id = auth.uid()
) WITH CHECK (TRUE);
;
