# CEO Implementation Plan

**User Type:** CEO (Staff Admin)
**Current Completion:** 75-80% (Audit-Verified: December 24, 2025)
**Target Completion:** 95%
**Estimated Hours:** 6 hours
**Last Audit:** December 24, 2025 - Deep Surgical Audit Complete

---

## ⚠️ CRITICAL AUDIT FINDING

**GDPR Features Are Misaligned With User Stories**

The plan states GDPR data export exists, but the audit revealed:

**What User Stories Require (Section 1.5, Rows 218-228):**
- **USER-initiated** data export from profile page
- User submits deletion request from their OWN profile
- CEO reviews and approves deletion in admin queue

**What Actually Exists:**
- `/api/admin/data-export/route.ts` - **ADMIN-only** export (CEO exports OTHER users' data)
- No user-facing export button in profile
- No deletion request workflow at all

**The Problem:**
```
USER STORY: "I want to generate extract of my data to my email"
ACTUAL:     CEO can export any user's data (wrong direction!)
```

**Fix Required:**
1. Create `/api/gdpr/export/route.ts` - User exports THEIR OWN data
2. Create `/api/gdpr/deletion-request/route.ts` - User requests deletion
3. Add buttons to `/versotech_main/profile/page.tsx`
4. Create approval queue for CEO to review deletion requests

---

## 1. WHO IS THE CEO?

The CEO is the platform administrator who manages the entire VERSO platform. From the user stories (Section 1.CEO, 228 rows):

**Business Role:**
- Creates and manages ALL user types (investors, arrangers, lawyers, partners, commercial partners, introducers)
- Creates and manages investment opportunities (deals)
- Reviews and approves KYC submissions
- Tracks fees, invoices, and reconciliation
- Views reporting and analytics
- Handles GDPR requests and compliance
- Manages the signature queue (VersaSign)
- Signs documents (subscription packs, NDAs) on behalf of VERSO

**Key Distinction:**
- CEO is a ROLE within staff, not a separate user type
- Detected via `profiles.role = 'staff_admin'` or `profiles.role = 'ceo'`
- Has access to everything staff has, plus CEO-only routes

---

## 2. WHAT ALREADY EXISTS

### 2.1 Database

**Tables (All Exist):**
- `profiles` - Has role column with 'staff_admin', 'ceo' values
- All user management tables (investors, partners, etc.)
- All deal/subscription tables
- Fee tables (`fee_plans`, `fee_events`, `fee_invoices`)
- Audit tables (`audit_log`)

**No new tables needed for CEO.**

### 2.2 Pages (All Built)

| Route | Status | Description |
|-------|--------|-------------|
| `/versotech_main/dashboard` | BUILT | CEO dashboard with metrics |
| `/versotech_main/deals` | BUILT | Deal management |
| `/versotech_main/deals/new` | BUILT | Create new deal |
| `/versotech_main/deals/[id]` | BUILT | Deal detail |
| `/versotech_main/investors` | BUILT | Investor management |
| `/versotech_main/investors/[id]` | BUILT | Investor detail |
| `/versotech_main/introducers` | BUILT | Introducer management |
| `/versotech_main/introducers/[id]` | BUILT | Introducer detail |
| `/versotech_main/arrangers` | BUILT | Arranger management |
| `/versotech_main/arrangers/[id]` | BUILT | Arranger detail |
| `/versotech_main/partners/[id]` | BUILT | Partner detail |
| `/versotech_main/commercial-partners/[id]` | BUILT | CP detail |
| `/versotech_main/lawyers/[id]` | BUILT | Lawyer detail |
| `/versotech_main/users` | BUILT | Unified user management |
| `/versotech_main/kyc-review` | BUILT | KYC approval queue |
| `/versotech_main/fees` | BUILT | Fees management |
| `/versotech_main/reconciliation` | BUILT | Payment reconciliation |
| `/versotech_main/audit` | BUILT | Audit logs |
| `/versotech_main/versosign` | BUILT | Signature queue |
| `/versotech_main/subscriptions` | BUILT | Subscription management |
| `/versotech_main/entities` | BUILT | Entity/vehicle management |
| `/versotech_main/approvals` | BUILT | Approval queue |
| `/versotech_main/inbox` | BUILT | Unified inbox |
| `/versotech_main/documents` | BUILT | Document center |
| `/versotech_main/admin` | BUILT | Admin settings |
| `/versotech_main/processes` | BUILT | Workflow processes |
| `/versotech_main/profile` | BUILT | CEO profile |

### 2.3 API Routes (All Built)

| Route | Status |
|-------|--------|
| `/api/admin/investors/*` | BUILT |
| `/api/admin/partners/*` | BUILT |
| `/api/admin/commercial-partners/*` | BUILT |
| `/api/admin/arrangers/*` | BUILT |
| `/api/admin/lawyers/*` | BUILT |
| `/api/staff/introductions/*` | BUILT |
| `/api/staff/introducers/*` | BUILT |
| `/api/staff/fees/*` | BUILT (comprehensive) |
| `/api/deals/*` | BUILT |
| `/api/subscriptions/*` | BUILT |
| `/api/kyc/*` | BUILT |
| `/api/approvals/*` | BUILT |

### 2.4 Components

| Component | Status |
|-----------|--------|
| `components/dashboard/ceo-dashboard.tsx` | BUILT |
| `components/deals/*` | BUILT |
| `components/investors/*` | BUILT |
| `components/fees/*` | BUILT |
| `components/kyc/*` | BUILT |

---

## 3. WHAT'S MISSING

### 3.1 GDPR Features (From User Stories Section 1.5)

**User Stories Requiring Implementation:**

| Row | User Story | Status |
|-----|------------|--------|
| 210 | Delete personal data if no longer used or consent revoked | MISSING |
| 211-215 | Consent management, data scope identification | MISSING |
| 216-217 | Report data breaches, restrict processing | MISSING |
| 218 | Generate extract of user data to email | MISSING |
| 219-228 | User-initiated GDPR requests | MISSING |

**What to Build:**

1. **Data Export Button** (2 hours)
   - User clicks "Export My Data" in profile
   - System generates CSV/XLS with all personal data
   - Download link provided

2. **Deletion Request Form** (2 hours)
   - User submits deletion request
   - Creates task for CEO to review
   - CEO approves/rejects with reason
   - If approved, soft-delete user data

---

## 4. IMPLEMENTATION TASKS

### Task 1: GDPR Data Export (2 hours)

**Files to Create:**

```
src/app/api/gdpr/export/route.ts
src/components/profile/gdpr-export-button.tsx
```

**API Route: `/api/gdpr/export`**

```typescript
// POST /api/gdpr/export
// Returns: { download_url: string }

// Collects:
// - Profile data (name, email, phone)
// - KYC documents metadata (not files)
// - Subscription history
// - Transaction history
// - Activity logs
// - Communication preferences
```

**Component Integration:**
- Add to `src/app/(main)/versotech_main/profile/page.tsx`
- Button in profile settings tab
- Shows loading state while generating
- Opens download on completion

### Task 2: GDPR Deletion Request (2 hours)

**Files to Create:**

```
src/app/api/gdpr/deletion-request/route.ts
src/app/api/gdpr/deletion-request/[id]/route.ts
src/components/profile/gdpr-deletion-form.tsx
```

**API Route: `/api/gdpr/deletion-request`**

```typescript
// POST /api/gdpr/deletion-request
// Body: { reason: string, confirm_understood: boolean }
// Returns: { request_id: string, status: 'pending' }

// Creates approval task for CEO
// Sends confirmation email to user
```

**Approval Flow:**
- Request appears in CEO's approval queue
- CEO reviews with user data summary
- Approve: Soft-delete all user data, anonymize audit logs
- Reject: Notify user with reason

---

## 5. USER STORIES COVERAGE CHECK

### Fully Implemented (From Section 1.CEO)

| Section | Stories | Status |
|---------|---------|--------|
| 1.1 User profiles (Create/Manage all user types) | Rows 2-33 | COMPLETE |
| 1.2 Manage Opportunity (Create, dispatch, subscription) | Rows 34-147 | COMPLETE |
| 1.3 Reporting | Rows 148-169 | COMPLETE |

### Partially Implemented

| Section | Stories | Status | Notes |
|---------|---------|--------|-------|
| 1.3.8 Conversion Event | Rows 170-178 | DEFERRED | Post-launch |
| 1.3.9 Redemption Event | Rows 179-200 | DEFERRED | Post-launch |
| 1.4 Resell | Rows 201-209 | NEEDS WORK | See Investor plan |
| 1.5 GDPR | Rows 210-229 | MINIMAL | Basic export + deletion only |

---

## 6. TESTING CHECKLIST

### CEO Flow Tests

- [ ] Login as CEO → Dashboard shows CEO metrics
- [ ] Navigate to Users → See all user types tabs
- [ ] Create new investor → Success, appears in list
- [ ] Create new arranger → Success
- [ ] Create new deal → Success
- [ ] Dispatch deal to investor → Investor receives notification
- [ ] Review KYC submission → Approve/Reject works
- [ ] View fees → Data displays correctly
- [ ] Generate invoice → PDF created
- [ ] View audit log → Activity visible
- [ ] Access VersaSign → Queue displays
- [ ] GDPR export → File downloads
- [ ] GDPR deletion request → Creates approval task

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- None (CEO features are foundational)

**Blocks Other Features:**
- Introducer agreement approval (CEO approves)
- Placement agreement approval (CEO approves)
- GDPR deletion approval (CEO approves)
- Escrow completion notification (CEO receives)

---

## 8. FILES SUMMARY

### To Create (4 total)

```
src/app/api/gdpr/export/route.ts
src/app/api/gdpr/deletion-request/route.ts
src/app/api/gdpr/deletion-request/[id]/route.ts
src/components/profile/gdpr-export-button.tsx
src/components/profile/gdpr-deletion-form.tsx
```

### To Modify (1 file)

```
src/app/(main)/versotech_main/profile/page.tsx
  - Add GDPR tab or section
  - Include export button and deletion form
```

---

## 9. ACCEPTANCE CRITERIA

1. **GDPR Export:**
   - [ ] CEO can export their own data
   - [ ] Export includes profile, transactions, audit logs
   - [ ] File is CSV or XLS format
   - [ ] Download completes within 30 seconds

2. **GDPR Deletion:**
   - [ ] User can submit deletion request with reason
   - [ ] Request appears in CEO approval queue
   - [ ] CEO can approve or reject with reason
   - [ ] Approved deletion soft-deletes user data
   - [ ] User receives confirmation email

---

## 10. DEVELOPER-READY IMPLEMENTATION CODE

### 10.1 GDPR Export API Route

**File: `src/app/api/gdpr/export/route.ts`**

```typescript
/**
 * GDPR Data Export API
 * POST /api/gdpr/export
 *
 * Allows authenticated users to export their own personal data
 * Returns a JSON file with all their data across tables
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get investor data if user is an investor
    const { data: investorUser } = await supabase
      .from('investor_users')
      .select('investor_id, investors(*)')
      .eq('user_id', user.id)
      .single();

    // Get subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, vehicle_id, commitment, currency, status, created_at, committed_at')
      .eq('investor_id', investorUser?.investor_id);

    // Get activity logs for this user
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('event_type, action, timestamp, action_details')
      .eq('actor_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(100);

    // Get notifications
    const { data: notifications } = await supabase
      .from('investor_notifications')
      .select('type, title, message, created_at, read_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    // Get signature requests
    const { data: signatures } = await supabase
      .from('signature_requests')
      .select('document_type, status, signed_at, created_at')
      .eq('user_id', user.id);

    // Compile export
    const exportData = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profile ? {
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        created_at: profile.created_at,
        last_sign_in_at: profile.last_sign_in_at,
      } : null,
      investor: investorUser?.investors || null,
      subscriptions: subscriptions || [],
      activity_logs: auditLogs || [],
      notifications: notifications || [],
      signatures: signatures || [],
    };

    // Create audit log for this export
    await supabase.from('audit_logs').insert({
      event_type: 'gdpr',
      action: 'data_export',
      entity_type: 'profile',
      entity_id: user.id,
      actor_id: user.id,
      action_details: {
        description: 'User exported their personal data',
        tables_included: ['profiles', 'investors', 'subscriptions', 'audit_logs', 'notifications', 'signatures']
      },
      timestamp: new Date().toISOString()
    });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="verso-data-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
```

### 10.2 GDPR Deletion Request API

**File: `src/app/api/gdpr/deletion-request/route.ts`**

```typescript
/**
 * GDPR Deletion Request API
 * POST /api/gdpr/deletion-request - Submit deletion request
 * GET /api/gdpr/deletion-request - Get user's pending requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const deletionRequestSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason'),
  confirm_understood: z.boolean().refine(v => v === true, 'You must confirm you understand')
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = deletionRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 });
    }

    // Check for existing pending request
    const { data: existing } = await supabase
      .from('gdpr_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('request_type', 'deletion')
      .eq('status', 'pending')
      .single();

    if (existing) {
      return NextResponse.json({
        error: 'You already have a pending deletion request'
      }, { status: 400 });
    }

    // Create deletion request
    const { data: request_record, error } = await supabase
      .from('gdpr_requests')
      .insert({
        user_id: user.id,
        request_type: 'deletion',
        status: 'pending',
        reason: validation.data.reason,
        metadata: {
          submitted_at: new Date().toISOString(),
          user_email: user.email
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create deletion request:', error);
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }

    // Create task for CEO/admin to review
    await supabase.from('tasks').insert({
      kind: 'gdpr_deletion_review',
      title: 'GDPR Deletion Request Review',
      description: `User ${user.email} has requested account deletion. Reason: ${validation.data.reason}`,
      status: 'pending',
      priority: 'high',
      related_entity_type: 'gdpr_request',
      related_entity_id: request_record.id,
      assigned_to_role: 'staff_admin'
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      event_type: 'gdpr',
      action: 'deletion_request_submitted',
      entity_type: 'gdpr_request',
      entity_id: request_record.id,
      actor_id: user.id,
      action_details: { reason: validation.data.reason },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      data: {
        request_id: request_record.id,
        status: 'pending',
        message: 'Your deletion request has been submitted and will be reviewed within 30 days.'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Deletion request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: requests } = await supabase
      .from('gdpr_requests')
      .select('id, request_type, status, reason, created_at, resolved_at, resolution_notes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ data: requests || [] });

  } catch (error) {
    console.error('Get deletion requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 10.3 Database Migration for GDPR Requests Table

**File: `supabase/migrations/YYYYMMDD_gdpr_requests_table.sql`**

```sql
-- GDPR Requests Table
-- Tracks user data export and deletion requests

CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion', 'restriction')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gdpr_requests_user_id ON gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX idx_gdpr_requests_type_status ON gdpr_requests(request_type, status);

-- RLS Policies
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own GDPR requests"
  ON gdpr_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own GDPR requests"
  ON gdpr_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff can view all requests
CREATE POLICY "Staff can view all GDPR requests"
  ON gdpr_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('staff_admin', 'ceo')
    )
  );

-- Staff can update requests (for approval/rejection)
CREATE POLICY "Staff can update GDPR requests"
  ON gdpr_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('staff_admin', 'ceo')
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_gdpr_requests_updated_at
  BEFORE UPDATE ON gdpr_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 10.4 GDPR Export Button Component

**File: `src/components/profile/gdpr-export-button.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function GDPRExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `verso-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()

      toast.success('Your data has been exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export My Data
    </Button>
  )
}
```

---

**Total Estimated Hours: 6**
**Priority: Medium (GDPR can launch minimal)**
**Risk: Low**
**Last Updated:** December 24, 2025 (Developer-Ready)
