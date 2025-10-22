-- Migration: Final Fix for Investor Conversation Creation
-- Date: 2025-11-15
-- Description: Ensure investors can create conversations - runs after all other migrations
-- This migration has a higher timestamp to ensure it runs LAST

-- Drop and recreate conversations INSERT policy to allow investors
DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid()
);
-- Ensure conversation_participants INSERT allows creator to add participants
DROP POLICY IF EXISTS conversation_participants_insert ON conversation_participants;
CREATE POLICY conversation_participants_insert ON conversation_participants
FOR INSERT
WITH CHECK (
  -- Allow if user is the conversation creator OR if user is staff
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND c.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
-- Ensure messages INSERT allows participants to send messages
DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  -- Note: Don't check participants yet as the row might not exist when conversation is being created
);
-- Ensure messages SELECT allows participants to read
DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text LIKE 'staff_%'
  )
);
-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated to allow investor conversation creation';
END $$;
