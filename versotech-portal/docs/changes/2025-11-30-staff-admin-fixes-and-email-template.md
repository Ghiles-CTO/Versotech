# Change Log: Staff Admin Bug Fixes & Email Template Enhancement

**Date:** November 30, 2025
**Author:** Development Team
**Type:** Bug Fix & Enhancement

---

## Executive Summary

This change addresses critical bugs in the staff admin invitation feature and implements a professional branded email template for user invitations. The issues affected audit logging functionality across the entire platform and staff account deactivation.

---

## Table of Contents

1. [Phase 1: Audit Log Bug Fixes](#phase-1-audit-log-bug-fixes)
2. [Phase 2: Missing event_type Column Fixes](#phase-2-missing-event_type-column-fixes)
3. [Phase 3: Additional Audit Log Fixes](#phase-3-additional-audit-log-fixes)
4. [Phase 4: Email Template Enhancement](#phase-4-email-template-enhancement)
5. [Files Modified Summary](#files-modified-summary)
6. [Testing & Verification](#testing--verification)

---

## Phase 1: Audit Log Bug Fixes

### Problem Description

The staff admin features (invitation, deactivation, activity logging) were failing silently due to incorrect database table and column references in audit logging calls.

### Issues Identified

| Issue | Wrong Value | Correct Value |
|-------|-------------|---------------|
| Table name | `audit_log` | `audit_logs` |
| Actor column | `actor_user_id` | `actor_id` |
| Entity column | `entity` | `entity_type` |
| Details column | `details`, `metadata`, `description` | `action_details` |
| Ban duration | `'none'` | `'876000h'` (100 years) |
| Error parsing | `error.message` | `error.error` |

### Files Fixed (Phase 1)

#### 1. `src/app/api/admin/staff/[id]/deactivate/route.ts`

**Critical Bug:** Using `ban_duration: 'none'` actually **UNBANS** users instead of banning them.

```typescript
// BEFORE (broken)
const { error: authError } = await supabase.auth.admin.updateUserById(
  staffId,
  { ban_duration: 'none' }
)

// AFTER (fixed)
const { error: authError } = await supabase.auth.admin.updateUserById(
  staffId,
  { ban_duration: '876000h' }  // ~100 years = effectively permanent
)
```

**Audit logging fix:**
```typescript
// BEFORE
await supabase.from('audit_log').insert({
  actor_user_id: user.id,
  entity: 'staff',
  // ...
})

// AFTER
await supabase.from('audit_logs').insert({
  event_type: 'authorization',
  actor_id: user.id,
  entity_type: 'staff',
  // ...
})
```

#### 2. `src/app/api/admin/staff/[id]/activity/route.ts`

Fixed table and column names for activity querying.

#### 3. `src/app/api/admin/staff/route.ts`

Fixed audit logging for staff management operations.

#### 4. `src/app/api/admin/staff/invite/route.ts`

Fixed audit logging for staff invitation.

#### 5. `src/app/(staff)/versotech/staff/admin/components/staff-management-panel.tsx`

Fixed error parsing from Supabase Auth responses:
```typescript
// BEFORE
setError(error.message || 'Failed to invite user')

// AFTER
setError(error.error || 'Failed to invite user')
```

---

## Phase 2: Missing event_type Column Fixes

### Problem Description

The `audit_logs` table has a `event_type` column that is **NOT NULL** with no default value. All existing audit log inserts were missing this required field, causing silent constraint violations.

### Database Schema Reference

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,  -- REQUIRED, no default
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  action_details JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

### Valid event_type Values

Based on codebase analysis:
- `'system'` - System-level operations
- `'authorization'` - Auth/permission changes
- `'workflow'` - n8n workflow operations
- `'compliance'` - KYC/AML/document operations
- `'deal'` - Deal-related operations
- `'subscription'` - Subscription operations

### Files Fixed (Phase 2)

| File | event_type Added |
|------|------------------|
| `src/lib/audit.ts` | `'system'` |
| `src/lib/trigger-workflow.ts` | `'workflow'` |
| `src/app/api/workflows/[key]/trigger/route.ts` | `'workflow'` |
| `src/app/api/workflows/test-webhook/route.ts` | `'workflow'` |
| `src/app/api/webhooks/n8n/route.ts` | `'workflow'` |
| `src/app/api/admin/staff/[id]/deactivate/route.ts` | `'authorization'` |
| `src/app/api/admin/staff/invite/route.ts` | `'authorization'` |

### Example Fix (src/lib/audit.ts)

This is the main audit logger used by 90+ files across the codebase:

```typescript
// BEFORE
await supabase.from('audit_logs').insert({
  actor_id: entry.actor_user_id || null,
  action: entry.action,
  entity_type: entry.entity,
  entity_id: entry.entity_id || null,
  action_details: entry.metadata || null,
  timestamp: new Date().toISOString()
})

// AFTER
await supabase.from('audit_logs').insert({
  event_type: 'system',  // Added required field
  actor_id: entry.actor_user_id || null,
  action: entry.action,
  entity_type: entry.entity,
  entity_id: entry.entity_id || null,
  action_details: entry.metadata || null,
  timestamp: new Date().toISOString()
})
```

---

## Phase 3: Additional Audit Log Fixes

### Problem Description

During comprehensive codebase search, additional files were found with:
1. Missing `event_type` field
2. Using wrong column names (`details`, `description`, `metadata` instead of `action_details`)

### Files Fixed (Phase 3)

#### 1. `src/app/api/staff/kyc-submissions/[id]/review/route.ts`

**Issues:** Missing `event_type`, using `details` instead of `action_details`

```typescript
// BEFORE
await serviceSupabase.from('audit_logs').insert({
  actor_id: user.id,
  action: action === 'approve' ? 'kyc_document_approved' : 'kyc_document_rejected',
  entity_type: 'kyc_submission',
  entity_id: submissionId,
  details: {
    submission_type: submission.submission_type,
    investor_id: submission.investor_id,
    investor_name: submission.investor?.legal_name,
    notes: notes || null
  },
  timestamp: new Date().toISOString()
})

// AFTER
await serviceSupabase.from('audit_logs').insert({
  event_type: 'compliance',  // Added
  actor_id: user.id,
  action: action === 'approve' ? 'kyc_document_approved' : 'kyc_document_rejected',
  entity_type: 'kyc_submission',
  entity_id: submissionId,
  action_details: {  // Renamed from 'details'
    submission_type: submission.submission_type,
    investor_id: submission.investor_id,
    investor_name: submission.investor?.legal_name,
    notes: notes || null
  },
  timestamp: new Date().toISOString()
})
```

#### 2. `src/lib/signature/handlers.ts` (2 locations)

**NDA Handler Fix:**
```typescript
// BEFORE
await supabase.from('audit_logs').insert({
  actor_id: dealAccess.user_id,
  action: 'nda_signed',
  entity_type: 'deal',
  entity_id: signatureRequest.entity_id,
  description: `NDA signed for deal ${deal?.name || signatureRequest.entity_id}`,
  metadata: {
    deal_name: deal?.name,
    investor_name: signatureRequest.signer_name,
    signature_request_id: signatureRequest.id
  }
})

// AFTER
await supabase.from('audit_logs').insert({
  event_type: 'deal',  // Added
  actor_id: dealAccess.user_id,
  action: 'nda_signed',
  entity_type: 'deal',
  entity_id: signatureRequest.entity_id,
  action_details: {  // Combined description + metadata
    description: `NDA signed for deal ${deal?.name || signatureRequest.entity_id}`,
    deal_name: deal?.name,
    investor_name: signatureRequest.signer_name,
    signature_request_id: signatureRequest.id
  }
})
```

**Subscription Handler Fix:**
```typescript
// BEFORE
await supabase.from('audit_logs').insert({
  actor_id: signatureRequest.signer_user_id,
  action: 'subscription_signed',
  entity_type: 'subscription',
  entity_id: signatureRequest.entity_id,
  description: `Subscription agreement signed`,
  metadata: {
    signer_role: signatureRequest.signer_role,
    signer_name: signatureRequest.signer_name,
    signature_request_id: signatureRequest.id
  }
})

// AFTER
await supabase.from('audit_logs').insert({
  event_type: 'subscription',  // Added
  actor_id: signatureRequest.signer_user_id,
  action: 'subscription_signed',
  entity_type: 'subscription',
  entity_id: signatureRequest.entity_id,
  action_details: {  // Combined description + metadata
    description: `Subscription agreement signed`,
    signer_role: signatureRequest.signer_role,
    signer_name: signatureRequest.signer_name,
    signature_request_id: signatureRequest.id
  }
})
```

#### 3. `src/app/api/investors/me/documents/upload/route.ts`

**Issues:** Missing `event_type`, using `details` instead of `action_details`

```typescript
// BEFORE
await serviceSupabase.from('audit_logs').insert({
  actor_id: user.id,
  action: 'document_uploaded',
  entity_type: 'document',
  entity_id: document.id,
  details: {
    file_name: fileName,
    category,
    investor_id: investorId,
    storage_path: filePath
  },
  timestamp: new Date().toISOString()
})

// AFTER
await serviceSupabase.from('audit_logs').insert({
  event_type: 'compliance',  // Added
  actor_id: user.id,
  action: 'document_uploaded',
  entity_type: 'document',
  entity_id: document.id,
  action_details: {  // Renamed from 'details'
    file_name: fileName,
    category,
    investor_id: investorId,
    storage_path: filePath
  },
  timestamp: new Date().toISOString()
})
```

---

## Phase 4: Email Template Enhancement

### Problem Description

The default Supabase "Invite user" email template is generic and doesn't reflect VERSO branding or provide a professional onboarding experience.

### Solution

A custom branded HTML email template for the Supabase Dashboard that:
1. Supports both Staff AND Investor invitations with conditional content
2. Uses Go template syntax for personalization
3. Includes professional VERSO branding

### Template Location

Configure in: **Supabase Dashboard > Authentication > Email Templates > Invite user**

### Full Template Code

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 50px 40px;
      background: #ffffff;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid #f0f0f0;
    }
    .logo {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #000000;
      text-transform: uppercase;
      margin: 0;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 30px;
    }
    .content {
      font-size: 15px;
      color: #333333;
    }
    .content p {
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 45px 0;
    }
    .button {
      display: inline-block;
      background: #000000;
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo">VERSO</div>
    </div>

    <div class="greeting">Dear {{ .Data.display_name }},</div>

    <div class="content">
      {{ if eq .Data.role "investor" }}
      <p><strong>Welcome to VERSO Holdings</strong> — your gateway to exclusive investment opportunities.</p>
      <p>We are delighted to welcome you to the VERSO Holdings Investor Portal. This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
      <p>Through your personalized dashboard, you'll be able to:</p>
      <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Monitor your portfolio performance in real-time</li>
        <li>Access quarterly statements and K-1 documents</li>
        <li>Review and participate in new investment opportunities</li>
        <li>Communicate directly with your relationship manager</li>
        <li>Complete required compliance documentation</li>
      </ul>
      <p>Click the button below to set up your password and access your investor portal.</p>
      {{ else }}
      <p><strong>Welcome to VERSOTECH</strong> — the future of investment banking.</p>
      <p>We are delighted to introduce you to VERSOTECH, an AI-powered investment banking platform designed to revolutionize how we work. As a member of our team, you now have access to cutting-edge tools that will enhance your productivity and streamline complex workflows.</p>
      <p>Our platform integrates advanced automation, intelligent document processing, and real-time analytics to support your daily operations. From deal management to investor relations, VERSOTECH empowers you to deliver exceptional results.</p>
      <p>Click the button below to set up your password and begin exploring the platform.</p>
      {{ end }}
    </div>

    <div class="button-container">
      {{ if eq .Data.role "investor" }}
      <a href="{{ .ConfirmationURL }}" class="button">Access Investor Portal</a>
      {{ else }}
      <a href="{{ .ConfirmationURL }}" class="button">Access VERSOTECH</a>
      {{ end }}
    </div>

    <div class="footer">
      &copy; 2025 VERSO Holdings. All rights reserved.
    </div>
  </div>
</body>
</html>
```

### Template Variables

The template uses these Go template variables that Supabase automatically populates:

| Variable | Source | Description |
|----------|--------|-------------|
| `{{ .Data.display_name }}` | `inviteUserByEmail()` data object | User's display name |
| `{{ .Data.role }}` | `inviteUserByEmail()` data object | User role (`investor` or `staff_*`) |
| `{{ .ConfirmationURL }}` | Supabase Auth | Magic link to confirm invitation |

### Code That Sends User Data

**Staff Invitation** (`src/app/api/admin/staff/invite/route.ts`):
```typescript
await supabase.auth.admin.inviteUserByEmail(
  validatedData.email,
  {
    data: {
      display_name: validatedData.display_name,  // Used in {{ .Data.display_name }}
      role: validatedData.role,                   // Used in {{ .Data.role }}
      title: validatedData.title,
    },
    redirectTo: `${getAppUrl()}/versotech/login`
  }
)
```

**Investor Invitation** (`src/app/api/staff/investors/[id]/users/route.ts`):
```typescript
await supabase.auth.admin.inviteUserByEmail(
  email,
  {
    data: {
      display_name: email.split('@')[0],  // Used in {{ .Data.display_name }}
      role: 'investor'                     // Used in {{ .Data.role }}
    },
    redirectTo: `${getAppUrl()}/versoholdings/dashboard`
  }
)
```

### Configuration Steps

1. Navigate to **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Select the **"Invite user"** template
3. Replace the default HTML with the template above
4. Click **Save**
5. Test by inviting a test user

---

## Files Modified Summary

### Total Files Modified: 13

| # | File Path | Changes Made |
|---|-----------|--------------|
| 1 | `src/lib/audit.ts` | Added `event_type: 'system'` |
| 2 | `src/lib/trigger-workflow.ts` | Added `event_type: 'workflow'` |
| 3 | `src/lib/signature/handlers.ts` | Added `event_type` (2 places), fixed column names |
| 4 | `src/app/api/workflows/[key]/trigger/route.ts` | Added `event_type: 'workflow'` |
| 5 | `src/app/api/workflows/test-webhook/route.ts` | Added `event_type: 'workflow'` |
| 6 | `src/app/api/webhooks/n8n/route.ts` | Added `event_type: 'workflow'` |
| 7 | `src/app/api/admin/staff/[id]/deactivate/route.ts` | Fixed ban_duration, table/column names, added event_type |
| 8 | `src/app/api/admin/staff/[id]/activity/route.ts` | Fixed table/column names |
| 9 | `src/app/api/admin/staff/route.ts` | Fixed table/column names |
| 10 | `src/app/api/admin/staff/invite/route.ts` | Fixed table/column names, added event_type |
| 11 | `src/app/api/staff/kyc-submissions/[id]/review/route.ts` | Added event_type, fixed column name |
| 12 | `src/app/api/investors/me/documents/upload/route.ts` | Added event_type, fixed column name |
| 13 | `src/(staff)/versotech/staff/admin/components/staff-management-panel.tsx` | Fixed error parsing |

---

## Testing & Verification

### Build Verification

All changes were verified with successful production build:
```bash
npm run build
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages
```

### Manual Testing Checklist

- [ ] Staff invitation sends email with correct branding
- [ ] Investor invitation sends email with correct branding
- [ ] Staff deactivation properly bans user
- [ ] Audit logs insert successfully with all required fields
- [ ] KYC review actions are logged correctly
- [ ] Signature events are logged correctly
- [ ] Document uploads are logged correctly

### Audit Log Verification Query

```sql
-- Check recent audit logs have event_type
SELECT event_type, action, entity_type, timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 20;

-- Verify no NULL event_types
SELECT COUNT(*) as null_count
FROM audit_logs
WHERE event_type IS NULL;
```

---

## Rollback Instructions

If issues arise, revert using:
```bash
git revert <commit-hash>
```

For email template, restore Supabase default by:
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Click "Reset to default" on the Invite user template

---

## Related Documentation

- [Email Notification Setup Guide](../important/email-notification-setup-guide.md)
- [Database Architecture](../DATABASE_ARCHITECTURE.md)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

*Document generated: November 30, 2025*
