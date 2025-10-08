-- Database Migration 024: Staff Messaging Metadata Enhancements
-- Description: Add visibility and participant role metadata required for staff messaging inbox
-- Dependencies: 011_create_messaging_schema.sql
-- Date: 2025-10-08

-- ============================================================================
-- 1) ENUM TYPES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'conversation_visibility_enum'
  ) THEN
    CREATE TYPE conversation_visibility_enum AS ENUM ('investor', 'internal', 'deal');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'participant_role_enum'
  ) THEN
    CREATE TYPE participant_role_enum AS ENUM ('owner', 'member', 'viewer');
  END IF;
END $$;

ALTER TYPE convo_type_enum ADD VALUE IF NOT EXISTS 'deal_room';

-- ============================================================================
-- 2) TABLE ALTERATIONS
-- ============================================================================

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS visibility conversation_visibility_enum NOT NULL DEFAULT 'internal';

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS owner_team text;

ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS participant_role participant_role_enum NOT NULL DEFAULT 'member';

-- ============================================================================
-- 3) INDEXES & DATA BACKFILL
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_conversations_visibility ON conversations(visibility);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_role ON conversation_participants(participant_role);

UPDATE conversation_participants cp
SET participant_role = 'owner'
FROM conversations c
WHERE cp.conversation_id = c.id
  AND c.created_by = cp.user_id
  AND cp.participant_role <> 'owner';

UPDATE conversations
SET visibility = 'investor'
WHERE visibility = 'internal'
  AND type = 'dm'
  AND deal_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM conversation_participants cp
    JOIN profiles p ON p.id = cp.user_id
    WHERE cp.conversation_id = conversations.id
      AND p.role = 'investor'
  );

UPDATE conversations
SET visibility = 'deal'
WHERE visibility = 'internal'
  AND deal_id IS NOT NULL;

-- ============================================================================
-- 4) RLS POLICY UPDATES
-- ============================================================================

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
        AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
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
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
)
WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
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
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
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
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
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
);

-- Messages table already inherits correct policies in 011; no change needed here.

COMMENT ON COLUMN conversations.visibility IS 'Visibility scope for staff messaging filters: investor, internal, deal';
COMMENT ON COLUMN conversations.owner_team IS 'Optional staff team label owning the conversation';
COMMENT ON COLUMN conversation_participants.participant_role IS 'Role of participant within the conversation (owner/member/viewer)';

-- ============================================================================
-- 5) HELPER FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS get_conversation_unread_counts(uuid, uuid[]);

CREATE OR REPLACE FUNCTION get_conversation_unread_counts(
  p_user_id uuid,
  p_conversation_ids uuid[]
)
RETURNS TABLE(conversation_id uuid, unread_count bigint)
LANGUAGE plpgsql
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

