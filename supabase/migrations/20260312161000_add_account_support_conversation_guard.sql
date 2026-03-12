create unique index if not exists conversations_account_support_active_unique_idx
on public.conversations (
  ((metadata->>'entity_type')),
  ((metadata->>'entity_id'))
)
where archived_at is null
  and (metadata->>'support_thread_type') = 'account_support';
