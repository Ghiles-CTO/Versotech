-- Transfer all records to biz@ghiless.com user before deleting other users
DO $$
DECLARE
  biz_user_id uuid;
BEGIN
  -- Get the biz@ghiless.com user ID
  SELECT id INTO biz_user_id FROM auth.users WHERE email = 'biz@ghiless.com';
  
  IF biz_user_id IS NULL THEN
    RAISE EXCEPTION 'biz@ghiless.com user not found';
  END IF;
  
  -- Transfer all user references to biz@ghiless.com
  -- Request tickets
  UPDATE request_tickets SET assigned_to = biz_user_id WHERE assigned_to != biz_user_id;
  UPDATE request_tickets SET created_by = biz_user_id WHERE created_by != biz_user_id;
  
  -- Tasks
  UPDATE tasks SET owner_user_id = biz_user_id WHERE owner_user_id != biz_user_id AND owner_user_id IS NOT NULL;
  UPDATE tasks SET completed_by = biz_user_id WHERE completed_by != biz_user_id AND completed_by IS NOT NULL;
  
  -- Approvals
  UPDATE approvals SET requested_by = biz_user_id WHERE requested_by != biz_user_id AND requested_by IS NOT NULL;
  UPDATE approvals SET assigned_to = biz_user_id WHERE assigned_to != biz_user_id AND assigned_to IS NOT NULL;
  UPDATE approvals SET approved_by = biz_user_id WHERE approved_by != biz_user_id AND approved_by IS NOT NULL;
  UPDATE approvals SET secondary_approved_by = biz_user_id WHERE secondary_approved_by != biz_user_id AND secondary_approved_by IS NOT NULL;
  
  -- Investors
  UPDATE investors SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  UPDATE investors SET primary_rm = biz_user_id WHERE primary_rm != biz_user_id AND primary_rm IS NOT NULL;
  UPDATE investors SET secondary_rm = biz_user_id WHERE secondary_rm != biz_user_id AND secondary_rm IS NOT NULL;
  UPDATE investors SET kyc_approved_by = biz_user_id WHERE kyc_approved_by != biz_user_id AND kyc_approved_by IS NOT NULL;
  
  -- Allocations
  UPDATE allocations SET approved_by = biz_user_id WHERE approved_by != biz_user_id AND approved_by IS NOT NULL;
  
  -- Reservations
  UPDATE reservations SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Fee plans
  UPDATE fee_plans SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Invoices
  UPDATE invoices SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Introducers
  UPDATE introducers SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  UPDATE introducers SET user_id = biz_user_id WHERE user_id != biz_user_id AND user_id IS NOT NULL;
  
  -- Introducer commissions
  UPDATE introducer_commissions SET approved_by = biz_user_id WHERE approved_by != biz_user_id AND approved_by IS NOT NULL;
  
  -- Introductions
  UPDATE introductions SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Investor terms
  UPDATE investor_terms SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  UPDATE investor_terms SET approved_by = biz_user_id WHERE approved_by != biz_user_id AND approved_by IS NOT NULL;
  
  -- Term sheets
  UPDATE term_sheets SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Doc packages
  UPDATE doc_packages SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Document folders
  UPDATE document_folders SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Document versions
  UPDATE document_versions SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Document approvals
  UPDATE document_approvals SET requested_by = biz_user_id WHERE requested_by != biz_user_id AND requested_by IS NOT NULL;
  UPDATE document_approvals SET reviewed_by = biz_user_id WHERE reviewed_by != biz_user_id AND reviewed_by IS NOT NULL;
  
  -- Document publishing schedule
  UPDATE document_publishing_schedule SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Documents (already done but including for completeness)
  UPDATE documents SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  UPDATE documents SET owner_user_id = biz_user_id WHERE owner_user_id != biz_user_id AND owner_user_id IS NOT NULL;
  
  -- Report requests
  UPDATE report_requests SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Workflow runs
  UPDATE workflow_runs SET triggered_by = biz_user_id WHERE triggered_by != biz_user_id AND triggered_by IS NOT NULL;
  
  -- Deal commitments
  UPDATE deal_commitments SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Deal memberships
  UPDATE deal_memberships SET invited_by = biz_user_id WHERE invited_by != biz_user_id AND invited_by IS NOT NULL;
  
  -- Invite links
  UPDATE invite_links SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Entity events
  UPDATE entity_events SET changed_by = biz_user_id WHERE changed_by != biz_user_id AND changed_by IS NOT NULL;
  
  -- Director registry
  UPDATE director_registry SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Counterparty aliases
  UPDATE counterparty_aliases SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Import batches
  UPDATE import_batches SET imported_by = biz_user_id WHERE imported_by != biz_user_id AND imported_by IS NOT NULL;
  
  -- Reconciliations
  UPDATE reconciliations SET matched_by = biz_user_id WHERE matched_by != biz_user_id AND matched_by IS NOT NULL;
  
  -- Reconciliation matches
  UPDATE reconciliation_matches SET approved_by = biz_user_id WHERE approved_by != biz_user_id AND approved_by IS NOT NULL;
  
  -- Compliance alerts
  UPDATE compliance_alerts SET assigned_to = biz_user_id WHERE assigned_to != biz_user_id AND assigned_to IS NOT NULL;
  UPDATE compliance_alerts SET resolved_by = biz_user_id WHERE resolved_by != biz_user_id AND resolved_by IS NOT NULL;
  
  -- Audit logs
  UPDATE audit_logs SET actor_id = biz_user_id WHERE actor_id != biz_user_id AND actor_id IS NOT NULL;
  UPDATE audit_logs SET compliance_reviewer_id = biz_user_id WHERE compliance_reviewer_id != biz_user_id AND compliance_reviewer_id IS NOT NULL;
  
  -- Audit report templates
  UPDATE audit_report_templates SET created_by = biz_user_id WHERE created_by != biz_user_id AND created_by IS NOT NULL;
  
  -- Approval history
  UPDATE approval_history SET actor_id = biz_user_id WHERE actor_id != biz_user_id AND actor_id IS NOT NULL;
  
  -- Delete junction table records (these can be safely deleted)
  DELETE FROM conversation_participants WHERE user_id != biz_user_id;
  DELETE FROM deal_memberships WHERE user_id != biz_user_id;
  DELETE FROM investor_users WHERE user_id != biz_user_id;
  DELETE FROM message_reads WHERE user_id != biz_user_id;
  DELETE FROM dashboard_preferences WHERE user_id != biz_user_id;
  
  -- Now delete from profiles table
  DELETE FROM profiles WHERE email != 'biz@ghiless.com';
  
  -- Finally, delete from auth.users
  DELETE FROM auth.users WHERE email != 'biz@ghiless.com';
  
  RAISE NOTICE 'Successfully cleaned up all users except biz@ghiless.com';
END $$;;
