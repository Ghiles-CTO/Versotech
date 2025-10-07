# Approvals Module - Complete Implementation & Fix Plan

**Date**: January 6, 2025
**Status**: Critical Issues Identified
**Estimated Effort**: 3-5 days
**Priority**: P0 (Critical - System Not Functional)

---

## Executive Summary

The Approvals module has been **partially implemented** but contains **critical gaps** that prevent it from functioning as designed. While the UI and database schema are well-built, **investor commitments never reach the approval queue** due to a missing trigger/workflow that should automatically create approval records.

### Current State Assessment

**✅ What Works:**
- Database schema fully implemented (27 columns, proper indexes, RPC functions)
- Staff approval UI displays correctly with SLA tracking
- Approve/reject actions work when approval records exist
- Downstream actions (update commitment status, create tasks) implemented
- Role-based authority checking functional
- Audit logging in place

**❌ Critical Gaps:**
- **No automatic approval creation** - Commitments submitted by investors never appear in approval queue
- Missing database triggers to link deal_commitments → approvals
- ~60% of PRD features not implemented (bulk actions, filtering, pagination, etc.)
- Priority enum mismatch (database uses 'normal', code expects 'low'/'medium'/'high'/'critical')
- No approval creation for reservations, KYC changes, withdrawals, or other entity types

**Business Impact:**
- Investors submit commitments that **never get processed**
- Staff have **zero visibility** into pending investor requests
- Manual database intervention required for every commitment
- Complete workflow breakdown between investor and staff portals

---

## Part 1: Critical Fixes (Must Do Immediately)

### 1.1 Fix Broken Commitment → Approval Workflow

**Problem**: When investors submit commitments via the investor portal, NO approval record is created.

**Root Cause Analysis:**

**Investor Commitment Flow (Current - Broken):**
```
Investor Portal: /versoholdings/deals
  ↓
User clicks "Submit Commitment" button
  ↓
CommitmentModal opens (src/components/deals/commitment-modal.tsx)
  ↓
User fills form (units, amount, fee plan) and submits
  ↓
API: POST to /api/deals/[id]/commitments (src/app/api/deals/[id]/commitments/route.ts:109-130)
  ↓
INSERT into deal_commitments table:
  - deal_id
  - investor_id
  - requested_units
  - requested_amount
  - status: 'submitted'
  - selected_fee_plan_id
  ↓
❌ STOPS HERE - No approval record created
  ↓
💀 Record sits in deal_commitments forever
  ↓
Staff approvals page queries: SELECT * FROM approvals WHERE entity_type='deal_commitment'
  ↓
Returns EMPTY - Staff sees nothing
```

**Solution Options:**

**Option A: Database Trigger (Recommended)**

Create an AFTER INSERT trigger on `deal_commitments` that automatically creates approval records:

```sql
-- File: versotech-portal/supabase/migrations/YYYYMMDD_fix_commitment_approval_trigger.sql

-- ============================================================================
-- CRITICAL FIX: Auto-create approval when commitment is submitted
-- ============================================================================

CREATE OR REPLACE FUNCTION create_commitment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_commitment_create_approval ON deal_commitments;
CREATE TRIGGER on_commitment_create_approval
  AFTER INSERT ON deal_commitments
  FOR EACH ROW
  WHEN (NEW.status = 'submitted')
  EXECUTE FUNCTION create_commitment_approval();

-- Comment for documentation
COMMENT ON FUNCTION create_commitment_approval IS
  'Automatically creates approval record when investor submits commitment';
```

**Why Trigger Approach:**
- ✅ Atomic - happens in same transaction as commitment insert
- ✅ Works for ALL commitment insertions (UI, API, bulk imports, staff manual entry)
- ✅ No code changes required in application layer
- ✅ Consistent with existing approval architecture (auto_assign_approval trigger)
- ✅ Easy to test and validate

**Option B: API Middleware (Alternative)**

Add approval creation logic to commitment API routes:

```typescript
// File: versotech-portal/src/app/api/deals/[id]/commitments/route.ts
// Line 109 - After commitment creation

// Create corresponding approval record
const { data: approval, error: approvalError } = await serviceSupabase
  .from('approvals')
  .insert({
    entity_type: 'deal_commitment',
    entity_id: commitment.id,
    status: 'pending',
    action: 'approve',
    priority: commitment.requested_amount > 1000000 ? 'critical'
            : commitment.requested_amount > 100000 ? 'high'
            : commitment.requested_amount > 50000 ? 'medium'
            : 'low',
    requested_by: user.id,
    related_deal_id: dealId,
    related_investor_id: investor_id,
    entity_metadata: {
      requested_amount: commitment.requested_amount,
      requested_units: commitment.requested_units,
      fee_plan_id: finalFeeplanId
    }
  })
  .single();

if (approvalError) {
  console.error('Failed to create approval:', approvalError);
  // Rollback commitment? Or just log warning?
}
```

**Why NOT Recommended:**
- ❌ Requires changes in multiple API files
- ❌ Could be bypassed by direct database inserts
- ❌ More complex to maintain
- ❌ Harder to ensure consistency

**Implementation Steps:**

1. **Create Migration File**
   - Filename: `versotech-portal/supabase/migrations/20250106000001_fix_commitment_approval_workflow.sql`
   - Copy trigger code from Option A above

2. **Test Locally**
   ```bash
   cd versotech-portal
   npx supabase db reset  # Reset local DB
   # Or just apply the migration:
   npx supabase migration up
   ```

3. **Verify Trigger Works**
   ```sql
   -- Test commitment insertion
   INSERT INTO deal_commitments (
     deal_id, investor_id, requested_units, requested_amount,
     status, created_by
   ) VALUES (
     '<deal_id>', '<investor_id>', 100, 50000,
     'submitted', '<user_id>'
   );

   -- Check approval was created
   SELECT * FROM approvals
   WHERE entity_type = 'deal_commitment'
   ORDER BY created_at DESC LIMIT 1;
   ```

4. **Deploy to Supabase**
   ```bash
   npx supabase db push
   ```

5. **Smoke Test in UI**
   - Log in as investor
   - Submit commitment via investor portal
   - Log in as staff
   - Verify commitment appears in approvals queue

**Files to Create/Modify:**
- `versotech-portal/supabase/migrations/20250106000001_fix_commitment_approval_workflow.sql` (NEW)

**Testing Checklist:**
- [ ] Trigger compiles without errors
- [ ] Commitment with status='submitted' creates approval
- [ ] Commitment with other status does NOT create approval
- [ ] Approval has correct priority based on amount
- [ ] Approval has correct entity_metadata
- [ ] SLA deadline is set automatically (via existing trigger)
- [ ] Staff member is auto-assigned (via existing trigger)
- [ ] End-to-end: Investor submit → Staff sees → Staff approves → Commitment status updates

---

### 1.2 Fix Priority Enum Mismatch

**Problem**: Database default value is `'normal'` but TypeScript types and SLA calculation expect `'low'|'medium'|'high'|'critical'`.

**Evidence:**
```sql
-- Current database state (WRONG):
ALTER TABLE approvals ALTER COLUMN priority SET DEFAULT 'normal'::text;

-- TypeScript types (CORRECT):
export type ApprovalPriority = 'low' | 'medium' | 'high' | 'critical'

-- SLA trigger uses correct values:
v_sla_hours := CASE NEW.priority
  WHEN 'critical' THEN 2
  WHEN 'high' THEN 4
  WHEN 'medium' THEN 24
  WHEN 'low' THEN 72
  ELSE 24  -- <-- Fallback never used if enum is correct
END;
```

**Impact:**
- New approvals get `priority='normal'` which breaks SLA calculation
- UI displays wrong priority badges
- Sorting by priority fails
- Data integrity issues

**Solution:**

```sql
-- File: versotech-portal/supabase/migrations/20250106000002_fix_priority_enum.sql

-- ============================================================================
-- FIX: Correct priority enum and migrate existing data
-- ============================================================================

-- Step 1: Migrate existing 'normal' values to 'medium'
UPDATE approvals
SET priority = 'medium'
WHERE priority = 'normal';

-- Step 2: Add proper CHECK constraint
ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_priority_check;
ALTER TABLE approvals ADD CONSTRAINT approvals_priority_check
  CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Step 3: Change default from 'normal' to 'medium'
ALTER TABLE approvals ALTER COLUMN priority SET DEFAULT 'medium';

-- Step 4: Verify no bad data remains
DO $$
DECLARE
  v_bad_count int;
BEGIN
  SELECT COUNT(*) INTO v_bad_count
  FROM approvals
  WHERE priority NOT IN ('low', 'medium', 'high', 'critical');

  IF v_bad_count > 0 THEN
    RAISE EXCEPTION 'Found % approvals with invalid priority values', v_bad_count;
  END IF;

  RAISE NOTICE 'Priority enum migration completed successfully';
END $$;
```

**Implementation Steps:**

1. **Check for Existing Bad Data**
   ```sql
   -- Run this first to see if migration needed
   SELECT priority, COUNT(*)
   FROM approvals
   GROUP BY priority;
   ```

2. **Apply Migration**
   ```bash
   npx supabase db push
   ```

3. **Verify**
   ```sql
   -- Should return 0
   SELECT COUNT(*) FROM approvals
   WHERE priority NOT IN ('low', 'medium', 'high', 'critical');

   -- Check constraint is in place
   SELECT conname, contype, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conname = 'approvals_priority_check';
   ```

**Files to Create/Modify:**
- `versotech-portal/supabase/migrations/20250106000002_fix_priority_enum.sql` (NEW)

**Testing Checklist:**
- [ ] Migration runs without errors
- [ ] All existing 'normal' values converted to 'medium'
- [ ] CHECK constraint prevents inserting bad values
- [ ] Default value is 'medium'
- [ ] Can insert approvals with low/medium/high/critical
- [ ] Cannot insert approval with 'normal' or other invalid priority
- [ ] SLA calculation works for all priority levels

---

### 1.3 Add Missing Approval Sources

**Problem**: Only deal_commitments are handled. PRD requires approvals for:
- Reservations
- Allocations
- KYC changes
- Profile updates
- Withdrawals
- Document access requests

**Current State:**
- ❌ No trigger for `reservations` table
- ❌ No trigger for `allocations` table
- ❌ No UI/API for KYC change requests
- ❌ No UI/API for withdrawal requests

**Solution (Reservations):**

```sql
-- File: versotech-portal/supabase/migrations/20250106000003_add_reservation_approvals.sql

-- ============================================================================
-- Auto-create approval for reservation requests
-- ============================================================================

CREATE OR REPLACE FUNCTION create_reservation_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    WHEN v_reservation_value > 500000 THEN 'high'
    WHEN v_reservation_value > 100000 THEN 'medium'
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
      'expires_at', NEW.expires_at
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_reservation_create_approval ON reservations;
CREATE TRIGGER on_reservation_create_approval
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION create_reservation_approval();
```

**Implementation Approach:**
- **Phase 1** (Critical): Implement commitment + reservation approval triggers
- **Phase 2** (High): Implement allocation approval trigger
- **Phase 3** (Medium): Build UI/API for KYC changes, withdrawals, profile updates

**Files to Create/Modify:**
- `versotech-portal/supabase/migrations/20250106000003_add_reservation_approvals.sql` (NEW)
- Similar migration files for allocations, KYC, etc. (Future phases)

---

## Part 2: High Priority Features (PRD Gaps)

### 2.1 Implement Filtering

**Current State**: Filter button exists but is disabled.

**Location**:
- UI: `versotech-portal/src/app/(staff)/versotech/staff/approvals/page.tsx:158`
- Client: `versotech-portal/src/components/approvals/approvals-page-client.tsx`

**Implementation:**

```typescript
// File: versotech-portal/src/components/approvals/approval-filters.tsx (NEW)
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Filter } from 'lucide-react'
import { ApprovalEntityType, ApprovalPriority } from '@/types/approvals'

interface ApprovalFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  entity_types: ApprovalEntityType[]
  priorities: ApprovalPriority[]
  assigned_to_me: boolean
  overdue_only: boolean
}

export function ApprovalFilters({ onFilterChange }: ApprovalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    entity_types: [],
    priorities: [],
    assigned_to_me: false,
    overdue_only: false
  })

  const entityTypes: { value: ApprovalEntityType; label: string }[] = [
    { value: 'deal_commitment', label: 'Deal Commitments' },
    { value: 'reservation', label: 'Reservations' },
    { value: 'allocation', label: 'Allocations' },
    { value: 'kyc_change', label: 'KYC Changes' },
    { value: 'withdrawal', label: 'Withdrawals' },
  ]

  const priorities: { value: ApprovalPriority; label: string }[] = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]

  const updateFilter = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Request Type</h4>
            <div className="space-y-2">
              {entityTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={filters.entity_types.includes(type.value)}
                    onCheckedChange={(checked) => {
                      updateFilter({
                        entity_types: checked
                          ? [...filters.entity_types, type.value]
                          : filters.entity_types.filter(t => t !== type.value)
                      })
                    }}
                  />
                  <Label htmlFor={type.value}>{type.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Priority</h4>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <div key={priority.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={priority.value}
                    checked={filters.priorities.includes(priority.value)}
                    onCheckedChange={(checked) => {
                      updateFilter({
                        priorities: checked
                          ? [...filters.priorities, priority.value]
                          : filters.priorities.filter(p => p !== priority.value)
                      })
                    }}
                  />
                  <Label htmlFor={priority.value}>{priority.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assigned_to_me"
                checked={filters.assigned_to_me}
                onCheckedChange={(checked) =>
                  updateFilter({ assigned_to_me: checked as boolean })
                }
              />
              <Label htmlFor="assigned_to_me">Assigned to me</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdue_only"
                checked={filters.overdue_only}
                onCheckedChange={(checked) =>
                  updateFilter({ overdue_only: checked as boolean })
                }
              />
              <Label htmlFor="overdue_only">Overdue only</Label>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setFilters({
                entity_types: [],
                priorities: [],
                assigned_to_me: false,
                overdue_only: false
              })
              onFilterChange({
                entity_types: [],
                priorities: [],
                assigned_to_me: false,
                overdue_only: false
              })
            }}
          >
            Clear Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

**Update Client Component:**

```typescript
// File: versotech-portal/src/components/approvals/approvals-page-client.tsx
// Add imports
import { ApprovalFilters, FilterState } from './approval-filters'

// Add state
const [filters, setFilters] = useState<FilterState>({
  entity_types: [],
  priorities: [],
  assigned_to_me: false,
  overdue_only: false
})

// Update refreshData to include filters
const refreshData = useCallback(async () => {
  try {
    // Build query params from filters
    const params = new URLSearchParams()
    params.append('status', 'pending')

    if (filters.entity_types.length > 0) {
      params.append('entity_types', filters.entity_types.join(','))
    }
    if (filters.priorities.length > 0) {
      params.append('priorities', filters.priorities.join(','))
    }
    if (filters.assigned_to_me) {
      params.append('assigned_to', 'me')
    }
    if (filters.overdue_only) {
      params.append('overdue_only', 'true')
    }

    const response = await fetch(`/api/approvals?${params.toString()}`)
    // ... rest of fetch logic
  } catch (error) {
    // ... error handling
  }
}, [filters])

// Add filter component to JSX
<ApprovalFilters onFilterChange={setFilters} />
```

**Update API to Handle Filters:**

```typescript
// File: versotech-portal/src/app/api/approvals/route.ts
// Line 209-273 - Enhance GET endpoint

// Parse new filter params
const entityTypes = searchParams.get('entity_types')?.split(',') || []
const priorities = searchParams.get('priorities')?.split(',') || []
const overdueOnly = searchParams.get('overdue_only') === 'true'

// Apply filters to query
if (entityTypes.length > 0) {
  query = query.in('entity_type', entityTypes)
}
if (priorities.length > 0) {
  query = query.in('priority', priorities)
}
if (overdueOnly) {
  query = query.lt('sla_breach_at', new Date().toISOString())
}
```

**Files to Create/Modify:**
- `versotech-portal/src/components/approvals/approval-filters.tsx` (NEW)
- `versotech-portal/src/components/approvals/approvals-page-client.tsx` (MODIFY - add filter state)
- `versotech-portal/src/app/api/approvals/route.ts` (MODIFY - add filter params to GET)

---

### 2.2 Implement Pagination

**Current State**: Pagination controls exist but are disabled. Loading all approvals causes performance issues.

**Implementation:**

```typescript
// File: versotech-portal/src/components/approvals/approvals-page-client.tsx
// Add pagination state
const [pagination, setPagination] = useState({
  page: 1,
  limit: 50,
  total: 0
})

// Update refreshData to include pagination
const refreshData = useCallback(async () => {
  const params = new URLSearchParams()
  params.append('limit', pagination.limit.toString())
  params.append('offset', ((pagination.page - 1) * pagination.limit).toString())
  // ... rest of params

  const response = await fetch(`/api/approvals?${params.toString()}`)
  const data = await response.json()

  setApprovals(data.approvals || [])
  setPagination(prev => ({ ...prev, total: data.total || 0 }))
}, [pagination.page, pagination.limit, filters])

// Add pagination controls
const totalPages = Math.ceil(pagination.total / pagination.limit)

<div className="flex items-center justify-between mt-4">
  <p className="text-sm text-muted-foreground">
    Showing {((pagination.page - 1) * pagination.limit) + 1}-
    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
  </p>
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={pagination.page === 1}
      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
    >
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      disabled={pagination.page >= totalPages}
      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
    >
      Next
    </Button>
  </div>
</div>
```

**Update API:**

```typescript
// File: versotech-portal/src/app/api/approvals/route.ts
// Parse pagination params
const limit = parseInt(searchParams.get('limit') || '50', 10)
const offset = parseInt(searchParams.get('offset') || '0', 10)

// Get total count
const { count } = await supabase
  .from('approvals')
  .select('*', { count: 'exact', head: true })
  .eq('status', status)

// Apply pagination to query
query = query.range(offset, offset + limit - 1)

// Return with total
return NextResponse.json({
  approvals: approvals || [],
  stats,
  counts,
  total: count || 0,
  hasData: (approvals && approvals.length > 0) || false
})
```

**Files to Modify:**
- `versotech-portal/src/components/approvals/approvals-page-client.tsx` (MODIFY - add pagination)
- `versotech-portal/src/app/api/approvals/route.ts` (MODIFY - add pagination params)

---

### 2.3 Implement Bulk Approval

**Problem**: No way to approve/reject multiple approvals at once.

**Implementation:**

```typescript
// File: versotech-portal/src/app/api/approvals/bulk-action/route.ts (NEW)
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const bulkActionSchema = z.object({
  approval_ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
  rejection_reason: z.string().optional()
}).refine(
  (data) => {
    if (data.action === 'reject' && !data.rejection_reason) {
      return false
    }
    return true
  },
  { message: 'rejection_reason required for reject action' }
)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Staff check
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    // Validate request
    const body = await request.json()
    const validation = bulkActionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { approval_ids, action, notes, rejection_reason } = validation.data

    // Fetch all approvals to check authority
    const { data: approvals } = await supabase
      .from('approvals')
      .select('id, entity_type, entity_metadata, status, assigned_to')
      .in('id', approval_ids)

    if (!approvals || approvals.length === 0) {
      return NextResponse.json({ error: 'No approvals found' }, { status: 404 })
    }

    // Track results
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ id: string; error: string }>
    }

    // Process each approval
    for (const approval of approvals) {
      try {
        // Check if already processed
        if (approval.status !== 'pending') {
          results.failed.push({
            id: approval.id,
            error: `Already ${approval.status}`
          })
          continue
        }

        // Check authority (simplified - expand based on checkApprovalAuthority logic)
        const canApprove = profile.role === 'staff_admin' ||
          approval.assigned_to === profile.id

        if (!canApprove) {
          results.failed.push({
            id: approval.id,
            error: 'Insufficient authority'
          })
          continue
        }

        // Update approval
        const newStatus = action === 'approve' ? 'approved' : 'rejected'
        const { error: updateError } = await serviceSupabase
          .from('approvals')
          .update({
            status: newStatus,
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            notes: notes || null,
            rejection_reason: action === 'reject' ? rejection_reason : null
          })
          .eq('id', approval.id)

        if (updateError) {
          results.failed.push({
            id: approval.id,
            error: updateError.message
          })
        } else {
          results.successful.push(approval.id)
        }
      } catch (err) {
        results.failed.push({
          id: approval.id,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      total: approval_ids.length,
      successful_count: results.successful.length,
      failed_count: results.failed.length,
      results
    })

  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Add UI for Bulk Selection:**

```typescript
// File: versotech-portal/src/components/approvals/approvals-page-client.tsx
// Add selection state
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
const [isBulkProcessing, setIsBulkProcessing] = useState(false)

// Toggle selection
const toggleSelection = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    return next
  })
}

// Select all
const toggleSelectAll = () => {
  if (selectedIds.size === approvals.length) {
    setSelectedIds(new Set())
  } else {
    setSelectedIds(new Set(approvals.map(a => a.id)))
  }
}

// Bulk action handler
const handleBulkAction = async (action: 'approve' | 'reject') => {
  if (selectedIds.size === 0) return

  setIsBulkProcessing(true)
  try {
    const response = await fetch('/api/approvals/bulk-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approval_ids: Array.from(selectedIds),
        action,
        rejection_reason: action === 'reject' ? 'Bulk rejection' : undefined
      })
    })

    const data = await response.json()

    if (data.successful_count > 0) {
      toast.success(`${data.successful_count} approvals ${action}d`)
    }
    if (data.failed_count > 0) {
      toast.error(`${data.failed_count} approvals failed`)
    }

    setSelectedIds(new Set())
    refreshData()
  } catch (error) {
    toast.error(`Bulk ${action} failed`)
  } finally {
    setIsBulkProcessing(false)
  }
}

// Add to JSX - Bulk action bar
{selectedIds.size > 0 && (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2
                  bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4
                  border-2 border-blue-500 z-50">
    <div className="flex items-center gap-4">
      <span className="font-medium">
        {selectedIds.size} selected
      </span>
      <Button
        size="sm"
        onClick={() => handleBulkAction('approve')}
        disabled={isBulkProcessing}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Approve All
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleBulkAction('reject')}
        disabled={isBulkProcessing}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Reject All
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setSelectedIds(new Set())}
      >
        Clear
      </Button>
    </div>
  </div>
)}

// Add checkbox to table header
<TableHead className="w-12">
  <Checkbox
    checked={selectedIds.size === approvals.length && approvals.length > 0}
    onCheckedChange={toggleSelectAll}
  />
</TableHead>

// Add checkbox to each row
<TableCell className="w-12">
  <Checkbox
    checked={selectedIds.has(approval.id)}
    onCheckedChange={() => toggleSelection(approval.id)}
  />
</TableCell>
```

**Files to Create/Modify:**
- `versotech-portal/src/app/api/approvals/bulk-action/route.ts` (NEW)
- `versotech-portal/src/components/approvals/approvals-page-client.tsx` (MODIFY - add bulk selection)

---

## Part 3: Medium Priority Features

### 3.1 Request Info / Pause SLA

Add ability for staff to request additional information from investor, pausing the SLA timer.

### 3.2 Approval History View

Display timeline of all approval state changes from `approval_history` table.

### 3.3 Search Functionality

Add search by investor name, deal name, approval ID.

### 3.4 Reassign & Escalate Actions

Allow staff to reassign approvals or escalate to senior staff.

---

## Part 4: Low Priority / Future Enhancements

### 4.1 Real-time Updates via Supabase Realtime

### 4.2 SLA Escalation Notifications

### 4.3 Secondary Approval Workflow (Dual Approval)

### 4.4 Auto-Approval Execution

### 4.5 Export Functionality

### 4.6 Enhanced Analytics Dashboard

---

## Database Schema Reference

### approvals Table (27 columns)

```
Core Fields:
  - id (uuid, PK)
  - entity_type (text) - 'deal_commitment', 'reservation', etc.
  - entity_id (uuid) - FK to commitment/reservation/etc
  - entity_metadata (jsonb) - Cached entity data snapshot
  - action (text) - 'approve', 'reject', 'revise'
  - status (text) - 'pending', 'approved', 'rejected', etc.
  - priority (text) - 'low', 'medium', 'high', 'critical'

Request Details:
  - requested_by (uuid, FK to profiles)
  - request_reason (text)
  - notes (text)

Assignment:
  - assigned_to (uuid, FK to profiles)

Decision:
  - approved_by (uuid, FK to profiles)
  - approved_at (timestamptz)
  - rejection_reason (text)

SLA Tracking:
  - sla_breach_at (timestamptz)
  - sla_paused_at (timestamptz)
  - sla_resumed_at (timestamptz)
  - actual_processing_time_hours (numeric)

Secondary Approval:
  - requires_secondary_approval (boolean)
  - secondary_approver_role (text)
  - secondary_approved_by (uuid)
  - secondary_approved_at (timestamptz)

Relations:
  - related_deal_id (uuid, FK to deals)
  - related_investor_id (uuid, FK to investors)

Timestamps:
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - resolved_at (timestamptz)
```

### Existing Database Functions

**get_approval_stats(p_staff_id uuid)**
Returns approval queue KPIs:
- total_pending
- overdue_count
- avg_processing_time_hours
- approval_rate_24h
- total_approved_30d
- total_rejected_30d
- total_awaiting_info

**check_auto_approval_criteria(p_approval_id uuid)**
Evaluates if approval meets auto-approval rules.

### Existing Triggers

**set_approval_sla_deadline()**
- Automatically sets `sla_breach_at` based on priority
- Runs BEFORE INSERT on approvals

**auto_assign_approval()**
- Automatically assigns approval to appropriate staff member
- Routes based on entity_type and investor relationship
- Runs BEFORE INSERT on approvals

**log_approval_change()**
- Logs all approval state changes to approval_history table
- Calculates actual_processing_time_hours when resolved
- Runs AFTER INSERT OR UPDATE on approvals

---

## Code File Reference

### Investor Portal (Where Approvals Originate)

**Deal Commitments UI:**
- `versotech-portal/src/app/(investor)/versoholdings/deals/page.tsx`
  - Line 501-508: "Submit Commitment" button

- `versotech-portal/src/components/deals/commitment-modal.tsx`
  - Line 79-155: Form submission handler
  - Line 101-114: INSERT into deal_commitments

**Deal Commitments API:**
- `versotech-portal/src/app/api/deals/[id]/commitments/route.ts`
  - Line 17-210: POST endpoint creates commitments
  - Line 109-130: INSERT statement (MISSING approval creation)

- `versotech-portal/src/app/api/commitments/route.ts`
  - Line 15-150: Alternative API endpoint
  - Line 82-95: INSERT statement (MISSING approval creation)

**Reservations:**
- `versotech-portal/src/components/deals/reservation-modal.tsx`
  - Similar structure to commitment modal
  - Also missing approval creation

### Staff Portal (Approvals Module)

**Approvals Page (Server Component):**
- `versotech-portal/src/app/(staff)/versotech/staff/approvals/page.tsx`
  - Line 11-121: Server-side data fetching
  - Line 38-77: Main query fetches approvals with joins
  - Line 86-93: Calls get_approval_stats RPC
  - Line 140-177: Page layout with filters/export buttons

**Approvals Client Component:**
- `versotech-portal/src/components/approvals/approvals-page-client.tsx`
  - Line 65-375: Main approval queue UI
  - Line 80-93: refreshData function
  - Line 96-112: Approve/reject button handlers
  - Line 118-153: Stats cards
  - Line 156-305: Approvals table
  - Line 308-362: Quick actions & SLA performance cards

**Approval Action Dialog:**
- `versotech-portal/src/components/approvals/approval-action-dialog.tsx`
  - Line 45-275: Modal for approve/reject with notes
  - Line 62-101: Form submission handler
  - Line 74-84: POST to /api/approvals/[id]/action

**Approvals API (GET - View Approvals):**
- `versotech-portal/src/app/api/approvals/route.ts`
  - Line 180-329: GET endpoint with filtering
  - Line 218-253: Main query with comprehensive joins
  - Line 256-277: Apply filters (status, entity_type, assigned_to, etc.)
  - Line 288-296: Call get_approval_stats RPC
  - Line 303-320: Return response with stats

**Approvals API (POST/PATCH - Create/Update):**
- `versotech-portal/src/app/api/approvals/route.ts`
  - Line 23-177: POST endpoint to CREATE approvals (used by staff, NOT by investor portal)
  - Line 332-447: PATCH endpoint to UPDATE approvals

**Approvals Action API (Approve/Reject):**
- `versotech-portal/src/app/api/approvals/[id]/action/route.ts`
  - Line 222-391: POST endpoint for approve/reject actions
  - Line 25-70: checkApprovalAuthority function (role-based limits)
  - Line 72-164: executeApprovalActions function (downstream workflows)
  - Line 166-220: executeRejectionActions function (create tasks, update status)
  - Line 299-305: Authority check
  - Line 320-332: Update approval record
  - Line 343-358: Execute downstream actions

### TypeScript Types

**Approval Types:**
- `versotech-portal/src/types/approvals.ts`
  - Line 2-12: ApprovalEntityType enum
  - Line 15-21: ApprovalStatus enum
  - Line 24: ApprovalPriority enum (CORRECT: 'low'|'medium'|'high'|'critical')
  - Line 64-114: Main Approval interface (matches DB schema)
  - Line 117-128: ApprovalHistory interface
  - Line 131-136: SLAStatus interface
  - Line 139-147: ApprovalStats interface

### Database Migrations

**Approvals Schema:**
- `versotech-portal/supabase/migrations/20250105000000_extend_approvals_schema.sql`
  - Line 1-55: Alter approvals table (add SLA, secondary approval, relations)
  - Line 60-78: Create approval_history table
  - Line 84-103: Create indexes
  - Line 109-137: set_approval_sla_deadline trigger
  - Line 143-208: auto_assign_approval trigger
  - Line 214-303: log_approval_change trigger
  - Line 309-350: get_approval_stats RPC function
  - Line 356-427: check_auto_approval_criteria RPC function

---

## Testing Plan

### Critical Path Testing (Must Pass)

**Test 1: End-to-End Commitment → Approval Flow**
```
1. Login as investor (demo mode or real user)
2. Navigate to /versoholdings/deals
3. Click "Submit Commitment" on an open deal
4. Fill form:
   - Units: 1000
   - Amount: $75,000 (should trigger 'medium' priority)
5. Submit commitment
6. Verify: commitment created in deal_commitments table
7. Verify: approval created in approvals table with:
   - entity_type = 'deal_commitment'
   - status = 'pending'
   - priority = 'medium'
   - entity_metadata contains commitment data
   - sla_breach_at is set (24 hours from now)
   - assigned_to is populated
8. Login as staff
9. Navigate to /versotech/staff/approvals
10. Verify: commitment appears in approval queue
11. Click approve
12. Verify: approval status = 'approved'
13. Verify: commitment status = 'approved' in deal_commitments
```

**Test 2: Priority Calculation**
```
Test commitments with different amounts:
- $10,000 → priority = 'low'
- $75,000 → priority = 'medium'
- $500,000 → priority = 'high'
- $2,000,000 → priority = 'critical'

Verify correct SLA deadlines:
- low: 72 hours
- medium: 24 hours
- high: 4 hours
- critical: 2 hours
```

**Test 3: Role-Based Authority**
```
Create approval with $75,000 commitment:
- staff_admin: ✅ Can approve
- staff_ops: ✅ Can approve (<$50K limit, but this is $75K so should FAIL)
- staff_rm (assigned): ✅ Can approve
- staff_rm (not assigned): ❌ Cannot approve
```

**Test 4: Filtering**
```
1. Create multiple approvals with different entity_types and priorities
2. Apply filters:
   - Entity type: deal_commitment only
   - Priority: high only
   - Assigned to me: checked
3. Verify: results match filters
```

**Test 5: Bulk Approval**
```
1. Create 5 pending approvals
2. Select 3 approvals
3. Click "Approve All"
4. Verify: 3 approvals moved to 'approved' status
5. Verify: corresponding commitments updated
```

### Regression Testing

- Verify existing approval records still work after migration
- Verify SLA calculation works for all priority levels
- Verify audit logging to approval_history
- Verify downstream actions (commitment status update, task creation)

### Performance Testing

- Load 1000+ approvals
- Test pagination performance
- Test filter response time
- Test bulk action with 100 approvals

---

## Deployment Checklist

### Pre-Deployment

- [ ] All migrations tested locally
- [ ] No breaking changes to existing approval records
- [ ] Backup production approvals table
- [ ] All tests passing

### Deployment Steps

1. **Apply Database Migrations**
   ```bash
   npx supabase db push
   ```

2. **Verify Migrations**
   ```sql
   -- Check triggers exist
   SELECT trigger_name FROM information_schema.triggers
   WHERE event_object_table = 'deal_commitments';

   -- Check priority constraint
   SELECT conname FROM pg_constraint
   WHERE conname = 'approvals_priority_check';
   ```

3. **Deploy Application Code**
   ```bash
   git push origin main
   # Or deploy via CI/CD
   ```

4. **Smoke Test in Production**
   - Submit test commitment as investor
   - Verify appears in staff approvals queue
   - Approve test commitment
   - Verify commitment status updated

### Rollback Plan

If issues arise:

1. **Rollback Database Migrations**
   ```sql
   -- Drop new triggers
   DROP TRIGGER IF EXISTS on_commitment_create_approval ON deal_commitments;
   DROP FUNCTION IF EXISTS create_commitment_approval();

   -- Revert priority constraint
   ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_priority_check;
   ALTER TABLE approvals ALTER COLUMN priority SET DEFAULT 'normal';
   ```

2. **Rollback Application Code**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

---

## Success Metrics

### Immediate (Week 1)

- ✅ 100% of investor commitments appear in approval queue
- ✅ Zero manual database interventions required
- ✅ Staff approval workflow functional end-to-end
- ✅ No priority-related errors in logs

### Short-term (Month 1)

- ✅ Average approval processing time < 12 hours
- ✅ SLA breach rate < 10%
- ✅ 80% of approvals use filtering feature
- ✅ 50% of approvals use bulk actions
- ✅ Zero lost commitments (all tracked in approvals)

### Long-term (Quarter 1)

- ✅ All approval sources implemented (reservations, KYC, etc.)
- ✅ Auto-approval rate for small commitments: 30%
- ✅ Secondary approval workflow for >$1M commitments: 100%
- ✅ Real-time notifications active
- ✅ Full PRD feature parity

---

## Support & Documentation

### For Developers

- **PRD**: `docs/staff/Approvals_PRD.md`
- **Database Schema**: See "Database Schema Reference" section above
- **Code Locations**: See "Code File Reference" section above
- **Type Definitions**: `versotech-portal/src/types/approvals.ts`

### For QA

- **Test Plan**: See "Testing Plan" section above
- **Test Data Setup**: Use `create_test_data_with_auth.sql`
- **Demo Mode**: Enable via `DEMO_COOKIE_NAME` cookie

### For Product/Business

- **Feature Status**: See "Current State Assessment" section
- **Missing Features**: See "Part 2: High Priority Features"
- **Timeline**:
  - Critical fixes: 2-3 days
  - High priority: 1 week
  - Medium priority: 2-3 weeks
  - Full PRD: 4-5 weeks

---

## Frequently Asked Questions

**Q: Why aren't investor commitments showing up in the approvals queue?**

A: There's a missing trigger that should automatically create approval records when commitments are submitted. This is the #1 critical fix in this plan.

**Q: What's the difference between approval status and commitment status?**

A: Approval status tracks the staff review process ('pending', 'approved', 'rejected'). Commitment status tracks the investor's deal participation ('submitted', 'approved', 'allocated', 'settled'). When an approval is approved, it updates the corresponding commitment status.

**Q: Why does priority show as 'normal' in some records?**

A: Database default was incorrectly set to 'normal'. The code expects 'low'/'medium'/'high'/'critical'. This is fixed in Part 1.2.

**Q: Can we auto-approve small commitments?**

A: Yes, the `check_auto_approval_criteria` function exists but isn't being invoked. This is a Phase 4 enhancement.

**Q: How do SLA timers work?**

A: When an approval is created, the `set_approval_sla_deadline` trigger calculates the deadline based on priority (critical: 2h, high: 4h, medium: 24h, low: 72h). The UI displays countdown timers and highlights overdue items.

**Q: What happens when staff approves a commitment?**

A: The approval record status changes to 'approved', and the `executeApprovalActions` function runs which updates the commitment status and can trigger other workflows like creating allocations or generating term sheets.

---

## Related Documents

- **PRD**: `docs/staff/Approvals_PRD.md`
- **Database Migration**: `versotech-portal/supabase/migrations/20250105000000_extend_approvals_schema.sql`
- **API Documentation**: See code comments in route files
- **Type Definitions**: `versotech-portal/src/types/approvals.ts`

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-01-06 | System Analysis | Initial implementation plan created |

---

**END OF DOCUMENT**
