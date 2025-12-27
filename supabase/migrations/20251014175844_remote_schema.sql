create extension if not exists "citext" with schema "public" version '1.6';
drop policy "conversation_participants_read" on "public"."conversation_participants";
drop policy "conversation_participants_insert" on "public"."conversation_participants";
drop policy "conversation_participants_select" on "public"."conversation_participants";
drop policy "conversation_participants_update" on "public"."conversation_participants";
drop policy "conversations_select" on "public"."conversations";
drop policy "messages_insert" on "public"."messages";
revoke delete on table "public"."activity_feed" from "anon";
revoke insert on table "public"."activity_feed" from "anon";
revoke references on table "public"."activity_feed" from "anon";
revoke select on table "public"."activity_feed" from "anon";
revoke trigger on table "public"."activity_feed" from "anon";
revoke truncate on table "public"."activity_feed" from "anon";
revoke update on table "public"."activity_feed" from "anon";
revoke delete on table "public"."activity_feed" from "authenticated";
revoke insert on table "public"."activity_feed" from "authenticated";
revoke references on table "public"."activity_feed" from "authenticated";
revoke select on table "public"."activity_feed" from "authenticated";
revoke trigger on table "public"."activity_feed" from "authenticated";
revoke truncate on table "public"."activity_feed" from "authenticated";
revoke update on table "public"."activity_feed" from "authenticated";
revoke delete on table "public"."activity_feed" from "service_role";
revoke insert on table "public"."activity_feed" from "service_role";
revoke references on table "public"."activity_feed" from "service_role";
revoke select on table "public"."activity_feed" from "service_role";
revoke trigger on table "public"."activity_feed" from "service_role";
revoke truncate on table "public"."activity_feed" from "service_role";
revoke update on table "public"."activity_feed" from "service_role";
revoke delete on table "public"."allocation_lot_items" from "anon";
revoke insert on table "public"."allocation_lot_items" from "anon";
revoke references on table "public"."allocation_lot_items" from "anon";
revoke select on table "public"."allocation_lot_items" from "anon";
revoke trigger on table "public"."allocation_lot_items" from "anon";
revoke truncate on table "public"."allocation_lot_items" from "anon";
revoke update on table "public"."allocation_lot_items" from "anon";
revoke delete on table "public"."allocation_lot_items" from "authenticated";
revoke insert on table "public"."allocation_lot_items" from "authenticated";
revoke references on table "public"."allocation_lot_items" from "authenticated";
revoke select on table "public"."allocation_lot_items" from "authenticated";
revoke trigger on table "public"."allocation_lot_items" from "authenticated";
revoke truncate on table "public"."allocation_lot_items" from "authenticated";
revoke update on table "public"."allocation_lot_items" from "authenticated";
revoke delete on table "public"."allocation_lot_items" from "service_role";
revoke insert on table "public"."allocation_lot_items" from "service_role";
revoke references on table "public"."allocation_lot_items" from "service_role";
revoke select on table "public"."allocation_lot_items" from "service_role";
revoke trigger on table "public"."allocation_lot_items" from "service_role";
revoke truncate on table "public"."allocation_lot_items" from "service_role";
revoke update on table "public"."allocation_lot_items" from "service_role";
revoke delete on table "public"."allocations" from "anon";
revoke insert on table "public"."allocations" from "anon";
revoke references on table "public"."allocations" from "anon";
revoke select on table "public"."allocations" from "anon";
revoke trigger on table "public"."allocations" from "anon";
revoke truncate on table "public"."allocations" from "anon";
revoke update on table "public"."allocations" from "anon";
revoke delete on table "public"."allocations" from "authenticated";
revoke insert on table "public"."allocations" from "authenticated";
revoke references on table "public"."allocations" from "authenticated";
revoke select on table "public"."allocations" from "authenticated";
revoke trigger on table "public"."allocations" from "authenticated";
revoke truncate on table "public"."allocations" from "authenticated";
revoke update on table "public"."allocations" from "authenticated";
revoke delete on table "public"."allocations" from "service_role";
revoke insert on table "public"."allocations" from "service_role";
revoke references on table "public"."allocations" from "service_role";
revoke select on table "public"."allocations" from "service_role";
revoke trigger on table "public"."allocations" from "service_role";
revoke truncate on table "public"."allocations" from "service_role";
revoke update on table "public"."allocations" from "service_role";
revoke delete on table "public"."approval_history" from "anon";
revoke insert on table "public"."approval_history" from "anon";
revoke references on table "public"."approval_history" from "anon";
revoke select on table "public"."approval_history" from "anon";
revoke trigger on table "public"."approval_history" from "anon";
revoke truncate on table "public"."approval_history" from "anon";
revoke update on table "public"."approval_history" from "anon";
revoke delete on table "public"."approval_history" from "authenticated";
revoke insert on table "public"."approval_history" from "authenticated";
revoke references on table "public"."approval_history" from "authenticated";
revoke select on table "public"."approval_history" from "authenticated";
revoke trigger on table "public"."approval_history" from "authenticated";
revoke truncate on table "public"."approval_history" from "authenticated";
revoke update on table "public"."approval_history" from "authenticated";
revoke delete on table "public"."approval_history" from "service_role";
revoke insert on table "public"."approval_history" from "service_role";
revoke references on table "public"."approval_history" from "service_role";
revoke select on table "public"."approval_history" from "service_role";
revoke trigger on table "public"."approval_history" from "service_role";
revoke truncate on table "public"."approval_history" from "service_role";
revoke update on table "public"."approval_history" from "service_role";
revoke delete on table "public"."approvals" from "anon";
revoke insert on table "public"."approvals" from "anon";
revoke references on table "public"."approvals" from "anon";
revoke select on table "public"."approvals" from "anon";
revoke trigger on table "public"."approvals" from "anon";
revoke truncate on table "public"."approvals" from "anon";
revoke update on table "public"."approvals" from "anon";
revoke delete on table "public"."approvals" from "authenticated";
revoke insert on table "public"."approvals" from "authenticated";
revoke references on table "public"."approvals" from "authenticated";
revoke select on table "public"."approvals" from "authenticated";
revoke trigger on table "public"."approvals" from "authenticated";
revoke truncate on table "public"."approvals" from "authenticated";
revoke update on table "public"."approvals" from "authenticated";
revoke delete on table "public"."approvals" from "service_role";
revoke insert on table "public"."approvals" from "service_role";
revoke references on table "public"."approvals" from "service_role";
revoke select on table "public"."approvals" from "service_role";
revoke trigger on table "public"."approvals" from "service_role";
revoke truncate on table "public"."approvals" from "service_role";
revoke update on table "public"."approvals" from "service_role";
revoke delete on table "public"."audit_log" from "anon";
revoke insert on table "public"."audit_log" from "anon";
revoke references on table "public"."audit_log" from "anon";
revoke select on table "public"."audit_log" from "anon";
revoke trigger on table "public"."audit_log" from "anon";
revoke truncate on table "public"."audit_log" from "anon";
revoke update on table "public"."audit_log" from "anon";
revoke delete on table "public"."audit_log" from "authenticated";
revoke insert on table "public"."audit_log" from "authenticated";
revoke references on table "public"."audit_log" from "authenticated";
revoke select on table "public"."audit_log" from "authenticated";
revoke trigger on table "public"."audit_log" from "authenticated";
revoke truncate on table "public"."audit_log" from "authenticated";
revoke update on table "public"."audit_log" from "authenticated";
revoke delete on table "public"."audit_log" from "service_role";
revoke insert on table "public"."audit_log" from "service_role";
revoke references on table "public"."audit_log" from "service_role";
revoke select on table "public"."audit_log" from "service_role";
revoke trigger on table "public"."audit_log" from "service_role";
revoke truncate on table "public"."audit_log" from "service_role";
revoke update on table "public"."audit_log" from "service_role";
revoke delete on table "public"."audit_log_hash_chain" from "anon";
revoke insert on table "public"."audit_log_hash_chain" from "anon";
revoke references on table "public"."audit_log_hash_chain" from "anon";
revoke select on table "public"."audit_log_hash_chain" from "anon";
revoke trigger on table "public"."audit_log_hash_chain" from "anon";
revoke truncate on table "public"."audit_log_hash_chain" from "anon";
revoke update on table "public"."audit_log_hash_chain" from "anon";
revoke delete on table "public"."audit_log_hash_chain" from "authenticated";
revoke insert on table "public"."audit_log_hash_chain" from "authenticated";
revoke references on table "public"."audit_log_hash_chain" from "authenticated";
revoke select on table "public"."audit_log_hash_chain" from "authenticated";
revoke trigger on table "public"."audit_log_hash_chain" from "authenticated";
revoke truncate on table "public"."audit_log_hash_chain" from "authenticated";
revoke update on table "public"."audit_log_hash_chain" from "authenticated";
revoke delete on table "public"."audit_log_hash_chain" from "service_role";
revoke insert on table "public"."audit_log_hash_chain" from "service_role";
revoke references on table "public"."audit_log_hash_chain" from "service_role";
revoke select on table "public"."audit_log_hash_chain" from "service_role";
revoke trigger on table "public"."audit_log_hash_chain" from "service_role";
revoke truncate on table "public"."audit_log_hash_chain" from "service_role";
revoke update on table "public"."audit_log_hash_chain" from "service_role";
revoke delete on table "public"."audit_logs" from "anon";
revoke insert on table "public"."audit_logs" from "anon";
revoke references on table "public"."audit_logs" from "anon";
revoke select on table "public"."audit_logs" from "anon";
revoke trigger on table "public"."audit_logs" from "anon";
revoke truncate on table "public"."audit_logs" from "anon";
revoke update on table "public"."audit_logs" from "anon";
revoke delete on table "public"."audit_logs" from "authenticated";
revoke insert on table "public"."audit_logs" from "authenticated";
revoke references on table "public"."audit_logs" from "authenticated";
revoke select on table "public"."audit_logs" from "authenticated";
revoke trigger on table "public"."audit_logs" from "authenticated";
revoke truncate on table "public"."audit_logs" from "authenticated";
revoke update on table "public"."audit_logs" from "authenticated";
revoke delete on table "public"."audit_logs" from "service_role";
revoke insert on table "public"."audit_logs" from "service_role";
revoke references on table "public"."audit_logs" from "service_role";
revoke select on table "public"."audit_logs" from "service_role";
revoke trigger on table "public"."audit_logs" from "service_role";
revoke truncate on table "public"."audit_logs" from "service_role";
revoke update on table "public"."audit_logs" from "service_role";
revoke delete on table "public"."audit_report_templates" from "anon";
revoke insert on table "public"."audit_report_templates" from "anon";
revoke references on table "public"."audit_report_templates" from "anon";
revoke select on table "public"."audit_report_templates" from "anon";
revoke trigger on table "public"."audit_report_templates" from "anon";
revoke truncate on table "public"."audit_report_templates" from "anon";
revoke update on table "public"."audit_report_templates" from "anon";
revoke delete on table "public"."audit_report_templates" from "authenticated";
revoke insert on table "public"."audit_report_templates" from "authenticated";
revoke references on table "public"."audit_report_templates" from "authenticated";
revoke select on table "public"."audit_report_templates" from "authenticated";
revoke trigger on table "public"."audit_report_templates" from "authenticated";
revoke truncate on table "public"."audit_report_templates" from "authenticated";
revoke update on table "public"."audit_report_templates" from "authenticated";
revoke delete on table "public"."audit_report_templates" from "service_role";
revoke insert on table "public"."audit_report_templates" from "service_role";
revoke references on table "public"."audit_report_templates" from "service_role";
revoke select on table "public"."audit_report_templates" from "service_role";
revoke trigger on table "public"."audit_report_templates" from "service_role";
revoke truncate on table "public"."audit_report_templates" from "service_role";
revoke update on table "public"."audit_report_templates" from "service_role";
revoke delete on table "public"."bank_transactions" from "anon";
revoke insert on table "public"."bank_transactions" from "anon";
revoke references on table "public"."bank_transactions" from "anon";
revoke select on table "public"."bank_transactions" from "anon";
revoke trigger on table "public"."bank_transactions" from "anon";
revoke truncate on table "public"."bank_transactions" from "anon";
revoke update on table "public"."bank_transactions" from "anon";
revoke delete on table "public"."bank_transactions" from "authenticated";
revoke insert on table "public"."bank_transactions" from "authenticated";
revoke references on table "public"."bank_transactions" from "authenticated";
revoke select on table "public"."bank_transactions" from "authenticated";
revoke trigger on table "public"."bank_transactions" from "authenticated";
revoke truncate on table "public"."bank_transactions" from "authenticated";
revoke update on table "public"."bank_transactions" from "authenticated";
revoke delete on table "public"."bank_transactions" from "service_role";
revoke insert on table "public"."bank_transactions" from "service_role";
revoke references on table "public"."bank_transactions" from "service_role";
revoke select on table "public"."bank_transactions" from "service_role";
revoke trigger on table "public"."bank_transactions" from "service_role";
revoke truncate on table "public"."bank_transactions" from "service_role";
revoke update on table "public"."bank_transactions" from "service_role";
revoke delete on table "public"."capital_calls" from "anon";
revoke insert on table "public"."capital_calls" from "anon";
revoke references on table "public"."capital_calls" from "anon";
revoke select on table "public"."capital_calls" from "anon";
revoke trigger on table "public"."capital_calls" from "anon";
revoke truncate on table "public"."capital_calls" from "anon";
revoke update on table "public"."capital_calls" from "anon";
revoke delete on table "public"."capital_calls" from "authenticated";
revoke insert on table "public"."capital_calls" from "authenticated";
revoke references on table "public"."capital_calls" from "authenticated";
revoke select on table "public"."capital_calls" from "authenticated";
revoke trigger on table "public"."capital_calls" from "authenticated";
revoke truncate on table "public"."capital_calls" from "authenticated";
revoke update on table "public"."capital_calls" from "authenticated";
revoke delete on table "public"."capital_calls" from "service_role";
revoke insert on table "public"."capital_calls" from "service_role";
revoke references on table "public"."capital_calls" from "service_role";
revoke select on table "public"."capital_calls" from "service_role";
revoke trigger on table "public"."capital_calls" from "service_role";
revoke truncate on table "public"."capital_calls" from "service_role";
revoke update on table "public"."capital_calls" from "service_role";
revoke delete on table "public"."cashflows" from "anon";
revoke insert on table "public"."cashflows" from "anon";
revoke references on table "public"."cashflows" from "anon";
revoke select on table "public"."cashflows" from "anon";
revoke trigger on table "public"."cashflows" from "anon";
revoke truncate on table "public"."cashflows" from "anon";
revoke update on table "public"."cashflows" from "anon";
revoke delete on table "public"."cashflows" from "authenticated";
revoke insert on table "public"."cashflows" from "authenticated";
revoke references on table "public"."cashflows" from "authenticated";
revoke select on table "public"."cashflows" from "authenticated";
revoke trigger on table "public"."cashflows" from "authenticated";
revoke truncate on table "public"."cashflows" from "authenticated";
revoke update on table "public"."cashflows" from "authenticated";
revoke delete on table "public"."cashflows" from "service_role";
revoke insert on table "public"."cashflows" from "service_role";
revoke references on table "public"."cashflows" from "service_role";
revoke select on table "public"."cashflows" from "service_role";
revoke trigger on table "public"."cashflows" from "service_role";
revoke truncate on table "public"."cashflows" from "service_role";
revoke update on table "public"."cashflows" from "service_role";
revoke delete on table "public"."compliance_alerts" from "anon";
revoke insert on table "public"."compliance_alerts" from "anon";
revoke references on table "public"."compliance_alerts" from "anon";
revoke select on table "public"."compliance_alerts" from "anon";
revoke trigger on table "public"."compliance_alerts" from "anon";
revoke truncate on table "public"."compliance_alerts" from "anon";
revoke update on table "public"."compliance_alerts" from "anon";
revoke delete on table "public"."compliance_alerts" from "authenticated";
revoke insert on table "public"."compliance_alerts" from "authenticated";
revoke references on table "public"."compliance_alerts" from "authenticated";
revoke select on table "public"."compliance_alerts" from "authenticated";
revoke trigger on table "public"."compliance_alerts" from "authenticated";
revoke truncate on table "public"."compliance_alerts" from "authenticated";
revoke update on table "public"."compliance_alerts" from "authenticated";
revoke delete on table "public"."compliance_alerts" from "service_role";
revoke insert on table "public"."compliance_alerts" from "service_role";
revoke references on table "public"."compliance_alerts" from "service_role";
revoke select on table "public"."compliance_alerts" from "service_role";
revoke trigger on table "public"."compliance_alerts" from "service_role";
revoke truncate on table "public"."compliance_alerts" from "service_role";
revoke update on table "public"."compliance_alerts" from "service_role";
revoke delete on table "public"."conversation_participants" from "anon";
revoke insert on table "public"."conversation_participants" from "anon";
revoke references on table "public"."conversation_participants" from "anon";
revoke select on table "public"."conversation_participants" from "anon";
revoke trigger on table "public"."conversation_participants" from "anon";
revoke truncate on table "public"."conversation_participants" from "anon";
revoke update on table "public"."conversation_participants" from "anon";
revoke delete on table "public"."conversation_participants" from "authenticated";
revoke insert on table "public"."conversation_participants" from "authenticated";
revoke references on table "public"."conversation_participants" from "authenticated";
revoke select on table "public"."conversation_participants" from "authenticated";
revoke trigger on table "public"."conversation_participants" from "authenticated";
revoke truncate on table "public"."conversation_participants" from "authenticated";
revoke update on table "public"."conversation_participants" from "authenticated";
revoke delete on table "public"."conversation_participants" from "service_role";
revoke insert on table "public"."conversation_participants" from "service_role";
revoke references on table "public"."conversation_participants" from "service_role";
revoke select on table "public"."conversation_participants" from "service_role";
revoke trigger on table "public"."conversation_participants" from "service_role";
revoke truncate on table "public"."conversation_participants" from "service_role";
revoke update on table "public"."conversation_participants" from "service_role";
revoke delete on table "public"."conversations" from "anon";
revoke insert on table "public"."conversations" from "anon";
revoke references on table "public"."conversations" from "anon";
revoke select on table "public"."conversations" from "anon";
revoke trigger on table "public"."conversations" from "anon";
revoke truncate on table "public"."conversations" from "anon";
revoke update on table "public"."conversations" from "anon";
revoke delete on table "public"."conversations" from "authenticated";
revoke insert on table "public"."conversations" from "authenticated";
revoke references on table "public"."conversations" from "authenticated";
revoke select on table "public"."conversations" from "authenticated";
revoke trigger on table "public"."conversations" from "authenticated";
revoke truncate on table "public"."conversations" from "authenticated";
revoke update on table "public"."conversations" from "authenticated";
revoke delete on table "public"."conversations" from "service_role";
revoke insert on table "public"."conversations" from "service_role";
revoke references on table "public"."conversations" from "service_role";
revoke select on table "public"."conversations" from "service_role";
revoke trigger on table "public"."conversations" from "service_role";
revoke truncate on table "public"."conversations" from "service_role";
revoke update on table "public"."conversations" from "service_role";
revoke delete on table "public"."counterparty_aliases" from "anon";
revoke insert on table "public"."counterparty_aliases" from "anon";
revoke references on table "public"."counterparty_aliases" from "anon";
revoke select on table "public"."counterparty_aliases" from "anon";
revoke trigger on table "public"."counterparty_aliases" from "anon";
revoke truncate on table "public"."counterparty_aliases" from "anon";
revoke update on table "public"."counterparty_aliases" from "anon";
revoke delete on table "public"."counterparty_aliases" from "authenticated";
revoke insert on table "public"."counterparty_aliases" from "authenticated";
revoke references on table "public"."counterparty_aliases" from "authenticated";
revoke select on table "public"."counterparty_aliases" from "authenticated";
revoke trigger on table "public"."counterparty_aliases" from "authenticated";
revoke truncate on table "public"."counterparty_aliases" from "authenticated";
revoke update on table "public"."counterparty_aliases" from "authenticated";
revoke delete on table "public"."counterparty_aliases" from "service_role";
revoke insert on table "public"."counterparty_aliases" from "service_role";
revoke references on table "public"."counterparty_aliases" from "service_role";
revoke select on table "public"."counterparty_aliases" from "service_role";
revoke trigger on table "public"."counterparty_aliases" from "service_role";
revoke truncate on table "public"."counterparty_aliases" from "service_role";
revoke update on table "public"."counterparty_aliases" from "service_role";
revoke delete on table "public"."dashboard_preferences" from "anon";
revoke insert on table "public"."dashboard_preferences" from "anon";
revoke references on table "public"."dashboard_preferences" from "anon";
revoke select on table "public"."dashboard_preferences" from "anon";
revoke trigger on table "public"."dashboard_preferences" from "anon";
revoke truncate on table "public"."dashboard_preferences" from "anon";
revoke update on table "public"."dashboard_preferences" from "anon";
revoke delete on table "public"."dashboard_preferences" from "authenticated";
revoke insert on table "public"."dashboard_preferences" from "authenticated";
revoke references on table "public"."dashboard_preferences" from "authenticated";
revoke select on table "public"."dashboard_preferences" from "authenticated";
revoke trigger on table "public"."dashboard_preferences" from "authenticated";
revoke truncate on table "public"."dashboard_preferences" from "authenticated";
revoke update on table "public"."dashboard_preferences" from "authenticated";
revoke delete on table "public"."dashboard_preferences" from "service_role";
revoke insert on table "public"."dashboard_preferences" from "service_role";
revoke references on table "public"."dashboard_preferences" from "service_role";
revoke select on table "public"."dashboard_preferences" from "service_role";
revoke trigger on table "public"."dashboard_preferences" from "service_role";
revoke truncate on table "public"."dashboard_preferences" from "service_role";
revoke update on table "public"."dashboard_preferences" from "service_role";
revoke delete on table "public"."deal_commitments" from "anon";
revoke insert on table "public"."deal_commitments" from "anon";
revoke references on table "public"."deal_commitments" from "anon";
revoke select on table "public"."deal_commitments" from "anon";
revoke trigger on table "public"."deal_commitments" from "anon";
revoke truncate on table "public"."deal_commitments" from "anon";
revoke update on table "public"."deal_commitments" from "anon";
revoke delete on table "public"."deal_commitments" from "authenticated";
revoke insert on table "public"."deal_commitments" from "authenticated";
revoke references on table "public"."deal_commitments" from "authenticated";
revoke select on table "public"."deal_commitments" from "authenticated";
revoke trigger on table "public"."deal_commitments" from "authenticated";
revoke truncate on table "public"."deal_commitments" from "authenticated";
revoke update on table "public"."deal_commitments" from "authenticated";
revoke delete on table "public"."deal_commitments" from "service_role";
revoke insert on table "public"."deal_commitments" from "service_role";
revoke references on table "public"."deal_commitments" from "service_role";
revoke select on table "public"."deal_commitments" from "service_role";
revoke trigger on table "public"."deal_commitments" from "service_role";
revoke truncate on table "public"."deal_commitments" from "service_role";
revoke update on table "public"."deal_commitments" from "service_role";
revoke delete on table "public"."deal_memberships" from "anon";
revoke insert on table "public"."deal_memberships" from "anon";
revoke references on table "public"."deal_memberships" from "anon";
revoke select on table "public"."deal_memberships" from "anon";
revoke trigger on table "public"."deal_memberships" from "anon";
revoke truncate on table "public"."deal_memberships" from "anon";
revoke update on table "public"."deal_memberships" from "anon";
revoke delete on table "public"."deal_memberships" from "authenticated";
revoke insert on table "public"."deal_memberships" from "authenticated";
revoke references on table "public"."deal_memberships" from "authenticated";
revoke select on table "public"."deal_memberships" from "authenticated";
revoke trigger on table "public"."deal_memberships" from "authenticated";
revoke truncate on table "public"."deal_memberships" from "authenticated";
revoke update on table "public"."deal_memberships" from "authenticated";
revoke delete on table "public"."deal_memberships" from "service_role";
revoke insert on table "public"."deal_memberships" from "service_role";
revoke references on table "public"."deal_memberships" from "service_role";
revoke select on table "public"."deal_memberships" from "service_role";
revoke trigger on table "public"."deal_memberships" from "service_role";
revoke truncate on table "public"."deal_memberships" from "service_role";
revoke update on table "public"."deal_memberships" from "service_role";
revoke delete on table "public"."deals" from "anon";
revoke insert on table "public"."deals" from "anon";
revoke references on table "public"."deals" from "anon";
revoke select on table "public"."deals" from "anon";
revoke trigger on table "public"."deals" from "anon";
revoke truncate on table "public"."deals" from "anon";
revoke update on table "public"."deals" from "anon";
revoke delete on table "public"."deals" from "authenticated";
revoke insert on table "public"."deals" from "authenticated";
revoke references on table "public"."deals" from "authenticated";
revoke select on table "public"."deals" from "authenticated";
revoke trigger on table "public"."deals" from "authenticated";
revoke truncate on table "public"."deals" from "authenticated";
revoke update on table "public"."deals" from "authenticated";
revoke delete on table "public"."deals" from "service_role";
revoke insert on table "public"."deals" from "service_role";
revoke references on table "public"."deals" from "service_role";
revoke select on table "public"."deals" from "service_role";
revoke trigger on table "public"."deals" from "service_role";
revoke truncate on table "public"."deals" from "service_role";
revoke update on table "public"."deals" from "service_role";
revoke delete on table "public"."director_registry" from "anon";
revoke insert on table "public"."director_registry" from "anon";
revoke references on table "public"."director_registry" from "anon";
revoke select on table "public"."director_registry" from "anon";
revoke trigger on table "public"."director_registry" from "anon";
revoke truncate on table "public"."director_registry" from "anon";
revoke update on table "public"."director_registry" from "anon";
revoke delete on table "public"."director_registry" from "authenticated";
revoke insert on table "public"."director_registry" from "authenticated";
revoke references on table "public"."director_registry" from "authenticated";
revoke select on table "public"."director_registry" from "authenticated";
revoke trigger on table "public"."director_registry" from "authenticated";
revoke truncate on table "public"."director_registry" from "authenticated";
revoke update on table "public"."director_registry" from "authenticated";
revoke delete on table "public"."director_registry" from "service_role";
revoke insert on table "public"."director_registry" from "service_role";
revoke references on table "public"."director_registry" from "service_role";
revoke select on table "public"."director_registry" from "service_role";
revoke trigger on table "public"."director_registry" from "service_role";
revoke truncate on table "public"."director_registry" from "service_role";
revoke update on table "public"."director_registry" from "service_role";
revoke delete on table "public"."distributions" from "anon";
revoke insert on table "public"."distributions" from "anon";
revoke references on table "public"."distributions" from "anon";
revoke select on table "public"."distributions" from "anon";
revoke trigger on table "public"."distributions" from "anon";
revoke truncate on table "public"."distributions" from "anon";
revoke update on table "public"."distributions" from "anon";
revoke delete on table "public"."distributions" from "authenticated";
revoke insert on table "public"."distributions" from "authenticated";
revoke references on table "public"."distributions" from "authenticated";
revoke select on table "public"."distributions" from "authenticated";
revoke trigger on table "public"."distributions" from "authenticated";
revoke truncate on table "public"."distributions" from "authenticated";
revoke update on table "public"."distributions" from "authenticated";
revoke delete on table "public"."distributions" from "service_role";
revoke insert on table "public"."distributions" from "service_role";
revoke references on table "public"."distributions" from "service_role";
revoke select on table "public"."distributions" from "service_role";
revoke trigger on table "public"."distributions" from "service_role";
revoke truncate on table "public"."distributions" from "service_role";
revoke update on table "public"."distributions" from "service_role";
revoke delete on table "public"."doc_package_items" from "anon";
revoke insert on table "public"."doc_package_items" from "anon";
revoke references on table "public"."doc_package_items" from "anon";
revoke select on table "public"."doc_package_items" from "anon";
revoke trigger on table "public"."doc_package_items" from "anon";
revoke truncate on table "public"."doc_package_items" from "anon";
revoke update on table "public"."doc_package_items" from "anon";
revoke delete on table "public"."doc_package_items" from "authenticated";
revoke insert on table "public"."doc_package_items" from "authenticated";
revoke references on table "public"."doc_package_items" from "authenticated";
revoke select on table "public"."doc_package_items" from "authenticated";
revoke trigger on table "public"."doc_package_items" from "authenticated";
revoke truncate on table "public"."doc_package_items" from "authenticated";
revoke update on table "public"."doc_package_items" from "authenticated";
revoke delete on table "public"."doc_package_items" from "service_role";
revoke insert on table "public"."doc_package_items" from "service_role";
revoke references on table "public"."doc_package_items" from "service_role";
revoke select on table "public"."doc_package_items" from "service_role";
revoke trigger on table "public"."doc_package_items" from "service_role";
revoke truncate on table "public"."doc_package_items" from "service_role";
revoke update on table "public"."doc_package_items" from "service_role";
revoke delete on table "public"."doc_packages" from "anon";
revoke insert on table "public"."doc_packages" from "anon";
revoke references on table "public"."doc_packages" from "anon";
revoke select on table "public"."doc_packages" from "anon";
revoke trigger on table "public"."doc_packages" from "anon";
revoke truncate on table "public"."doc_packages" from "anon";
revoke update on table "public"."doc_packages" from "anon";
revoke delete on table "public"."doc_packages" from "authenticated";
revoke insert on table "public"."doc_packages" from "authenticated";
revoke references on table "public"."doc_packages" from "authenticated";
revoke select on table "public"."doc_packages" from "authenticated";
revoke trigger on table "public"."doc_packages" from "authenticated";
revoke truncate on table "public"."doc_packages" from "authenticated";
revoke update on table "public"."doc_packages" from "authenticated";
revoke delete on table "public"."doc_packages" from "service_role";
revoke insert on table "public"."doc_packages" from "service_role";
revoke references on table "public"."doc_packages" from "service_role";
revoke select on table "public"."doc_packages" from "service_role";
revoke trigger on table "public"."doc_packages" from "service_role";
revoke truncate on table "public"."doc_packages" from "service_role";
revoke update on table "public"."doc_packages" from "service_role";
revoke delete on table "public"."doc_templates" from "anon";
revoke insert on table "public"."doc_templates" from "anon";
revoke references on table "public"."doc_templates" from "anon";
revoke select on table "public"."doc_templates" from "anon";
revoke trigger on table "public"."doc_templates" from "anon";
revoke truncate on table "public"."doc_templates" from "anon";
revoke update on table "public"."doc_templates" from "anon";
revoke delete on table "public"."doc_templates" from "authenticated";
revoke insert on table "public"."doc_templates" from "authenticated";
revoke references on table "public"."doc_templates" from "authenticated";
revoke select on table "public"."doc_templates" from "authenticated";
revoke trigger on table "public"."doc_templates" from "authenticated";
revoke truncate on table "public"."doc_templates" from "authenticated";
revoke update on table "public"."doc_templates" from "authenticated";
revoke delete on table "public"."doc_templates" from "service_role";
revoke insert on table "public"."doc_templates" from "service_role";
revoke references on table "public"."doc_templates" from "service_role";
revoke select on table "public"."doc_templates" from "service_role";
revoke trigger on table "public"."doc_templates" from "service_role";
revoke truncate on table "public"."doc_templates" from "service_role";
revoke update on table "public"."doc_templates" from "service_role";
revoke delete on table "public"."document_approvals" from "anon";
revoke insert on table "public"."document_approvals" from "anon";
revoke references on table "public"."document_approvals" from "anon";
revoke select on table "public"."document_approvals" from "anon";
revoke trigger on table "public"."document_approvals" from "anon";
revoke truncate on table "public"."document_approvals" from "anon";
revoke update on table "public"."document_approvals" from "anon";
revoke delete on table "public"."document_approvals" from "authenticated";
revoke insert on table "public"."document_approvals" from "authenticated";
revoke references on table "public"."document_approvals" from "authenticated";
revoke select on table "public"."document_approvals" from "authenticated";
revoke trigger on table "public"."document_approvals" from "authenticated";
revoke truncate on table "public"."document_approvals" from "authenticated";
revoke update on table "public"."document_approvals" from "authenticated";
revoke delete on table "public"."document_approvals" from "service_role";
revoke insert on table "public"."document_approvals" from "service_role";
revoke references on table "public"."document_approvals" from "service_role";
revoke select on table "public"."document_approvals" from "service_role";
revoke trigger on table "public"."document_approvals" from "service_role";
revoke truncate on table "public"."document_approvals" from "service_role";
revoke update on table "public"."document_approvals" from "service_role";
revoke delete on table "public"."document_folders" from "anon";
revoke insert on table "public"."document_folders" from "anon";
revoke references on table "public"."document_folders" from "anon";
revoke select on table "public"."document_folders" from "anon";
revoke trigger on table "public"."document_folders" from "anon";
revoke truncate on table "public"."document_folders" from "anon";
revoke update on table "public"."document_folders" from "anon";
revoke delete on table "public"."document_folders" from "authenticated";
revoke insert on table "public"."document_folders" from "authenticated";
revoke references on table "public"."document_folders" from "authenticated";
revoke select on table "public"."document_folders" from "authenticated";
revoke trigger on table "public"."document_folders" from "authenticated";
revoke truncate on table "public"."document_folders" from "authenticated";
revoke update on table "public"."document_folders" from "authenticated";
revoke delete on table "public"."document_folders" from "service_role";
revoke insert on table "public"."document_folders" from "service_role";
revoke references on table "public"."document_folders" from "service_role";
revoke select on table "public"."document_folders" from "service_role";
revoke trigger on table "public"."document_folders" from "service_role";
revoke truncate on table "public"."document_folders" from "service_role";
revoke update on table "public"."document_folders" from "service_role";
revoke delete on table "public"."document_publishing_schedule" from "anon";
revoke insert on table "public"."document_publishing_schedule" from "anon";
revoke references on table "public"."document_publishing_schedule" from "anon";
revoke select on table "public"."document_publishing_schedule" from "anon";
revoke trigger on table "public"."document_publishing_schedule" from "anon";
revoke truncate on table "public"."document_publishing_schedule" from "anon";
revoke update on table "public"."document_publishing_schedule" from "anon";
revoke delete on table "public"."document_publishing_schedule" from "authenticated";
revoke insert on table "public"."document_publishing_schedule" from "authenticated";
revoke references on table "public"."document_publishing_schedule" from "authenticated";
revoke select on table "public"."document_publishing_schedule" from "authenticated";
revoke trigger on table "public"."document_publishing_schedule" from "authenticated";
revoke truncate on table "public"."document_publishing_schedule" from "authenticated";
revoke update on table "public"."document_publishing_schedule" from "authenticated";
revoke delete on table "public"."document_publishing_schedule" from "service_role";
revoke insert on table "public"."document_publishing_schedule" from "service_role";
revoke references on table "public"."document_publishing_schedule" from "service_role";
revoke select on table "public"."document_publishing_schedule" from "service_role";
revoke trigger on table "public"."document_publishing_schedule" from "service_role";
revoke truncate on table "public"."document_publishing_schedule" from "service_role";
revoke update on table "public"."document_publishing_schedule" from "service_role";
revoke delete on table "public"."document_versions" from "anon";
revoke insert on table "public"."document_versions" from "anon";
revoke references on table "public"."document_versions" from "anon";
revoke select on table "public"."document_versions" from "anon";
revoke trigger on table "public"."document_versions" from "anon";
revoke truncate on table "public"."document_versions" from "anon";
revoke update on table "public"."document_versions" from "anon";
revoke delete on table "public"."document_versions" from "authenticated";
revoke insert on table "public"."document_versions" from "authenticated";
revoke references on table "public"."document_versions" from "authenticated";
revoke select on table "public"."document_versions" from "authenticated";
revoke trigger on table "public"."document_versions" from "authenticated";
revoke truncate on table "public"."document_versions" from "authenticated";
revoke update on table "public"."document_versions" from "authenticated";
revoke delete on table "public"."document_versions" from "service_role";
revoke insert on table "public"."document_versions" from "service_role";
revoke references on table "public"."document_versions" from "service_role";
revoke select on table "public"."document_versions" from "service_role";
revoke trigger on table "public"."document_versions" from "service_role";
revoke truncate on table "public"."document_versions" from "service_role";
revoke update on table "public"."document_versions" from "service_role";
revoke delete on table "public"."documents" from "anon";
revoke insert on table "public"."documents" from "anon";
revoke references on table "public"."documents" from "anon";
revoke select on table "public"."documents" from "anon";
revoke trigger on table "public"."documents" from "anon";
revoke truncate on table "public"."documents" from "anon";
revoke update on table "public"."documents" from "anon";
revoke delete on table "public"."documents" from "authenticated";
revoke insert on table "public"."documents" from "authenticated";
revoke references on table "public"."documents" from "authenticated";
revoke select on table "public"."documents" from "authenticated";
revoke trigger on table "public"."documents" from "authenticated";
revoke truncate on table "public"."documents" from "authenticated";
revoke update on table "public"."documents" from "authenticated";
revoke delete on table "public"."documents" from "service_role";
revoke insert on table "public"."documents" from "service_role";
revoke references on table "public"."documents" from "service_role";
revoke select on table "public"."documents" from "service_role";
revoke trigger on table "public"."documents" from "service_role";
revoke truncate on table "public"."documents" from "service_role";
revoke update on table "public"."documents" from "service_role";
revoke delete on table "public"."entity_directors" from "anon";
revoke insert on table "public"."entity_directors" from "anon";
revoke references on table "public"."entity_directors" from "anon";
revoke select on table "public"."entity_directors" from "anon";
revoke trigger on table "public"."entity_directors" from "anon";
revoke truncate on table "public"."entity_directors" from "anon";
revoke update on table "public"."entity_directors" from "anon";
revoke delete on table "public"."entity_directors" from "authenticated";
revoke insert on table "public"."entity_directors" from "authenticated";
revoke references on table "public"."entity_directors" from "authenticated";
revoke select on table "public"."entity_directors" from "authenticated";
revoke trigger on table "public"."entity_directors" from "authenticated";
revoke truncate on table "public"."entity_directors" from "authenticated";
revoke update on table "public"."entity_directors" from "authenticated";
revoke delete on table "public"."entity_directors" from "service_role";
revoke insert on table "public"."entity_directors" from "service_role";
revoke references on table "public"."entity_directors" from "service_role";
revoke select on table "public"."entity_directors" from "service_role";
revoke trigger on table "public"."entity_directors" from "service_role";
revoke truncate on table "public"."entity_directors" from "service_role";
revoke update on table "public"."entity_directors" from "service_role";
revoke delete on table "public"."entity_events" from "anon";
revoke insert on table "public"."entity_events" from "anon";
revoke references on table "public"."entity_events" from "anon";
revoke select on table "public"."entity_events" from "anon";
revoke trigger on table "public"."entity_events" from "anon";
revoke truncate on table "public"."entity_events" from "anon";
revoke update on table "public"."entity_events" from "anon";
revoke delete on table "public"."entity_events" from "authenticated";
revoke insert on table "public"."entity_events" from "authenticated";
revoke references on table "public"."entity_events" from "authenticated";
revoke select on table "public"."entity_events" from "authenticated";
revoke trigger on table "public"."entity_events" from "authenticated";
revoke truncate on table "public"."entity_events" from "authenticated";
revoke update on table "public"."entity_events" from "authenticated";
revoke delete on table "public"."entity_events" from "service_role";
revoke insert on table "public"."entity_events" from "service_role";
revoke references on table "public"."entity_events" from "service_role";
revoke select on table "public"."entity_events" from "service_role";
revoke trigger on table "public"."entity_events" from "service_role";
revoke truncate on table "public"."entity_events" from "service_role";
revoke update on table "public"."entity_events" from "service_role";
revoke delete on table "public"."esign_envelopes" from "anon";
revoke insert on table "public"."esign_envelopes" from "anon";
revoke references on table "public"."esign_envelopes" from "anon";
revoke select on table "public"."esign_envelopes" from "anon";
revoke trigger on table "public"."esign_envelopes" from "anon";
revoke truncate on table "public"."esign_envelopes" from "anon";
revoke update on table "public"."esign_envelopes" from "anon";
revoke delete on table "public"."esign_envelopes" from "authenticated";
revoke insert on table "public"."esign_envelopes" from "authenticated";
revoke references on table "public"."esign_envelopes" from "authenticated";
revoke select on table "public"."esign_envelopes" from "authenticated";
revoke trigger on table "public"."esign_envelopes" from "authenticated";
revoke truncate on table "public"."esign_envelopes" from "authenticated";
revoke update on table "public"."esign_envelopes" from "authenticated";
revoke delete on table "public"."esign_envelopes" from "service_role";
revoke insert on table "public"."esign_envelopes" from "service_role";
revoke references on table "public"."esign_envelopes" from "service_role";
revoke select on table "public"."esign_envelopes" from "service_role";
revoke trigger on table "public"."esign_envelopes" from "service_role";
revoke truncate on table "public"."esign_envelopes" from "service_role";
revoke update on table "public"."esign_envelopes" from "service_role";
revoke delete on table "public"."fee_components" from "anon";
revoke insert on table "public"."fee_components" from "anon";
revoke references on table "public"."fee_components" from "anon";
revoke select on table "public"."fee_components" from "anon";
revoke trigger on table "public"."fee_components" from "anon";
revoke truncate on table "public"."fee_components" from "anon";
revoke update on table "public"."fee_components" from "anon";
revoke delete on table "public"."fee_components" from "authenticated";
revoke insert on table "public"."fee_components" from "authenticated";
revoke references on table "public"."fee_components" from "authenticated";
revoke select on table "public"."fee_components" from "authenticated";
revoke trigger on table "public"."fee_components" from "authenticated";
revoke truncate on table "public"."fee_components" from "authenticated";
revoke update on table "public"."fee_components" from "authenticated";
revoke delete on table "public"."fee_components" from "service_role";
revoke insert on table "public"."fee_components" from "service_role";
revoke references on table "public"."fee_components" from "service_role";
revoke select on table "public"."fee_components" from "service_role";
revoke trigger on table "public"."fee_components" from "service_role";
revoke truncate on table "public"."fee_components" from "service_role";
revoke update on table "public"."fee_components" from "service_role";
revoke delete on table "public"."fee_events" from "anon";
revoke insert on table "public"."fee_events" from "anon";
revoke references on table "public"."fee_events" from "anon";
revoke select on table "public"."fee_events" from "anon";
revoke trigger on table "public"."fee_events" from "anon";
revoke truncate on table "public"."fee_events" from "anon";
revoke update on table "public"."fee_events" from "anon";
revoke delete on table "public"."fee_events" from "authenticated";
revoke insert on table "public"."fee_events" from "authenticated";
revoke references on table "public"."fee_events" from "authenticated";
revoke select on table "public"."fee_events" from "authenticated";
revoke trigger on table "public"."fee_events" from "authenticated";
revoke truncate on table "public"."fee_events" from "authenticated";
revoke update on table "public"."fee_events" from "authenticated";
revoke delete on table "public"."fee_events" from "service_role";
revoke insert on table "public"."fee_events" from "service_role";
revoke references on table "public"."fee_events" from "service_role";
revoke select on table "public"."fee_events" from "service_role";
revoke trigger on table "public"."fee_events" from "service_role";
revoke truncate on table "public"."fee_events" from "service_role";
revoke update on table "public"."fee_events" from "service_role";
revoke delete on table "public"."fee_plans" from "anon";
revoke insert on table "public"."fee_plans" from "anon";
revoke references on table "public"."fee_plans" from "anon";
revoke select on table "public"."fee_plans" from "anon";
revoke trigger on table "public"."fee_plans" from "anon";
revoke truncate on table "public"."fee_plans" from "anon";
revoke update on table "public"."fee_plans" from "anon";
revoke delete on table "public"."fee_plans" from "authenticated";
revoke insert on table "public"."fee_plans" from "authenticated";
revoke references on table "public"."fee_plans" from "authenticated";
revoke select on table "public"."fee_plans" from "authenticated";
revoke trigger on table "public"."fee_plans" from "authenticated";
revoke truncate on table "public"."fee_plans" from "authenticated";
revoke update on table "public"."fee_plans" from "authenticated";
revoke delete on table "public"."fee_plans" from "service_role";
revoke insert on table "public"."fee_plans" from "service_role";
revoke references on table "public"."fee_plans" from "service_role";
revoke select on table "public"."fee_plans" from "service_role";
revoke trigger on table "public"."fee_plans" from "service_role";
revoke truncate on table "public"."fee_plans" from "service_role";
revoke update on table "public"."fee_plans" from "service_role";
revoke delete on table "public"."import_batches" from "anon";
revoke insert on table "public"."import_batches" from "anon";
revoke references on table "public"."import_batches" from "anon";
revoke select on table "public"."import_batches" from "anon";
revoke trigger on table "public"."import_batches" from "anon";
revoke truncate on table "public"."import_batches" from "anon";
revoke update on table "public"."import_batches" from "anon";
revoke delete on table "public"."import_batches" from "authenticated";
revoke insert on table "public"."import_batches" from "authenticated";
revoke references on table "public"."import_batches" from "authenticated";
revoke select on table "public"."import_batches" from "authenticated";
revoke trigger on table "public"."import_batches" from "authenticated";
revoke truncate on table "public"."import_batches" from "authenticated";
revoke update on table "public"."import_batches" from "authenticated";
revoke delete on table "public"."import_batches" from "service_role";
revoke insert on table "public"."import_batches" from "service_role";
revoke references on table "public"."import_batches" from "service_role";
revoke select on table "public"."import_batches" from "service_role";
revoke trigger on table "public"."import_batches" from "service_role";
revoke truncate on table "public"."import_batches" from "service_role";
revoke update on table "public"."import_batches" from "service_role";
revoke delete on table "public"."introducer_commissions" from "anon";
revoke insert on table "public"."introducer_commissions" from "anon";
revoke references on table "public"."introducer_commissions" from "anon";
revoke select on table "public"."introducer_commissions" from "anon";
revoke trigger on table "public"."introducer_commissions" from "anon";
revoke truncate on table "public"."introducer_commissions" from "anon";
revoke update on table "public"."introducer_commissions" from "anon";
revoke delete on table "public"."introducer_commissions" from "authenticated";
revoke insert on table "public"."introducer_commissions" from "authenticated";
revoke references on table "public"."introducer_commissions" from "authenticated";
revoke select on table "public"."introducer_commissions" from "authenticated";
revoke trigger on table "public"."introducer_commissions" from "authenticated";
revoke truncate on table "public"."introducer_commissions" from "authenticated";
revoke update on table "public"."introducer_commissions" from "authenticated";
revoke delete on table "public"."introducer_commissions" from "service_role";
revoke insert on table "public"."introducer_commissions" from "service_role";
revoke references on table "public"."introducer_commissions" from "service_role";
revoke select on table "public"."introducer_commissions" from "service_role";
revoke trigger on table "public"."introducer_commissions" from "service_role";
revoke truncate on table "public"."introducer_commissions" from "service_role";
revoke update on table "public"."introducer_commissions" from "service_role";
revoke delete on table "public"."introducers" from "anon";
revoke insert on table "public"."introducers" from "anon";
revoke references on table "public"."introducers" from "anon";
revoke select on table "public"."introducers" from "anon";
revoke trigger on table "public"."introducers" from "anon";
revoke truncate on table "public"."introducers" from "anon";
revoke update on table "public"."introducers" from "anon";
revoke delete on table "public"."introducers" from "authenticated";
revoke insert on table "public"."introducers" from "authenticated";
revoke references on table "public"."introducers" from "authenticated";
revoke select on table "public"."introducers" from "authenticated";
revoke trigger on table "public"."introducers" from "authenticated";
revoke truncate on table "public"."introducers" from "authenticated";
revoke update on table "public"."introducers" from "authenticated";
revoke delete on table "public"."introducers" from "service_role";
revoke insert on table "public"."introducers" from "service_role";
revoke references on table "public"."introducers" from "service_role";
revoke select on table "public"."introducers" from "service_role";
revoke trigger on table "public"."introducers" from "service_role";
revoke truncate on table "public"."introducers" from "service_role";
revoke update on table "public"."introducers" from "service_role";
revoke delete on table "public"."introductions" from "anon";
revoke insert on table "public"."introductions" from "anon";
revoke references on table "public"."introductions" from "anon";
revoke select on table "public"."introductions" from "anon";
revoke trigger on table "public"."introductions" from "anon";
revoke truncate on table "public"."introductions" from "anon";
revoke update on table "public"."introductions" from "anon";
revoke delete on table "public"."introductions" from "authenticated";
revoke insert on table "public"."introductions" from "authenticated";
revoke references on table "public"."introductions" from "authenticated";
revoke select on table "public"."introductions" from "authenticated";
revoke trigger on table "public"."introductions" from "authenticated";
revoke truncate on table "public"."introductions" from "authenticated";
revoke update on table "public"."introductions" from "authenticated";
revoke delete on table "public"."introductions" from "service_role";
revoke insert on table "public"."introductions" from "service_role";
revoke references on table "public"."introductions" from "service_role";
revoke select on table "public"."introductions" from "service_role";
revoke trigger on table "public"."introductions" from "service_role";
revoke truncate on table "public"."introductions" from "service_role";
revoke update on table "public"."introductions" from "service_role";
revoke delete on table "public"."investor_terms" from "anon";
revoke insert on table "public"."investor_terms" from "anon";
revoke references on table "public"."investor_terms" from "anon";
revoke select on table "public"."investor_terms" from "anon";
revoke trigger on table "public"."investor_terms" from "anon";
revoke truncate on table "public"."investor_terms" from "anon";
revoke update on table "public"."investor_terms" from "anon";
revoke delete on table "public"."investor_terms" from "authenticated";
revoke insert on table "public"."investor_terms" from "authenticated";
revoke references on table "public"."investor_terms" from "authenticated";
revoke select on table "public"."investor_terms" from "authenticated";
revoke trigger on table "public"."investor_terms" from "authenticated";
revoke truncate on table "public"."investor_terms" from "authenticated";
revoke update on table "public"."investor_terms" from "authenticated";
revoke delete on table "public"."investor_terms" from "service_role";
revoke insert on table "public"."investor_terms" from "service_role";
revoke references on table "public"."investor_terms" from "service_role";
revoke select on table "public"."investor_terms" from "service_role";
revoke trigger on table "public"."investor_terms" from "service_role";
revoke truncate on table "public"."investor_terms" from "service_role";
revoke update on table "public"."investor_terms" from "service_role";
revoke delete on table "public"."investor_users" from "anon";
revoke insert on table "public"."investor_users" from "anon";
revoke references on table "public"."investor_users" from "anon";
revoke select on table "public"."investor_users" from "anon";
revoke trigger on table "public"."investor_users" from "anon";
revoke truncate on table "public"."investor_users" from "anon";
revoke update on table "public"."investor_users" from "anon";
revoke delete on table "public"."investor_users" from "authenticated";
revoke insert on table "public"."investor_users" from "authenticated";
revoke references on table "public"."investor_users" from "authenticated";
revoke select on table "public"."investor_users" from "authenticated";
revoke trigger on table "public"."investor_users" from "authenticated";
revoke truncate on table "public"."investor_users" from "authenticated";
revoke update on table "public"."investor_users" from "authenticated";
revoke delete on table "public"."investor_users" from "service_role";
revoke insert on table "public"."investor_users" from "service_role";
revoke references on table "public"."investor_users" from "service_role";
revoke select on table "public"."investor_users" from "service_role";
revoke trigger on table "public"."investor_users" from "service_role";
revoke truncate on table "public"."investor_users" from "service_role";
revoke update on table "public"."investor_users" from "service_role";
revoke delete on table "public"."investors" from "anon";
revoke insert on table "public"."investors" from "anon";
revoke references on table "public"."investors" from "anon";
revoke select on table "public"."investors" from "anon";
revoke trigger on table "public"."investors" from "anon";
revoke truncate on table "public"."investors" from "anon";
revoke update on table "public"."investors" from "anon";
revoke delete on table "public"."investors" from "authenticated";
revoke insert on table "public"."investors" from "authenticated";
revoke references on table "public"."investors" from "authenticated";
revoke select on table "public"."investors" from "authenticated";
revoke trigger on table "public"."investors" from "authenticated";
revoke truncate on table "public"."investors" from "authenticated";
revoke update on table "public"."investors" from "authenticated";
revoke delete on table "public"."investors" from "service_role";
revoke insert on table "public"."investors" from "service_role";
revoke references on table "public"."investors" from "service_role";
revoke select on table "public"."investors" from "service_role";
revoke trigger on table "public"."investors" from "service_role";
revoke truncate on table "public"."investors" from "service_role";
revoke update on table "public"."investors" from "service_role";
revoke delete on table "public"."invite_links" from "anon";
revoke insert on table "public"."invite_links" from "anon";
revoke references on table "public"."invite_links" from "anon";
revoke select on table "public"."invite_links" from "anon";
revoke trigger on table "public"."invite_links" from "anon";
revoke truncate on table "public"."invite_links" from "anon";
revoke update on table "public"."invite_links" from "anon";
revoke delete on table "public"."invite_links" from "authenticated";
revoke insert on table "public"."invite_links" from "authenticated";
revoke references on table "public"."invite_links" from "authenticated";
revoke select on table "public"."invite_links" from "authenticated";
revoke trigger on table "public"."invite_links" from "authenticated";
revoke truncate on table "public"."invite_links" from "authenticated";
revoke update on table "public"."invite_links" from "authenticated";
revoke delete on table "public"."invite_links" from "service_role";
revoke insert on table "public"."invite_links" from "service_role";
revoke references on table "public"."invite_links" from "service_role";
revoke select on table "public"."invite_links" from "service_role";
revoke trigger on table "public"."invite_links" from "service_role";
revoke truncate on table "public"."invite_links" from "service_role";
revoke update on table "public"."invite_links" from "service_role";
revoke delete on table "public"."invoice_lines" from "anon";
revoke insert on table "public"."invoice_lines" from "anon";
revoke references on table "public"."invoice_lines" from "anon";
revoke select on table "public"."invoice_lines" from "anon";
revoke trigger on table "public"."invoice_lines" from "anon";
revoke truncate on table "public"."invoice_lines" from "anon";
revoke update on table "public"."invoice_lines" from "anon";
revoke delete on table "public"."invoice_lines" from "authenticated";
revoke insert on table "public"."invoice_lines" from "authenticated";
revoke references on table "public"."invoice_lines" from "authenticated";
revoke select on table "public"."invoice_lines" from "authenticated";
revoke trigger on table "public"."invoice_lines" from "authenticated";
revoke truncate on table "public"."invoice_lines" from "authenticated";
revoke update on table "public"."invoice_lines" from "authenticated";
revoke delete on table "public"."invoice_lines" from "service_role";
revoke insert on table "public"."invoice_lines" from "service_role";
revoke references on table "public"."invoice_lines" from "service_role";
revoke select on table "public"."invoice_lines" from "service_role";
revoke trigger on table "public"."invoice_lines" from "service_role";
revoke truncate on table "public"."invoice_lines" from "service_role";
revoke update on table "public"."invoice_lines" from "service_role";
revoke delete on table "public"."invoices" from "anon";
revoke insert on table "public"."invoices" from "anon";
revoke references on table "public"."invoices" from "anon";
revoke select on table "public"."invoices" from "anon";
revoke trigger on table "public"."invoices" from "anon";
revoke truncate on table "public"."invoices" from "anon";
revoke update on table "public"."invoices" from "anon";
revoke delete on table "public"."invoices" from "authenticated";
revoke insert on table "public"."invoices" from "authenticated";
revoke references on table "public"."invoices" from "authenticated";
revoke select on table "public"."invoices" from "authenticated";
revoke trigger on table "public"."invoices" from "authenticated";
revoke truncate on table "public"."invoices" from "authenticated";
revoke update on table "public"."invoices" from "authenticated";
revoke delete on table "public"."invoices" from "service_role";
revoke insert on table "public"."invoices" from "service_role";
revoke references on table "public"."invoices" from "service_role";
revoke select on table "public"."invoices" from "service_role";
revoke trigger on table "public"."invoices" from "service_role";
revoke truncate on table "public"."invoices" from "service_role";
revoke update on table "public"."invoices" from "service_role";
revoke delete on table "public"."message_reads" from "anon";
revoke insert on table "public"."message_reads" from "anon";
revoke references on table "public"."message_reads" from "anon";
revoke select on table "public"."message_reads" from "anon";
revoke trigger on table "public"."message_reads" from "anon";
revoke truncate on table "public"."message_reads" from "anon";
revoke update on table "public"."message_reads" from "anon";
revoke delete on table "public"."message_reads" from "authenticated";
revoke insert on table "public"."message_reads" from "authenticated";
revoke references on table "public"."message_reads" from "authenticated";
revoke select on table "public"."message_reads" from "authenticated";
revoke trigger on table "public"."message_reads" from "authenticated";
revoke truncate on table "public"."message_reads" from "authenticated";
revoke update on table "public"."message_reads" from "authenticated";
revoke delete on table "public"."message_reads" from "service_role";
revoke insert on table "public"."message_reads" from "service_role";
revoke references on table "public"."message_reads" from "service_role";
revoke select on table "public"."message_reads" from "service_role";
revoke trigger on table "public"."message_reads" from "service_role";
revoke truncate on table "public"."message_reads" from "service_role";
revoke update on table "public"."message_reads" from "service_role";
revoke delete on table "public"."messages" from "anon";
revoke insert on table "public"."messages" from "anon";
revoke references on table "public"."messages" from "anon";
revoke select on table "public"."messages" from "anon";
revoke trigger on table "public"."messages" from "anon";
revoke truncate on table "public"."messages" from "anon";
revoke update on table "public"."messages" from "anon";
revoke delete on table "public"."messages" from "authenticated";
revoke insert on table "public"."messages" from "authenticated";
revoke references on table "public"."messages" from "authenticated";
revoke select on table "public"."messages" from "authenticated";
revoke trigger on table "public"."messages" from "authenticated";
revoke truncate on table "public"."messages" from "authenticated";
revoke update on table "public"."messages" from "authenticated";
revoke delete on table "public"."messages" from "service_role";
revoke insert on table "public"."messages" from "service_role";
revoke references on table "public"."messages" from "service_role";
revoke select on table "public"."messages" from "service_role";
revoke trigger on table "public"."messages" from "service_role";
revoke truncate on table "public"."messages" from "service_role";
revoke update on table "public"."messages" from "service_role";
revoke delete on table "public"."payments" from "anon";
revoke insert on table "public"."payments" from "anon";
revoke references on table "public"."payments" from "anon";
revoke select on table "public"."payments" from "anon";
revoke trigger on table "public"."payments" from "anon";
revoke truncate on table "public"."payments" from "anon";
revoke update on table "public"."payments" from "anon";
revoke delete on table "public"."payments" from "authenticated";
revoke insert on table "public"."payments" from "authenticated";
revoke references on table "public"."payments" from "authenticated";
revoke select on table "public"."payments" from "authenticated";
revoke trigger on table "public"."payments" from "authenticated";
revoke truncate on table "public"."payments" from "authenticated";
revoke update on table "public"."payments" from "authenticated";
revoke delete on table "public"."payments" from "service_role";
revoke insert on table "public"."payments" from "service_role";
revoke references on table "public"."payments" from "service_role";
revoke select on table "public"."payments" from "service_role";
revoke trigger on table "public"."payments" from "service_role";
revoke truncate on table "public"."payments" from "service_role";
revoke update on table "public"."payments" from "service_role";
revoke delete on table "public"."performance_snapshots" from "anon";
revoke insert on table "public"."performance_snapshots" from "anon";
revoke references on table "public"."performance_snapshots" from "anon";
revoke select on table "public"."performance_snapshots" from "anon";
revoke trigger on table "public"."performance_snapshots" from "anon";
revoke truncate on table "public"."performance_snapshots" from "anon";
revoke update on table "public"."performance_snapshots" from "anon";
revoke delete on table "public"."performance_snapshots" from "authenticated";
revoke insert on table "public"."performance_snapshots" from "authenticated";
revoke references on table "public"."performance_snapshots" from "authenticated";
revoke select on table "public"."performance_snapshots" from "authenticated";
revoke trigger on table "public"."performance_snapshots" from "authenticated";
revoke truncate on table "public"."performance_snapshots" from "authenticated";
revoke update on table "public"."performance_snapshots" from "authenticated";
revoke delete on table "public"."performance_snapshots" from "service_role";
revoke insert on table "public"."performance_snapshots" from "service_role";
revoke references on table "public"."performance_snapshots" from "service_role";
revoke select on table "public"."performance_snapshots" from "service_role";
revoke trigger on table "public"."performance_snapshots" from "service_role";
revoke truncate on table "public"."performance_snapshots" from "service_role";
revoke update on table "public"."performance_snapshots" from "service_role";
revoke delete on table "public"."positions" from "anon";
revoke insert on table "public"."positions" from "anon";
revoke references on table "public"."positions" from "anon";
revoke select on table "public"."positions" from "anon";
revoke trigger on table "public"."positions" from "anon";
revoke truncate on table "public"."positions" from "anon";
revoke update on table "public"."positions" from "anon";
revoke delete on table "public"."positions" from "authenticated";
revoke insert on table "public"."positions" from "authenticated";
revoke references on table "public"."positions" from "authenticated";
revoke select on table "public"."positions" from "authenticated";
revoke trigger on table "public"."positions" from "authenticated";
revoke truncate on table "public"."positions" from "authenticated";
revoke update on table "public"."positions" from "authenticated";
revoke delete on table "public"."positions" from "service_role";
revoke insert on table "public"."positions" from "service_role";
revoke references on table "public"."positions" from "service_role";
revoke select on table "public"."positions" from "service_role";
revoke trigger on table "public"."positions" from "service_role";
revoke truncate on table "public"."positions" from "service_role";
revoke update on table "public"."positions" from "service_role";
revoke delete on table "public"."profiles" from "anon";
revoke insert on table "public"."profiles" from "anon";
revoke references on table "public"."profiles" from "anon";
revoke select on table "public"."profiles" from "anon";
revoke trigger on table "public"."profiles" from "anon";
revoke truncate on table "public"."profiles" from "anon";
revoke update on table "public"."profiles" from "anon";
revoke delete on table "public"."profiles" from "authenticated";
revoke insert on table "public"."profiles" from "authenticated";
revoke references on table "public"."profiles" from "authenticated";
revoke select on table "public"."profiles" from "authenticated";
revoke trigger on table "public"."profiles" from "authenticated";
revoke truncate on table "public"."profiles" from "authenticated";
revoke update on table "public"."profiles" from "authenticated";
revoke delete on table "public"."profiles" from "service_role";
revoke insert on table "public"."profiles" from "service_role";
revoke references on table "public"."profiles" from "service_role";
revoke select on table "public"."profiles" from "service_role";
revoke trigger on table "public"."profiles" from "service_role";
revoke truncate on table "public"."profiles" from "service_role";
revoke update on table "public"."profiles" from "service_role";
revoke delete on table "public"."reconciliation_matches" from "anon";
revoke insert on table "public"."reconciliation_matches" from "anon";
revoke references on table "public"."reconciliation_matches" from "anon";
revoke select on table "public"."reconciliation_matches" from "anon";
revoke trigger on table "public"."reconciliation_matches" from "anon";
revoke truncate on table "public"."reconciliation_matches" from "anon";
revoke update on table "public"."reconciliation_matches" from "anon";
revoke delete on table "public"."reconciliation_matches" from "authenticated";
revoke insert on table "public"."reconciliation_matches" from "authenticated";
revoke references on table "public"."reconciliation_matches" from "authenticated";
revoke select on table "public"."reconciliation_matches" from "authenticated";
revoke trigger on table "public"."reconciliation_matches" from "authenticated";
revoke truncate on table "public"."reconciliation_matches" from "authenticated";
revoke update on table "public"."reconciliation_matches" from "authenticated";
revoke delete on table "public"."reconciliation_matches" from "service_role";
revoke insert on table "public"."reconciliation_matches" from "service_role";
revoke references on table "public"."reconciliation_matches" from "service_role";
revoke select on table "public"."reconciliation_matches" from "service_role";
revoke trigger on table "public"."reconciliation_matches" from "service_role";
revoke truncate on table "public"."reconciliation_matches" from "service_role";
revoke update on table "public"."reconciliation_matches" from "service_role";
revoke delete on table "public"."reconciliations" from "anon";
revoke insert on table "public"."reconciliations" from "anon";
revoke references on table "public"."reconciliations" from "anon";
revoke select on table "public"."reconciliations" from "anon";
revoke trigger on table "public"."reconciliations" from "anon";
revoke truncate on table "public"."reconciliations" from "anon";
revoke update on table "public"."reconciliations" from "anon";
revoke delete on table "public"."reconciliations" from "authenticated";
revoke insert on table "public"."reconciliations" from "authenticated";
revoke references on table "public"."reconciliations" from "authenticated";
revoke select on table "public"."reconciliations" from "authenticated";
revoke trigger on table "public"."reconciliations" from "authenticated";
revoke truncate on table "public"."reconciliations" from "authenticated";
revoke update on table "public"."reconciliations" from "authenticated";
revoke delete on table "public"."reconciliations" from "service_role";
revoke insert on table "public"."reconciliations" from "service_role";
revoke references on table "public"."reconciliations" from "service_role";
revoke select on table "public"."reconciliations" from "service_role";
revoke trigger on table "public"."reconciliations" from "service_role";
revoke truncate on table "public"."reconciliations" from "service_role";
revoke update on table "public"."reconciliations" from "service_role";
revoke delete on table "public"."report_requests" from "anon";
revoke insert on table "public"."report_requests" from "anon";
revoke references on table "public"."report_requests" from "anon";
revoke select on table "public"."report_requests" from "anon";
revoke trigger on table "public"."report_requests" from "anon";
revoke truncate on table "public"."report_requests" from "anon";
revoke update on table "public"."report_requests" from "anon";
revoke delete on table "public"."report_requests" from "authenticated";
revoke insert on table "public"."report_requests" from "authenticated";
revoke references on table "public"."report_requests" from "authenticated";
revoke select on table "public"."report_requests" from "authenticated";
revoke trigger on table "public"."report_requests" from "authenticated";
revoke truncate on table "public"."report_requests" from "authenticated";
revoke update on table "public"."report_requests" from "authenticated";
revoke delete on table "public"."report_requests" from "service_role";
revoke insert on table "public"."report_requests" from "service_role";
revoke references on table "public"."report_requests" from "service_role";
revoke select on table "public"."report_requests" from "service_role";
revoke trigger on table "public"."report_requests" from "service_role";
revoke truncate on table "public"."report_requests" from "service_role";
revoke update on table "public"."report_requests" from "service_role";
revoke delete on table "public"."request_tickets" from "anon";
revoke insert on table "public"."request_tickets" from "anon";
revoke references on table "public"."request_tickets" from "anon";
revoke select on table "public"."request_tickets" from "anon";
revoke trigger on table "public"."request_tickets" from "anon";
revoke truncate on table "public"."request_tickets" from "anon";
revoke update on table "public"."request_tickets" from "anon";
revoke delete on table "public"."request_tickets" from "authenticated";
revoke insert on table "public"."request_tickets" from "authenticated";
revoke references on table "public"."request_tickets" from "authenticated";
revoke select on table "public"."request_tickets" from "authenticated";
revoke trigger on table "public"."request_tickets" from "authenticated";
revoke truncate on table "public"."request_tickets" from "authenticated";
revoke update on table "public"."request_tickets" from "authenticated";
revoke delete on table "public"."request_tickets" from "service_role";
revoke insert on table "public"."request_tickets" from "service_role";
revoke references on table "public"."request_tickets" from "service_role";
revoke select on table "public"."request_tickets" from "service_role";
revoke trigger on table "public"."request_tickets" from "service_role";
revoke truncate on table "public"."request_tickets" from "service_role";
revoke update on table "public"."request_tickets" from "service_role";
revoke delete on table "public"."reservation_lot_items" from "anon";
revoke insert on table "public"."reservation_lot_items" from "anon";
revoke references on table "public"."reservation_lot_items" from "anon";
revoke select on table "public"."reservation_lot_items" from "anon";
revoke trigger on table "public"."reservation_lot_items" from "anon";
revoke truncate on table "public"."reservation_lot_items" from "anon";
revoke update on table "public"."reservation_lot_items" from "anon";
revoke delete on table "public"."reservation_lot_items" from "authenticated";
revoke insert on table "public"."reservation_lot_items" from "authenticated";
revoke references on table "public"."reservation_lot_items" from "authenticated";
revoke select on table "public"."reservation_lot_items" from "authenticated";
revoke trigger on table "public"."reservation_lot_items" from "authenticated";
revoke truncate on table "public"."reservation_lot_items" from "authenticated";
revoke update on table "public"."reservation_lot_items" from "authenticated";
revoke delete on table "public"."reservation_lot_items" from "service_role";
revoke insert on table "public"."reservation_lot_items" from "service_role";
revoke references on table "public"."reservation_lot_items" from "service_role";
revoke select on table "public"."reservation_lot_items" from "service_role";
revoke trigger on table "public"."reservation_lot_items" from "service_role";
revoke truncate on table "public"."reservation_lot_items" from "service_role";
revoke update on table "public"."reservation_lot_items" from "service_role";
revoke delete on table "public"."reservations" from "anon";
revoke insert on table "public"."reservations" from "anon";
revoke references on table "public"."reservations" from "anon";
revoke select on table "public"."reservations" from "anon";
revoke trigger on table "public"."reservations" from "anon";
revoke truncate on table "public"."reservations" from "anon";
revoke update on table "public"."reservations" from "anon";
revoke delete on table "public"."reservations" from "authenticated";
revoke insert on table "public"."reservations" from "authenticated";
revoke references on table "public"."reservations" from "authenticated";
revoke select on table "public"."reservations" from "authenticated";
revoke trigger on table "public"."reservations" from "authenticated";
revoke truncate on table "public"."reservations" from "authenticated";
revoke update on table "public"."reservations" from "authenticated";
revoke delete on table "public"."reservations" from "service_role";
revoke insert on table "public"."reservations" from "service_role";
revoke references on table "public"."reservations" from "service_role";
revoke select on table "public"."reservations" from "service_role";
revoke trigger on table "public"."reservations" from "service_role";
revoke truncate on table "public"."reservations" from "service_role";
revoke update on table "public"."reservations" from "service_role";
revoke delete on table "public"."share_lots" from "anon";
revoke insert on table "public"."share_lots" from "anon";
revoke references on table "public"."share_lots" from "anon";
revoke select on table "public"."share_lots" from "anon";
revoke trigger on table "public"."share_lots" from "anon";
revoke truncate on table "public"."share_lots" from "anon";
revoke update on table "public"."share_lots" from "anon";
revoke delete on table "public"."share_lots" from "authenticated";
revoke insert on table "public"."share_lots" from "authenticated";
revoke references on table "public"."share_lots" from "authenticated";
revoke select on table "public"."share_lots" from "authenticated";
revoke trigger on table "public"."share_lots" from "authenticated";
revoke truncate on table "public"."share_lots" from "authenticated";
revoke update on table "public"."share_lots" from "authenticated";
revoke delete on table "public"."share_lots" from "service_role";
revoke insert on table "public"."share_lots" from "service_role";
revoke references on table "public"."share_lots" from "service_role";
revoke select on table "public"."share_lots" from "service_role";
revoke trigger on table "public"."share_lots" from "service_role";
revoke truncate on table "public"."share_lots" from "service_role";
revoke update on table "public"."share_lots" from "service_role";
revoke delete on table "public"."share_sources" from "anon";
revoke insert on table "public"."share_sources" from "anon";
revoke references on table "public"."share_sources" from "anon";
revoke select on table "public"."share_sources" from "anon";
revoke trigger on table "public"."share_sources" from "anon";
revoke truncate on table "public"."share_sources" from "anon";
revoke update on table "public"."share_sources" from "anon";
revoke delete on table "public"."share_sources" from "authenticated";
revoke insert on table "public"."share_sources" from "authenticated";
revoke references on table "public"."share_sources" from "authenticated";
revoke select on table "public"."share_sources" from "authenticated";
revoke trigger on table "public"."share_sources" from "authenticated";
revoke truncate on table "public"."share_sources" from "authenticated";
revoke update on table "public"."share_sources" from "authenticated";
revoke delete on table "public"."share_sources" from "service_role";
revoke insert on table "public"."share_sources" from "service_role";
revoke references on table "public"."share_sources" from "service_role";
revoke select on table "public"."share_sources" from "service_role";
revoke trigger on table "public"."share_sources" from "service_role";
revoke truncate on table "public"."share_sources" from "service_role";
revoke update on table "public"."share_sources" from "service_role";
revoke delete on table "public"."subscriptions" from "anon";
revoke insert on table "public"."subscriptions" from "anon";
revoke references on table "public"."subscriptions" from "anon";
revoke select on table "public"."subscriptions" from "anon";
revoke trigger on table "public"."subscriptions" from "anon";
revoke truncate on table "public"."subscriptions" from "anon";
revoke update on table "public"."subscriptions" from "anon";
revoke delete on table "public"."subscriptions" from "authenticated";
revoke insert on table "public"."subscriptions" from "authenticated";
revoke references on table "public"."subscriptions" from "authenticated";
revoke select on table "public"."subscriptions" from "authenticated";
revoke trigger on table "public"."subscriptions" from "authenticated";
revoke truncate on table "public"."subscriptions" from "authenticated";
revoke update on table "public"."subscriptions" from "authenticated";
revoke delete on table "public"."subscriptions" from "service_role";
revoke insert on table "public"."subscriptions" from "service_role";
revoke references on table "public"."subscriptions" from "service_role";
revoke select on table "public"."subscriptions" from "service_role";
revoke trigger on table "public"."subscriptions" from "service_role";
revoke truncate on table "public"."subscriptions" from "service_role";
revoke update on table "public"."subscriptions" from "service_role";
revoke delete on table "public"."suggested_matches" from "anon";
revoke insert on table "public"."suggested_matches" from "anon";
revoke references on table "public"."suggested_matches" from "anon";
revoke select on table "public"."suggested_matches" from "anon";
revoke trigger on table "public"."suggested_matches" from "anon";
revoke truncate on table "public"."suggested_matches" from "anon";
revoke update on table "public"."suggested_matches" from "anon";
revoke delete on table "public"."suggested_matches" from "authenticated";
revoke insert on table "public"."suggested_matches" from "authenticated";
revoke references on table "public"."suggested_matches" from "authenticated";
revoke select on table "public"."suggested_matches" from "authenticated";
revoke trigger on table "public"."suggested_matches" from "authenticated";
revoke truncate on table "public"."suggested_matches" from "authenticated";
revoke update on table "public"."suggested_matches" from "authenticated";
revoke delete on table "public"."suggested_matches" from "service_role";
revoke insert on table "public"."suggested_matches" from "service_role";
revoke references on table "public"."suggested_matches" from "service_role";
revoke select on table "public"."suggested_matches" from "service_role";
revoke trigger on table "public"."suggested_matches" from "service_role";
revoke truncate on table "public"."suggested_matches" from "service_role";
revoke update on table "public"."suggested_matches" from "service_role";
revoke delete on table "public"."task_actions" from "anon";
revoke insert on table "public"."task_actions" from "anon";
revoke references on table "public"."task_actions" from "anon";
revoke select on table "public"."task_actions" from "anon";
revoke trigger on table "public"."task_actions" from "anon";
revoke truncate on table "public"."task_actions" from "anon";
revoke update on table "public"."task_actions" from "anon";
revoke delete on table "public"."task_actions" from "authenticated";
revoke insert on table "public"."task_actions" from "authenticated";
revoke references on table "public"."task_actions" from "authenticated";
revoke select on table "public"."task_actions" from "authenticated";
revoke trigger on table "public"."task_actions" from "authenticated";
revoke truncate on table "public"."task_actions" from "authenticated";
revoke update on table "public"."task_actions" from "authenticated";
revoke delete on table "public"."task_actions" from "service_role";
revoke insert on table "public"."task_actions" from "service_role";
revoke references on table "public"."task_actions" from "service_role";
revoke select on table "public"."task_actions" from "service_role";
revoke trigger on table "public"."task_actions" from "service_role";
revoke truncate on table "public"."task_actions" from "service_role";
revoke update on table "public"."task_actions" from "service_role";
revoke delete on table "public"."task_dependencies" from "anon";
revoke insert on table "public"."task_dependencies" from "anon";
revoke references on table "public"."task_dependencies" from "anon";
revoke select on table "public"."task_dependencies" from "anon";
revoke trigger on table "public"."task_dependencies" from "anon";
revoke truncate on table "public"."task_dependencies" from "anon";
revoke update on table "public"."task_dependencies" from "anon";
revoke delete on table "public"."task_dependencies" from "authenticated";
revoke insert on table "public"."task_dependencies" from "authenticated";
revoke references on table "public"."task_dependencies" from "authenticated";
revoke select on table "public"."task_dependencies" from "authenticated";
revoke trigger on table "public"."task_dependencies" from "authenticated";
revoke truncate on table "public"."task_dependencies" from "authenticated";
revoke update on table "public"."task_dependencies" from "authenticated";
revoke delete on table "public"."task_dependencies" from "service_role";
revoke insert on table "public"."task_dependencies" from "service_role";
revoke references on table "public"."task_dependencies" from "service_role";
revoke select on table "public"."task_dependencies" from "service_role";
revoke trigger on table "public"."task_dependencies" from "service_role";
revoke truncate on table "public"."task_dependencies" from "service_role";
revoke update on table "public"."task_dependencies" from "service_role";
revoke delete on table "public"."task_templates" from "anon";
revoke insert on table "public"."task_templates" from "anon";
revoke references on table "public"."task_templates" from "anon";
revoke select on table "public"."task_templates" from "anon";
revoke trigger on table "public"."task_templates" from "anon";
revoke truncate on table "public"."task_templates" from "anon";
revoke update on table "public"."task_templates" from "anon";
revoke delete on table "public"."task_templates" from "authenticated";
revoke insert on table "public"."task_templates" from "authenticated";
revoke references on table "public"."task_templates" from "authenticated";
revoke select on table "public"."task_templates" from "authenticated";
revoke trigger on table "public"."task_templates" from "authenticated";
revoke truncate on table "public"."task_templates" from "authenticated";
revoke update on table "public"."task_templates" from "authenticated";
revoke delete on table "public"."task_templates" from "service_role";
revoke insert on table "public"."task_templates" from "service_role";
revoke references on table "public"."task_templates" from "service_role";
revoke select on table "public"."task_templates" from "service_role";
revoke trigger on table "public"."task_templates" from "service_role";
revoke truncate on table "public"."task_templates" from "service_role";
revoke update on table "public"."task_templates" from "service_role";
revoke delete on table "public"."tasks" from "anon";
revoke insert on table "public"."tasks" from "anon";
revoke references on table "public"."tasks" from "anon";
revoke select on table "public"."tasks" from "anon";
revoke trigger on table "public"."tasks" from "anon";
revoke truncate on table "public"."tasks" from "anon";
revoke update on table "public"."tasks" from "anon";
revoke delete on table "public"."tasks" from "authenticated";
revoke insert on table "public"."tasks" from "authenticated";
revoke references on table "public"."tasks" from "authenticated";
revoke select on table "public"."tasks" from "authenticated";
revoke trigger on table "public"."tasks" from "authenticated";
revoke truncate on table "public"."tasks" from "authenticated";
revoke update on table "public"."tasks" from "authenticated";
revoke delete on table "public"."tasks" from "service_role";
revoke insert on table "public"."tasks" from "service_role";
revoke references on table "public"."tasks" from "service_role";
revoke select on table "public"."tasks" from "service_role";
revoke trigger on table "public"."tasks" from "service_role";
revoke truncate on table "public"."tasks" from "service_role";
revoke update on table "public"."tasks" from "service_role";
revoke delete on table "public"."term_sheets" from "anon";
revoke insert on table "public"."term_sheets" from "anon";
revoke references on table "public"."term_sheets" from "anon";
revoke select on table "public"."term_sheets" from "anon";
revoke trigger on table "public"."term_sheets" from "anon";
revoke truncate on table "public"."term_sheets" from "anon";
revoke update on table "public"."term_sheets" from "anon";
revoke delete on table "public"."term_sheets" from "authenticated";
revoke insert on table "public"."term_sheets" from "authenticated";
revoke references on table "public"."term_sheets" from "authenticated";
revoke select on table "public"."term_sheets" from "authenticated";
revoke trigger on table "public"."term_sheets" from "authenticated";
revoke truncate on table "public"."term_sheets" from "authenticated";
revoke update on table "public"."term_sheets" from "authenticated";
revoke delete on table "public"."term_sheets" from "service_role";
revoke insert on table "public"."term_sheets" from "service_role";
revoke references on table "public"."term_sheets" from "service_role";
revoke select on table "public"."term_sheets" from "service_role";
revoke trigger on table "public"."term_sheets" from "service_role";
revoke truncate on table "public"."term_sheets" from "service_role";
revoke update on table "public"."term_sheets" from "service_role";
revoke delete on table "public"."valuations" from "anon";
revoke insert on table "public"."valuations" from "anon";
revoke references on table "public"."valuations" from "anon";
revoke select on table "public"."valuations" from "anon";
revoke trigger on table "public"."valuations" from "anon";
revoke truncate on table "public"."valuations" from "anon";
revoke update on table "public"."valuations" from "anon";
revoke delete on table "public"."valuations" from "authenticated";
revoke insert on table "public"."valuations" from "authenticated";
revoke references on table "public"."valuations" from "authenticated";
revoke select on table "public"."valuations" from "authenticated";
revoke trigger on table "public"."valuations" from "authenticated";
revoke truncate on table "public"."valuations" from "authenticated";
revoke update on table "public"."valuations" from "authenticated";
revoke delete on table "public"."valuations" from "service_role";
revoke insert on table "public"."valuations" from "service_role";
revoke references on table "public"."valuations" from "service_role";
revoke select on table "public"."valuations" from "service_role";
revoke trigger on table "public"."valuations" from "service_role";
revoke truncate on table "public"."valuations" from "service_role";
revoke update on table "public"."valuations" from "service_role";
revoke delete on table "public"."vehicles" from "anon";
revoke insert on table "public"."vehicles" from "anon";
revoke references on table "public"."vehicles" from "anon";
revoke select on table "public"."vehicles" from "anon";
revoke trigger on table "public"."vehicles" from "anon";
revoke truncate on table "public"."vehicles" from "anon";
revoke update on table "public"."vehicles" from "anon";
revoke delete on table "public"."vehicles" from "authenticated";
revoke insert on table "public"."vehicles" from "authenticated";
revoke references on table "public"."vehicles" from "authenticated";
revoke select on table "public"."vehicles" from "authenticated";
revoke trigger on table "public"."vehicles" from "authenticated";
revoke truncate on table "public"."vehicles" from "authenticated";
revoke update on table "public"."vehicles" from "authenticated";
revoke delete on table "public"."vehicles" from "service_role";
revoke insert on table "public"."vehicles" from "service_role";
revoke references on table "public"."vehicles" from "service_role";
revoke select on table "public"."vehicles" from "service_role";
revoke trigger on table "public"."vehicles" from "service_role";
revoke truncate on table "public"."vehicles" from "service_role";
revoke update on table "public"."vehicles" from "service_role";
revoke delete on table "public"."workflow_run_logs" from "anon";
revoke insert on table "public"."workflow_run_logs" from "anon";
revoke references on table "public"."workflow_run_logs" from "anon";
revoke select on table "public"."workflow_run_logs" from "anon";
revoke trigger on table "public"."workflow_run_logs" from "anon";
revoke truncate on table "public"."workflow_run_logs" from "anon";
revoke update on table "public"."workflow_run_logs" from "anon";
revoke delete on table "public"."workflow_run_logs" from "authenticated";
revoke insert on table "public"."workflow_run_logs" from "authenticated";
revoke references on table "public"."workflow_run_logs" from "authenticated";
revoke select on table "public"."workflow_run_logs" from "authenticated";
revoke trigger on table "public"."workflow_run_logs" from "authenticated";
revoke truncate on table "public"."workflow_run_logs" from "authenticated";
revoke update on table "public"."workflow_run_logs" from "authenticated";
revoke delete on table "public"."workflow_run_logs" from "service_role";
revoke insert on table "public"."workflow_run_logs" from "service_role";
revoke references on table "public"."workflow_run_logs" from "service_role";
revoke select on table "public"."workflow_run_logs" from "service_role";
revoke trigger on table "public"."workflow_run_logs" from "service_role";
revoke truncate on table "public"."workflow_run_logs" from "service_role";
revoke update on table "public"."workflow_run_logs" from "service_role";
revoke delete on table "public"."workflow_runs" from "anon";
revoke insert on table "public"."workflow_runs" from "anon";
revoke references on table "public"."workflow_runs" from "anon";
revoke select on table "public"."workflow_runs" from "anon";
revoke trigger on table "public"."workflow_runs" from "anon";
revoke truncate on table "public"."workflow_runs" from "anon";
revoke update on table "public"."workflow_runs" from "anon";
revoke delete on table "public"."workflow_runs" from "authenticated";
revoke insert on table "public"."workflow_runs" from "authenticated";
revoke references on table "public"."workflow_runs" from "authenticated";
revoke select on table "public"."workflow_runs" from "authenticated";
revoke trigger on table "public"."workflow_runs" from "authenticated";
revoke truncate on table "public"."workflow_runs" from "authenticated";
revoke update on table "public"."workflow_runs" from "authenticated";
revoke delete on table "public"."workflow_runs" from "service_role";
revoke insert on table "public"."workflow_runs" from "service_role";
revoke references on table "public"."workflow_runs" from "service_role";
revoke select on table "public"."workflow_runs" from "service_role";
revoke trigger on table "public"."workflow_runs" from "service_role";
revoke truncate on table "public"."workflow_runs" from "service_role";
revoke update on table "public"."workflow_runs" from "service_role";
revoke delete on table "public"."workflows" from "anon";
revoke insert on table "public"."workflows" from "anon";
revoke references on table "public"."workflows" from "anon";
revoke select on table "public"."workflows" from "anon";
revoke trigger on table "public"."workflows" from "anon";
revoke truncate on table "public"."workflows" from "anon";
revoke update on table "public"."workflows" from "anon";
revoke delete on table "public"."workflows" from "authenticated";
revoke insert on table "public"."workflows" from "authenticated";
revoke references on table "public"."workflows" from "authenticated";
revoke select on table "public"."workflows" from "authenticated";
revoke trigger on table "public"."workflows" from "authenticated";
revoke truncate on table "public"."workflows" from "authenticated";
revoke update on table "public"."workflows" from "authenticated";
revoke delete on table "public"."workflows" from "service_role";
revoke insert on table "public"."workflows" from "service_role";
revoke references on table "public"."workflows" from "service_role";
revoke select on table "public"."workflows" from "service_role";
revoke trigger on table "public"."workflows" from "service_role";
revoke truncate on table "public"."workflows" from "service_role";
revoke update on table "public"."workflows" from "service_role";
alter table "public"."conversations" drop constraint "conversations_type_check";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.accrue_quarterly_management_fees(p_deal_id uuid, p_quarter_end_date date)
 RETURNS TABLE(investor_id uuid, fee_amount numeric, fee_event_id uuid)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_quarter_start date;
  v_days_in_quarter integer;
  v_allocation record;
  v_fee_plan record;
  v_component record;
  v_rate integer;
  v_base numeric;
  v_fee numeric;
  v_fee_event_id uuid;
BEGIN
  v_quarter_start := date_trunc('quarter', p_quarter_end_date)::date;
  v_days_in_quarter := (p_quarter_end_date - v_quarter_start) + 1;

  FOR v_allocation IN
    SELECT a.investor_id, a.units, a.status
    FROM public.allocations a
    WHERE a.deal_id = p_deal_id
      AND a.status IN ('approved','settled')
  LOOP
    SELECT * INTO v_fee_plan
    FROM public.get_applicable_fee_plan(v_allocation.investor_id, p_deal_id, p_quarter_end_date)
    LIMIT 1;

    IF FOUND THEN
      SELECT * INTO v_component
      FROM jsonb_to_recordset(v_fee_plan.components) AS x(
        id uuid,
        kind public.fee_component_kind_enum,
        rate_bps integer,
        calc_method public.fee_calc_method_enum,
        frequency public.fee_frequency_enum,
        base_calculation text
      )
      WHERE kind = 'management'
      LIMIT 1;

      IF FOUND THEN
        v_rate := COALESCE((v_fee_plan.overrides->>'management_rate_bps')::integer, v_component.rate_bps);
        v_base := 0;

        IF v_component.base_calculation = 'commitment' OR v_component.calc_method = 'percent_of_commitment' THEN
          SELECT COALESCE(dc.requested_amount, 0)
          INTO v_base
          FROM public.deal_commitments dc
          WHERE dc.deal_id = p_deal_id
            AND dc.investor_id = v_allocation.investor_id
          LIMIT 1;
        ELSE
          SELECT COALESCE(sum(pos.units * pos.last_nav), 0)
          INTO v_base
          FROM public.positions pos
          WHERE pos.vehicle_id = (SELECT deal.vehicle_id FROM public.deals deal WHERE deal.id = p_deal_id)
            AND pos.investor_id = v_allocation.investor_id;
        END IF;

        v_fee := public.calculate_management_fee(v_base, v_rate, v_days_in_quarter);

        INSERT INTO public.fee_events (
          deal_id,
          investor_id,
          fee_component_id,
          fee_type,
          event_date,
          period_start_date,
          period_end_date,
          base_amount,
          rate_bps,
          computed_amount,
          status
        )
        VALUES (
          p_deal_id,
          v_allocation.investor_id,
          v_component.id,
          'management',
          p_quarter_end_date,
          v_quarter_start,
          p_quarter_end_date,
          v_base,
          v_rate,
          v_fee,
          'accrued'
        )
        RETURNING id INTO v_fee_event_id;

        RETURN QUERY SELECT v_allocation.investor_id, v_fee, v_fee_event_id;
      END IF;
    END IF;
  END LOOP;
END;
$function$;
CREATE OR REPLACE FUNCTION public.append_audit_hash()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_prev_hash bytea;
  v_hash bytea;
BEGIN
  SELECT hash
  INTO v_prev_hash
  FROM public.audit_log_hash_chain
  ORDER BY created_at DESC
  LIMIT 1;

  v_hash := digest((NEW.id::text || NEW.timestamp::text || coalesce(NEW.actor_id::text,'') || NEW.action)::bytea, 'sha256');

  INSERT INTO public.audit_log_hash_chain (audit_log_id, hash, prev_hash)
  VALUES (NEW.id, v_hash, v_prev_hash);

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.apply_match(p_match_id uuid, p_approved_by uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_match record;
BEGIN
  SELECT * INTO v_match FROM public.reconciliation_matches WHERE id = p_match_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % not found', p_match_id;
  END IF;

  UPDATE public.reconciliation_matches
  SET status = 'approved', approved_by = p_approved_by, approved_at = now()
  WHERE id = p_match_id;

  UPDATE public.bank_transactions
  SET status = CASE
    WHEN v_match.match_type = 'partial' THEN 'partially_matched'
    ELSE 'matched'
  END,
  match_confidence = v_match.match_confidence,
  match_notes = v_match.match_reason,
  matched_invoice_ids = array_append(coalesce(matched_invoice_ids, '{}'), v_match.invoice_id)
  WHERE id = v_match.bank_transaction_id;

  UPDATE public.invoices
  SET paid_amount = coalesce(paid_amount, 0) + v_match.matched_amount,
      status = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN 'paid'
        ELSE 'partially_paid'
      END,
      match_status = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN 'matched'
        ELSE 'partially_matched'
      END,
      paid_at = CASE
        WHEN coalesce(paid_amount, 0) + v_match.matched_amount >= total THEN now()
        ELSE paid_at
      END
  WHERE id = v_match.invoice_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.auto_assign_approval()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_assigned_to uuid;
  v_investor_id uuid;
BEGIN
  -- Only auto-assign on insert if not manually assigned
  IF TG_OP = 'INSERT' AND NEW.assigned_to IS NULL THEN

    -- Extract investor_id from entity_metadata if available
    IF NEW.entity_metadata ? 'investor_id' THEN
      v_investor_id := (NEW.entity_metadata->>'investor_id')::uuid;
    END IF;

    -- Route based on entity type
    IF NEW.entity_type IN ('commitment', 'deal_commitment', 'reservation', 'allocation') THEN
      -- Try to get investor's primary RM from related_investor_id
      IF NEW.related_investor_id IS NOT NULL THEN
        -- For now, assign to first available RM
        -- TODO: Add primary_rm field to investors table
        SELECT id INTO v_assigned_to
        FROM profiles
        WHERE role = 'staff_rm'
        ORDER BY random()
        LIMIT 1;
      END IF;

    ELSIF NEW.entity_type IN ('kyc_change', 'profile_update') THEN
      -- Assign to compliance team (round-robin by random for now)
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_admin' AND title = 'compliance'
      ORDER BY random()
      LIMIT 1;

    ELSIF NEW.entity_type = 'withdrawal' THEN
      -- Assign to bizops team
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE title = 'bizops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    -- Fallback: assign to any available ops staff
    IF v_assigned_to IS NULL THEN
      SELECT id INTO v_assigned_to
      FROM profiles
      WHERE role = 'staff_ops'
      ORDER BY random()
      LIMIT 1;
    END IF;

    NEW.assigned_to := v_assigned_to;
  END IF;

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.calculate_investor_kpis(investor_ids uuid[], as_of_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(current_nav numeric, total_contributed numeric, total_distributions numeric, unfunded_commitment numeric, total_commitment numeric, total_cost_basis numeric, unrealized_gain numeric, unrealized_gain_pct numeric, dpi numeric, tvpi numeric, irr_estimate numeric, total_positions integer, total_vehicles integer)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    calc_current_nav numeric(18,2) := 0;
    calc_total_contributed numeric(18,2) := 0;
    calc_total_distributions numeric(18,2) := 0;
    calc_total_commitment numeric(18,2) := 0;
    calc_total_cost_basis numeric(18,2) := 0;
    calc_unfunded_commitment numeric(18,2) := 0;
    calc_unrealized_gain numeric(18,2) := 0;
    calc_unrealized_gain_pct numeric(5,2) := 0;
    calc_dpi numeric(10,4) := 0;
    calc_tvpi numeric(10,4) := 0;
    calc_irr_estimate numeric(5,2) := 0;
    calc_total_positions int := 0;
    calc_total_vehicles int := 0;
BEGIN
    -- Calculate current NAV from positions with latest valuations
    SELECT COALESCE(SUM(
        CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END
    ), 0)
    INTO calc_current_nav
    FROM positions p
    LEFT JOIN get_latest_valuations() lv ON p.vehicle_id = lv.vehicle_id
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0;

    -- Calculate total cost basis from positions
    SELECT COALESCE(SUM(p.cost_basis), 0)
    INTO calc_total_cost_basis
    FROM positions p
    WHERE p.investor_id = ANY(investor_ids);

    -- Calculate total contributed capital from cashflows
    SELECT COALESCE(SUM(cf.amount), 0)
    INTO calc_total_contributed
    FROM cashflows cf
    WHERE cf.investor_id = ANY(investor_ids)
    AND cf.type = 'call'
    AND cf.date <= as_of_date;

    -- Calculate total distributions from cashflows
    SELECT COALESCE(SUM(cf.amount), 0)
    INTO calc_total_distributions
    FROM cashflows cf
    WHERE cf.investor_id = ANY(investor_ids)
    AND cf.type = 'distribution'
    AND cf.date <= as_of_date;

    -- Calculate total commitments from active subscriptions
    SELECT COALESCE(SUM(s.commitment), 0)
    INTO calc_total_commitment
    FROM subscriptions s
    WHERE s.investor_id = ANY(investor_ids)
    AND s.status IN ('active', 'pending');

    -- Calculate derived metrics
    calc_unfunded_commitment := GREATEST(calc_total_commitment - calc_total_contributed, 0);
    calc_unrealized_gain := calc_current_nav - calc_total_cost_basis;

    -- Calculate unrealized gain percentage (avoid division by zero)
    IF calc_total_cost_basis > 0 THEN
        calc_unrealized_gain_pct := (calc_unrealized_gain / calc_total_cost_basis) * 100;
    ELSE
        calc_unrealized_gain_pct := 0;
    END IF;

    -- Calculate DPI (Distributions to Paid-in Capital)
    IF calc_total_contributed > 0 THEN
        calc_dpi := calc_total_distributions / calc_total_contributed;
    ELSE
        calc_dpi := 0;
    END IF;

    -- Calculate TVPI (Total Value to Paid-in Capital)
    IF calc_total_contributed > 0 THEN
        calc_tvpi := (calc_current_nav + calc_total_distributions) / calc_total_contributed;
    ELSE
        calc_tvpi := 0;
    END IF;

    -- Simple IRR estimation (placeholder - complex calculation)
    -- For MVP, we'll use a simplified approach based on total return and time
    IF calc_total_contributed > 0 AND calc_tvpi > 1 THEN
        -- Estimate based on compound annual growth
        -- This is a simplified calculation - real IRR requires cashflow timing
        calc_irr_estimate := LEAST(GREATEST((calc_tvpi - 1) * 10, 0), 100);
    ELSE
        calc_irr_estimate := 0;
    END IF;

    -- Count positions and vehicles
    SELECT COUNT(*), COUNT(DISTINCT vehicle_id)
    INTO calc_total_positions, calc_total_vehicles
    FROM positions p
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0;

    -- Return all calculated values
    RETURN QUERY SELECT
        calc_current_nav,
        calc_total_contributed,
        calc_total_distributions,
        calc_unfunded_commitment,
        calc_total_commitment,
        calc_total_cost_basis,
        calc_unrealized_gain,
        calc_unrealized_gain_pct,
        calc_dpi,
        calc_tvpi,
        calc_irr_estimate,
        calc_total_positions,
        calc_total_vehicles;
END;
$function$;
CREATE OR REPLACE FUNCTION public.calculate_investor_kpis_with_deals(investor_ids uuid[], as_of_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(current_nav numeric, total_contributed numeric, total_distributions numeric, unfunded_commitment numeric, total_commitment numeric, total_cost_basis numeric, unrealized_gain numeric, unrealized_gain_pct numeric, dpi numeric, tvpi numeric, irr_estimate numeric, total_positions integer, total_vehicles integer, total_deals integer, total_deal_value numeric, pending_allocations integer)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    calc_current_nav numeric(18,2) := 0;
    calc_total_contributed numeric(18,2) := 0;
    calc_total_distributions numeric(18,2) := 0;
    calc_total_commitment numeric(18,2) := 0;
    calc_total_cost_basis numeric(18,2) := 0;
    calc_unfunded_commitment numeric(18,2) := 0;
    calc_unrealized_gain numeric(18,2) := 0;
    calc_unrealized_gain_pct numeric(5,2) := 0;
    calc_dpi numeric(10,4) := 0;
    calc_tvpi numeric(10,4) := 0;
    calc_irr_estimate numeric(5,2) := 0;
    calc_total_positions int := 0;
    calc_total_vehicles int := 0;
    calc_total_deals int := 0;
    calc_total_deal_value numeric(18,2) := 0;
    calc_pending_allocations int := 0;
BEGIN
    -- Get base KPI calculations
    SELECT 
        base.current_nav,
        base.total_contributed,
        base.total_distributions,
        base.unfunded_commitment,
        base.total_commitment,
        base.total_cost_basis,
        base.unrealized_gain,
        base.unrealized_gain_pct,
        base.dpi,
        base.tvpi,
        base.irr_estimate,
        base.total_positions,
        base.total_vehicles
    INTO 
        calc_current_nav,
        calc_total_contributed,
        calc_total_distributions,
        calc_unfunded_commitment,
        calc_total_commitment,
        calc_total_cost_basis,
        calc_unrealized_gain,
        calc_unrealized_gain_pct,
        calc_dpi,
        calc_tvpi,
        calc_irr_estimate,
        calc_total_positions,
        calc_total_vehicles
    FROM calculate_investor_kpis(investor_ids, as_of_date) base;

    -- Count deal allocations if deals table exists
    BEGIN
        SELECT COUNT(*), COALESCE(SUM(a.amount), 0)
        INTO calc_total_deals, calc_total_deal_value
        FROM deal_allocations a
        INNER JOIN deals d ON a.deal_id = d.id
        WHERE a.investor_id = ANY(investor_ids);
        
        -- Count pending allocations
        SELECT COUNT(*)
        INTO calc_pending_allocations
        FROM deal_allocations a
        INNER JOIN deals d ON a.deal_id = d.id
        WHERE a.investor_id = ANY(investor_ids)
        AND d.status = 'pending';
        
    EXCEPTION WHEN undefined_table THEN
        -- If deals/deal_allocations tables don't exist, set to 0
        calc_total_deals := 0;
        calc_total_deal_value := 0;
        calc_pending_allocations := 0;
    END;

    -- Return all calculated values including deal metrics
    RETURN QUERY SELECT
        calc_current_nav,
        calc_total_contributed,
        calc_total_distributions,
        calc_unfunded_commitment,
        calc_total_commitment,
        calc_total_cost_basis,
        calc_unrealized_gain,
        calc_unrealized_gain_pct,
        calc_dpi,
        calc_tvpi,
        calc_irr_estimate,
        calc_total_positions,
        calc_total_vehicles,
        calc_total_deals,
        calc_total_deal_value,
        calc_pending_allocations;
END;
$function$;
CREATE OR REPLACE FUNCTION public.calculate_management_fee(p_base_amount numeric, p_rate_bps integer, p_period_days integer)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN round(p_base_amount * (p_rate_bps::numeric / 10000) * (p_period_days::numeric / 365), 2);
END;
$function$;
CREATE OR REPLACE FUNCTION public.calculate_performance_fee(p_contributed_capital numeric, p_exit_proceeds numeric, p_carry_rate_bps integer, p_hurdle_rate_bps integer, p_years_held numeric)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_profit numeric;
  v_hurdle_return numeric;
  v_profit_above_hurdle numeric;
BEGIN
  v_profit := p_exit_proceeds - p_contributed_capital;
  IF v_profit <= 0 THEN
    RETURN 0;
  END IF;

  v_hurdle_return := p_contributed_capital * (p_hurdle_rate_bps::numeric / 10000) * p_years_held;
  v_profit_above_hurdle := v_profit - v_hurdle_return;

  IF v_profit_above_hurdle <= 0 THEN
    RETURN 0;
  END IF;

  RETURN round(v_profit_above_hurdle * (p_carry_rate_bps::numeric / 10000), 2);
END;
$function$;
CREATE OR REPLACE FUNCTION public.calculate_subscription_fee(p_commitment_amount numeric, p_rate_bps integer)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN round(p_commitment_amount * (p_rate_bps::numeric / 10000), 2);
END;
$function$;
CREATE OR REPLACE FUNCTION public.check_auto_approval_criteria(p_approval_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_approval record;
  v_investor record;
  v_previous_approvals int;
  v_recent_rejections int;
  v_commitment_amount numeric;
BEGIN
  -- Get approval details
  SELECT * INTO v_approval FROM approvals WHERE id = p_approval_id;

  -- Only auto-approve commitments
  IF v_approval.entity_type NOT IN ('commitment', 'deal_commitment') THEN
    RETURN false;
  END IF;

  -- Extract commitment amount from metadata
  IF v_approval.entity_metadata ? 'requested_amount' THEN
    v_commitment_amount := (v_approval.entity_metadata->>'requested_amount')::numeric;
  ELSIF v_approval.entity_metadata ? 'amount' THEN
    v_commitment_amount := (v_approval.entity_metadata->>'amount')::numeric;
  ELSE
    RETURN false; -- No amount data
  END IF;

  -- Check commitment amount threshold
  IF v_commitment_amount > 5000 THEN
    RETURN false;
  END IF;

  -- Get investor details if available
  IF v_approval.related_investor_id IS NOT NULL THEN
    SELECT * INTO v_investor FROM investors WHERE id = v_approval.related_investor_id;

    -- Check KYC status
    IF v_investor.kyc_status != 'completed' THEN
      RETURN false;
    END IF;

    -- Check previous successful approvals
    SELECT COUNT(*) INTO v_previous_approvals
    FROM approvals
    WHERE related_investor_id = v_approval.related_investor_id
      AND entity_type IN ('commitment', 'deal_commitment')
      AND status = 'approved';

    IF v_previous_approvals < 3 THEN
      RETURN false;
    END IF;

    -- Check recent rejections
    SELECT COUNT(*) INTO v_recent_rejections
    FROM approvals
    WHERE related_investor_id = v_approval.related_investor_id
      AND status = 'rejected'
      AND created_at >= CURRENT_DATE - INTERVAL '90 days';

    IF v_recent_rejections > 0 THEN
      RETURN false;
    END IF;
  ELSE
    -- No investor data, cannot auto-approve
    RETURN false;
  END IF;

  -- All criteria met
  RETURN true;
END;
$function$;
CREATE OR REPLACE FUNCTION public.create_commitment_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_priority text;
BEGIN
  -- Only create approval for submitted commitments
  IF NEW.status != 'submitted' THEN
    RETURN NEW;
  END IF;

  -- Calculate priority based on commitment amount
  v_priority := CASE
    WHEN NEW.requested_amount > 1000000 THEN 'critical'  -- >$1M
    WHEN NEW.requested_amount > 100000 THEN 'high'       -- >$100K
    WHEN NEW.requested_amount > 50000 THEN 'medium'      -- >$50K
    ELSE 'low'
  END;

  -- Create approval record
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  ) VALUES (
    'deal_commitment',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'requested_amount', NEW.requested_amount,
      'requested_units', NEW.requested_units,
      'fee_plan_id', NEW.selected_fee_plan_id,
      'commitment_created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.create_default_vehicle_folders(p_vehicle_id uuid, p_created_by uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_vehicle_name text;
  v_root_folder_id uuid;
  v_category_names text[] := ARRAY['Agreements', 'KYC Documents', 'Position Statements', 'NDAs', 'Reports'];
  v_category_name text;
BEGIN
  -- Get vehicle name
  SELECT name INTO v_vehicle_name FROM vehicles WHERE id = p_vehicle_id;
  
  IF v_vehicle_name IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found: %', p_vehicle_id;
  END IF;
  
  -- Create root folder for vehicle
  INSERT INTO document_folders (name, path, vehicle_id, folder_type, created_by)
  VALUES (v_vehicle_name, '/' || v_vehicle_name, p_vehicle_id, 'vehicle_root', p_created_by)
  RETURNING id INTO v_root_folder_id;
  
  -- Create default category folders
  FOREACH v_category_name IN ARRAY v_category_names
  LOOP
    INSERT INTO document_folders (parent_folder_id, name, path, vehicle_id, folder_type, created_by)
    VALUES (
      v_root_folder_id,
      v_category_name,
      '/' || v_vehicle_name || '/' || v_category_name,
      p_vehicle_id,
      'category',
      p_created_by
    );
  END LOOP;
END;
$function$;
CREATE OR REPLACE FUNCTION public.create_reservation_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_priority text;
  v_reservation_value numeric;
BEGIN
  -- Only create approval for pending reservations
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Calculate reservation value
  v_reservation_value := NEW.requested_units * COALESCE(NEW.proposed_unit_price, 0);

  -- Calculate priority based on reservation value
  v_priority := CASE
    WHEN v_reservation_value > 1000000 THEN 'critical'  -- >$1M
    WHEN v_reservation_value > 500000 THEN 'high'       -- >$500K
    WHEN v_reservation_value > 100000 THEN 'medium'     -- >$100K
    ELSE 'low'
  END;

  -- Create approval record
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  ) VALUES (
    'reservation',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'requested_units', NEW.requested_units,
      'proposed_unit_price', NEW.proposed_unit_price,
      'reservation_value', v_reservation_value,
      'expires_at', NEW.expires_at,
      'reservation_created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.create_tasks_from_templates(p_user_id uuid, p_investor_id uuid, p_trigger_event text)
 RETURNS SETOF tasks
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  INSERT INTO tasks (
    owner_user_id, owner_investor_id, kind, category, title, description,
    priority, estimated_minutes, due_at, status
  )
  SELECT
    p_user_id, p_investor_id, tt.kind, tt.category, tt.title, tt.description,
    tt.priority, tt.estimated_minutes,
    CASE WHEN tt.default_due_days IS NOT NULL
      THEN now() + (tt.default_due_days || ' days')::interval
      ELSE NULL
    END,
    CASE WHEN tt.prerequisite_task_kinds IS NOT NULL AND array_length(tt.prerequisite_task_kinds, 1) > 0
      THEN 'blocked'
      ELSE 'pending'
    END
  FROM task_templates tt
  WHERE tt.trigger_event = p_trigger_event
    AND NOT EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.owner_user_id = p_user_id AND t.kind = tt.kind
        AND t.status NOT IN ('completed', 'waived')
    )
  RETURNING *;
END;
$function$;
CREATE OR REPLACE FUNCTION public.ensure_message_read_receipt()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO message_reads (message_id, user_id, read_at)
  VALUES (NEW.id, NEW.sender_id, NEW.created_at)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.fn_compute_fee_events(p_deal_id uuid, p_as_of_date date DEFAULT CURRENT_DATE)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_events_created integer := 0;
  v_term_record RECORD;
  v_component_record RECORD;
  v_invested_amount numeric(18,2);
  v_fee_amount numeric(18,2);
BEGIN
  -- For each active investor_terms in this deal
  FOR v_term_record IN
    SELECT 
      it.investor_id,
      it.selected_fee_plan_id,
      it.overrides
    FROM investor_terms it
    WHERE it.deal_id = p_deal_id
      AND it.status = 'active'
  LOOP
    -- Get invested amount from approved allocations
    SELECT COALESCE(SUM(units * unit_price), 0)
    INTO v_invested_amount
    FROM allocations
    WHERE deal_id = p_deal_id
      AND investor_id = v_term_record.investor_id
      AND status IN ('approved', 'settled');
    
    -- For each fee component in their plan
    FOR v_component_record IN
      SELECT *
      FROM fee_components fc
      WHERE fc.fee_plan_id = v_term_record.selected_fee_plan_id
    LOOP
      -- Calculate fee based on component type
      v_fee_amount := 0;
      
      CASE v_component_record.calc_method
        WHEN 'percent_of_investment' THEN
          v_fee_amount := v_invested_amount * (v_component_record.rate_bps / 10000.0);
          
        WHEN 'fixed' THEN
          v_fee_amount := v_component_record.flat_amount;
          
        WHEN 'percent_per_annum' THEN
          -- For management fees - calculate based on time period and NAV
          -- This is a simplified version - in practice you'd need current NAV
          v_fee_amount := v_invested_amount * (v_component_record.rate_bps / 10000.0) * 
            EXTRACT(DAYS FROM (p_as_of_date - current_date + interval '1 year')) / 365.0;
          
        -- Add other calculation methods as needed
        ELSE
          CONTINUE;  -- Skip unsupported calculation methods
      END CASE;
      
      -- Only create fee event if amount > 0 and not already exists
      IF v_fee_amount > 0 THEN
        INSERT INTO fee_events (
          deal_id,
          investor_id,
          fee_component_id,
          event_date,
          period_start,
          period_end,
          base_amount,
          computed_amount,
          currency,
          source_ref,
          status
        ) 
        SELECT 
          p_deal_id,
          v_term_record.investor_id,
          v_component_record.id,
          p_as_of_date,
          CASE 
            WHEN v_component_record.frequency = 'annual' THEN date_trunc('year', p_as_of_date)::date
            WHEN v_component_record.frequency = 'quarterly' THEN date_trunc('quarter', p_as_of_date)::date
            ELSE p_as_of_date
          END,
          CASE 
            WHEN v_component_record.frequency = 'annual' THEN (date_trunc('year', p_as_of_date) + interval '1 year' - interval '1 day')::date
            WHEN v_component_record.frequency = 'quarterly' THEN (date_trunc('quarter', p_as_of_date) + interval '3 months' - interval '1 day')::date
            ELSE p_as_of_date
          END,
          v_invested_amount,
          v_fee_amount,
          'USD',
          'allocation',
          'accrued'
        WHERE NOT EXISTS (
          -- Avoid duplicates
          SELECT 1 FROM fee_events fe
          WHERE fe.deal_id = p_deal_id
            AND fe.investor_id = v_term_record.investor_id
            AND fe.fee_component_id = v_component_record.id
            AND fe.event_date = p_as_of_date
            AND fe.status != 'voided'
        );
        
        IF FOUND THEN
          v_events_created := v_events_created + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN v_events_created;
END;
$function$;
CREATE OR REPLACE FUNCTION public.fn_deal_inventory_summary(p_deal_id uuid)
 RETURNS TABLE(total_units numeric, available_units numeric, reserved_units numeric, allocated_units numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(sl.units_total), 0) as total_units,
    COALESCE(SUM(sl.units_remaining), 0) as available_units,
    COALESCE((
      SELECT SUM(r.requested_units) 
      FROM reservations r 
      WHERE r.deal_id = p_deal_id AND r.status = 'pending'
    ), 0) as reserved_units,
    COALESCE((
      SELECT SUM(a.units)
      FROM allocations a
      WHERE a.deal_id = p_deal_id AND a.status IN ('approved', 'settled')
    ), 0) as allocated_units
  FROM share_lots sl
  WHERE sl.deal_id = p_deal_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.fn_expire_reservations()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_expired_count integer := 0;
  v_reservation_record RECORD;
  v_lot_item_record RECORD;
BEGIN
  -- Find reservations that are pending and expired
  FOR v_reservation_record IN
    SELECT id, deal_id
    FROM reservations 
    WHERE status = 'pending' 
      AND expires_at < now()
    FOR UPDATE SKIP LOCKED  -- Work lock per reservation
  LOOP
    -- Restore units_remaining for all lots in this reservation
    FOR v_lot_item_record IN
      SELECT lot_id, units
      FROM reservation_lot_items 
      WHERE reservation_id = v_reservation_record.id
    LOOP
      UPDATE share_lots 
      SET units_remaining = units_remaining + v_lot_item_record.units,
          status = CASE 
            WHEN status = 'exhausted' AND units_remaining + v_lot_item_record.units > 0 THEN 'available'
            ELSE status
          END
      WHERE id = v_lot_item_record.lot_id;
    END LOOP;
    
    -- Mark reservation as expired
    UPDATE reservations 
    SET status = 'expired'
    WHERE id = v_reservation_record.id
      AND status = 'pending';  -- Double-check status hasn't changed
    
    v_expired_count := v_expired_count + 1;
  END LOOP;
  
  RETURN v_expired_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.fn_finalize_allocation(p_reservation_id uuid, p_approver_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_allocation_id uuid;
  v_reservation_record RECORD;
  v_total_units numeric(28,8);
  v_weighted_cost numeric(18,6);
  v_spread_amount numeric(18,2);
  v_vehicle_id uuid;
BEGIN
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  
  -- Get reservation details
  SELECT 
    r.deal_id,
    r.investor_id, 
    r.proposed_unit_price,
    r.status,
    d.vehicle_id
  INTO v_reservation_record
  FROM reservations r
  JOIN deals d ON d.id = r.deal_id
  WHERE r.id = p_reservation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found: %', p_reservation_id;
  END IF;
  
  IF v_reservation_record.status != 'pending' THEN
    RAISE EXCEPTION 'Reservation is not pending. Status: %', v_reservation_record.status;
  END IF;
  
  -- TODO: Check for approval existence (implement when approvals system is ready)
  -- This would check the approvals table for approved status
  
  -- Calculate total units and weighted average cost
  SELECT 
    SUM(rli.units) as total_units,
    SUM(rli.units * sl.unit_cost) / SUM(rli.units) as weighted_cost
  INTO v_total_units, v_weighted_cost
  FROM reservation_lot_items rli
  JOIN share_lots sl ON sl.id = rli.lot_id
  WHERE rli.reservation_id = p_reservation_id;
  
  -- Create allocation
  v_allocation_id := gen_random_uuid();
  INSERT INTO allocations (
    id,
    deal_id,
    investor_id,
    unit_price,
    units,
    status,
    approved_by,
    approved_at
  ) VALUES (
    v_allocation_id,
    v_reservation_record.deal_id,
    v_reservation_record.investor_id,
    v_reservation_record.proposed_unit_price,
    v_total_units,
    'approved',
    p_approver_id,
    now()
  );
  
  -- Copy reservation_lot_items to allocation_lot_items
  INSERT INTO allocation_lot_items (allocation_id, lot_id, units)
  SELECT v_allocation_id, lot_id, units
  FROM reservation_lot_items
  WHERE reservation_id = p_reservation_id;
  
  -- Mark reservation as approved
  UPDATE reservations 
  SET status = 'approved'
  WHERE id = p_reservation_id;
  
  -- Update positions (upsert)
  IF v_reservation_record.vehicle_id IS NOT NULL THEN
    INSERT INTO positions (
      investor_id,
      vehicle_id,
      units,
      cost_basis,
      as_of_date
    ) VALUES (
      v_reservation_record.investor_id,
      v_reservation_record.vehicle_id,
      v_total_units,
      v_total_units * v_reservation_record.proposed_unit_price,
      current_date
    )
    ON CONFLICT (investor_id, vehicle_id) 
    DO UPDATE SET
      units = positions.units + EXCLUDED.units,
      cost_basis = positions.cost_basis + EXCLUDED.cost_basis,
      as_of_date = EXCLUDED.as_of_date;
  END IF;
  
  -- Calculate and record spread
  v_spread_amount := (v_reservation_record.proposed_unit_price - v_weighted_cost) * v_total_units;
  
  IF v_spread_amount > 0 THEN
    -- Create spread invoice line (will be attached to invoice later)
    INSERT INTO invoice_lines (
      invoice_id,
      kind,
      description,
      quantity,
      unit_price,
      amount
    ) VALUES (
      NULL,  -- Will be linked when invoice is created
      'spread',
      'Trading spread on allocation ' || v_allocation_id,
      v_total_units,
      v_reservation_record.proposed_unit_price - v_weighted_cost,
      v_spread_amount
    );
  END IF;
  
  RETURN v_allocation_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.fn_invoice_fees(p_deal_id uuid, p_investor_id uuid DEFAULT NULL::uuid, p_up_to_date date DEFAULT CURRENT_DATE)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_invoice_id uuid;
  v_subtotal numeric(18,2) := 0;
  v_event_record RECORD;
  v_investor_filter uuid;
BEGIN
  -- If investor_id provided, filter to that investor, otherwise process all
  v_investor_filter := p_investor_id;
  
  -- Create invoice
  v_invoice_id := gen_random_uuid();
  
  -- Group uninvoiced fee_events and create invoice
  FOR v_event_record IN
    SELECT 
      fe.investor_id,
      SUM(fe.computed_amount) as total_amount,
      fe.currency
    FROM fee_events fe
    WHERE fe.deal_id = p_deal_id
      AND fe.status = 'accrued'
      AND fe.event_date <= p_up_to_date
      AND (v_investor_filter IS NULL OR fe.investor_id = v_investor_filter)
    GROUP BY fe.investor_id, fe.currency
    HAVING SUM(fe.computed_amount) > 0
  LOOP
    INSERT INTO invoices (
      id,
      investor_id,
      deal_id,
      due_date,
      currency,
      subtotal,
      tax,
      total,
      status,
      generated_from
    ) VALUES (
      v_invoice_id,
      v_event_record.investor_id,
      p_deal_id,
      current_date + interval '30 days',
      v_event_record.currency,
      v_event_record.total_amount,
      0,  -- No tax calculation in MVP
      v_event_record.total_amount,
      'draft',
      'fee_events'
    );
    
    -- Create invoice lines for each fee event
    INSERT INTO invoice_lines (
      invoice_id,
      kind,
      description,
      quantity,
      unit_price,
      amount,
      fee_event_id
    )
    SELECT 
      v_invoice_id,
      'fee',
      CONCAT(fc.kind, ' fee - ', fe.event_date),
      1,
      fe.computed_amount,
      fe.computed_amount,
      fe.id
    FROM fee_events fe
    JOIN fee_components fc ON fc.id = fe.fee_component_id
    WHERE fe.deal_id = p_deal_id
      AND fe.status = 'accrued'
      AND fe.event_date <= p_up_to_date
      AND fe.investor_id = v_event_record.investor_id
      AND (v_investor_filter IS NULL OR fe.investor_id = v_investor_filter);
    
    -- Mark fee events as invoiced
    UPDATE fee_events 
    SET status = 'invoiced'
    WHERE deal_id = p_deal_id
      AND status = 'accrued'
      AND event_date <= p_up_to_date
      AND investor_id = v_event_record.investor_id
      AND (v_investor_filter IS NULL OR investor_id = v_investor_filter);
      
    EXIT; -- Only create one invoice per call
  END LOOP;
  
  RETURN v_invoice_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.fn_reserve_inventory(p_deal_id uuid, p_investor_id uuid, p_requested_units numeric, p_proposed_unit_price numeric, p_hold_minutes integer DEFAULT 30)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_reservation_id uuid;
  v_deal_status text;
  v_remaining_units numeric(28,8);
  v_lot_record RECORD;
  v_allocated_units numeric(28,8) := 0;
  v_units_to_take numeric(28,8);
BEGIN
  -- Set transaction isolation level for consistency
  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  
  -- 1. Validate deal status
  SELECT status INTO v_deal_status
  FROM deals 
  WHERE id = p_deal_id;
  
  IF v_deal_status IS NULL THEN
    RAISE EXCEPTION 'Deal not found: %', p_deal_id;
  END IF;
  
  IF v_deal_status NOT IN ('open', 'allocation_pending') THEN
    RAISE EXCEPTION 'Deal is not available for reservations. Status: %', v_deal_status;
  END IF;
  
  -- 2. Create reservation record first
  v_reservation_id := gen_random_uuid();
  INSERT INTO reservations (
    id,
    deal_id,
    investor_id,
    requested_units,
    proposed_unit_price,
    expires_at,
    status,
    created_by
  ) VALUES (
    v_reservation_id,
    p_deal_id,
    p_investor_id,
    p_requested_units,
    p_proposed_unit_price,
    now() + (p_hold_minutes || ' minutes')::interval,
    'pending',
    p_investor_id  -- Assuming investor creates their own reservation
  );
  
  -- 3. Select share_lots for the deal_id FOR UPDATE SKIP LOCKED, ordered by acquired_at (FIFO)
  FOR v_lot_record IN
    SELECT id, units_remaining, unit_cost
    FROM share_lots 
    WHERE deal_id = p_deal_id 
      AND status = 'available'
      AND units_remaining > 0
    ORDER BY acquired_at ASC, created_at ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Calculate how many units to take from this lot
    v_units_to_take := LEAST(
      v_lot_record.units_remaining, 
      p_requested_units - v_allocated_units
    );
    
    -- 4. Insert reservation_lot_items
    INSERT INTO reservation_lot_items (
      reservation_id,
      lot_id,
      units
    ) VALUES (
      v_reservation_id,
      v_lot_record.id,
      v_units_to_take
    );
    
    -- 5. Decrement share_lots.units_remaining
    UPDATE share_lots 
    SET units_remaining = units_remaining - v_units_to_take,
        status = CASE 
          WHEN units_remaining - v_units_to_take = 0 THEN 'exhausted'
          ELSE status
        END
    WHERE id = v_lot_record.id;
    
    v_allocated_units := v_allocated_units + v_units_to_take;
    
    -- Break if we've allocated enough
    EXIT WHEN v_allocated_units >= p_requested_units;
  END LOOP;
  
  -- Check if we were able to reserve enough units
  IF v_allocated_units < p_requested_units THEN
    RAISE EXCEPTION 'Insufficient inventory available. Requested: %, Available: %', 
      p_requested_units, v_allocated_units;
  END IF;
  
  -- 6. Return reservation_id
  RETURN v_reservation_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_applicable_fee_plan(p_investor_id uuid, p_deal_id uuid, p_as_of_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(fee_plan_id uuid, fee_plan_name text, components jsonb, overrides jsonb)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH investor_terms AS (
    SELECT
      it.base_fee_plan_id,
      it.overrides
    FROM public.investor_terms it
    WHERE it.investor_id = p_investor_id
      AND it.deal_id = p_deal_id
      AND it.status = 'active'
      AND it.effective_from <= p_as_of_date
      AND (it.effective_until IS NULL OR it.effective_until >= p_as_of_date)
    ORDER BY it.effective_from DESC
    LIMIT 1
  ),
  default_plan AS (
    SELECT
      fp.id AS fee_plan_id,
      fp.name AS fee_plan_name,
      jsonb_agg(
        jsonb_build_object(
          'id', fc.id,
          'kind', fc.kind,
          'rate_bps', fc.rate_bps,
          'calc_method', fc.calc_method,
          'frequency', fc.frequency,
          'base_calculation', fc.base_calculation,
          'hurdle_rate_bps', fc.hurdle_rate_bps
        ) ORDER BY fc.kind
      ) AS components
    FROM public.fee_plans fp
    JOIN public.fee_components fc ON fc.fee_plan_id = fp.id
    WHERE fp.deal_id = p_deal_id
      AND fp.is_default = true
      AND fp.is_active = true
    GROUP BY fp.id, fp.name
  )
  SELECT
    COALESCE(it.base_fee_plan_id, dp.fee_plan_id) AS fee_plan_id,
    dp.fee_plan_name,
    dp.components,
    COALESCE(it.overrides, '{}'::jsonb) AS overrides
  FROM default_plan dp
  LEFT JOIN investor_terms it ON true;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_approval_stats(p_staff_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(total_pending integer, overdue_count integer, avg_processing_time_hours numeric, approval_rate_24h numeric, total_approved_30d integer, total_rejected_30d integer, total_awaiting_info integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH approval_data AS (
    SELECT
      a.status,
      a.sla_breach_at,
      a.actual_processing_time_hours,
      a.created_at,
      a.resolved_at
    FROM approvals a
    WHERE (p_staff_id IS NULL OR a.assigned_to = p_staff_id)
      AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'
  )
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending')::int,
    COUNT(*) FILTER (WHERE status = 'pending' AND sla_breach_at < now())::int,
    COALESCE(AVG(actual_processing_time_hours) FILTER (
      WHERE status IN ('approved', 'rejected') AND actual_processing_time_hours IS NOT NULL
    ), 0)::numeric(10,2),
    COALESCE(
      (COUNT(*) FILTER (WHERE status = 'approved' AND actual_processing_time_hours <= 24)::numeric /
        NULLIF(COUNT(*) FILTER (WHERE status = 'approved'), 0) * 100
      ), 0
    )::numeric(5,2),
    COUNT(*) FILTER (WHERE status = 'approved')::int,
    COUNT(*) FILTER (WHERE status = 'rejected')::int,
    COUNT(*) FILTER (WHERE status = 'awaiting_info')::int
  FROM approval_data;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_conversation_unread_counts(p_user_id uuid, p_conversation_ids uuid[])
 RETURNS TABLE(conversation_id uuid, unread_count bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  IF p_conversation_ids IS NULL OR array_length(p_conversation_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id,
         COALESCE(
           (
             SELECT COUNT(*)
             FROM messages m
             WHERE m.conversation_id = c.id
               AND m.deleted_at IS NULL
               AND (m.created_at > COALESCE(cp.last_read_at, '-infinity'::timestamptz))
               AND (m.sender_id IS DISTINCT FROM p_user_id)
           ),
           0
         )::bigint AS unread_count
  FROM conversations c
  LEFT JOIN conversation_participants cp
    ON cp.conversation_id = c.id AND cp.user_id = p_user_id
  WHERE c.id = ANY(p_conversation_ids);
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_folder_path(p_folder_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_path text;
BEGIN
  WITH RECURSIVE folder_path AS (
    SELECT id, name, parent_folder_id, name::text as path
    FROM document_folders
    WHERE id = p_folder_id
    
    UNION ALL
    
    SELECT f.id, f.name, f.parent_folder_id, f.name || '/' || fp.path
    FROM document_folders f
    INNER JOIN folder_path fp ON f.id = fp.parent_folder_id
  )
  SELECT '/' || path INTO v_path
  FROM folder_path
  WHERE parent_folder_id IS NULL;
  
  RETURN v_path;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_investor_capital_summary(p_investor_ids uuid[])
 RETURNS TABLE(investor_id uuid, total_commitment numeric, total_contributed numeric, total_distributed numeric, unfunded_commitment numeric, current_nav numeric, vehicle_count integer, position_count integer, last_capital_call_date date, last_distribution_date date)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    inv.id as investor_id,
    COALESCE(SUM(DISTINCT s.commitment), 0)::numeric as total_commitment,
    COALESCE(SUM(CASE WHEN cf.type = 'call' THEN cf.amount ELSE 0 END), 0)::numeric as total_contributed,
    COALESCE(SUM(CASE WHEN cf.type = 'distribution' THEN cf.amount ELSE 0 END), 0)::numeric as total_distributed,
    COALESCE(SUM(DISTINCT s.commitment), 0)::numeric - COALESCE(SUM(CASE WHEN cf.type = 'call' THEN cf.amount ELSE 0 END), 0)::numeric as unfunded_commitment,
    COALESCE(SUM(p.last_nav * p.units), 0)::numeric as current_nav,
    COUNT(DISTINCT s.vehicle_id)::int as vehicle_count,
    COUNT(DISTINCT p.id)::int as position_count,
    MAX(cc.due_date)::date as last_capital_call_date,
    MAX(d.date)::date as last_distribution_date
  FROM unnest(p_investor_ids) inv(id)
  LEFT JOIN subscriptions s ON s.investor_id = inv.id
  LEFT JOIN cashflows cf ON cf.investor_id = inv.id
  LEFT JOIN positions p ON p.investor_id = inv.id
  LEFT JOIN capital_calls cc ON cc.vehicle_id = s.vehicle_id
  LEFT JOIN distributions d ON d.vehicle_id = s.vehicle_id
  GROUP BY inv.id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_investor_kpi_details(investor_ids uuid[], kpi_type text, as_of_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(id uuid, name text, type text, value numeric, percentage numeric, metadata jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF kpi_type = 'nav_breakdown' THEN
        RETURN QUERY
        SELECT 
            pos.vehicle_id as id,
            v.name,
            v.type::text,
            CASE 
                WHEN pos.units > 0 AND val.nav_per_unit IS NOT NULL 
                THEN pos.units * val.nav_per_unit
                ELSE COALESCE(pos.cost_basis, 0)
            END as value,
            0.0 as percentage, -- Will calculate after getting total
            jsonb_build_object(
                'units', pos.units,
                'nav_per_unit', val.nav_per_unit,
                'cost_basis', pos.cost_basis,
                'last_valuation_date', val.as_of_date,
                'commitment', sub.commitment,
                'currency', sub.currency
            ) as metadata
        FROM positions pos
        JOIN vehicles v ON pos.vehicle_id = v.id
        JOIN subscriptions sub ON pos.investor_id = sub.investor_id AND pos.vehicle_id = sub.vehicle_id
        LEFT JOIN LATERAL (
            SELECT nav_per_unit, as_of_date
            FROM valuations val 
            WHERE val.vehicle_id = pos.vehicle_id 
              AND val.as_of_date <= as_of_date
            ORDER BY val.as_of_date DESC 
            LIMIT 1
        ) val ON true
        WHERE pos.investor_id = ANY(investor_ids)
        ORDER BY value DESC;

    ELSIF kpi_type = 'contributions_breakdown' THEN
        RETURN QUERY
        SELECT 
            pos.vehicle_id as id,
            v.name,
            v.type::text,
            COALESCE(cf.total_contributions, 0) as value,
            0.0 as percentage,
            jsonb_build_object(
                'commitment', sub.commitment,
                'contribution_count', cf.contribution_count,
                'last_contribution_date', cf.last_contribution_date,
                'currency', sub.currency
            ) as metadata
        FROM positions pos
        JOIN vehicles v ON pos.vehicle_id = v.id
        JOIN subscriptions sub ON pos.investor_id = sub.investor_id AND pos.vehicle_id = sub.vehicle_id
        LEFT JOIN LATERAL (
            SELECT 
                SUM(amount) as total_contributions,
                COUNT(*) as contribution_count,
                MAX(date) as last_contribution_date
            FROM cashflows cf
            WHERE cf.investor_id = pos.investor_id 
              AND cf.vehicle_id = pos.vehicle_id 
              AND cf.type = 'call'
              AND cf.date <= as_of_date
        ) cf ON true
        WHERE pos.investor_id = ANY(investor_ids)
          AND COALESCE(cf.total_contributions, 0) > 0
        ORDER BY value DESC;

    ELSIF kpi_type = 'distributions_breakdown' THEN
        RETURN QUERY
        SELECT 
            pos.vehicle_id as id,
            v.name,
            v.type::text,
            COALESCE(cf.total_distributions, 0) as value,
            0.0 as percentage,
            jsonb_build_object(
                'distribution_count', cf.distribution_count,
                'last_distribution_date', cf.last_distribution_date,
                'currency', sub.currency
            ) as metadata
        FROM positions pos
        JOIN vehicles v ON pos.vehicle_id = v.id
        JOIN subscriptions sub ON pos.investor_id = sub.investor_id AND pos.vehicle_id = sub.vehicle_id
        LEFT JOIN LATERAL (
            SELECT 
                SUM(amount) as total_distributions,
                COUNT(*) as distribution_count,
                MAX(date) as last_distribution_date
            FROM cashflows cf
            WHERE cf.investor_id = pos.investor_id 
              AND cf.vehicle_id = pos.vehicle_id 
              AND cf.type = 'distribution'
              AND cf.date <= as_of_date
        ) cf ON true
        WHERE pos.investor_id = ANY(investor_ids)
          AND COALESCE(cf.total_distributions, 0) > 0
        ORDER BY value DESC;

    ELSIF kpi_type = 'deal_breakdown' THEN
        RETURN QUERY
        SELECT 
            alloc.deal_id as id,
            deals.name,
            deals.deal_type::text as type,
            alloc.units * alloc.unit_price as value,
            0.0 as percentage,
            jsonb_build_object(
                'units', alloc.units,
                'unit_price', alloc.unit_price,
                'status', alloc.status,
                'approved_at', alloc.approved_at,
                'company_name', deals.company_name,
                'sector', deals.sector,
                'currency', deals.currency
            ) as metadata
        FROM allocations alloc
        JOIN deals ON alloc.deal_id = deals.id
        WHERE alloc.investor_id = ANY(investor_ids)
          AND alloc.status IN ('approved', 'settled')
        ORDER BY value DESC;

    END IF;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_investor_vehicle_breakdown(investor_ids uuid[])
 RETURNS TABLE(vehicle_id uuid, vehicle_name text, vehicle_type text, current_value numeric, cost_basis numeric, units numeric, unrealized_gain numeric, unrealized_gain_pct numeric, commitment numeric, contributed numeric, distributed numeric, nav_per_unit numeric, last_valuation_date date)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.name,
        v.type::text,
        CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END::numeric(18,2) as current_value,
        COALESCE(p.cost_basis, 0),
        COALESCE(p.units, 0),
        (CASE
            WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
            WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
            ELSE 0
        END - COALESCE(p.cost_basis, 0))::numeric(18,2) as unrealized_gain,
        CASE
            WHEN p.cost_basis > 0 THEN
                ((CASE
                    WHEN lv.nav_per_unit IS NOT NULL THEN p.units * lv.nav_per_unit
                    WHEN p.last_nav IS NOT NULL THEN p.units * p.last_nav
                    ELSE 0
                END - p.cost_basis) / p.cost_basis * 100)::numeric(5,2)
            ELSE 0
        END as unrealized_gain_pct,
        COALESCE(s.commitment, 0),
        COALESCE(contrib.total, 0) as contributed,
        COALESCE(distrib.total, 0) as distributed,
        COALESCE(lv.nav_per_unit, p.last_nav),
        lv.as_of_date
    FROM vehicles v
    LEFT JOIN positions p ON v.id = p.vehicle_id AND p.investor_id = ANY(investor_ids)
    LEFT JOIN subscriptions s ON v.id = s.vehicle_id AND s.investor_id = ANY(investor_ids)
    LEFT JOIN get_latest_valuations() lv ON v.id = lv.vehicle_id
    LEFT JOIN (
        SELECT vehicle_id, SUM(amount) as total
        FROM cashflows
        WHERE investor_id = ANY(investor_ids) AND type = 'call'
        GROUP BY vehicle_id
    ) contrib ON v.id = contrib.vehicle_id
    LEFT JOIN (
        SELECT vehicle_id, SUM(amount) as total
        FROM cashflows
        WHERE investor_id = ANY(investor_ids) AND type = 'distribution'
        GROUP BY vehicle_id
    ) distrib ON v.id = distrib.vehicle_id
    WHERE p.investor_id = ANY(investor_ids)
    AND p.units > 0
    ORDER BY current_value DESC;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_latest_valuations()
 RETURNS TABLE(vehicle_id uuid, nav_per_unit numeric, as_of_date date)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (v.vehicle_id)
        v.vehicle_id,
        v.nav_per_unit,
        v.as_of_date
    FROM valuations v
    WHERE v.nav_per_unit IS NOT NULL
    ORDER BY v.vehicle_id, v.as_of_date DESC;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_my_investor_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select investor_id from investor_users where user_id = auth.uid();
$function$;
CREATE OR REPLACE FUNCTION public.get_portfolio_trends(investor_ids uuid[], days_back integer DEFAULT 30)
 RETURNS TABLE(nav_change numeric, nav_change_pct numeric, performance_change numeric, period_days integer)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    current_kpis record;
    previous_kpis record;
    calc_nav_change numeric(18,2) := 0;
    calc_nav_change_pct numeric(5,2) := 0;
    calc_performance_change numeric(5,2) := 0;
BEGIN
    -- Get current KPIs
    SELECT * INTO current_kpis
    FROM calculate_investor_kpis(investor_ids, CURRENT_DATE);

    -- Get KPIs from days_back ago (simplified - uses current positions with older valuations)
    SELECT * INTO previous_kpis
    FROM calculate_investor_kpis(investor_ids, CURRENT_DATE - days_back);

    -- Calculate changes
    calc_nav_change := current_kpis.current_nav - previous_kpis.current_nav;

    IF previous_kpis.current_nav > 0 THEN
        calc_nav_change_pct := (calc_nav_change / previous_kpis.current_nav) * 100;
    END IF;

    calc_performance_change := current_kpis.unrealized_gain_pct - previous_kpis.unrealized_gain_pct;

    RETURN QUERY SELECT
        calc_nav_change,
        calc_nav_change_pct,
        calc_performance_change,
        days_back;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_reconciliation_summary()
 RETURNS TABLE(total_transactions bigint, matched_transactions bigint, unmatched_transactions bigint, match_rate numeric, reconciled_amount numeric, pending_amount numeric)
 LANGUAGE sql
AS $function$
  WITH tx AS (
    SELECT
      count(*) AS total_transactions,
      count(*) FILTER (WHERE status = 'matched') AS matched_transactions,
      count(*) FILTER (WHERE status <> 'matched') AS unmatched_transactions,
      coalesce(sum(amount) FILTER (WHERE status = 'matched'), 0) AS reconciled_amount,
      coalesce(sum(amount) FILTER (WHERE status <> 'matched'), 0) AS pending_amount
    FROM public.bank_transactions
  )
  SELECT
    tx.total_transactions,
    tx.matched_transactions,
    tx.unmatched_transactions,
    CASE WHEN tx.total_transactions = 0 THEN 0 ELSE round(tx.matched_transactions::numeric / tx.total_transactions * 100, 1) END AS match_rate,
    tx.reconciled_amount,
    tx.pending_amount
  FROM tx;
$function$;
CREATE OR REPLACE FUNCTION public.get_task_progress_by_category(p_user_id uuid, p_investor_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(category text, total_tasks bigint, completed_tasks bigint, percentage numeric)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    t.category,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE t.status IN ('completed', 'waived')) as completed_tasks,
    ROUND((COUNT(*) FILTER (WHERE t.status IN ('completed', 'waived'))::numeric / COUNT(*)::numeric) * 100, 0) as percentage
  FROM tasks t
  WHERE t.owner_user_id = p_user_id
    AND (p_investor_id IS NULL OR t.owner_investor_id = p_investor_id)
    AND t.category IS NOT NULL
  GROUP BY t.category;
$function$;
CREATE OR REPLACE FUNCTION public.get_unread_message_count(p_user_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  unread_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages m
  JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
  WHERE cp.user_id = p_user_id
    AND m.created_at > cp.last_read_at
    AND m.sender_id != p_user_id
    AND m.deleted_at IS NULL;

  RETURN unread_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_role text;
  user_display_name text;
BEGIN
  -- Extract role from metadata, default to 'investor'
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'investor');
  
  -- Extract display name from metadata
  user_display_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  -- Insert profile with type cast
  INSERT INTO public.profiles (id, email, role, display_name, created_at)
  VALUES (
    new.id,
    new.email,
    user_role::user_role,
    user_display_name,
    NOW()
  );
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.email, SQLERRM;
    RETURN new;
END;
$function$;
CREATE OR REPLACE FUNCTION public.has_document_access(p_document_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_doc documents%ROWTYPE;
BEGIN
  SELECT * INTO v_doc FROM documents WHERE id = p_document_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Staff always have access
  IF is_staff_user() THEN
    RETURN true;
  END IF;
  
  -- Document must be published for investors
  IF NOT v_doc.is_published THEN
    RETURN false;
  END IF;
  
  -- Check vehicle access
  IF v_doc.vehicle_id IS NOT NULL THEN
    RETURN has_vehicle_access(v_doc.vehicle_id);
  END IF;
  
  -- Check investor ownership
  IF v_doc.owner_investor_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM investor_users 
      WHERE investor_id = v_doc.owner_investor_id 
      AND user_id = auth.uid()
    );
  END IF;
  
  -- Check user ownership
  IF v_doc.owner_user_id IS NOT NULL THEN
    RETURN v_doc.owner_user_id = auth.uid();
  END IF;
  
  -- Check deal membership
  IF v_doc.deal_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM deal_memberships 
      WHERE deal_id = v_doc.deal_id 
      AND user_id = auth.uid()
    );
  END IF;
  
  RETURN false;
END;
$function$;
CREATE OR REPLACE FUNCTION public.has_vehicle_access(p_vehicle_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Staff always have access
  IF is_staff_user() THEN
    RETURN true;
  END IF;
  
  -- Check investor access
  RETURN EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN investor_users iu ON iu.investor_id = s.investor_id
    WHERE s.vehicle_id = p_vehicle_id 
    AND iu.user_id = auth.uid()
  );
END;
$function$;
CREATE OR REPLACE FUNCTION public.is_staff_user()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role::text LIKE 'staff_%'
  );
END;
$function$;
CREATE OR REPLACE FUNCTION public.log_approval_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_action text;
  v_actor_id uuid;
BEGIN
  -- Determine action type and actor
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_actor_id := NEW.requested_by;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := CASE NEW.status
        WHEN 'approved' THEN 'approved'
        WHEN 'rejected' THEN 'rejected'
        WHEN 'escalated' THEN 'escalated'
        WHEN 'awaiting_info' THEN 'info_requested'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'updated'
      END;
      v_actor_id := NEW.approved_by;

      -- Calculate processing time when resolved
      IF NEW.status IN ('approved', 'rejected') THEN
        NEW.resolved_at := now();

        -- Calculate actual time excluding paused periods
        IF NEW.sla_paused_at IS NOT NULL AND NEW.sla_resumed_at IS NOT NULL THEN
          -- Subtract paused duration
          NEW.actual_processing_time_hours :=
            EXTRACT(EPOCH FROM (
              (now() - NEW.created_at) -
              (NEW.sla_resumed_at - NEW.sla_paused_at)
            )) / 3600;
        ELSE
          NEW.actual_processing_time_hours :=
            EXTRACT(EPOCH FROM (now() - NEW.created_at)) / 3600;
        END IF;
      END IF;

    -- Assignment changes
    ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      v_action := 'reassigned';
      v_actor_id := NEW.assigned_to;

    -- Secondary approval
    ELSIF OLD.secondary_approved_at IS NULL AND NEW.secondary_approved_at IS NOT NULL THEN
      v_action := 'secondary_approved';
      v_actor_id := NEW.secondary_approved_by;
    ELSE
      -- Skip logging for minor updates
      RETURN NEW;
    END IF;

    -- Update the updated_at timestamp
    NEW.updated_at := now();
  END IF;

  -- Insert history record
  INSERT INTO approval_history (
    approval_id,
    action,
    actor_id,
    notes,
    metadata
  ) VALUES (
    NEW.id,
    v_action,
    COALESCE(v_actor_id, NEW.approved_by, NEW.assigned_to),
    NEW.notes,
    jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'old_assigned_to', OLD.assigned_to,
      'new_assigned_to', NEW.assigned_to
    )
  );

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.log_audit_event(p_event_type text, p_action text, p_actor_id uuid, p_entity_type text, p_entity_id uuid, p_entity_name text, p_action_details jsonb, p_before jsonb, p_after jsonb, p_risk_level text, p_compliance_flag boolean, p_retention_category text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_actor record;
  v_new_id uuid;
BEGIN
  IF p_actor_id IS NOT NULL THEN
    SELECT id, email, display_name, role
    INTO v_actor
    FROM public.profiles
    WHERE id = p_actor_id;
  END IF;

  INSERT INTO public.audit_logs (
    event_type,
    action,
    actor_id,
    actor_email,
    actor_name,
    actor_role,
    entity_type,
    entity_id,
    entity_name,
    action_details,
    before_value,
    after_value,
    risk_level,
    compliance_flag,
    retention_category,
    retention_expiry
  )
  VALUES (
    p_event_type,
    p_action,
    p_actor_id,
    v_actor.email,
    v_actor.display_name,
    v_actor.role,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_action_details,
    p_before,
    p_after,
    coalesce(p_risk_level, 'low'),
    coalesce(p_compliance_flag, false),
    coalesce(p_retention_category, 'operational'),
    CASE
      WHEN p_retention_category = 'operational' THEN current_date + interval '1 year'
      WHEN p_retention_category = 'financial' THEN current_date + interval '7 years'
      WHEN p_retention_category = 'legal_hold' THEN NULL
      ELSE current_date + interval '1 year'
    END
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.mark_compliance_review(p_audit_log_id uuid, p_reviewer_id uuid, p_status text, p_notes text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.audit_logs
  SET compliance_review_status = p_status,
      compliance_reviewer_id = p_reviewer_id,
      compliance_reviewed_at = now(),
      compliance_notes = p_notes
  WHERE id = p_audit_log_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = greatest(coalesce(last_read_at, '-infinity'::timestamptz), now())
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.mark_overdue_tasks()
 RETURNS TABLE(updated_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_count bigint;
BEGIN
  WITH updated AS (
    UPDATE tasks
    SET status = 'overdue'
    WHERE status IN ('pending', 'in_progress')
      AND due_at IS NOT NULL
      AND due_at < now()
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM updated;
  RETURN QUERY SELECT v_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$function$;
CREATE OR REPLACE FUNCTION public.publish_scheduled_documents()
 RETURNS TABLE(document_id uuid, published_count integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update documents that should be published
  WITH to_publish AS (
    SELECT dps.document_id
    FROM document_publishing_schedule dps
    WHERE dps.publish_at <= now()
      AND NOT dps.published
  )
  UPDATE documents d
  SET 
    is_published = true,
    published_at = now(),
    status = 'published'
  FROM to_publish tp
  WHERE d.id = tp.document_id;
  
  -- Mark schedule entries as published
  UPDATE document_publishing_schedule
  SET published = true
  WHERE publish_at <= now()
    AND NOT published;
  
  -- Return results
  RETURN QUERY
  SELECT d.id, 1::int
  FROM documents d
  WHERE d.published_at >= now() - interval '1 minute';
END;
$function$;
CREATE OR REPLACE FUNCTION public.run_auto_match()
 RETURNS TABLE(transaction_id uuid, invoice_id uuid, confidence integer, reason text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_transaction record;
  v_invoice record;
  v_confidence int;
  v_reason text;
  v_amount_diff numeric;
BEGIN
  FOR v_transaction IN
    SELECT * FROM public.bank_transactions
    WHERE status = 'unmatched'
  LOOP
    FOR v_invoice IN
      SELECT i.id,
             i.total AS total_amount,
             i.balance_due,
             inv.legal_name,
             similarity(coalesce(v_transaction.counterparty,''), coalesce(inv.legal_name,'')) AS name_similarity
      FROM public.invoices i
      JOIN public.investors inv ON inv.id = i.investor_id
      WHERE i.status IN ('sent','partially_paid','overdue')
        AND i.currency = v_transaction.currency
        AND i.balance_due > 0
      ORDER BY ABS(i.balance_due - v_transaction.amount) ASC,
               name_similarity DESC
      LIMIT 1
    LOOP
      v_confidence := 0;
      v_reason := '';
      v_amount_diff := v_transaction.amount - v_invoice.balance_due;

      IF abs(v_amount_diff) <= 1 THEN
        v_confidence := v_confidence + 50;
        v_reason := 'Exact amount match';
      ELSIF abs(v_amount_diff) / NULLIF(v_invoice.balance_due,0) < 0.05 THEN
        v_confidence := v_confidence + 40;
        v_reason := 'Amount match within 5%';
      ELSIF abs(v_amount_diff) / NULLIF(v_invoice.balance_due,0) < 0.10 THEN
        v_confidence := v_confidence + 20;
        v_reason := 'Amount match within 10%';
      END IF;

      IF v_invoice.name_similarity > 0.8 THEN
        v_confidence := v_confidence + 40;
        v_reason := v_reason || ', strong counterparty match';
      ELSIF v_invoice.name_similarity > 0.6 THEN
        v_confidence := v_confidence + 25;
        v_reason := v_reason || ', good counterparty match';
      ELSIF v_invoice.name_similarity > 0.4 THEN
        v_confidence := v_confidence + 10;
        v_reason := v_reason || ', possible counterparty match';
      END IF;

      IF v_transaction.value_date BETWEEN current_date - interval '30 days' AND current_date + interval '1 day' THEN
        v_confidence := v_confidence + 10;
      END IF;

      IF v_confidence >= 50 THEN
        INSERT INTO public.suggested_matches (bank_transaction_id, invoice_id, confidence, match_reason, amount_difference)
        VALUES (v_transaction.id, v_invoice.id, v_confidence, v_reason, v_amount_diff)
        ON CONFLICT DO NOTHING;

        RETURN QUERY SELECT v_transaction.id, v_invoice.id, v_confidence, v_reason;
      END IF;
    END LOOP;
  END LOOP;
END;
$function$;
CREATE OR REPLACE FUNCTION public.set_approval_sla_deadline()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_sla_hours int;
BEGIN
  -- Only set SLA on insert if not already set
  IF TG_OP = 'INSERT' AND NEW.sla_breach_at IS NULL THEN
    -- Calculate SLA hours based on priority
    v_sla_hours := CASE NEW.priority
      WHEN 'critical' THEN 2
      WHEN 'high' THEN 4
      WHEN 'medium' THEN 24
      WHEN 'low' THEN 72
      ELSE 24
    END;

    NEW.sla_breach_at := now() + (v_sla_hours || ' hours')::interval;
  END IF;

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.set_workflows_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.trg_conversation_set_owner()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  owner_exists boolean;
BEGIN
  IF NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT TRUE INTO owner_exists
  FROM conversation_participants
  WHERE conversation_id = NEW.id AND participant_role = 'owner'
  LIMIT 1;

  IF NOT owner_exists THEN
    INSERT INTO conversation_participants (conversation_id, user_id, participant_role, joined_at)
    VALUES (NEW.id, NEW.created_by, 'owner', COALESCE(NEW.created_at, now()))
    ON CONFLICT (conversation_id, user_id) DO UPDATE
      SET participant_role = EXCLUDED.participant_role;
  END IF;

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.trg_refresh_conversation_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      last_message_id = NEW.id,
      preview = COALESCE(NULLIF(left(NEW.body, 320), ''), preview),
      updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.trg_touch_conversation_participant()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.unlock_dependent_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status IN ('completed', 'waived') AND OLD.status NOT IN ('completed', 'waived') THEN
    UPDATE tasks t
    SET status = 'pending'
    WHERE t.id IN (
      SELECT td.task_id
      FROM task_dependencies td
      WHERE td.depends_on_task_id = NEW.id
        AND NOT EXISTS (
          SELECT 1 FROM task_dependencies td2
          JOIN tasks t2 ON t2.id = td2.depends_on_task_id
          WHERE td2.task_id = td.task_id
            AND td2.depends_on_task_id != NEW.id
            AND t2.status NOT IN ('completed', 'waived')
        )
    )
    AND t.status = 'blocked';
  END IF;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.unpublish_expired_documents()
 RETURNS TABLE(document_id uuid, unpublished_count integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update documents that should be unpublished
  WITH to_unpublish AS (
    SELECT dps.document_id
    FROM document_publishing_schedule dps
    WHERE dps.unpublish_at IS NOT NULL
      AND dps.unpublish_at <= now()
      AND dps.published
  )
  UPDATE documents d
  SET 
    is_published = false,
    status = 'archived'
  FROM to_unpublish tu
  WHERE d.id = tu.document_id;
  
  -- Return results
  RETURN QUERY
  SELECT d.id, 1::int
  FROM documents d
  WHERE d.status = 'archived'
    AND d.updated_at >= now() - interval '1 minute';
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.user_has_deal_access(target_deal_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Check if user has direct access to the deal
  if exists (
    select 1 from deal_memberships dm
    where dm.deal_id = target_deal_id
      and dm.user_id = auth.uid()
  ) then
    return true;
  end if;

  -- Check if user's investor has access to the deal
  if exists (
    select 1 from deal_memberships dm
    join investor_users iu on iu.investor_id = dm.investor_id
    where dm.deal_id = target_deal_id
      and iu.user_id = auth.uid()
  ) then
    return true;
  end if;

  -- Check if user is staff
  if exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.role)::text like 'staff_%'
  ) then
    return true;
  end if;

  return false;
end;
$function$;
CREATE OR REPLACE FUNCTION public.user_is_staff()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and (p.role)::text like 'staff_%'
  );
end;
$function$;
CREATE OR REPLACE FUNCTION public.user_linked_to_investor(target_investor_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return exists (
    select 1
    from investor_users iu
    where iu.investor_id = target_investor_id
      and iu.user_id = auth.uid()
  );
end;
$function$;
create policy "conversation_participants_delete"
on "public"."conversation_participants"
as permissive
for delete
to public
using (((auth.uid() IN ( SELECT conversations.created_by
   FROM conversations
  WHERE (conversations.id = conversation_participants.conversation_id))) OR (auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = ANY (ARRAY['staff_admin'::user_role, 'staff_ops'::user_role, 'staff_rm'::user_role]))))));
create policy "conversation_participants_insert"
on "public"."conversation_participants"
as permissive
for insert
to public
with check (((auth.uid() IN ( SELECT conversations.created_by
   FROM conversations
  WHERE (conversations.id = conversation_participants.conversation_id))) OR (auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = ANY (ARRAY['staff_admin'::user_role, 'staff_ops'::user_role, 'staff_rm'::user_role]))))));
create policy "conversation_participants_select"
on "public"."conversation_participants"
as permissive
for select
to public
using (((user_id = auth.uid()) OR (auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = ANY (ARRAY['staff_admin'::user_role, 'staff_ops'::user_role, 'staff_rm'::user_role]))))));
create policy "conversation_participants_update"
on "public"."conversation_participants"
as permissive
for update
to public
using (((user_id = auth.uid()) OR (auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = ANY (ARRAY['staff_admin'::user_role, 'staff_ops'::user_role, 'staff_rm'::user_role]))))));
create policy "conversations_select"
on "public"."conversations"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM conversation_participants cp
  WHERE ((cp.conversation_id = conversations.id) AND (cp.user_id = auth.uid())))) OR ((deal_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM deal_memberships dm
  WHERE ((dm.deal_id = conversations.deal_id) AND (dm.user_id = auth.uid()))))) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['staff_admin'::user_role, 'staff_ops'::user_role, 'staff_rm'::user_role])))))));
create policy "messages_insert"
on "public"."messages"
as permissive
for insert
to public
with check (((sender_id = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM conversation_participants cp
  WHERE ((cp.conversation_id = messages.conversation_id) AND (cp.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['staff_admin'::user_role, 'staff_ops'::user_role, 'staff_rm'::user_role]))))))));
