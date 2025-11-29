# Change Log #05: Approval Kanban & PDF Preview Fixes

**Date**: November 28-29, 2025
**Author**: Claude Code
**Status**: Completed - Production Ready
**Priority**: HIGH
**Affected Systems**: Approval Queue (Kanban View), Document Viewer (PDF Preview), Staff Portal

---

## Executive Summary

This change resolves critical bugs in the approval kanban view and PDF document preview:

1. **Approval Kanban Race Condition** - Fixed race condition where localStorage view preference caused API calls to overwrite server data
2. **Approval Kanban Data Loss** - Fixed issue where switching views or applying filters would lose approved/rejected items
3. **Approval Kanban Pagination Bug** - Fixed `LIMIT 50` cutting off pending items at position 52 in ordered results
4. **PDF Preview Layout Issue** - Fixed empty white space at bottom of fullscreen document preview in Brave browser
5. **PDF Thumbnail Sidebar Issue** - Fixed thumbnail sidebar not rendering properly

**Impact**: Staff can now reliably use the kanban view to see all approval statuses, and PDF documents display correctly in fullscreen mode.

---

## Table of Contents

1. [Background & Symptoms](#background--symptoms)
2. [Root Cause Analysis](#root-cause-analysis)
3. [Fixes Implemented](#fixes-implemented)
4. [Files Changed](#files-changed)
5. [Testing & Verification](#testing--verification)
6. [Commits](#commits)

---

## Background & Symptoms

### Approval Kanban Issues

**Reported Symptoms**:
- **Local server**: Kanban showed approved/rejected but pending = 0
- **Production**: Kanban showed 0 in ALL columns, but table/list views worked normally

**Database State** (verified via Supabase MCP):
- 47 approved records
- 1 pending record
- 7 rejected records
- Total: 55 records with valid `resolved_at` timestamps

### PDF Preview Issues

**Reported Symptoms**:
- Empty white space at bottom of fullscreen document preview
- Thumbnail sidebar not rendering in Brave browser
- Layout issues when switching between PDF pages

---

## Root Cause Analysis

### Issue 1: Race Condition on Page Load

**The Problem**:
1. Server renders page with complete data (all 55 approvals)
2. Client hydrates with `initialApprovals` array
3. `useEffect` triggers `refreshData()` before localStorage loads view preference
4. API call with `status=pending` overwrites the complete dataset with pending-only data
5. Kanban shows 0 approved, 0 rejected

**Code Location**: `approvals-page-client.tsx` lines 277-285

```typescript
// BEFORE: useEffect fired on mount and overwrote server data
useEffect(() => {
  refreshData()  // Called immediately, overwrote good server data
}, [filters.entity_types, filters.priorities, ...])
```

### Issue 2: Status Filtering Based on View

**The Problem**:
1. `refreshData()` only fetched `status=pending` for table view
2. User applies filter in table view → only pending data fetched
3. User switches to kanban → approved/rejected data is GONE
4. Kanban shows 0 approved, 0 rejected

**Code Location**: `approvals-page-client.tsx` lines 165-171

```typescript
// BEFORE: Conditionally fetched statuses based on view
if (currentView === 'kanban') {
  params.append('status', 'pending,approved,rejected')
} else {
  params.append('status', 'pending')  // Lost approved/rejected data!
}
```

### Issue 3: Pagination Limit Cutting Off Pending Items

**The Problem**:
1. Database returns results ordered by `sla_breach_at ASC`
2. With 55 records, pending item sits at position 52 in sorted results
3. `refreshData()` uses `LIMIT 50`
4. Pending item at position 52 is NOT returned!

**Evidence from Database Query**:
```
Position 50: 2025-11-25 20:30:37 - approved
Position 51: 2025-11-27 01:53:24 - approved
Position 52: 2025-11-27 01:53:37 - PENDING  ← CUT OFF BY LIMIT 50!
Position 53-55: more approved items
```

### Issue 4: PDF Preview Flex Centering

**The Problem**:
1. Main viewport container used `flex items-center justify-center`
2. This caused content to be vertically centered even when PDF filled viewport
3. In Brave browser, this created white space at bottom
4. Thumbnail sidebar had competing flex layout issues

**Code Location**: `DocumentViewerFullscreen.tsx` lines ~35-40

---

## Fixes Implemented

### Fix 1: Add `isInitialMount` Flag

Skip the first `useEffect` run to preserve server-rendered data:

```typescript
// Track initial mount to prevent API call from overwriting server data
const [isInitialMount, setIsInitialMount] = useState(true)

useEffect(() => {
  // Skip initial mount - we already have correct server data
  if (isInitialMount) {
    setIsInitialMount(false)
    return
  }
  refreshData()
}, [filters.entity_types, filters.priorities, ...])
```

### Fix 2: Always Fetch All Statuses

Changed `refreshData()` to always fetch all statuses regardless of view:

```typescript
// ALWAYS fetch all statuses to ensure data consistency across views
// The visibleApprovals memo handles filtering for non-kanban views
params.append('status', 'pending,approved,rejected')
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
params.append('decided_after', thirtyDaysAgo.toISOString())
```

### Fix 3: Remove `currentView` from useEffect Dependencies

Prevent unnecessary API calls when switching views:

```typescript
// Note: currentView is intentionally NOT included
useEffect(() => {
  if (isInitialMount) {
    setIsInitialMount(false)
    return
  }
  refreshData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filters.entity_types, filters.priorities, filters.assigned_to_me, filters.overdue_only, pagination.page])
```

### Fix 4: Client-Side Filtering via Memo

Use `visibleApprovals` memo to filter for non-kanban views:

```typescript
// Filter approvals based on current view
// Kanban shows all statuses, other views show only pending
const visibleApprovals = useMemo(() => {
  if (currentView === 'kanban') {
    return approvals
  }
  // Table, List, Database views only show pending items
  return approvals.filter(a => a.status === 'pending')
}, [approvals, currentView])
```

### Fix 5: Increase Limit for Kanban View

Use higher limit for kanban to ensure all items are fetched:

```typescript
// Kanban view needs ALL items without pagination to show complete board
// Other views (table, list, database) use standard pagination
const effectiveLimit = currentView === 'kanban' ? 500 : pagination.limit
params.append('limit', effectiveLimit.toString())
if (currentView !== 'kanban') {
  params.append('offset', ((pagination.page - 1) * pagination.limit).toString())
}
```

### Fix 6: PDF Preview Layout

Remove flex centering from main viewport, keep only for loading/error states:

```typescript
// BEFORE
<div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900">

// AFTER
<div className="flex-1 overflow-auto bg-gray-900">
```

---

## Files Changed

### Core Changes

| File | Lines Changed | Description |
|------|--------------|-------------|
| `components/approvals/approvals-page-client.tsx` | ~30 lines | Race condition fix, status fetching, pagination fix |
| `components/documents/DocumentViewerFullscreen.tsx` | ~5 lines | PDF preview layout fix |

### Detailed Changes in `approvals-page-client.tsx`

1. **Line 96**: Added `isInitialMount` state
2. **Lines 131-137**: Added `visibleApprovals` memo
3. **Lines 165-179**: Changed to always fetch all statuses + conditional pagination
4. **Line 205**: Added `currentView` to useCallback dependencies
5. **Lines 277-285**: Added isInitialMount check in useEffect

---

## Testing & Verification

### Test Case 1: Fresh Page Load with Kanban Preference

1. Clear localStorage
2. Set `approvals-view-preference` to `'kanban'`
3. Navigate to Approvals page
4. **Expected**: Kanban shows 1 pending, 47 approved, 7 rejected

### Test Case 2: Switch Between Views

1. Start in Table view
2. Apply a filter (e.g., High Priority)
3. Switch to Kanban view
4. **Expected**: Kanban shows all statuses, not empty

### Test Case 3: Click Refresh Button

1. View Kanban with all data showing
2. Click Refresh button
3. **Expected**: Pending count remains 1 (not 0)

### Test Case 4: Apply and Clear Filters

1. Apply "Overdue Only" filter
2. Clear all filters
3. **Expected**: All data returns correctly

### Test Case 5: PDF Preview

1. Open a PDF document in fullscreen viewer
2. **Expected**: No white space at bottom, thumbnail sidebar renders

---

## Commits

| Commit | Message |
|--------|---------|
| `55fe9b1` | Fix PDF preview thumbnail sidebar issue in Brave browser |
| `2909812` | Fix PDF preview layout and approval kanban race condition |
| `7ee6f25` | Fix approval kanban by always fetching all statuses |
| `edc76f8` | Fix kanban view cutting off pending items due to pagination limit |

---

## Architecture Decisions

### Why Always Fetch All Statuses?

1. **Data Consistency**: Prevents data loss when switching views
2. **Client-Side Filtering**: Faster than re-fetching on view change
3. **Simpler Logic**: One query pattern instead of conditional

### Why Higher Limit for Kanban?

1. **Kanban is Visual Board**: Users expect to see ALL items at once
2. **No Pagination UI**: Kanban doesn't have page navigation
3. **500 is Reasonable**: Even with growth, unlikely to exceed this for active approvals

### Why Remove currentView from useEffect?

1. **Server Provides Complete Data**: Initial render already has all statuses
2. **No Need to Refetch**: View change is just a presentation change
3. **Better Performance**: Fewer API calls

---

## Known Limitations

1. **500 Record Limit**: If approvals exceed 500 in kanban view, some may not show
2. **Memory Usage**: All records held in memory for kanban (acceptable for expected scale)

---

## Related Changes

This change builds on:
- **Change #01**: Authentication and query ordering fixes
- **Change #04**: Tasks page visibility fix (similar `.eq()` filter pattern)

---

**End of Change Log #05**
