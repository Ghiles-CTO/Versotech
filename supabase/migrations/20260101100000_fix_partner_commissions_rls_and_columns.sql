-- Migration: Fix partner_commissions RLS and add missing columns
-- Problem: Partners cannot view their own commissions due to missing RLS policy
-- Also: Missing rejection columns that my-commissions page expects

-- PART 1: Add missing rejection columns to partner_commissions
ALTER TABLE public.partner_commissions
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

COMMENT ON COLUMN partner_commissions.rejection_reason IS 'Reason for invoice rejection by arranger/staff';
COMMENT ON COLUMN partner_commissions.rejected_by IS 'User who rejected the invoice';
COMMENT ON COLUMN partner_commissions.rejected_at IS 'When the invoice was rejected';

-- Add 'rejected' to the status check constraint
ALTER TABLE public.partner_commissions DROP CONSTRAINT IF EXISTS partner_commissions_status_check;
ALTER TABLE public.partner_commissions
ADD CONSTRAINT partner_commissions_status_check
CHECK (status IN ('accrued', 'invoice_requested', 'invoiced', 'paid', 'cancelled', 'rejected'));

-- PART 2: Add RLS policy for Partners to view their own commissions
-- Critical: Without this, Partners get "failed to load commissions" error

CREATE POLICY "partners_view_own_commissions" ON partner_commissions
FOR SELECT USING (
    -- Partner can view commissions for their own entity
    partner_id IN (
        SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
    )
);

-- Also allow partners to update their own commissions (for invoice submission)
CREATE POLICY "partners_update_own_commissions" ON partner_commissions
FOR UPDATE USING (
    partner_id IN (
        SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    partner_id IN (
        SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
    )
);

-- PART 3: Create notification trigger for partner commission status changes
-- PRD Rows 80-86, 91-94: Partner should receive notifications

CREATE OR REPLACE FUNCTION notify_partner_commission_status()
RETURNS TRIGGER AS $$
DECLARE
    partner_user_id uuid;
    deal_name text;
    notification_title text;
    notification_message text;
BEGIN
    -- Only notify on status changes
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get deal name for context
    SELECT name INTO deal_name FROM deals WHERE id = NEW.deal_id;

    -- Get the partner user(s) to notify
    FOR partner_user_id IN
        SELECT user_id FROM partner_users WHERE partner_id = NEW.partner_id
    LOOP
        -- Determine notification type based on status
        CASE NEW.status
            WHEN 'accrued' THEN
                notification_title := 'Commission Accrued';
                notification_message := format('A commission of %s %s has been accrued for %s',
                    NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
            WHEN 'invoice_requested' THEN
                notification_title := 'Invoice Request Submitted';
                notification_message := format('Your invoice request for %s %s has been submitted for %s',
                    NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
            WHEN 'invoiced' THEN
                notification_title := 'Invoice Approved';
                notification_message := format('Your invoice for %s %s has been approved for %s',
                    NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
            WHEN 'paid' THEN
                notification_title := 'Payment Completed';
                notification_message := format('Payment of %s %s has been completed for %s',
                    NEW.currency, NEW.accrual_amount, COALESCE(deal_name, 'a deal'));
            WHEN 'rejected' THEN
                notification_title := 'Invoice Rejected';
                notification_message := format('Your invoice for %s %s was rejected. Reason: %s',
                    NEW.currency, NEW.accrual_amount, COALESCE(NEW.rejection_reason, 'See details'));
            ELSE
                -- No notification for other status changes
                RETURN NEW;
        END CASE;

        -- Insert notification
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            read
        ) VALUES (
            partner_user_id,
            'partner_commission_' || NEW.status,
            notification_title,
            notification_message,
            jsonb_build_object(
                'commission_id', NEW.id,
                'deal_id', NEW.deal_id,
                'amount', NEW.accrual_amount,
                'currency', NEW.currency,
                'status', NEW.status
            ),
            false
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for commission status changes
DROP TRIGGER IF EXISTS partner_commission_status_notify ON partner_commissions;
CREATE TRIGGER partner_commission_status_notify
    AFTER INSERT OR UPDATE OF status ON partner_commissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_partner_commission_status();

COMMENT ON FUNCTION notify_partner_commission_status() IS 'PRD Rows 80-86, 91-94: Notify partner on commission status changes';
