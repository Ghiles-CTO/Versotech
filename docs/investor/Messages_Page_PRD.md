# Messages Page PRD - Investor & Staff Portals

**Version:** 2.0
**Product:** VERSO Holdings & VersoTech Portals
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Messages experience is the secure communications hub baked into the Verso portals. It gives investors, their delegates, and Verso staff a single place to exchange updates, share files, and coordinate deal activity without leaving the platform. Threads stay in sync with portfolio data so that a document upload, allocation change, or task completion can be discussed in-line, giving everyone shared context and an audit-ready trail.

Conversations can be one-to-one, small groups, or tied to a specific deal space. Real-time delivery, read indicators, and role-aware access keep communication responsive while satisfying compliance needs. Attachments use the same watermarked document infrastructure as the Documents module, and every action is captured for audit.

---

## Part 1: Business Context (Non-Technical)

### What is the Messages Feature?

Messages is the in-portal chat center. Investors see their ongoing conversations with relationship managers, compliance, or advisors. Staff see both investor chats and internal deal rooms. Each thread feels familiar-subject line, timeline of messages, and quick composer-but sits inside Verso so sensitive details never leak into email.

### Why Does It Matter?

**For Investors**
- Stay informed about allocations, capital calls, and documents without hunting through email chains.
- Submit quick questions and get responses from the right Verso contact.
- Share files securely with automatic watermarking and logging.

**For Verso Operations**
- Keep all investor communications discoverable in one place for compliance reviews.
- Link discussions to the associated deal or workflow run, making follow-up easier.
- Reduce risk of missed requests by replacing ad-hoc emails with auditable threads.

### How It Connects to Other Modules
- Deal-scoped conversations automatically show up for members invited through `deal_memberships`.
- Document attachments come from or create entries in the Documents module.
- Activity feed items (e.g., "Document uploaded") can be discussed in the related thread.
- Tasks and report requests push status updates into the relevant chat when completed.

### Who Uses It?
- Investors and their authorized delegates (advisors, family office staff).
- Verso relationship managers, operations, compliance, and leadership.
- External collaborators invited to a specific deal (lawyers, introducers) with limited chat access.

### Core Use Cases
1. **Deal Coordination** - Staff posts allocation updates in the dedicated deal room, tagging investors to confirm.
2. **Document Follow-Up** - An investor receives a notification about a new capital call notice and asks clarifying questions in chat; the staff member responds and links the notice.
3. **Onboarding Support** - Compliance guides a new investor through outstanding KYC tasks via a direct message thread.
4. **Advisor Collaboration** - An investor invites their lawyer to a deal conversation so the lawyer can review terms without gaining access to unrelated data.
5. **Issue Escalation** - Operations escalates a payment discrepancy to finance inside an internal conversation, referencing the relevant invoice ID.

---

## Part 2: Experience Walkthrough

- **Inbox & Filters**: List of conversations sorted by latest activity, with filters for All, Deal Rooms, Direct Messages, and Unread. Badges show unread counts pulled from realtime updates.
- **Conversation Header**: Displays subject, participants, deal association (if any), and quick actions (add participant, view deal, export transcript).
- **Message Timeline**: Chronological feed with sender avatar, timestamp, read receipts, inline previews for documents, and status banners (e.g., system messages for workflow updates).
- **Composer**: Rich text box supporting mentions, attachments, and quick templates ("Request capital call confirmation"). Attachments invoke the secure upload flow and watermarking pipeline.
- **Typing & Presence**: Supabase realtime indicates who is currently typing or viewing the thread, improving responsiveness.
- **Staff Controls**: Staff can pin important messages, mark a thread for follow-up, or escalate to a formal request ticket.
- **Mobile View**: Responsive layout collapses the conversation list into a drawer while keeping the active thread accessible.

---

## Part 3: Data Model & Integrations

- **`conversations`**: Stores thread metadata (`subject`, `type`, `deal_id`, creator). `deal_id` links chat rooms to specific deals so membership follows deal access.
- **`conversation_participants`**: Manages which users can view/post in each conversation. Populated automatically for deal members and manually for direct messages.
- **`messages`**: Individual posts with sender, body, optional `file_key`, and timestamps. Attachments point to secure storage via the Documents service.
- **`documents`**: When files are shared, entries are created or linked here to enforce watermarking, expiry, and audit logging.
- **`audit_log`**: Captures actions (message posted, participant added) with hash chaining to satisfy compliance.
- **`activity_feed`** (derived): Important chat events can surface as portfolio notifications.
- **Realtime Channels**: Supabase channels broadcast inserts/updates for conversations and messages (`messages_changes`), enabling instant UI updates.
- **RLS Policies**: Users must be listed in `conversation_participants` or be deal members/staff to read/write, ensuring investors see only their own threads.

---

## Part 4: Functional Requirements

- **Access Control**: Enforce RLS policies so only participants (or staff) can read or write messages; staff have full visibility.
- **Conversation Creation**: Investors can start direct messages with assigned relationship managers; staff can create group or deal conversations.
- **Participant Management**: Adding a participant requires confirmation and triggers notification; removing is limited to staff or conversation owner.
- **Messaging**: Support plain text, basic formatting, file attachments up to policy limits, and system-generated messages (e.g., "Allocation approved").
- **Read Tracking**: Show read receipts for the latest message per user; mark thread as read when the timeline is viewed.
- **Notifications**: Push unread counts to sidebar badges and optionally send email digests for missed messages.
- **Attachment Handling**: Uploads run through virus scan, watermarking, and audit logging; downloads use short-lived pre-signed URLs.
- **Search & Filtering**: Provide keyword search across subjects and bodies (phase 2 can move to full-text).
- **Export**: Staff can export conversation transcript for compliance, generating a PDF stored in Documents with audit trail.
- **Retention**: Follow retention schedules; allow legal hold to lock messages from deletion.

---

## Part 5: States & Edge Cases

- **Deal Access Revoked**: When a user loses deal membership, they immediately lose conversation access and receive notification.
- **New Participant Backfill**: Optional ability to hide history for new external participants (configurable per conversation).
- **Attachment Failure**: If upload fails, show error and allow retry without losing composed text.
- **Offline Mode**: Queue outbound messages locally and retry when connection restores; prevent duplicates via idempotency keys.
- **Message Deletion**: Staff can redact a message (for regulatory reasons) while leaving an audit stub indicating removal.
- **Sensitive Data Guardrails**: Optional detection flags if users paste bank account numbers, prompting confirmation.

---

## Part 6: Success Metrics

- Percentage of investor inquiries handled via Messages vs. external email.
- Average response time per conversation (investor-facing SLA).
- Read rate of high-priority messages within 24 hours.
- Number of deal conversations active per live deal.
- Compliance audit findings related to communication record-keeping (target: zero).

---

## Part 7: Open Questions & Follow-Ups

1. Do we support message reactions or is that deferred to reduce scope?
2. Should investors be able to invite third parties directly, or must staff approve every external participant?
3. What is the retention policy for internal-only conversations vs. investor-facing ones?
4. Do we need profanity or sensitive-content filters enabled from day one?
5. Should transcripts automatically attach to closing checklists when a deal completes?

---

## Glossary

- **Conversation**: A chat thread containing multiple participants and messages.
- **Deal Room**: Conversation scoped to a specific deal where memberships follow `deal_memberships` permissions.
- **Read Receipt**: Indicator that another participant has viewed a specific message.
- **Attachment**: File shared inside a conversation, stored via the Documents module.
- **Transcript Export**: Archived copy of a conversation for compliance or audit.

---

---

## Part 8: Technical Implementation

### 8.1 Architecture

**Page Route**: `/versoholdings/messages/page.tsx`
**Type**: Server Component + Client Components for realtime messaging
**Authentication**: Required via `AppLayout`

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout
       └─ MessagingClient (Client Component)
            ├─ ConversationList (sidebar)
            │    ├─ Search & Filters
            │    └─ ConversationItem(s)
            ├─ ActiveConversation
            │    ├─ Header (participants, deal link)
            │    ├─ MessageTimeline
            │    │    └─ MessageBubble(s)
            │    ├─ TypingIndicator
            │    └─ Composer (with attachments)
            └─ NewConversationModal
```

### 8.2 Data Model

```sql
-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  subject text,
  type text check (type in ('dm', 'group', 'deal_room')) default 'dm',
  name text,
  deal_id uuid references deals(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  last_message_at timestamptz default now()
);

-- Participants
create table conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  last_read_at timestamptz default now(),
  is_muted boolean default false,
  primary key (conversation_id, user_id)
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text,
  file_key text,
  message_type text check (message_type in ('text', 'system', 'file')) default 'text',
  created_at timestamptz default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

-- Read receipts
create table message_reads (
  message_id uuid references messages(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (message_id, user_id)
);

-- Indexes
create index idx_conversations_last_message on conversations(last_message_at desc);
create index idx_conversations_deal on conversations(deal_id) where deal_id is not null;
create index idx_messages_conversation_created on messages(conversation_id, created_at desc);
create index idx_conversation_participants_user on conversation_participants(user_id, last_read_at);
```

### 8.3 RLS Policies

```sql
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;

-- Conversations: see only if participant or deal member
create policy conversations_read on conversations for select
using (
  exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
  or (
    deal_id is not null
    and exists (
      select 1 from deal_memberships dm
      where dm.deal_id = conversations.deal_id
        and dm.user_id = auth.uid()
    )
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);

-- Participants: see only if in conversation
create policy conversation_participants_read on conversation_participants for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);

-- Messages: see only if participant
create policy messages_read on messages for select
using (
  exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);

-- Insert messages only if participant
create policy messages_insert on messages for insert
with check (
  exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
  and sender_id = auth.uid()
);
```

### 8.4 Server-Side Data Fetching

```typescript
// page.tsx
export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get conversations where user is participant
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants!inner(user_id, last_read_at, joined_at),
      messages(id, body, created_at, sender_id)
    `)
    .eq('conversation_participants.user_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(50)

  // Calculate unread counts
  const conversationsWithUnread = conversations?.map(conv => {
    const participant = conv.conversation_participants.find(p => p.user_id === user.id)
    const unreadMessages = conv.messages?.filter(m =>
      m.created_at > participant?.last_read_at && m.sender_id !== user.id
    ).length || 0

    return {
      ...conv,
      unreadCount: unreadMessages
    }
  })

  return (
    <AppLayout brand="versoholdings">
      <MessagingClient
        initialConversations={conversationsWithUnread || []}
        currentUserId={user.id}
      />
    </AppLayout>
  )
}
```

### 8.5 Realtime Features

```typescript
'use client'

export function MessagingClient({ initialConversations, currentUserId }) {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new messages
    const messageChannel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new

        // Update conversation last_message_at
        setConversations(prev => prev.map(conv =>
          conv.id === newMessage.conversation_id
            ? { ...conv, last_message_at: newMessage.created_at, messages: [...conv.messages, newMessage] }
            : conv
        ))

        // Show notification if not active conversation
        if (newMessage.conversation_id !== activeConversationId && newMessage.sender_id !== currentUserId) {
          toast.info('New message received')
        }
      })
      .subscribe()

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${activeConversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState()
        setTypingUsers(Object.keys(state).filter(id => id !== currentUserId))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(typingChannel)
    }
  }, [activeConversationId, currentUserId])

  // Send message
  const sendMessage = async (body: string, fileKey?: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversationId,
        sender_id: currentUserId,
        body,
        file_key: fileKey,
        message_type: fileKey ? 'file' : 'text'
      })

    if (!error) {
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeConversationId)

      // Mark as read
      markAsRead(activeConversationId)
    }
  }

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
  }

  // Typing indicator
  const broadcastTyping = () => {
    const channel = supabase.channel(`typing:${activeConversationId}`)
    channel.track({ user_id: currentUserId, typing: true })
  }

  // ... render components
}
```

### 8.6 API Routes

**Create Conversation:**
```
POST /api/conversations
Body: { type, subject, participant_ids, deal_id? }
Response: { conversation_id }
```

**Send Message:**
```
POST /api/conversations/[id]/messages
Body: { body, file_key? }
Response: { message_id }
```

**Add Participant:**
```
POST /api/conversations/[id]/participants
Body: { user_id }
Response: { success }
```

**Export Transcript (staff):**
```
POST /api/conversations/[id]/export
Response: { document_id }
```

### 8.7 Attachment Handling

```typescript
async function uploadAttachment(file: File, conversationId: string) {
  // 1. Upload to Supabase Storage
  const fileKey = `conversations/${conversationId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileKey, file)

  if (uploadError) throw uploadError

  // 2. Create document record (watermarking happens server-side)
  const { data: document } = await supabase
    .from('documents')
    .insert({
      file_key: fileKey,
      type: 'message_attachment',
      created_by: user.id
    })
    .select()
    .single()

  // 3. Send message with file_key
  await sendMessage(`Shared ${file.name}`, fileKey)

  return document
}
```

### 8.8 Performance Optimizations

- **Pagination**: Load messages in batches of 50 with infinite scroll
- **Virtual Scrolling**: Use `react-window` for long conversation lists
- **Optimistic UI**: Show sent messages immediately, mark as "sending"
- **Message Grouping**: Group consecutive messages from same sender
- **Presence Batching**: Debounce typing indicators to reduce realtime traffic

### 8.9 Unread Count Badge

```sql
-- Function to get total unread count
create or replace function get_unread_message_count(p_user_id uuid)
returns bigint
language plpgsql
as $$
declare
  unread_count bigint;
begin
  select count(*)
  into unread_count
  from messages m
  join conversation_participants cp on cp.conversation_id = m.conversation_id
  where cp.user_id = p_user_id
    and m.created_at > cp.last_read_at
    and m.sender_id != p_user_id;

  return unread_count;
end;
$$;
```

---

**Document Version History**
- v2.0 (October 2, 2025): Added comprehensive technical implementation section
- v1.0 (September 2025): Initial Messages PRD aligned to Verso portal v2 messaging architecture

