-- Migration: Commission invoice approvals + core fixes
-- Purpose:
-- 1) Add co-referrer tracking to deal_memberships for partner+introducer shares
-- 2) Add invoice_submitted status + rejection fields where missing
-- 3) Fix partner/introducer/CP commission notification triggers

-- ============================================================================
-- 1) Co-referrer tracking on deal_memberships
-- ============================================================================
ALTER TABLE deal_memberships
  ADD COLUMN IF NOT EXISTS co_referrer_entity_id uuid,
  ADD COLUMN IF NOT EXISTS co_referrer_entity_type text;

COMMENT ON COLUMN deal_memberships.co_referrer_entity_id IS
  'Optional co-referrer entity ID (introducer/partner/commercial_partner) for shared referrals.';
COMMENT ON COLUMN deal_memberships.co_referrer_entity_type IS
  'Co-referrer entity type: partner, introducer, commercial_partner.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_deal_memberships_co_referrer_type'
  ) THEN
    ALTER TABLE deal_memberships
      ADD CONSTRAINT chk_deal_memberships_co_referrer_type
      CHECK (
        co_referrer_entity_type IS NULL
        OR co_referrer_entity_type IN ('partner', 'introducer', 'commercial_partner')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_deal_memberships_co_referrer
  ON deal_memberships(co_referrer_entity_id, co_referrer_entity_type)
  WHERE co_referrer_entity_id IS NOT NULL;

-- ============================================================================
-- 2) Commission status + rejection fields
-- ============================================================================
-- Introducer commissions: add invoice_submitted to status check
ALTER TABLE public.introducer_commissions DROP CONSTRAINT IF EXISTS introducer_commissions_status_check;
ALTER TABLE public.introducer_commissions
  ADD CONSTRAINT introducer_commissions_status_check
  CHECK (status IN (
    'accrued',
    'invoice_requested',
    'invoice_submitted',
    'invoiced',
    'paid',
    'cancelled',
    'rejected'
  ));

-- Partner commissions: add invoice_submitted to status check
ALTER TABLE public.partner_commissions DROP CONSTRAINT IF EXISTS partner_commissions_status_check;
ALTER TABLE public.partner_commissions
  ADD CONSTRAINT partner_commissions_status_check
  CHECK (status IN (
    'accrued',
    'invoice_requested',
    'invoice_submitted',
    'invoiced',
    'paid',
    'cancelled',
    'rejected'
  ));

-- Commercial partner commissions: add rejection fields + invoice_submitted + rejected status
ALTER TABLE public.commercial_partner_commissions
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

COMMENT ON COLUMN commercial_partner_commissions.rejection_reason IS 'Reason for invoice rejection by staff/CEO.';
COMMENT ON COLUMN commercial_partner_commissions.rejected_by IS 'User who rejected the invoice.';
COMMENT ON COLUMN commercial_partner_commissions.rejected_at IS 'When the invoice was rejected.';

ALTER TABLE public.commercial_partner_commissions DROP CONSTRAINT IF EXISTS cp_commissions_status_check;
ALTER TABLE public.commercial_partner_commissions
  ADD CONSTRAINT cp_commissions_status_check
  CHECK (status IN (
    'accrued',
    'invoice_requested',
    'invoice_submitted',
    'invoiced',
    'paid',
    'cancelled',
    'rejected'
  ));

-- ============================================================================
-- 3) Commission notification triggers
-- ============================================================================
-- Fix partner commission notifications (write to investor_notifications)
CREATE OR REPLACE FUNCTION notify_partner_commission_status()
RETURNS TRIGGER AS $$
DECLARE
    partner_user_id uuid;
    deal_name text;
    notification_title text;
    notification_message text;
    notification_type text;
BEGIN
    -- Only notify on status changes
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get deal name for context
    SELECT name INTO deal_name FROM deals WHERE id = NEW.deal_id;

    -- Determine notification type based on status
    CASE NEW.status
        WHEN 'accrued' THEN
            notification_type := 'partner_commission_accrued';
            notification_title := 'Commission Accrued';
            notification_message := format('A commission of %s %s has been accrued for %s',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'invoice_requested' THEN
            notification_type := 'partner_invoice_requested';
            notification_title := 'Invoice Requested';
            notification_message := format('An invoice has been requested for %s %s (%s).',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'invoice_submitted' THEN
            notification_type := 'partner_invoice_submitted';
            notification_title := 'Invoice Submitted';
            notification_message := format('Your invoice for %s %s has been submitted for approval.',
                NEW.currency, NEW.accrual_amount);
        WHEN 'invoiced' THEN
            notification_type := 'partner_invoiced';
            notification_title := 'Invoice Approved';
            notification_message := format('Your invoice for %s %s has been approved for %s',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'paid' THEN
            notification_type := 'partner_paid';
            notification_title := 'Payment Completed';
            notification_message := format('Payment of %s %s has been completed for %s',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'rejected' THEN
            notification_type := 'partner_rejected';
            notification_title := 'Invoice Rejected';
            notification_message := format('Your invoice for %s %s was rejected. Reason: %s',
                NEW.currency, NEW.accrual_amount, COALESCE(NEW.rejection_reason, 'See details'));
        ELSE
            RETURN NEW;
    END CASE;

    -- Notify all partner users
    FOR partner_user_id IN
        SELECT user_id FROM partner_users WHERE partner_id = NEW.partner_id
    LOOP
        INSERT INTO investor_notifications (
            user_id,
            title,
            message,
            type,
            link,
            deal_id,
            data
        ) VALUES (
            partner_user_id,
            notification_title,
            notification_message,
            notification_type,
            '/versotech_main/my-commissions',
            NEW.deal_id,
            jsonb_build_object(
                'commission_id', NEW.id,
                'deal_id', NEW.deal_id,
                'amount', NEW.accrual_amount,
                'currency', NEW.currency,
                'status', NEW.status
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep trigger name consistent
DROP TRIGGER IF EXISTS partner_commission_status_notify ON partner_commissions;
CREATE TRIGGER partner_commission_status_notify
    AFTER INSERT OR UPDATE OF status ON partner_commissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_partner_commission_status();

COMMENT ON FUNCTION notify_partner_commission_status() IS 'Notify partner users on commission status changes (investor_notifications).';

-- Update introducer commission notifications to include invoice_submitted
CREATE OR REPLACE FUNCTION notify_introducer_commission_status()
RETURNS TRIGGER AS $$
DECLARE
    intro_user_id uuid;
    deal_name text;
    notification_title text;
    notification_message text;
    notification_type text;
BEGIN
    -- Only notify on status changes
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get deal name for context
    SELECT name INTO deal_name FROM deals WHERE id = NEW.deal_id;

    -- Determine notification based on status
    CASE NEW.status
        WHEN 'accrued' THEN
            notification_type := 'introducer_commission_accrued';
            notification_title := 'Commission Accrued';
            notification_message := format('A commission of %s %s has been accrued for %s',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'invoice_requested' THEN
            notification_type := 'introducer_invoice_requested';
            notification_title := 'Invoice Requested';
            notification_message := format('An invoice has been requested for %s %s (%s).',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'invoice_submitted' THEN
            notification_type := 'introducer_invoice_sent';
            notification_title := 'Invoice Submitted';
            notification_message := format('Your invoice for %s %s has been submitted for approval.',
                NEW.currency, NEW.accrual_amount);
        WHEN 'invoiced' THEN
            notification_type := 'introducer_invoice_approved';
            notification_title := 'Invoice Approved';
            notification_message := format('Your invoice for %s %s has been approved and is awaiting payment.',
                NEW.currency, NEW.accrual_amount);
        WHEN 'paid' THEN
            notification_type := 'introducer_payment_confirmed';
            notification_title := 'Payment Completed';
            notification_message := format('Payment of %s %s has been completed for %s.',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'your commission'));
        WHEN 'rejected' THEN
            notification_type := 'introducer_invoice_rejected';
            notification_title := 'Invoice Requires Changes';
            notification_message := format('Your invoice for %s %s requires changes. Reason: %s',
                NEW.currency, NEW.accrual_amount, COALESCE(NEW.rejection_reason, 'See details'));
        ELSE
            RETURN NEW;
    END CASE;

    -- Get all users for this introducer and notify each
    FOR intro_user_id IN
        SELECT user_id FROM introducer_users WHERE introducer_id = NEW.introducer_id
    LOOP
        INSERT INTO investor_notifications (
            user_id,
            title,
            message,
            type,
            link,
            deal_id,
            data
        ) VALUES (
            intro_user_id,
            notification_title,
            notification_message,
            notification_type,
            '/versotech_main/my-commissions',
            NEW.deal_id,
            jsonb_build_object(
                'commission_id', NEW.id,
                'deal_id', NEW.deal_id,
                'amount', NEW.accrual_amount,
                'currency', NEW.currency,
                'status', NEW.status
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS introducer_commission_notify ON introducer_commissions;
CREATE TRIGGER introducer_commission_notify
    AFTER INSERT OR UPDATE OF status ON introducer_commissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_introducer_commission_status();

COMMENT ON FUNCTION notify_introducer_commission_status() IS 'Notify introducer users on commission status changes (invoice_submitted supported).';

-- New: Commercial partner commission notifications
CREATE OR REPLACE FUNCTION notify_commercial_partner_commission_status()
RETURNS TRIGGER AS $$
DECLARE
    cp_user_id uuid;
    deal_name text;
    notification_title text;
    notification_message text;
    notification_type text;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    SELECT name INTO deal_name FROM deals WHERE id = NEW.deal_id;

    CASE NEW.status
        WHEN 'accrued' THEN
            notification_type := 'cp_commission_accrued';
            notification_title := 'Commission Accrued';
            notification_message := format('A commission of %s %s has been accrued for %s',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'invoice_requested' THEN
            notification_type := 'cp_invoice_requested';
            notification_title := 'Invoice Requested';
            notification_message := format('An invoice has been requested for %s %s (%s).',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
        WHEN 'invoice_submitted' THEN
            notification_type := 'cp_invoice_submitted';
            notification_title := 'Invoice Submitted';
            notification_message := format('Your invoice for %s %s has been submitted for approval.',
                NEW.currency, NEW.accrual_amount);
        WHEN 'invoiced' THEN
            notification_type := 'cp_invoice_approved';
            notification_title := 'Invoice Approved';
            notification_message := format('Your invoice for %s %s has been approved and is awaiting payment.',
                NEW.currency, NEW.accrual_amount);
        WHEN 'paid' THEN
            notification_type := 'cp_payment_confirmed';
            notification_title := 'Payment Completed';
            notification_message := format('Payment of %s %s has been completed for %s.',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'your commission'));
        WHEN 'rejected' THEN
            notification_type := 'cp_invoice_rejected';
            notification_title := 'Invoice Requires Changes';
            notification_message := format('Your invoice for %s %s requires changes. Reason: %s',
                NEW.currency, NEW.accrual_amount, COALESCE(NEW.rejection_reason, 'See details'));
        ELSE
            RETURN NEW;
    END CASE;

    FOR cp_user_id IN
        SELECT user_id FROM commercial_partner_users WHERE commercial_partner_id = NEW.commercial_partner_id
    LOOP
        INSERT INTO investor_notifications (
            user_id,
            title,
            message,
            type,
            link,
            deal_id,
            data
        ) VALUES (
            cp_user_id,
            notification_title,
            notification_message,
            notification_type,
            '/versotech_main/my-commissions',
            NEW.deal_id,
            jsonb_build_object(
                'commission_id', NEW.id,
                'deal_id', NEW.deal_id,
                'amount', NEW.accrual_amount,
                'currency', NEW.currency,
                'status', NEW.status
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS commercial_partner_commission_notify ON commercial_partner_commissions;
CREATE TRIGGER commercial_partner_commission_notify
    AFTER INSERT OR UPDATE OF status ON commercial_partner_commissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_commercial_partner_commission_status();

COMMENT ON FUNCTION notify_commercial_partner_commission_status() IS 'Notify commercial partner users on commission status changes.';
