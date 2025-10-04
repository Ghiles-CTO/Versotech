# Apply Messaging Migration to Supabase

## Quick Setup Steps

### 1. Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: **rtuwlssfrbumznfhdlsx**
3. Go to **SQL Editor** in the left sidebar

### 2. Copy the Migration SQL
Open this file on your computer:
```
database/migrations/011_create_messaging_schema.sql
```

Copy ALL the contents (it's about 11KB / ~515 lines)

### 3. Run the Migration
1. In Supabase SQL Editor, click "New Query"
2. Paste the entire migration SQL
3. Click "Run" or press `Ctrl+Enter`

### 4. Verify Tables Were Created
Run this query to verify:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('conversations', 'conversation_participants', 'messages', 'message_reads')
ORDER BY table_name;
```

You should see all 4 tables listed.

### 5. Test the Messaging System
1. Go to your investor portal: `/versoholdings/messages`
2. You should see a WhatsApp-style chat interface
3. The system will automatically create a conversation with Julien Machot (or first admin staff)
4. Send a test message to verify it works

## What This Migration Creates

✅ **Tables:**
- `conversations` - Chat threads
- `conversation_participants` - Who's in each conversation
- `messages` - Individual messages
- `message_reads` - Read receipts

✅ **RLS Policies:**
- Users can only see conversations they're part of
- Staff can see all conversations
- Messages are protected by conversation access

✅ **Functions:**
- `get_unread_message_count()` - Count unread messages
- `mark_conversation_read()` - Mark conversation as read
- Auto-update `last_message_at` on new messages

✅ **Indexes:**
- Optimized for fast message loading
- Efficient conversation filtering
- Quick unread count queries

## Troubleshooting

### Error: "relation already exists"
If tables already exist, you can either:
1. Skip this migration (tables are already there)
2. Drop and recreate:
```sql
DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
```
Then run the migration again.

### Error: "permission denied"
Make sure you're using the Supabase SQL Editor, which has admin permissions.

### No staff member found
If you get "No staff member available", you need to create a staff user:
```sql
-- Create a staff profile
INSERT INTO profiles (id, email, display_name, role)
VALUES (
  'YOUR_USER_ID',
  'julien@versotech.com',
  'Julien Machot',
  'staff_admin'
);
```

## Next Steps

After migration is applied:
1. ✅ Test sending messages
2. ✅ Test deleting messages (your own only)
3. ✅ Test editing messages
4. ✅ Check realtime updates (open in 2 browser tabs)
5. ✅ Verify read receipts work

The messaging system is now fully functional! 🚀
