# Audit & Compliance Module PRD

**Product:** VERSO Staff Portal – Audit & Compliance
**Date:** October 2, 2025
**Status:** Active Development

---

## Executive Summary

The **Audit & Compliance** module provides comprehensive activity logging, compliance monitoring, and security oversight for the VERSO platform. This system maintains an immutable audit trail of all user actions, system events, and data modifications to ensure regulatory compliance, detect security threats, and support forensic investigations.

This PRD is structured in three parts:
1. **Part 1 – Business Context**: Comprehensive overview for non-technical stakeholders
2. **Part 2 – Technical Implementation**: Detailed technical specifications for developers
3. **Part 3 – Success Metrics**: KPIs and measurement framework

---

# PART 1: BUSINESS CONTEXT

## 1. Product Overview

### 1.1 Purpose
The Audit & Compliance module serves as the security and accountability backbone of the VERSO platform. It automatically logs all user actions, system events, and data modifications to create an immutable audit trail that supports:

- **Regulatory Compliance**: Meet SEC, GDPR, SOC 2, and industry audit requirements
- **Security Monitoring**: Detect suspicious activity and potential security breaches
- **Operational Transparency**: Provide visibility into who did what, when, and why
- **Incident Investigation**: Enable forensic analysis of security incidents or data discrepancies
- **Risk Management**: Identify high-risk activities requiring additional oversight

### 1.2 Key Features

1. **Comprehensive Activity Logging**
   - Captures all user actions (logins, document access, data modifications)
   - Records system events (automated workflows, scheduled jobs)
   - Tracks privileged operations (role changes, permission grants)
   - Logs failed access attempts and security events

2. **Risk-Based Classification**
   - Automatic risk scoring (low/medium/high) based on action type
   - Compliance flagging for events requiring manual review
   - Alert generation for critical security events
   - IP address and device tracking for anomaly detection

3. **Advanced Search & Filtering**
   - Full-text search across all audit fields
   - Filter by date range, actor, action type, entity, risk level
   - Export audit logs for external analysis
   - Generate compliance reports on-demand

4. **Real-Time Monitoring**
   - Live activity dashboard showing current system usage
   - Compliance alerts for flagged events
   - Security summary showing system health
   - Failed login attempt monitoring

5. **Compliance Reporting**
   - Pre-configured reports for common audit requirements
   - Custom report generation for specific time periods
   - Export to CSV/PDF for external auditors
   - Automated retention policy enforcement

---

## 2. User Stories & Workflows

### 2.1 Story: Investigating a Data Breach Attempt

**Actors**: Security Administrator (Lisa Chen)
**Scenario**: Lisa receives an alert about multiple failed login attempts from an unusual IP address.

**Workflow**:
1. Lisa opens the Audit & Compliance page and sees a compliance alert: "5 failed login attempts detected from IP 198.51.100.23"
2. She clicks "Review" on the compliance alert
3. The system displays all audit events from that IP address in the last 24 hours
4. She sees the failed attempts targeted the account "contact@acmefund.com" (a high-value investor)
5. She checks if any successful logins occurred from nearby IPs or time periods
6. Finding none, she marks the event as "Investigated - No breach" and documents her findings
7. She sets up an IP block rule for the suspicious address
8. She generates an incident report and exports it as PDF for the compliance team

**Business Value**: Rapid incident detection and investigation prevents data breaches and demonstrates due diligence to auditors.

---

### 2.2 Story: Auditing Privileged User Activity

**Actors**: Compliance Officer (Maria Rodriguez)
**Scenario**: As part of quarterly compliance review, Maria needs to audit all role changes and permission grants.

**Workflow**:
1. Maria navigates to Audit & Compliance and clicks "Filter"
2. She selects:
   - Action type: "user_role_change", "permission_grant"
   - Date range: Last 90 days
   - Risk level: Medium and High
3. The system displays 12 role change events
4. She reviews a high-risk event: "Changed user role from investor to staff_ops"
5. She clicks "Details" to see:
   - Who made the change (admin@verso.com)
   - When it occurred (2024-01-15 13:45:55 UTC)
   - Before/after values (investor → staff_ops)
   - Approval ticket reference (if required)
   - IP address and user agent
6. She verifies the change was authorized via the linked approval ticket
7. She marks the event as "Compliance Reviewed" with her notes
8. She exports the full role change report for the compliance file

**Business Value**: Ensures privileged operations are properly authorized and documented, meeting audit requirements.

---

### 2.3 Story: Tracking Document Access for Regulatory Audit

**Actors**: Chief Compliance Officer (John Smith)
**Scenario**: A regulator requests proof that investor documents are properly secured and access is controlled.

**Workflow**:
1. John opens Audit & Compliance and searches for "document_access" and "document_download" events
2. He filters to show only investor role access to sensitive documents (KYC, subscription agreements)
3. The system shows 45 document access events in the last 6 months
4. He reviews the access patterns:
   - Investors can only access their own documents ✓
   - No cross-investor document access detected ✓
   - All downloads are logged with timestamp and IP address ✓
   - Staff access is properly justified (linked to support tickets) ✓
5. He generates a "Document Access Control Report" covering the audit period
6. The report includes:
   - Total documents accessed by type
   - Access denied events (attempted unauthorized access)
   - Average response time to access requests
   - Breakdown by user role
7. He exports the report as PDF and submits it to the regulator

**Business Value**: Demonstrates robust access controls and data protection practices, satisfying regulatory requirements.

---

### 2.4 Story: Investigating Unusual System Activity

**Actors**: Operations Manager (Sarah Chen)
**Scenario**: Sarah notices unusual spike in system activity at 3 AM when no staff should be working.

**Workflow**:
1. Sarah opens the Audit & Compliance dashboard and sees "Today's Events" is unusually high
2. She filters events to show only 3:00 AM - 4:00 AM time window
3. The system displays 50 audit events, mostly "workflow_execution" actions
4. She sees the automated "Positions Statement Generator" workflow ran for all 50 investors
5. She clicks on one event to see details:
   - Action: "Automated generation of position statement for investor inv-001"
   - Actor: "system"
   - Triggered by: Scheduled job "monthly-positions-report"
6. She verifies this was the scheduled monthly report generation
7. She checks if all 50 reports completed successfully
8. Finding 2 failed executions, she creates support tickets to investigate those investors
9. She documents the review and marks the activity as "Expected - Scheduled Job"

**Business Value**: Distinguishes between legitimate automated activity and potential security threats, reducing false alarms.

---

### 2.5 Story: Preparing for SOC 2 Audit

**Actors**: CTO (Michael Anderson)
**Scenario**: The company is undergoing SOC 2 Type II audit and needs to demonstrate comprehensive logging and monitoring.

**Workflow**:
1. Michael opens Audit & Compliance and clicks "Generate Report"
2. He selects "SOC 2 Compliance Report" template
3. He configures the report parameters:
   - Date range: Last 12 months
   - Include sections: Access Control, Data Modifications, System Changes, Failed Access Attempts
   - Group by: Month
4. The system generates a comprehensive report showing:
   - 100% logging coverage of all privileged operations
   - Average failed login rate: 0.2% (industry standard: <1%)
   - Zero unauthorized data access events
   - All role changes properly documented and approved
   - Complete audit trail retention (12+ months)
5. He reviews the compliance summary:
   - ✓ All admin actions logged
   - ✓ Document access tracking active
   - ✓ Failed login monitoring enabled
   - ✓ Data encryption active
   - ✓ Automated log retention policy enforced
6. He exports the report package (PDF + CSV data) for the auditors
7. He schedules quarterly compliance reviews to maintain SOC 2 readiness

**Business Value**: Streamlines audit preparation and demonstrates security maturity, reducing audit duration and cost.

---

### 2.6 Story: Real-Time Compliance Monitoring

**Actors**: Compliance Team (Automated Alerts)
**Scenario**: The system automatically detects and flags high-risk events requiring immediate review.

**Workflow**:
1. A staff admin updates an investor's KYC status from "pending" to "completed"
2. The system automatically:
   - Logs the audit event with full details
   - Classifies it as "medium risk" (data modification)
   - Flags it for compliance review (data modification without approval workflow)
   - Sends Slack notification to #compliance-alerts channel
3. Compliance officer receives the alert and reviews within 15 minutes
4. She verifies:
   - The KYC documents were properly uploaded and verified
   - The change aligns with the investor onboarding process
   - No approval was required for this type of change (per policy)
5. She marks the event as "Reviewed - Compliant" and documents the justification
6. The event is removed from the compliance alerts queue
7. The system tracks average review time (target: <30 minutes for medium-risk events)

**Business Value**: Proactive compliance monitoring catches issues before they become problems, reducing regulatory risk.

---

## 3. Business Requirements

### 3.1 Functional Requirements

**FR-1: Comprehensive Event Logging**
- System MUST log all user actions that create, read, update, or delete data
- System MUST log all authentication events (login, logout, failed attempts)
- System MUST log all privileged operations (role changes, permission grants)
- System MUST log all automated system events (workflows, scheduled jobs)
- System MUST capture: timestamp, actor, action, entity, before/after values, IP address, user agent

**FR-2: Risk Classification**
- System MUST automatically classify events by risk level (low/medium/high)
- System MUST flag events requiring compliance review based on configurable rules
- System MUST generate alerts for critical security events (e.g., 5+ failed logins)
- System MUST track compliance review status and reviewer notes

**FR-3: Search & Filtering**
- Users MUST be able to search audit logs by: actor, action, entity, date range, risk level
- Users MUST be able to export filtered results to CSV/PDF
- Search results MUST return within 2 seconds for up to 1M events
- System MUST support full-text search across all audit fields

**FR-4: Compliance Reporting**
- System MUST provide pre-configured report templates (SOC 2, GDPR, SEC)
- Users MUST be able to generate custom reports with configurable parameters
- Reports MUST include: total events, breakdown by type, compliance summary, flagged events
- System MUST enforce audit log retention policy (minimum 7 years for financial records)

**FR-5: Real-Time Monitoring**
- Dashboard MUST show: total events (30 days), today's events, compliance flags, high-risk events, unique users
- System MUST send real-time alerts for compliance-flagged events
- Dashboard MUST refresh automatically every 60 seconds

### 3.2 Non-Functional Requirements

**NFR-1: Performance**
- Audit logging MUST NOT add >50ms latency to user actions
- Search queries MUST return results within 2 seconds
- System MUST handle 10,000 events/hour sustained load

**NFR-2: Security**
- Audit logs MUST be immutable (write-only, no updates or deletes)
- Access to audit logs MUST require "staff_admin" or "staff_compliance" role
- All audit log access MUST itself be audited (meta-logging)
- Audit data MUST be encrypted at rest and in transit

**NFR-3: Reliability**
- Audit logging MUST have 99.99% uptime (separate from main application)
- Failed audit writes MUST be queued and retried (not dropped)
- System MUST alert if audit logging fails for >5 minutes

**NFR-4: Compliance**
- System MUST meet SOC 2 Type II requirements for audit logging
- System MUST support GDPR right-to-access (export user's audit trail)
- System MUST enforce 7-year retention for financial transaction audits
- System MUST support legal hold (prevent deletion of specific records)

---

## 4. Audit Event Types

### 4.1 Authentication Events
- `login_success`: Successful user login
- `login_failed`: Failed login attempt (wrong password)
- `logout`: User logout
- `session_timeout`: Automatic session expiration
- `magic_link_sent`: Passwordless login link sent
- `magic_link_verified`: Passwordless login link used

### 4.2 Data Modification Events
- `investor_data_modify`: Update to investor profile or settings
- `deal_data_modify`: Update to deal terms or structure
- `allocation_modify`: Change to capital allocation
- `document_upload`: New document added
- `document_delete`: Document removed
- `fee_calculation_modify`: Manual fee adjustment

### 4.3 Access Control Events
- `user_role_change`: Role assignment change
- `permission_grant`: Permission added
- `permission_revoke`: Permission removed
- `document_access`: Document viewed
- `document_download`: Document downloaded
- `report_generate`: Custom report created

### 4.4 System Events
- `workflow_execution`: Automated workflow run
- `scheduled_job_run`: Cron job execution
- `email_sent`: System email sent
- `notification_sent`: In-app notification delivered
- `data_export`: Bulk data export performed

### 4.5 Compliance Events
- `kyc_status_change`: KYC verification status updated
- `accreditation_verify`: Investor accreditation verified
- `aml_check_run`: Anti-money laundering check performed
- `tax_form_submit`: Tax documentation submitted
- `regulatory_report_generate`: Compliance report created

---

## 5. Risk Scoring Framework

### 5.1 Low Risk Events (Routine Operations)
- Document viewing (investor views their own documents)
- Report generation (standard reports)
- Successful login from known IP
- Workflow execution (scheduled jobs)
- Email/notification sent

### 5.2 Medium Risk Events (Require Monitoring)
- Data modifications (investor profile updates)
- Document downloads (bulk downloads)
- Failed login attempts (1-2 attempts)
- Access from new IP address
- Permission changes (non-admin roles)

### 5.3 High Risk Events (Require Immediate Review)
- User role changes (privilege escalation)
- Multiple failed login attempts (3+)
- Data deletion (any permanent removal)
- Access to sensitive data (KYC, financial records)
- System configuration changes

---

## 6. Compliance Review Workflow

### 6.1 Automatic Flagging Rules
Events are automatically flagged for compliance review if:
- Risk level is "high"
- Data modification without linked approval ticket
- Access to investor data by staff (requires justification)
- Failed login attempts (3+ within 1 hour)
- After-hours activity by privileged users (outside 9 AM - 6 PM)

### 6.2 Review Process
1. **Detection**: Event is logged and automatically flagged
2. **Alert**: Compliance team receives real-time notification
3. **Review**: Officer investigates event details and context
4. **Disposition**: Mark as "Compliant", "Non-Compliant", or "Escalate"
5. **Documentation**: Add reviewer notes explaining decision
6. **Follow-up**: Create remediation tasks if non-compliant

### 6.3 SLA Targets
- High-risk events: Review within 30 minutes
- Medium-risk events: Review within 24 hours
- Low-risk events: No review required (automated monitoring)

---

# PART 2: TECHNICAL IMPLEMENTATION

## 1. Data Model

### 1.1 Core Schema

```sql
-- Main audit log table (immutable, append-only)
create table audit_logs (
  id uuid primary key default gen_random_uuid(),

  -- Event metadata
  timestamp timestamptz not null default now(),
  event_type text not null, -- 'authentication', 'data_modification', 'access_control', 'system', 'compliance'
  action text not null, -- 'login_success', 'investor_data_modify', etc.

  -- Actor information
  actor_id uuid references profiles(id), -- null for system events
  actor_email text,
  actor_name text,
  actor_role text, -- 'staff_admin', 'staff_rm', 'investor', 'system'

  -- Target entity
  entity_type text, -- 'investor', 'deal', 'document', 'user', 'workflow'
  entity_id uuid, -- ID of affected entity
  entity_name text, -- Human-readable name

  -- Event details
  action_details jsonb, -- Flexible structure for action-specific data
  before_value jsonb, -- State before change (for modifications)
  after_value jsonb, -- State after change (for modifications)

  -- Security metadata
  ip_address inet,
  user_agent text,
  session_id uuid,

  -- Risk & compliance
  risk_level text check (risk_level in ('low', 'medium', 'high')) default 'low',
  compliance_flag boolean default false,
  compliance_review_status text check (compliance_review_status in ('pending', 'reviewed', 'escalated')) default 'pending',
  compliance_reviewer_id uuid references profiles(id),
  compliance_reviewed_at timestamptz,
  compliance_notes text,

  -- Retention policy
  retention_category text check (retention_category in ('operational', 'financial', 'legal_hold')) default 'operational',
  retention_expiry date, -- null = indefinite retention

  -- Immutability enforcement
  created_at timestamptz not null default now()
);

-- Prevent updates and deletes (immutable log)
create or replace function prevent_audit_log_modification()
returns trigger as $$
begin
  raise exception 'Audit logs are immutable and cannot be modified or deleted';
end;
$$ language plpgsql;

create trigger prevent_audit_log_update
  before update on audit_logs
  for each row execute function prevent_audit_log_modification();

create trigger prevent_audit_log_delete
  before delete on audit_logs
  for each row execute function prevent_audit_log_modification();

-- Indexes for common queries
create index idx_audit_logs_timestamp on audit_logs(timestamp desc);
create index idx_audit_logs_actor on audit_logs(actor_id, timestamp desc);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id, timestamp desc);
create index idx_audit_logs_action on audit_logs(action, timestamp desc);
create index idx_audit_logs_risk on audit_logs(risk_level, timestamp desc) where risk_level in ('medium', 'high');
create index idx_audit_logs_compliance on audit_logs(compliance_flag, compliance_review_status, timestamp desc) where compliance_flag = true;
create index idx_audit_logs_ip on audit_logs(ip_address, timestamp desc);

-- Full-text search index
create index idx_audit_logs_search on audit_logs using gin(to_tsvector('english',
  coalesce(actor_name, '') || ' ' ||
  coalesce(actor_email, '') || ' ' ||
  coalesce(action, '') || ' ' ||
  coalesce(entity_name, '') || ' ' ||
  coalesce(compliance_notes, '')
));

-- Partitioning for performance (partition by month)
create table audit_logs_y2025m01 partition of audit_logs
  for values from ('2025-01-01') to ('2025-02-01');
-- (Create partitions for each month)
```

### 1.2 Compliance Alerts Table

```sql
create table compliance_alerts (
  id uuid primary key default gen_random_uuid(),
  audit_log_id uuid references audit_logs(id) not null,

  alert_type text not null, -- 'high_risk_action', 'failed_login_pattern', 'unusual_access', 'data_breach_attempt'
  severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',

  title text not null,
  description text,

  status text check (status in ('open', 'investigating', 'resolved', 'false_positive')) default 'open',
  assigned_to uuid references profiles(id),

  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid references profiles(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_compliance_alerts_status on compliance_alerts(status, created_at desc) where status in ('open', 'investigating');
create index idx_compliance_alerts_assigned on compliance_alerts(assigned_to, status, created_at desc);
```

### 1.3 Audit Report Templates

```sql
create table audit_report_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,

  report_type text check (report_type in ('soc2', 'gdpr', 'sec', 'internal', 'custom')) not null,

  -- Report configuration
  config jsonb not null, -- { "event_types": [...], "risk_levels": [...], "date_range": "last_90_days", etc. }

  -- Output format
  output_format text[] default array['pdf', 'csv'],

  is_active boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Pre-configured templates
insert into audit_report_templates (name, description, report_type, config) values
('SOC 2 Type II Audit', 'Comprehensive audit trail for SOC 2 compliance', 'soc2', '{
  "event_types": ["data_modification", "access_control", "authentication"],
  "risk_levels": ["medium", "high"],
  "include_sections": ["access_control", "data_modifications", "failed_attempts", "system_changes"],
  "date_range": "last_12_months",
  "group_by": "month"
}'),
('GDPR Data Access Report', 'User data access audit for GDPR compliance', 'gdpr', '{
  "event_types": ["data_modification", "document_access", "document_download"],
  "filter_by_entity": "investor",
  "include_personal_data_access": true,
  "date_range": "all_time"
}'),
('Security Incident Report', 'Failed login attempts and security events', 'internal', '{
  "actions": ["login_failed", "failed_login_attempt", "session_timeout"],
  "risk_levels": ["high"],
  "include_ip_analysis": true,
  "date_range": "last_30_days"
}');
```

---

## 2. API Routes

### 2.1 Log Audit Event (Internal Function)

```typescript
// /lib/audit/log-event.ts
import { createClient } from '@/lib/supabase/server'

export type AuditEventType = 'authentication' | 'data_modification' | 'access_control' | 'system' | 'compliance'
export type RiskLevel = 'low' | 'medium' | 'high'

interface LogAuditEventParams {
  eventType: AuditEventType
  action: string
  actorId?: string
  entityType?: string
  entityId?: string
  entityName?: string
  actionDetails?: Record<string, any>
  beforeValue?: Record<string, any>
  afterValue?: Record<string, any>
  riskLevel?: RiskLevel
  complianceFlag?: boolean
  retentionCategory?: 'operational' | 'financial' | 'legal_hold'
}

export async function logAuditEvent(params: LogAuditEventParams) {
  const supabase = createClient()

  // Get request metadata
  const headers = (await import('next/headers')).headers()
  const ipAddress = headers().get('x-forwarded-for') || headers().get('x-real-ip')
  const userAgent = headers().get('user-agent')

  // Get actor details if actorId provided
  let actorEmail: string | undefined
  let actorName: string | undefined
  let actorRole: string | undefined

  if (params.actorId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name, role')
      .eq('id', params.actorId)
      .single()

    if (profile) {
      actorEmail = profile.email
      actorName = profile.display_name
      actorRole = profile.role
    }
  }

  // Determine retention expiry
  let retentionExpiry: string | null = null
  if (params.retentionCategory === 'operational') {
    retentionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
  } else if (params.retentionCategory === 'financial') {
    retentionExpiry = new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
  }
  // legal_hold = null (indefinite)

  // Insert audit log (fire-and-forget, don't block user action)
  supabase
    .from('audit_logs')
    .insert({
      event_type: params.eventType,
      action: params.action,
      actor_id: params.actorId,
      actor_email: actorEmail,
      actor_name: actorName,
      actor_role: actorRole || 'system',
      entity_type: params.entityType,
      entity_id: params.entityId,
      entity_name: params.entityName,
      action_details: params.actionDetails,
      before_value: params.beforeValue,
      after_value: params.afterValue,
      ip_address: ipAddress,
      user_agent: userAgent,
      risk_level: params.riskLevel || 'low',
      compliance_flag: params.complianceFlag || false,
      retention_category: params.retentionCategory || 'operational',
      retention_expiry: retentionExpiry
    })
    .then(({ error }) => {
      if (error) {
        console.error('Failed to log audit event:', error)
        // Could send to error monitoring service (Sentry, etc.)
      }
    })

  // If compliance flagged, create alert
  if (params.complianceFlag) {
    await createComplianceAlert({
      action: params.action,
      actorName: actorName || actorEmail || 'Unknown',
      entityName: params.entityName,
      riskLevel: params.riskLevel || 'medium'
    })
  }
}

async function createComplianceAlert(params: {
  action: string
  actorName: string
  entityName?: string
  riskLevel: RiskLevel
}) {
  // Implementation would create compliance_alerts record and send notifications
}
```

### 2.2 Search Audit Logs API

```typescript
// /app/api/staff/audit/search/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createClient()

  // Verify user has audit access permission
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_compliance'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden - Requires admin or compliance role' }, { status: 403 })
  }

  // Log this audit access (meta-logging)
  await logAuditEvent({
    eventType: 'access_control',
    action: 'audit_log_access',
    actorId: user.id,
    entityType: 'audit_logs',
    riskLevel: 'low'
  })

  // Parse search parameters
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const actorId = searchParams.get('actor_id')
  const action = searchParams.get('action')
  const entityType = searchParams.get('entity_type')
  const riskLevel = searchParams.get('risk_level')
  const complianceFlag = searchParams.get('compliance_flag')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Build query
  let queryBuilder = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (query) {
    queryBuilder = queryBuilder.textSearch('fts', query)
  }
  if (actorId) {
    queryBuilder = queryBuilder.eq('actor_id', actorId)
  }
  if (action) {
    queryBuilder = queryBuilder.eq('action', action)
  }
  if (entityType) {
    queryBuilder = queryBuilder.eq('entity_type', entityType)
  }
  if (riskLevel) {
    queryBuilder = queryBuilder.eq('risk_level', riskLevel)
  }
  if (complianceFlag) {
    queryBuilder = queryBuilder.eq('compliance_flag', complianceFlag === 'true')
  }
  if (startDate) {
    queryBuilder = queryBuilder.gte('timestamp', startDate)
  }
  if (endDate) {
    queryBuilder = queryBuilder.lte('timestamp', endDate)
  }

  const { data: logs, error, count } = await queryBuilder

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    logs,
    total: count,
    limit,
    offset
  })
}
```

### 2.3 Review Compliance Event API

```typescript
// /app/api/staff/audit/review/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAuditEvent } from '@/lib/audit/log-event'

export async function POST(req: Request) {
  const supabase = createClient()

  // Verify user has compliance role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_compliance'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { audit_log_id, review_status, notes } = await req.json()

  // Update audit log with review
  const { data: updated, error } = await supabase
    .from('audit_logs')
    .update({
      compliance_review_status: review_status,
      compliance_reviewer_id: user.id,
      compliance_reviewed_at: new Date().toISOString(),
      compliance_notes: notes
    })
    .eq('id', audit_log_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log the compliance review action
  await logAuditEvent({
    eventType: 'compliance',
    action: 'compliance_review_completed',
    actorId: user.id,
    entityType: 'audit_log',
    entityId: audit_log_id,
    actionDetails: {
      review_status: review_status,
      reviewer_notes: notes
    },
    riskLevel: 'low'
  })

  return NextResponse.json({ audit_log: updated })
}
```

### 2.4 Generate Compliance Report API

```typescript
// /app/api/staff/audit/reports/generate/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAuditEvent } from '@/lib/audit/log-event'

export async function POST(req: Request) {
  const supabase = createClient()

  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_compliance'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { template_id, start_date, end_date, format } = await req.json()

  // Get report template
  const { data: template } = await supabase
    .from('audit_report_templates')
    .select('*')
    .eq('id', template_id)
    .single()

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // Query audit logs based on template config
  const config = template.config as any
  let queryBuilder = supabase
    .from('audit_logs')
    .select('*')
    .gte('timestamp', start_date)
    .lte('timestamp', end_date)

  if (config.event_types) {
    queryBuilder = queryBuilder.in('event_type', config.event_types)
  }
  if (config.risk_levels) {
    queryBuilder = queryBuilder.in('risk_level', config.risk_levels)
  }
  if (config.actions) {
    queryBuilder = queryBuilder.in('action', config.actions)
  }

  const { data: logs } = await queryBuilder

  // Generate report data
  const reportData = {
    template_name: template.name,
    report_type: template.report_type,
    date_range: { start: start_date, end: end_date },
    generated_at: new Date().toISOString(),
    generated_by: profile.display_name,

    summary: {
      total_events: logs?.length || 0,
      by_risk_level: {
        low: logs?.filter(l => l.risk_level === 'low').length || 0,
        medium: logs?.filter(l => l.risk_level === 'medium').length || 0,
        high: logs?.filter(l => l.risk_level === 'high').length || 0
      },
      by_event_type: {
        authentication: logs?.filter(l => l.event_type === 'authentication').length || 0,
        data_modification: logs?.filter(l => l.event_type === 'data_modification').length || 0,
        access_control: logs?.filter(l => l.event_type === 'access_control').length || 0,
        system: logs?.filter(l => l.event_type === 'system').length || 0,
        compliance: logs?.filter(l => l.event_type === 'compliance').length || 0
      },
      compliance_flags: logs?.filter(l => l.compliance_flag).length || 0,
      unique_actors: new Set(logs?.map(l => l.actor_id)).size
    },

    events: logs
  }

  // Log report generation
  await logAuditEvent({
    eventType: 'compliance',
    action: 'compliance_report_generated',
    actorId: user.id,
    entityType: 'audit_report',
    entityName: template.name,
    actionDetails: {
      template_id,
      date_range: { start_date, end_date },
      event_count: logs?.length
    },
    riskLevel: 'low'
  })

  if (format === 'csv') {
    // Convert to CSV format
    const csv = convertToCSV(logs)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${template.name}-${new Date().toISOString()}.csv"`
      }
    })
  }

  return NextResponse.json({ report: reportData })
}

function convertToCSV(logs: any[]) {
  // CSV conversion implementation
  const headers = ['Timestamp', 'Actor', 'Action', 'Entity', 'Risk Level', 'IP Address', 'Details']
  const rows = logs.map(log => [
    log.timestamp,
    log.actor_name || log.actor_email,
    log.action,
    log.entity_name || log.entity_id,
    log.risk_level,
    log.ip_address,
    JSON.stringify(log.action_details)
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}
```

---

## 3. Frontend Implementation

### 3.1 Audit Dashboard Page

```typescript
// /app/(staff)/versotech/staff/audit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Shield, Search, Filter, Download, Eye, Calendar,
  AlertTriangle, CheckCircle, Globe, Activity
} from 'lucide-react'

export default function AuditPage() {
  const supabase = createClient()
  const [auditLogs, setAuditLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    riskLevel: null,
    eventType: null,
    startDate: null,
    endDate: null
  })

  useEffect(() => {
    fetchAuditLogs()
    fetchStats()
  }, [filters])

  async function fetchAuditLogs() {
    setLoading(true)

    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (filters.riskLevel) params.append('risk_level', filters.riskLevel)
    if (filters.eventType) params.append('event_type', filters.eventType)
    if (filters.startDate) params.append('start_date', filters.startDate)
    if (filters.endDate) params.append('end_date', filters.endDate)
    params.append('limit', '50')

    const response = await fetch(`/api/staff/audit/search?${params}`)
    const data = await response.json()

    setAuditLogs(data.logs || [])
    setLoading(false)
  }

  async function fetchStats() {
    // Fetch aggregated stats
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (logs) {
      const today = new Date().toDateString()
      setStats({
        totalEvents: logs.length,
        todayEvents: logs.filter(l => new Date(l.timestamp).toDateString() === today).length,
        complianceFlags: logs.filter(l => l.compliance_flag).length,
        highRiskEvents: logs.filter(l => l.risk_level === 'high').length,
        uniqueUsers: new Set(logs.map(l => l.actor_id)).size
      })
    }
  }

  async function handleExportLogs() {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('start_date', filters.startDate)
    if (filters.endDate) params.append('end_date', filters.endDate)

    const response = await fetch(`/api/staff/audit/export?${params}`)
    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Implementation matches mockup from page.tsx */}
        {/* Stats cards, search, audit trail, compliance alerts */}
      </div>
    </AppLayout>
  )
}
```

---

## 4. Security Considerations

### 4.1 Access Control
- Audit log access restricted to `staff_admin` and `staff_compliance` roles
- All audit log access is itself audited (meta-logging)
- Row-level security policies enforce role-based access
- Export functionality requires additional permission

### 4.2 Data Protection
- Audit logs are immutable (database triggers prevent updates/deletes)
- Encryption at rest for sensitive audit data
- Personal data (IP addresses, user agents) subject to GDPR retention limits
- Legal hold capability to preserve specific records indefinitely

### 4.3 Performance & Scalability
- Table partitioning by month for efficient querying
- Indexes on common filter columns (timestamp, actor, action, risk_level)
- Async audit logging (doesn't block user actions)
- Retry queue for failed audit writes

---

# PART 3: SUCCESS METRICS

## 1. Key Performance Indicators (KPIs)

### 1.1 Operational Metrics
- **Audit Coverage**: 100% of privileged operations logged (target: 100%)
- **Logging Latency**: Audit write time <50ms (target: <50ms p95)
- **Search Performance**: Query results <2 seconds (target: <2s p95)
- **System Uptime**: Audit logging availability (target: 99.99%)

### 1.2 Compliance Metrics
- **Review SLA**: Compliance review within target time (target: 95% within SLA)
- **Flag Accuracy**: Percentage of flagged events that are truly non-compliant (target: >80%)
- **Audit Readiness**: Time to generate compliance report (target: <5 minutes)
- **Retention Compliance**: Zero data loss from premature deletion (target: 100%)

### 1.3 Security Metrics
- **Incident Detection Time**: Time from event to alert (target: <1 minute for high-risk)
- **False Positive Rate**: Percentage of alerts that are false alarms (target: <20%)
- **Failed Login Rate**: Percentage of failed login attempts (target: <1%)
- **Unauthorized Access Attempts**: Number of blocked access attempts (monitor for trends)

## 2. Success Criteria

**Phase 1 (MVP - Month 1)**
- ✅ Basic audit logging for all authentication and data modification events
- ✅ Search and filter functionality
- ✅ Export to CSV
- ✅ Immutable log storage with 7-year retention

**Phase 2 (Enhanced - Month 2)**
- ✅ Risk-based classification and compliance flagging
- ✅ Real-time alerts for high-risk events
- ✅ Compliance review workflow
- ✅ Pre-configured SOC 2 and GDPR report templates

**Phase 3 (Advanced - Month 3)**
- ✅ Anomaly detection (unusual access patterns)
- ✅ IP-based threat intelligence integration
- ✅ Automated compliance scoring
- ✅ Machine learning for risk classification

---

## 3. Appendix: Example Usage

### 3.1 Logging a User Login Event

```typescript
// In authentication flow
await logAuditEvent({
  eventType: 'authentication',
  action: 'login_success',
  actorId: user.id,
  entityType: 'user_session',
  entityId: sessionId,
  actionDetails: {
    login_method: 'magic_link',
    device_type: 'desktop'
  },
  riskLevel: 'low'
})
```

### 3.2 Logging a Data Modification Event

```typescript
// In investor update API
await logAuditEvent({
  eventType: 'data_modification',
  action: 'investor_data_modify',
  actorId: staffUserId,
  entityType: 'investor',
  entityId: investorId,
  entityName: investor.legal_name,
  beforeValue: { kyc_status: 'pending' },
  afterValue: { kyc_status: 'completed' },
  actionDetails: {
    approval_ticket: 'TICK-123',
    modified_fields: ['kyc_status']
  },
  riskLevel: 'medium',
  complianceFlag: true, // Flags for review
  retentionCategory: 'financial' // 7-year retention
})
```

### 3.3 Querying Audit Logs

```typescript
// Search for all failed login attempts in last 24 hours
const response = await fetch('/api/staff/audit/search?' + new URLSearchParams({
  action: 'failed_login_attempt',
  start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  risk_level: 'medium',
  limit: '100'
}))

const { logs, total } = await response.json()
console.log(`Found ${total} failed login attempts`)
```

---

**End of Document**
