-- Allow system/AI messages without sender_id by skipping auto-read receipt insertion.
CREATE OR REPLACE FUNCTION public.ensure_message_read_receipt()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.sender_id IS NOT NULL THEN
    INSERT INTO message_reads (message_id, user_id, read_at)
    VALUES (NEW.id, NEW.sender_id, NEW.created_at)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;
