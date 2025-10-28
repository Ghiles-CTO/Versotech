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

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS visibility conversation_visibility_enum NOT NULL DEFAULT 'internal';

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS owner_team text;

ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS participant_role participant_role_enum NOT NULL DEFAULT 'member';

CREATE INDEX IF NOT EXISTS idx_conversations_visibility ON conversations(visibility);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_role ON conversation_participants(participant_role);

UPDATE conversation_participants cp
SET participant_role = 'owner'
FROM conversations c
WHERE cp.conversation_id = c.id
  AND c.created_by = cp.user_id
  AND cp.participant_role <> 'owner';;
