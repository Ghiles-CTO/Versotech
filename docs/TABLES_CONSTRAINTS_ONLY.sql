CREATE TYPE "public"."allocation_status_enum" AS ENUM (
);
CREATE TYPE "public"."conversation_type_enum" AS ENUM (
);
CREATE TYPE "public"."conversation_visibility_enum" AS ENUM (
);
CREATE TYPE "public"."convo_type_enum" AS ENUM (
);
CREATE TYPE "public"."deal_member_role" AS ENUM (
);
CREATE TYPE "public"."deal_status_enum" AS ENUM (
);
CREATE TYPE "public"."deal_type_enum" AS ENUM (
);
CREATE TYPE "public"."entity_status" AS ENUM (
);
CREATE TYPE "public"."fee_calc_method_enum" AS ENUM (
);
CREATE TYPE "public"."fee_component_kind_enum" AS ENUM (
);
CREATE TYPE "public"."fee_event_status_enum" AS ENUM (
);
CREATE TYPE "public"."fee_frequency_enum" AS ENUM (
);
CREATE TYPE "public"."flag_severity" AS ENUM (
);
CREATE TYPE "public"."flag_type" AS ENUM (
);
CREATE TYPE "public"."folder_type" AS ENUM (
);
CREATE TYPE "public"."invoice_status_enum" AS ENUM (
);
CREATE TYPE "public"."message_type_enum" AS ENUM (
);
CREATE TYPE "public"."participant_role_enum" AS ENUM (
);
CREATE TYPE "public"."payment_status_enum" AS ENUM (
);
CREATE TYPE "public"."report_status_enum" AS ENUM (
);
CREATE TYPE "public"."reporting_type" AS ENUM (
);
CREATE TYPE "public"."request_priority_enum" AS ENUM (
);
CREATE TYPE "public"."request_status_enum" AS ENUM (
);
CREATE TYPE "public"."reservation_status_enum" AS ENUM (
);
CREATE TYPE "public"."stakeholder_role" AS ENUM (
);
CREATE TYPE "public"."user_role" AS ENUM (
);
CREATE TYPE "public"."vehicle_type" AS ENUM (
);
CREATE TABLE IF NOT EXISTS "public"."tasks" (
);
CREATE TABLE IF NOT EXISTS "public"."activity_feed" (
);
CREATE TABLE IF NOT EXISTS "public"."allocations" (
);
CREATE TABLE IF NOT EXISTS "public"."approval_history" (
);
CREATE TABLE IF NOT EXISTS "public"."approvals" (
);
CREATE TABLE IF NOT EXISTS "public"."arranger_entities" (
);
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
);
CREATE TABLE IF NOT EXISTS "public"."audit_report_templates" (
);
CREATE TABLE IF NOT EXISTS "public"."automation_webhook_events" (
);
CREATE TABLE IF NOT EXISTS "public"."bank_transactions" (
);
CREATE TABLE IF NOT EXISTS "public"."capital_call_items" (
);
CREATE TABLE IF NOT EXISTS "public"."capital_calls" (
);
CREATE TABLE IF NOT EXISTS "public"."cashflows" (
);
CREATE TABLE IF NOT EXISTS "public"."compliance_alerts" (
);
CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
);
CREATE TABLE IF NOT EXISTS "public"."conversations" (
);
CREATE TABLE IF NOT EXISTS "public"."counterparty_entity_members" (
);
CREATE TABLE IF NOT EXISTS "public"."dashboard_preferences" (
);
CREATE TABLE IF NOT EXISTS "public"."deal_activity_events" (
);
CREATE TABLE IF NOT EXISTS "public"."deal_data_room_access" (
);
CREATE TABLE IF NOT EXISTS "public"."deal_data_room_documents" (
);
CREATE TABLE IF NOT EXISTS "public"."deal_faqs" (
);
CREATE TABLE IF NOT EXISTS "public"."deal_fee_structures" (
);
CREATE TABLE IF NOT EXISTS "public"."deal_memberships" (
);
CREATE TABLE IF NOT EXISTS "public"."deal_subscription_submissions" (
);
CREATE TABLE IF NOT EXISTS "public"."deals" (
);
CREATE TABLE IF NOT EXISTS "public"."director_registry" (
);
CREATE TABLE IF NOT EXISTS "public"."distribution_items" (
);
CREATE TABLE IF NOT EXISTS "public"."distributions" (
);
CREATE TABLE IF NOT EXISTS "public"."document_approvals" (
);
CREATE TABLE IF NOT EXISTS "public"."document_folders" (
);
CREATE TABLE IF NOT EXISTS "public"."document_publishing_schedule" (
);
CREATE TABLE IF NOT EXISTS "public"."document_versions" (
);
CREATE TABLE IF NOT EXISTS "public"."documents" (
);
CREATE TABLE IF NOT EXISTS "public"."entity_flags" (
);
CREATE TABLE IF NOT EXISTS "public"."vehicles" (
);
CREATE TABLE IF NOT EXISTS "public"."entity_directors" (
);
CREATE TABLE IF NOT EXISTS "public"."entity_events" (
);
CREATE TABLE IF NOT EXISTS "public"."entity_folders" (
);
CREATE TABLE IF NOT EXISTS "public"."entity_investors" (
);
CREATE TABLE IF NOT EXISTS "public"."entity_stakeholders" (
);
CREATE TABLE IF NOT EXISTS "public"."esign_envelopes" (
);
CREATE TABLE IF NOT EXISTS "public"."fee_components" (
);
CREATE TABLE IF NOT EXISTS "public"."fee_events" (
);
CREATE TABLE IF NOT EXISTS "public"."fee_plans" (
);
CREATE TABLE IF NOT EXISTS "public"."fee_schedules" (
);
CREATE TABLE IF NOT EXISTS "public"."import_batches" (
);
CREATE TABLE IF NOT EXISTS "public"."introducer_commissions" (
);
CREATE TABLE IF NOT EXISTS "public"."introducers" (
);
CREATE TABLE IF NOT EXISTS "public"."introductions" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_counterparty" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_deal_holdings" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_deal_interest" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_interest_signals" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_members" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_notifications" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_terms" (
);
CREATE TABLE IF NOT EXISTS "public"."investor_users" (
);
CREATE TABLE IF NOT EXISTS "public"."investors" (
);
CREATE TABLE IF NOT EXISTS "public"."invite_links" (
);
CREATE TABLE IF NOT EXISTS "public"."invoice_lines" (
);
CREATE TABLE IF NOT EXISTS "public"."invoices" (
);
CREATE TABLE IF NOT EXISTS "public"."kyc_submissions" (
);
CREATE TABLE IF NOT EXISTS "public"."message_reads" (
);
CREATE TABLE IF NOT EXISTS "public"."messages" (
);
CREATE TABLE IF NOT EXISTS "public"."payments" (
);
CREATE TABLE IF NOT EXISTS "public"."performance_snapshots" (
);
CREATE TABLE IF NOT EXISTS "public"."positions" (
);
CREATE TABLE IF NOT EXISTS "public"."profiles" (
);
CREATE TABLE IF NOT EXISTS "public"."reconciliation_matches" (
);
CREATE TABLE IF NOT EXISTS "public"."reconciliations" (
);
CREATE TABLE IF NOT EXISTS "public"."report_requests" (
);
CREATE TABLE IF NOT EXISTS "public"."request_tickets" (
);
CREATE TABLE IF NOT EXISTS "public"."share_lots" (
);
CREATE TABLE IF NOT EXISTS "public"."share_sources" (
);
CREATE TABLE IF NOT EXISTS "public"."signature_requests" (
);
CREATE TABLE IF NOT EXISTS "public"."staff_filter_views" (
);
CREATE TABLE IF NOT EXISTS "public"."staff_permissions" (
);
CREATE TABLE IF NOT EXISTS "public"."subscription_fingerprints" (
);
CREATE TABLE IF NOT EXISTS "public"."subscription_import_results" (
);
CREATE TABLE IF NOT EXISTS "public"."subscription_workbook_runs" (
);
CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
);
CREATE TABLE IF NOT EXISTS "public"."suggested_matches" (
);
CREATE TABLE IF NOT EXISTS "public"."system_metrics" (
);
CREATE TABLE IF NOT EXISTS "public"."task_actions" (
);
CREATE TABLE IF NOT EXISTS "public"."task_dependencies" (
);
CREATE TABLE IF NOT EXISTS "public"."task_templates" (
);
CREATE TABLE IF NOT EXISTS "public"."term_sheets" (
);
CREATE TABLE IF NOT EXISTS "public"."valuations" (
);
CREATE TABLE IF NOT EXISTS "public"."workflow_run_logs" (
);
CREATE TABLE IF NOT EXISTS "public"."workflow_runs" (
);
CREATE TABLE IF NOT EXISTS "public"."workflows" (
);
