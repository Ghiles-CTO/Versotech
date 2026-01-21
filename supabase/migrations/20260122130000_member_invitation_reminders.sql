-- Migration: Member invitation reminder tracking
-- Purpose: track invite send/reminder metadata for automated follow-ups

ALTER TABLE public.member_invitations
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_reminded_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.member_invitations.sent_at IS
  'When the invitation email was first sent (after approval).';
COMMENT ON COLUMN public.member_invitations.last_reminded_at IS
  'Last time a reminder email was sent for this invitation.';
COMMENT ON COLUMN public.member_invitations.reminder_count IS
  'Number of reminder emails sent for this invitation.';

CREATE INDEX IF NOT EXISTS idx_member_invitations_reminders
  ON public.member_invitations(status, expires_at, last_reminded_at);
