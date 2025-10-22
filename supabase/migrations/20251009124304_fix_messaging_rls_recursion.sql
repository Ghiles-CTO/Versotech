-- Database Migration 025: Fix Messaging RLS Infinite Recursion
-- Description: Fix circular reference in conversation_participants policy causing infinite recursion
-- Dependencies: 024_staff_messaging_metadata.sql
-- Date: 2025-10-09

-- ============================================================================
-- 1) FIX CONVERSATION_PARTICIPANTS RLS POLICY
-- ============================================================================

-- The issue: conversation_participants_read policy checks conversation_participants
-- from within itself, causing infinite recursion when querying the table.
-- 
-- The fix: Remove the redundant recursive check. If a user is in the conversation,
-- they'll match the first condition (user_id = auth.uid()). The recursive check
-- was attempting to allow users to see OTHER participants in conversations they're
-- part of, but this should be done via joins in application code with service client.

DROP POLICY IF EXISTS conversation_participants_read ON conversation_participants;
CREATE POLICY conversation_participants_read ON conversation_participants FOR SELECT
USING (
  -- Users can see their own participation records
  user_id = auth.uid()
  -- Staff can see all participant records (for admin purposes)
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

-- ============================================================================
-- 2) ENSURE GET_CONVERSATION_UNREAD_COUNTS FUNCTION EXISTS
-- ============================================================================

-- Recreate the function to ensure it's available
DROP FUNCTION IF EXISTS get_conversation_unread_counts(uuid, uuid[]);

CREATE OR REPLACE FUNCTION get_conversation_unread_counts(
  p_user_id uuid,
  p_conversation_ids uuid[]
)
RETURNS TABLE(conversation_id uuid, unread_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_conversation_ids IS NULL OR array_length(p_conversation_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id,
         CASE
           WHEN cp.user_id IS NULL THEN 0::bigint
           ELSE (
             SELECT COUNT(*)::bigint
             FROM messages m
             WHERE m.conversation_id = c.id
               AND m.deleted_at IS NULL
               AND m.sender_id <> p_user_id
               AND m.created_at > COALESCE(cp.last_read_at, '-infinity'::timestamptz)
           )
         END AS unread_count
  FROM conversations c
  LEFT JOIN conversation_participants cp
    ON cp.conversation_id = c.id
   AND cp.user_id = p_user_id
  WHERE c.id = ANY(p_conversation_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION get_conversation_unread_counts(uuid, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_unread_counts(uuid, uuid[]) TO anon;

-- ============================================================================
-- 3) ADD BROADCAST TYPE TO CONVERSATIONS
-- ============================================================================

-- Add broadcast type if not already present
DO $$
BEGIN
  -- Check if broadcast type exists in the type column constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'conversations_type_check'
  ) THEN
    -- No constraint exists, add one with broadcast
    ALTER TABLE conversations 
      ADD CONSTRAINT conversations_type_check 
      CHECK (type IN ('dm', 'group', 'deal_room', 'broadcast'));
  ELSE
    -- Constraint exists, try to update it
    ALTER TABLE conversations 
      DROP CONSTRAINT IF EXISTS conversations_type_check;
    
    ALTER TABLE conversations 
      ADD CONSTRAINT conversations_type_check 
      CHECK (type IN ('dm', 'group', 'deal_room', 'broadcast'));
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If constraint doesn't match, recreate it
    ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_type_check;
    ALTER TABLE conversations 
      ADD CONSTRAINT conversations_type_check 
      CHECK (type IN ('dm', 'group', 'deal_room', 'broadcast'));
END $$;

COMMENT ON FUNCTION get_conversation_unread_counts(uuid, uuid[]) IS 'Returns unread message counts for specified conversations for a user';;
