-- Database Migration 011: Messaging & Communications Schema
-- Description: Creates conversations, messages, and related tables for the messaging feature
-- Dependencies: Migration 001 (profiles, deals)
-- Date: 2025-01-24

-- ============================================================================
-- 1) CONVERSATIONS & MESSAGING TABLES
-- ============================================================================

-- Main conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text,
  type text CHECK (type IN ('dm', 'group', 'deal_room')) DEFAULT 'dm',
  name text,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- Conversation participants (many-to-many)
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  is_muted boolean DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);
-- Messages within conversations
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id),
  body text,
  file_key text,
  message_type text CHECK (message_type IN ('text', 'system', 'file')) DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
-- Read receipts for messages
CREATE TABLE IF NOT EXISTS message_reads (
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);
-- ============================================================================
-- 2) INDEXES FOR PERFORMANCE
-- ============================================================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_deal ON conversations(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
-- Conversation participants indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id, last_read_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at) WHERE deleted_at IS NULL;
-- Message reads indexes
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message ON message_reads(message_id);
-- ============================================================================
-- 3) ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all messaging tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
-- Conversations: see only if participant, deal member, or staff
DROP POLICY IF EXISTS conversations_read ON conversations;
CREATE POLICY conversations_read ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
  )
  OR (
    deal_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM deal_memberships dm
      WHERE dm.deal_id = conversations.deal_id
        AND dm.user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role::text LIKE 'staff_%'
  )
);
-- Conversations: create if user is investor or staff
DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
    )
  )
);
-- Participants: see only if in conversation or staff
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
    WHERE p.id = auth.uid() AND p.role::text LIKE 'staff_%'
  )
);
-- Participants: insert only for own conversations or staff
DROP POLICY IF EXISTS conversation_participants_insert ON conversation_participants;
CREATE POLICY conversation_participants_insert ON conversation_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND (c.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role::text LIKE 'staff_%'
      ))
  )
);
-- Messages: see only if participant or staff
DROP POLICY IF EXISTS messages_read ON messages;
CREATE POLICY messages_read ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role::text LIKE 'staff_%'
  )
);
-- Messages: insert only if participant
DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
  )
  AND sender_id = auth.uid()
);
-- Messages: update only own messages (for editing)
DROP POLICY IF EXISTS messages_update ON messages;
CREATE POLICY messages_update ON messages FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());
-- Message reads: users can read their own read receipts
DROP POLICY IF EXISTS message_reads_read ON message_reads;
CREATE POLICY message_reads_read ON message_reads FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role::text LIKE 'staff_%'
  )
);
-- Message reads: users can insert their own read receipts
DROP POLICY IF EXISTS message_reads_insert ON message_reads;
CREATE POLICY message_reads_insert ON message_reads FOR INSERT
WITH CHECK (user_id = auth.uid());
-- ============================================================================
-- 4) TRIGGERS FOR BUSINESS LOGIC
-- ============================================================================

-- Update last_message_at when a new message is created
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON messages;
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
-- Update updated_at timestamp on conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================================
-- 5) HELPER FUNCTIONS
-- ============================================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages m
  JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
  WHERE cp.user_id = p_user_id
    AND m.created_at > cp.last_read_at
    AND m.sender_id != p_user_id
    AND m.deleted_at IS NULL;

  RETURN unread_count;
END;
$$;
-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = now()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$;
-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_message_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read(uuid, uuid) TO authenticated;
-- ============================================================================
-- 6) COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE conversations IS 'Chat threads between investors, staff, and deal participants';
COMMENT ON TABLE conversation_participants IS 'Users participating in each conversation with read tracking';
COMMENT ON TABLE messages IS 'Individual messages within conversations with support for text, files, and system messages';
COMMENT ON TABLE message_reads IS 'Read receipts showing when each user read each message';
COMMENT ON COLUMN conversations.type IS 'Conversation type: dm (direct message), group, or deal_room (scoped to a deal)';
COMMENT ON COLUMN conversations.deal_id IS 'If set, conversation is scoped to a specific deal';
COMMENT ON COLUMN conversation_participants.last_read_at IS 'Timestamp of when user last read messages in this conversation';
COMMENT ON COLUMN messages.message_type IS 'Type of message: text, system (automated), or file (attachment)';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete timestamp for compliance (message body retained for audit)';
COMMENT ON FUNCTION get_unread_message_count(uuid) IS 'Returns total unread message count across all conversations for a user';
COMMENT ON FUNCTION mark_conversation_read(uuid, uuid) IS 'Marks all messages in a conversation as read for a user';
