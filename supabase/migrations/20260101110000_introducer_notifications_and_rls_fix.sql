-- Migration: Complete Introducer Notifications + RLS Fix
-- Purpose: Implement ALL 10 notification stories for Introducer persona (Rows 86, 88, 91-96, 103, 105)
-- Also: Fix RLS policy so Introducers can view their own commissions

-- ============================================================================
-- PART 1: FIX INTRODUCER COMMISSIONS RLS (Same bug as Partner!)
-- ============================================================================

-- Add missing columns to introducer_commissions (matching partner_commissions pattern)
ALTER TABLE public.introducer_commissions
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

-- Add 'rejected' to status check if constraint exists
ALTER TABLE public.introducer_commissions DROP CONSTRAINT IF EXISTS introducer_commissions_status_check;
ALTER TABLE public.introducer_commissions
ADD CONSTRAINT introducer_commissions_status_check
CHECK (status IN ('accrued', 'invoice_requested', 'invoiced', 'paid', 'cancelled', 'rejected'));

-- RLS: Allow Introducers to view their OWN commissions
DROP POLICY IF EXISTS "Introducers can view own commissions" ON introducer_commissions;
CREATE POLICY "Introducers can view own commissions" ON introducer_commissions
FOR SELECT USING (
    introducer_id IN (
        SELECT introducer_id FROM introducer_users WHERE user_id = auth.uid()
    )
);

-- RLS: Allow Introducers to update their own commissions (for invoice submission)
DROP POLICY IF EXISTS "Introducers can update own commissions" ON introducer_commissions;
CREATE POLICY "Introducers can update own commissions" ON introducer_commissions
FOR UPDATE USING (
    introducer_id IN (
        SELECT introducer_id FROM introducer_users WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    introducer_id IN (
        SELECT introducer_id FROM introducer_users WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PART 2: ADD TYPE COLUMN TO investor_notifications IF NOT EXISTS
-- ============================================================================

-- Add type column if missing (for notification categorization)
ALTER TABLE public.investor_notifications
ADD COLUMN IF NOT EXISTS type text;

-- Add columns for enhanced filtering (matching PRD requirements)
ALTER TABLE public.investor_notifications
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES public.deals(id),
ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;

-- Index for type-based queries
CREATE INDEX IF NOT EXISTS idx_investor_notifications_type ON investor_notifications(type);
CREATE INDEX IF NOT EXISTS idx_investor_notifications_user_type ON investor_notifications(user_id, type);

-- ============================================================================
-- PART 3: NOTIFICATION TRIGGER FOR INTRODUCER AGREEMENTS
-- PRD Rows 86, 88: Agreement signed/rejected notifications
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_introducer_agreement_status()
RETURNS TRIGGER AS $$
DECLARE
    intro_user_id uuid;
    intro_name text;
    notification_title text;
    notification_message text;
    notification_type text;
BEGIN
    -- Only notify on status changes
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get introducer name for context
    SELECT legal_name INTO intro_name FROM introducers WHERE id = NEW.introducer_id;

    -- Determine notification based on status
    IF NEW.status = 'active' OR NEW.status = 'signed' THEN
        -- Row 86: Agreement signed notification
        notification_type := 'introducer_agreement_signed';
        notification_title := 'Agreement Signed';
        notification_message := format('Your introducer agreement with %s bps commission has been fully signed and is now active.',
            COALESCE(NEW.commission_bps::text, 'N/A'));
    ELSIF NEW.status = 'rejected' THEN
        -- Row 88: Agreement rejected notification
        notification_type := 'introducer_agreement_rejected';
        notification_title := 'Agreement Rejected';
        notification_message := 'Your introducer agreement has been rejected. Please contact support for more information.';
    ELSIF NEW.status = 'pending_introducer_signature' THEN
        notification_type := 'introducer_agreement_pending';
        notification_title := 'Agreement Ready for Signature';
        notification_message := 'Your introducer agreement is ready for your signature. Please review and sign to activate.';
    ELSE
        -- No notification for other status changes
        RETURN NEW;
    END IF;

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
            data
        ) VALUES (
            intro_user_id,
            notification_title,
            notification_message,
            notification_type,
            '/versotech_main/introducer-agreements',
            jsonb_build_object(
                'agreement_id', NEW.id,
                'introducer_id', NEW.introducer_id,
                'status', NEW.status,
                'commission_bps', NEW.commission_bps
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for introducer_agreements
DROP TRIGGER IF EXISTS introducer_agreement_notify ON introducer_agreements;
CREATE TRIGGER introducer_agreement_notify
    AFTER INSERT OR UPDATE OF status ON introducer_agreements
    FOR EACH ROW
    EXECUTE FUNCTION notify_introducer_agreement_status();

COMMENT ON FUNCTION notify_introducer_agreement_status() IS 'PRD Rows 86, 88: Notify introducer on agreement status changes';

-- ============================================================================
-- PART 4: NOTIFICATION TRIGGER FOR INTRODUCER COMMISSION STATUS
-- PRD Rows 95, 96, 103, 105: Invoice and payment notifications
-- ============================================================================

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
            -- Row 95: Invoice sent notification
            notification_type := 'introducer_invoice_sent';
            notification_title := 'Invoice Request Submitted';
            notification_message := format('Your invoice request for %s %s has been submitted for approval.',
                NEW.currency, NEW.accrual_amount);
        WHEN 'invoiced' THEN
            -- Row 103: Invoice approved notification
            notification_type := 'introducer_invoice_approved';
            notification_title := 'Invoice Approved';
            notification_message := format('Your invoice for %s %s has been approved and is awaiting payment.',
                NEW.currency, NEW.accrual_amount);
        WHEN 'paid' THEN
            -- Rows 96, 105: Payment sent/confirmed notification
            notification_type := 'introducer_payment_confirmed';
            notification_title := 'Payment Completed';
            notification_message := format('Payment of %s %s has been completed for %s.',
                NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'your commission'));
        WHEN 'rejected' THEN
            -- Row 104: Request for change notification
            notification_type := 'introducer_invoice_rejected';
            notification_title := 'Invoice Requires Changes';
            notification_message := format('Your invoice for %s %s requires changes. Reason: %s',
                NEW.currency, NEW.accrual_amount, COALESCE(NEW.rejection_reason, 'See details'));
        ELSE
            -- No notification for other status changes
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

-- Create trigger for introducer_commissions
DROP TRIGGER IF EXISTS introducer_commission_notify ON introducer_commissions;
CREATE TRIGGER introducer_commission_notify
    AFTER INSERT OR UPDATE OF status ON introducer_commissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_introducer_commission_status();

COMMENT ON FUNCTION notify_introducer_commission_status() IS 'PRD Rows 95, 96, 103, 104, 105: Notify introducer on commission/invoice status changes';

-- ============================================================================
-- PART 5: NOTIFICATION TRIGGER FOR SUBSCRIPTION PACK STATUS
-- PRD Rows 91-94: Pack sent, approved, signed, escrow funded notifications
-- These trigger when investors (referred by introducer) progress through the funnel
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_introducer_subscription_status()
RETURNS TRIGGER AS $$
DECLARE
    intro_user_id uuid;
    introducer_id_var uuid;
    investor_name text;
    deal_name text;
    notification_title text;
    notification_message text;
    notification_type text;
BEGIN
    -- Only notify on status changes
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get the introducer who referred this investor to this deal
    SELECT dm.referred_by_entity_id INTO introducer_id_var
    FROM deal_memberships dm
    WHERE dm.investor_id = NEW.investor_id
      AND dm.deal_id = NEW.deal_id
      AND dm.referred_by_entity_type = 'introducer'
    LIMIT 1;

    -- If no introducer referral found, exit
    IF introducer_id_var IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get investor and deal names for context
    SELECT legal_name INTO investor_name FROM investors WHERE id = NEW.investor_id;
    SELECT name INTO deal_name FROM deals WHERE id = NEW.deal_id;

    -- Determine notification based on status
    CASE NEW.status
        WHEN 'pending' THEN
            -- Row 91: Pack sent notification
            notification_type := 'introducer_pack_sent';
            notification_title := 'Subscription Pack Sent';
            notification_message := format('Subscription pack has been sent to %s for %s.',
                COALESCE(investor_name, 'your referred investor'), COALESCE(deal_name, 'a deal'));
        WHEN 'approved' THEN
            -- Row 92: Pack approved notification
            notification_type := 'introducer_pack_approved';
            notification_title := 'Subscription Pack Approved';
            notification_message := format('%s has approved the subscription pack for %s.',
                COALESCE(investor_name, 'Your referred investor'), COALESCE(deal_name, 'a deal'));
        WHEN 'signed' THEN
            -- Row 93: Pack signed notification
            notification_type := 'introducer_pack_signed';
            notification_title := 'Subscription Pack Signed';
            notification_message := format('%s has signed the subscription pack for %s.',
                COALESCE(investor_name, 'Your referred investor'), COALESCE(deal_name, 'a deal'));
        WHEN 'active' THEN
            -- Row 94: Escrow funded notification (active = funded)
            notification_type := 'introducer_escrow_funded';
            notification_title := 'Escrow Funded';
            notification_message := format('%s has funded the escrow for %s. Amount: %s %s.',
                COALESCE(investor_name, 'Your referred investor'), COALESCE(deal_name, 'a deal'),
                NEW.currency, NEW.commitment);
        ELSE
            -- No notification for other status changes
            RETURN NEW;
    END CASE;

    -- Get all users for this introducer and notify each
    FOR intro_user_id IN
        SELECT user_id FROM introducer_users WHERE introducer_id = introducer_id_var
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
            '/versotech_main/introductions',
            NEW.deal_id,
            jsonb_build_object(
                'subscription_id', NEW.id,
                'investor_id', NEW.investor_id,
                'investor_name', investor_name,
                'deal_id', NEW.deal_id,
                'deal_name', deal_name,
                'status', NEW.status,
                'amount', NEW.commitment,
                'currency', NEW.currency
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscriptions (for referred investors)
DROP TRIGGER IF EXISTS introducer_subscription_notify ON subscriptions;
CREATE TRIGGER introducer_subscription_notify
    AFTER INSERT OR UPDATE OF status ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION notify_introducer_subscription_status();

COMMENT ON FUNCTION notify_introducer_subscription_status() IS 'PRD Rows 91-94: Notify introducer when referred investor progresses through subscription funnel';

-- ============================================================================
-- PART 6: COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TRIGGER introducer_agreement_notify ON introducer_agreements IS
    'PRD Rows 86, 88: Fires on agreement status changes to notify introducer';

COMMENT ON TRIGGER introducer_commission_notify ON introducer_commissions IS
    'PRD Rows 95, 96, 103, 104, 105: Fires on commission status changes for invoice/payment notifications';

COMMENT ON TRIGGER introducer_subscription_notify ON subscriptions IS
    'PRD Rows 91-94: Fires when referred investor subscription status changes';

-- ============================================================================
-- SUMMARY OF TRIGGERS CREATED
-- ============================================================================
-- 1. notify_introducer_agreement_status() - Rows 86, 88 (agreement signed/rejected)
-- 2. notify_introducer_commission_status() - Rows 95, 96, 103, 104, 105 (invoice/payment)
-- 3. notify_introducer_subscription_status() - Rows 91-94 (pack sent/approved/signed/funded)
--
-- All triggers insert into investor_notifications table with appropriate type field
-- RLS fix also applied so Introducers can view their own commissions
-- ============================================================================
