-- Migration 026: Messaging schema rebuild aligned with PRD
-- Description: Recreate messaging tables, enums, helper functions, and RLS
-- Dependencies: deals, profiles, deal_memberships tables; update_updated_at_column()

-- ============================================================================
-- 0) CLEAN UP LEGACY STRUCTURE
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('public.message_reads') IS NOT NULL THEN
    DROP TABLE public.message_reads CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    DROP TABLE public.messages CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.conversation_participants') IS NOT NULL THEN
    DROP TABLE public.conversation_participants CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.conversations') IS NOT NULL THEN
    DROP TABLE public.conversations CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_visibility_enum') THEN
    DROP TYPE conversation_visibility_enum;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_type_enum') THEN
    DROP TYPE conversation_type_enum;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_role_enum') THEN
    DROP TYPE participant_role_enum;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
    DROP TYPE message_type_enum;
  END IF;
END $$;

-- ============================================================================
-- 1) ENUM TYPES
-- ============================================================================

CREATE TYPE conversation_type_enum AS ENUM ('dm', 'group', 'deal_room', 'broadcast');
CREATE TYPE conversation_visibility_enum AS ENUM ('investor', 'internal', 'deal');
CREATE TYPE participant_role_enum AS ENUM ('owner', 'member', 'viewer');
CREATE TYPE message_type_enum AS ENUM ('text', 'system', 'file');

-- ============================================================================
-- 2) CORE TABLES
-- ============================================================================

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text,
  preview text,
  type conversation_type_enum NOT NULL DEFAULT 'dm',
  visibility conversation_visibility_enum NOT NULL DEFAULT 'internal',
  owner_team text,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  last_message_id uuid,
  archived_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_role participant_role_enum NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz,
  last_notified_at timestamptz,
  is_muted boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  body text,
  message_type message_type_enum NOT NULL DEFAULT 'text',
  file_key text,
  reply_to_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);


CREATE TABLE message_reads (
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

-- ============================================================================
-- 3) INDEXES & CONSTRAINTS
-- ============================================================================

CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX idx_conversations_visibility ON conversations(visibility);
CREATE INDEX idx_conversations_deal ON conversations(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_conversations_type ON conversations(type);

CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_role ON conversation_participants(participant_role);

CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_reply_thread ON messages(reply_to_message_id);

CREATE INDEX idx_message_reads_user ON message_reads(user_id);

ALTER TABLE conversation_participants
  ADD CONSTRAINT conversation_participants_role_owner
  CHECK (
    (participant_role = 'owner' AND is_muted = false)
    OR participant_role IN ('member', 'viewer')
  );

-- Ensure deal rooms are unique per deal
CREATE UNIQUE INDEX idx_deal_room_per_deal
  ON conversations(deal_id)
  WHERE type = 'deal_room' AND archived_at IS NULL;

-- Seed owner participant via trigger helper

-- ============================================================================
-- 4) TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION trg_conversation_set_owner()
RETURNS TRIGGER AS $$
DECLARE
  owner_exists boolean;
BEGIN
  IF NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT TRUE INTO owner_exists
  FROM conversation_participants
  WHERE conversation_id = NEW.id AND participant_role = 'owner'
  LIMIT 1;

  IF NOT owner_exists THEN
    INSERT INTO conversation_participants (conversation_id, user_id, participant_role, joined_at)
    VALUES (NEW.id, NEW.created_by, 'owner', COALESCE(NEW.created_at, now()))
    ON CONFLICT (conversation_id, user_id) DO UPDATE
      SET participant_role = EXCLUDED.participant_role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversations_owner_seed ON conversations;
CREATE TRIGGER conversations_owner_seed
  AFTER INSERT ON conversations
  FOR EACH ROW EXECUTE FUNCTION trg_conversation_set_owner();

CREATE OR REPLACE FUNCTION trg_touch_conversation_participant()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversation_participants_touch ON conversation_participants;
CREATE TRIGGER conversation_participants_touch
  BEFORE UPDATE ON conversation_participants
  FOR EACH ROW EXECUTE FUNCTION trg_touch_conversation_participant();

CREATE OR REPLACE FUNCTION trg_refresh_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      last_message_id = NEW.id,
      preview = COALESCE(NULLIF(left(NEW.body, 320), ''), preview),
      updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_refresh_conversation ON messages;
CREATE TRIGGER messages_refresh_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION trg_refresh_conversation_metadata();

DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5) HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_conversation_unread_counts(
  p_user_id uuid,
  p_conversation_ids uuid[]
)
RETURNS TABLE(conversation_id uuid, unread_count bigint)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  IF p_conversation_ids IS NULL OR array_length(p_conversation_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id,
         COALESCE(
           (
             SELECT COUNT(*)
             FROM messages m
             WHERE m.conversation_id = c.id
               AND m.deleted_at IS NULL
               AND (m.created_at > COALESCE(cp.last_read_at, '-infinity'::timestamptz))
               AND (m.sender_id IS DISTINCT FROM p_user_id)
           ),
           0
         )::bigint AS unread_count
  FROM conversations c
  LEFT JOIN conversation_participants cp
    ON cp.conversation_id = c.id AND cp.user_id = p_user_id
  WHERE c.id = ANY(p_conversation_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION get_conversation_unread_counts(uuid, uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_conversation_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = greatest(coalesce(last_read_at, '-infinity'::timestamptz), now())
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_conversation_read(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION ensure_message_read_receipt()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO message_reads (message_id, user_id, read_at)
  VALUES (NEW.id, NEW.sender_id, NEW.created_at)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_auto_read ON messages;
CREATE TRIGGER messages_auto_read
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION ensure_message_read_receipt();

-- ============================================================================
-- 6) ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_select ON conversations;
CREATE POLICY conversations_select ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
  )
  OR (
    conversations.visibility = 'deal'
    AND EXISTS (
      SELECT 1
      FROM deal_memberships dm
      WHERE dm.deal_id = conversations.deal_id
        AND dm.user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

DROP POLICY IF EXISTS conversations_update ON conversations;
CREATE POLICY conversations_update ON conversations FOR UPDATE USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
) WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

DROP POLICY IF EXISTS conversation_participants_select ON conversation_participants;
CREATE POLICY conversation_participants_select ON conversation_participants FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM conversation_participants inner_cp
    WHERE inner_cp.conversation_id = conversation_participants.conversation_id
      AND inner_cp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

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

DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages FOR SELECT USING (
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

DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

DROP POLICY IF EXISTS messages_update ON messages;
CREATE POLICY messages_update ON messages FOR UPDATE USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
) WITH CHECK (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

DROP POLICY IF EXISTS message_reads_select ON message_reads;
CREATE POLICY message_reads_select ON message_reads FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = (
      SELECT conversation_id FROM messages WHERE id = message_reads.message_id
    )
      AND cp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm')
  )
);

DROP POLICY IF EXISTS message_reads_insert ON message_reads;
CREATE POLICY message_reads_insert ON message_reads FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ============================================================================
-- 7) COMMENTS
-- ============================================================================

COMMENT ON TABLE conversations IS 'Conversation metadata for investor/staff messages and deal rooms.';
COMMENT ON COLUMN conversations.preview IS 'Latest text preview used for inbox listing.';
COMMENT ON COLUMN conversations.visibility IS 'Visibility scope used by staff filters (investor/internal/deal).';
COMMENT ON COLUMN conversations.owner_team IS 'Optional staff team identifier owning the conversation.';
COMMENT ON COLUMN conversations.metadata IS 'JSON metadata such as pinned flags, workflow bindings, or escalation status.';

COMMENT ON TABLE conversation_participants IS 'Participants in a conversation with read state and preferences.';
COMMENT ON COLUMN conversation_participants.participant_role IS 'Role within the conversation (owner/member/viewer).';
COMMENT ON COLUMN conversation_participants.last_read_at IS 'Last time participant read the conversation.';

COMMENT ON TABLE messages IS 'Individual messages including attachments and system notices.';
COMMENT ON COLUMN messages.message_type IS 'text/system/file indicator for rendering and permissions.';
COMMENT ON COLUMN messages.metadata IS 'JSON metadata for reactions, attachments, or workflow references.';

COMMENT ON TABLE message_reads IS 'Message-level read receipts for compliance and realtime indicators.';

-- ============================================================================
-- 8) SEED DEFAULTS (OPTIONAL PLACEHOLDER)
-- ============================================================================

-- No seed data to insert; application-layer will handle bootstrapping conversations.


