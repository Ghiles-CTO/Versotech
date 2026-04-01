update public.conversations
set subject = regexp_replace(subject, '^Verso Support', 'VERSO Support')
where (metadata->>'support_thread_type') = 'account_support'
  and subject like 'Verso Support%';

update public.messages as m
set metadata = jsonb_set(
  coalesce(m.metadata, '{}'::jsonb),
  '{assistant_name}',
  to_jsonb('VERSO Support'::text),
  true
)
from public.conversations as c
where c.id = m.conversation_id
  and (c.metadata->>'support_thread_type') = 'account_support'
  and coalesce(m.metadata->>'assistant_name', '') = 'Verso Support';
