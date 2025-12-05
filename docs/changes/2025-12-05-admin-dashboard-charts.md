# Admin Dashboard - Admin-Only Charts & KPIs

**Date:** 2025-12-05
**Author:** Claude Code
**Status:** Complete

## Summary

Added functional, admin-only charts and KPI cards to the Super Admin Dashboard that visualize existing database data. These metrics are specifically designed for management oversight and show data that regular staff should not see about themselves or operational bottlenecks.

## Business Justification

| Chart/KPI | Admin Question Answered |
|-----------|------------------------|
| Security KPI Cards | "Are there security issues I need to address?" |
| Staff Activity Chart | "Is my team productive? Who needs attention?" |
| Approval Queue Chart | "Are we creating bottlenecks? SLA risks?" |
| Workflow Trend Chart | "Is our automation reliable? Degrading?" |
| Compliance Forecast | "What compliance work is coming? Can we plan?" |

**Key Design Decision:** These charts do NOT duplicate what the staff dashboard already shows (Revenue & Fees Chart, Capital Commitments, Active LPs, etc.). All metrics are admin-specific oversight concerns.

## Files Created

### API Endpoint
- `versotech-portal/src/app/api/admin/metrics/dashboard/route.ts` - Extended to add admin-only metrics

### Chart Components (6 new files)
- `versotech-portal/src/app/(staff)/versotech/staff/admin/components/admin-kpi-cards.tsx`
- `versotech-portal/src/app/(staff)/versotech/staff/admin/components/staff-activity-chart.tsx`
- `versotech-portal/src/app/(staff)/versotech/staff/admin/components/approval-queue-chart.tsx`
- `versotech-portal/src/app/(staff)/versotech/staff/admin/components/workflow-trend-chart.tsx`
- `versotech-portal/src/app/(staff)/versotech/staff/admin/components/compliance-forecast-chart.tsx`

### Modified Files
- `versotech-portal/src/app/(staff)/versotech/staff/admin/page.tsx` - Added chart grid and data fetching

## Technical Implementation

### Database Tables Queried (NO new tables created)

| Function | Tables Queried | Data Points |
|----------|---------------|-------------|
| `fetchSecurityMetrics` | `audit_logs`, `profiles`, `approvals` | Failed logins (24h/7d), new accounts, pending approvals |
| `fetchStaffActivity` | `profiles`, `audit_logs` | Actions per staff member (7 days) |
| `fetchApprovalQueueHealth` | `approvals` | Pending approvals by age bucket |
| `fetchWorkflowTrend` | `workflow_runs` | Success rate by day (30 days) |
| `fetchComplianceForecast` | `investors` | KYC expirations by timeframe |

### API Response Structure

```typescript
{
  data: {
    // ... existing KPIs and charts ...
    adminMetrics: {
      security: {
        failed_logins_24h: number,
        failed_logins_7d: number,
        new_accounts_7d: number,
        pending_approvals: number
      },
      staffActivity: Array<{
        staff_id: string,
        name: string,
        action_count: number,
        last_action: string | null
      }>,
      approvalQueue: {
        under_1_day: number,
        days_1_to_3: number,
        days_3_to_7: number,
        over_7_days: number,
        total: number
      },
      workflowTrend: Array<{
        date: string,
        total_runs: number,
        completed: number,
        failed: number,
        success_rate: number
      }>,
      complianceForecast: {
        next_7_days: number,
        next_30_days: number,
        next_90_days: number,
        total: number
      }
    }
  }
}
```

### Component Details

#### 1. Admin KPI Cards (`admin-kpi-cards.tsx`)
- **Type:** 4 metric cards in a grid
- **Data:** Security metrics + compliance forecast
- **Features:**
  - Dynamic color coding (red for alerts, emerald for good)
  - Failed logins shows 24h count with 7d context
  - KYC expiring shows 30d count with 7d critical count

#### 2. Staff Activity Chart (`staff-activity-chart.tsx`)
- **Type:** Horizontal bar chart (Recharts)
- **Data:** `staffActivity` array from API
- **Features:**
  - Shows top 8 staff members by action count
  - Color-coded bars by activity level (green/blue/amber/gray)
  - Tooltip shows full name, action count, and last action date
  - Empty state: "No staff activity data"

#### 3. Approval Queue Chart (`approval-queue-chart.tsx`)
- **Type:** Horizontal bar chart (Recharts)
- **Data:** `approvalQueue` object from API
- **Features:**
  - Age buckets: < 1 day, 1-3 days, 3-7 days, 7+ days
  - Color-coded: emerald → blue → amber → red (by age)
  - Empty state: "All clear" with green indicator

#### 4. Workflow Trend Chart (`workflow-trend-chart.tsx`)
- **Type:** Line chart (Recharts)
- **Data:** `workflowTrend` array from API
- **Features:**
  - Shows success rate % over 30 days
  - Reference line at 90% target
  - Purple color scheme
  - Tooltip shows date, success %, completed/total, failed count
  - Overall success rate in header

#### 5. Compliance Forecast Chart (`compliance-forecast-chart.tsx`)
- **Type:** Horizontal bar chart (Recharts)
- **Data:** `complianceForecast` object from API
- **Features:**
  - Timeframes: Next 7d (critical), 30d (high), 90d (medium)
  - Color-coded by urgency: red → amber → blue
  - Empty state: "No upcoming KYC expirations"

### Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│                    Super Admin Dashboard                          │
├─────────────┬─────────────┬─────────────┬─────────────┬──────────┤
│ Failed      │ New         │ Pending     │ KYC         │[Refresh] │
│ Logins: X   │ Accounts: X │ Approvals:X │ Expiring: X │          │
├─────────────┴─────────────┴─────────────┴─────────────┴──────────┤
│ ┌────────────────────────────┐ ┌────────────────────────────┐    │
│ │   Staff Activity (7d)      │ │   Approval Queue Health    │    │
│ │   [Horizontal Bar Chart]   │ │   [Horizontal Bar Chart]   │    │
│ └────────────────────────────┘ └────────────────────────────┘    │
│ ┌────────────────────────────┐ ┌────────────────────────────┐    │
│ │  Workflow Success Trend    │ │  Compliance Forecast       │    │
│ │  [Line Chart - 30 days]    │ │  [Horizontal Bar Chart]    │    │
│ └────────────────────────────┘ └────────────────────────────┘    │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │   Financial Overview (existing component)                   │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ ▼ Compliance & KYC Alerts                                         │
│ ▼ Staff Management                                                │
│ ▼ Workflow Monitoring                                             │
│ ▼ User Account Management                                         │
│ ▼ Real-Time Activity Feed                                         │
│ ▼ Data Export                                                     │
└──────────────────────────────────────────────────────────────────┘
```

## Security

- **Permission Check:** API validates `super_admin` permission via `staff_permissions` table
- **No Mock Data:** All charts pull from real database queries
- **Admin-Only Data:** Staff activity comparison and security metrics are not exposed to regular staff

## Real-Time Updates

- Initial data fetch on page load
- 30-second polling interval for all metrics
- Manual refresh button in header

## Empty States

All charts handle empty/zero data gracefully:
- Staff Activity: "No staff activity data"
- Approval Queue: "All clear" (green)
- Workflow Trend: "No workflow data"
- Compliance Forecast: "No upcoming KYC expirations" (green)

## Dependencies

- **Recharts v2.15.4** - Already installed in the project
- **Lucide React** - Icons (Users, Clock, Zap, Calendar, AlertTriangle, etc.)
- **shadcn/ui** - Card components

## Testing Notes

- Build succeeds with no TypeScript errors in implementation files
- ESLint warnings for useEffect dependencies are pre-existing and not blocking
- Test file errors are due to vitest not being installed (unrelated)

## Related Work

This implementation was part of a larger admin dashboard enhancement that also included:
- Fixing audit log column names (`entity_type` → `resource_type`, `entity_id` → `resource_id`)
- Removing broken `SystemHealthMetrics` component
- Wiring up staff activity dialog with real data
