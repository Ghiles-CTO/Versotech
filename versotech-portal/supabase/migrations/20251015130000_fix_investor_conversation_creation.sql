-- Migration: Fix Investor Conversation Creation
-- Date: 2025-10-15
-- Description: Ensure investors can create conversations and send messages properly

-- Ensure conversations INSERT policy allows all authenticated users (investors + staff)
DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations FOR INSERT
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    -- Allow both investors and staff
    AND p.role IS NOT NULL
  )
);

-- Ensure messages INSERT policy allows conversation participants
DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
);

-- Ensure messages SELECT policy allows conversation participants
DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

COMMENT ON POLICY conversations_insert ON conversations IS
  'Allow any authenticated user with a profile (investor or staff) to create conversations';

COMMENT ON POLICY messages_insert ON messages IS
  'Allow conversation participants to send messages';

