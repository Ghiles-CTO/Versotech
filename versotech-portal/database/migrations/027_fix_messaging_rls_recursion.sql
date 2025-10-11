-- Migration 027: Fix infinite recursion in conversation_participants RLS policy
-- Issue: The SELECT policy was querying conversation_participants within itself

-- Drop the problematic policy
DROP POLICY IF EXISTS conversation_participants_select ON conversation_participants;

-- Create a fixed policy without recursion
-- Users can see participant records if:
-- 1. They ARE that participant (user_id = auth.uid())
-- 2. They are staff with messaging access
CREATE POLICY conversation_participants_select ON conversation_participants 
FOR SELECT 
USING (
  (user_id = auth.uid())
  OR 
  (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  )
);

-- Also fix the conversations_select policy to avoid potential recursion
-- by checking conversation_participants membership more directly
DROP POLICY IF EXISTS conversations_select ON conversations;

CREATE POLICY conversations_select ON conversations 
FOR SELECT 
USING (
  -- Direct participant check (simple, no recursion)
  (
    EXISTS (
      SELECT 1
      FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
  )
  OR 
  (
    -- Deal room access via deal membership
    conversations.visibility = 'deal'
    AND conversations.deal_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM deal_memberships dm
      WHERE dm.deal_id = conversations.deal_id
        AND dm.user_id = auth.uid()
    )
  )
  OR 
  (
    -- Staff can see internal and deal conversations
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
    AND conversations.visibility IN ('internal', 'deal')
  )
  OR 
  (
    -- Staff can see investor conversations they participate in
    conversations.visibility = 'investor'
    AND EXISTS (
      SELECT 1
      FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
  )
);

COMMENT ON POLICY conversations_select ON conversations IS 
'Allow users to see conversations they participate in, deal rooms for their deals, and staff-appropriate conversations';

COMMENT ON POLICY conversation_participants_select ON conversation_participants IS 
'Allow users to see their own participant records and staff to see all (no recursion)';

-- Fix conversation_participants_insert policy (currently causing infinite recursion)
DROP POLICY IF EXISTS conversation_participants_insert ON conversation_participants;

CREATE POLICY conversation_participants_insert ON conversation_participants 
FOR INSERT 
WITH CHECK (
  -- Anyone can add participants to conversations they created
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_participants.conversation_id
      AND c.created_by = auth.uid()
  )
  OR
  -- Staff can add participants to any conversation
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

-- Fix messages_insert policy to allow staff to send messages in internal/deal conversations
DROP POLICY IF EXISTS messages_insert ON messages;

CREATE POLICY messages_insert ON messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid()
  AND
  (
    -- Regular users must be participants
    EXISTS (
      SELECT 1
      FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
    OR
    -- Staff can send messages in internal/deal conversations
    (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
      )
      AND EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
          AND c.visibility IN ('internal', 'deal')
      )
    )
  )
);

COMMENT ON POLICY messages_insert ON messages IS 
'Allow participants to send messages; staff can send in internal/deal conversations without being explicit participants';

-- Also update messages_select policy to be consistent
DROP POLICY IF EXISTS messages_select ON messages;

CREATE POLICY messages_select ON messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
  OR
  (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
    )
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.visibility IN ('internal', 'deal')
    )
  )
);

-- Update messages_update policy to be consistent
DROP POLICY IF EXISTS messages_update ON messages;

CREATE POLICY messages_update ON messages 
FOR UPDATE 
USING (
  sender_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
) 
WITH CHECK (
  sender_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

