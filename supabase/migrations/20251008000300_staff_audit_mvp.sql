-- Audit & Compliance MVP migration
-- Creates audit_logs, compliance_alerts, report templates, and supporting policies

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  action text NOT NULL,
  actor_id uuid REFERENCES public.profiles(id),
  actor_email text,
  actor_name text,
  actor_role text,
  entity_type text,
  entity_id uuid,
  entity_name text,
  action_details jsonb,
  before_value jsonb,
  after_value jsonb,
  ip_address text,
  user_agent text,
  session_id uuid,
  risk_level text CHECK (risk_level IN ('low','medium','high')) DEFAULT 'low',
  compliance_flag boolean DEFAULT false,
  compliance_review_status text CHECK (compliance_review_status IN ('pending','reviewed','escalated')) DEFAULT 'pending',
  compliance_reviewer_id uuid REFERENCES public.profiles(id),
  compliance_reviewed_at timestamptz,
  compliance_notes text,
  retention_category text CHECK (retention_category IN ('operational','financial','legal_hold')) DEFAULT 'operational',
  retention_expiry date,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id uuid REFERENCES public.audit_logs(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text CHECK (severity IN ('low','medium','high','critical')) DEFAULT 'medium',
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('open','investigating','resolved','false_positive')) DEFAULT 'open',
  assigned_to uuid REFERENCES public.profiles(id),
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.audit_report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  report_type text CHECK (report_type IN ('soc2','gdpr','sec','internal','custom')) NOT NULL,
  config jsonb NOT NULL,
  output_format text[] DEFAULT ARRAY['pdf','csv'],
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);
INSERT INTO public.audit_report_templates (name, description, report_type, config)
VALUES
  ('SOC 2 Type II Audit', 'Comprehensive audit trail for SOC 2 compliance', 'soc2', '{"event_types":["data_modification","access_control","authentication"],"risk_levels":["medium","high"],"include_sections":["access_control","data_modifications","failed_attempts","system_changes"],"date_range":"last_12_months","group_by":"month"}'),
  ('GDPR Data Access Report', 'User data access audit for GDPR compliance', 'gdpr', '{"event_types":["data_modification","document_access","document_download"],"filter_by_entity":"investor","include_personal_data_access":true,"date_range":"all_time"}'),
  ('Security Incident Report', 'Failed login attempts and security events', 'internal', '{"actions":["login_failed","failed_login_attempt","session_timeout"],"risk_levels":["high"],"include_ip_analysis":true,"date_range":"last_30_days"}')
ON CONFLICT (name) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk ON public.audit_logs(risk_level, timestamp DESC) WHERE risk_level IN ('medium','high');
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON public.audit_logs(compliance_flag, timestamp DESC) WHERE compliance_flag = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON public.audit_logs USING gin (to_tsvector('english', coalesce(actor_name,'') || ' ' || coalesce(actor_email,'') || ' ' || coalesce(action,'') || ' ' || coalesce(entity_name,'') || ' ' || coalesce(compliance_notes,'')));
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status ON public.compliance_alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_assigned ON public.compliance_alerts(assigned_to, status, created_at DESC);
CREATE TABLE IF NOT EXISTS public.audit_log_hash_chain (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id uuid REFERENCES public.audit_logs(id) ON DELETE CASCADE,
  hash bytea NOT NULL,
  prev_hash bytea,
  created_at timestamptz DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.append_audit_hash()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
$$;
DROP TRIGGER IF EXISTS trg_audit_logs_hash_chain ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_hash_chain
  AFTER INSERT ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.append_audit_hash();
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$;
DROP TRIGGER IF EXISTS trg_audit_logs_no_update ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_no_update
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();
DROP TRIGGER IF EXISTS trg_audit_logs_no_delete ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_no_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_event_type text,
  p_action text,
  p_actor_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_entity_name text,
  p_action_details jsonb,
  p_before jsonb,
  p_after jsonb,
  p_risk_level text,
  p_compliance_flag boolean,
  p_retention_category text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
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
$$;
CREATE OR REPLACE FUNCTION public.mark_compliance_review(
  p_audit_log_id uuid,
  p_reviewer_id uuid,
  p_status text,
  p_notes text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.audit_logs
  SET compliance_review_status = p_status,
      compliance_reviewer_id = p_reviewer_id,
      compliance_reviewed_at = now(),
      compliance_notes = p_notes
  WHERE id = p_audit_log_id;
END;
$$;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_report_templates ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'audit_logs_admin_read'
  ) THEN
    EXECUTE 'CREATE POLICY audit_logs_admin_read ON public.audit_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'audit_logs_insert'
  ) THEN
    EXECUTE 'CREATE POLICY audit_logs_insert ON public.audit_logs
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'',''staff_rm'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'compliance_alerts' AND policyname = 'compliance_alerts_admin'
  ) THEN
    EXECUTE 'CREATE POLICY compliance_alerts_admin ON public.compliance_alerts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'')
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'')
        )
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_report_templates' AND policyname = 'audit_report_templates_staff_read'
  ) THEN
    EXECUTE 'CREATE POLICY audit_report_templates_staff_read ON public.audit_report_templates
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN (''staff_admin'',''staff_ops'')
        )
      )';
  END IF;
END;
$$;
COMMIT;
