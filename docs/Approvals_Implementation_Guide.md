# Approvals UI Enhancement - Implementation Guide

**Created:** October 18, 2025
**Status:** Phase 1 Complete (Detail Drawer) | Phase 2 Ready to Implement

---

## What's Been Completed

### ✅ Comprehensive Approval Detail Drawer

**File Created:** `src/components/approvals/approval-detail-drawer.tsx`

**Features:**
- **4 Tabs:** Overview, Details, Timeline, Metadata
- **SLA Progress Bar:** Visual countdown to deadline
- **Deal Timeline:** Visual milestone progress
- **Quick Actions:** Inline Approve/Reject buttons
- **Comprehensive Info:** Shows all approval data, deal info, investor info
- **Responsive Design:** Works on all screen sizes

**Usage Example:**
```typescript
import { ApprovalDetailDrawer } from '@/components/approvals/approval-detail-drawer'

const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
const [drawerOpen, setDrawerOpen] = useState(false)

<ApprovalDetailDrawer
  approval={selectedApproval}
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  onApprove={async (id) => {
    // Call your approve API
    await fetch(`/api/approvals/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' })
    })
  }}
  onReject={async (id, reason) => {
    // Call your reject API
    await fetch(`/api/approvals/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', rejection_reason: reason })
    })
  }}
/>
```

---

## Next Steps: Integrating the Detail Drawer

### Step 1: Update Approvals Page Client

**File:** `src/components/approvals/approvals-page-client.tsx`

Add state for the drawer:

```typescript
// Add these imports
import { ApprovalDetailDrawer } from './approval-detail-drawer'

// Add these state variables (around line 85)
const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)

// Add handler functions
const handleApprovalClick = (approval: Approval) => {
  setSelectedApproval(approval)
  setDetailDrawerOpen(true)
}

const handleApprove = async (approvalId: string) => {
  // Call existing approval logic or create new one
  const response = await fetch(`/api/approvals/${approvalId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve' })
  })

  if (response.ok) {
    // Refresh approvals list
    await refreshApprovals()
  }
}

const handleReject = async (approvalId: string, reason: string) => {
  const response = await fetch(`/api/approvals/${approvalId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject', rejection_reason: reason })
  })

  if (response.ok) {
    await refreshApprovals()
  }
}
```

### Step 2: Make Table Rows Clickable

Find the table row rendering (around line 250-300) and add click handler:

```typescript
<TableRow
  key={approval.id}
  className="cursor-pointer hover:bg-white/5 transition-colors"
  onClick={() => handleApprovalClick(approval)}
>
  {/* existing cells */}
</TableRow>
```

### Step 3: Add the Drawer Component

At the end of the return statement (before the closing tag), add:

```typescript
return (
  <div>
    {/* existing code */}

    {/* Add this at the end */}
    <ApprovalDetailDrawer
      approval={selectedApproval}
      open={detailDrawerOpen}
      onOpenChange={setDetailDrawerOpen}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  </div>
)
```

---

## Phase 2: Multiple Views (Ready to Implement)

### Architecture Overview

```
/components/approvals/
├── approvals-page-client.tsx       (Main container - UPDATE THIS)
├── approval-detail-drawer.tsx      (✅ DONE)
├── approval-view-switcher.tsx      (CREATE)
└── views/
    ├── approvals-table-view.tsx    (Extract from current)
    ├── approvals-kanban-view.tsx   (CREATE)
    ├── approvals-list-view.tsx     (CREATE)
    └── approvals-database-view.tsx (CREATE - Optional)
```

### View Switcher Component

**File to Create:** `src/components/approvals/approval-view-switcher.tsx`

```typescript
'use client'

import { LayoutGrid, Table, List, Kanban } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ViewType = 'table' | 'kanban' | 'list' | 'database'

interface ApprovalViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ApprovalViewSwitcher({
  currentView,
  onViewChange
}: ApprovalViewSwitcherProps) {
  return (
    <Tabs value={currentView} onValueChange={(v) => onViewChange(v as ViewType)}>
      <TabsList className="grid w-full grid-cols-4 max-w-md">
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          <span className="hidden sm:inline">Table</span>
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <Kanban className="h-4 w-4" />
          <span className="hidden sm:inline">Kanban</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </TabsTrigger>
        <TabsTrigger value="database" className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Grid</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
```

### Kanban View Component

**File to Create:** `src/components/approvals/views/approvals-kanban-view.tsx`

```typescript
'use client'

import { Approval } from '@/types/approvals'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface ApprovalsKanbanViewProps {
  approvals: Approval[]
  onApprovalClick: (approval: Approval) => void
}

const statusColumns = [
  { id: 'pending', title: 'Pending Review', color: 'border-amber-500' },
  { id: 'approved', title: 'Approved', color: 'border-emerald-500' },
  { id: 'rejected', title: 'Rejected', color: 'border-rose-500' }
]

export function ApprovalsKanbanView({ approvals, onApprovalClick }: ApprovalsKanbanViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statusColumns.map((column) => {
        const columnApprovals = approvals.filter((a) => a.status === column.id)

        return (
          <div key={column.id} className="space-y-3">
            <div className={`border-l-4 ${column.color} pl-3`}>
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <p className="text-sm text-muted-foreground">{columnApprovals.length} items</p>
            </div>

            <div className="space-y-2">
              {columnApprovals.map((approval) => (
                <Card
                  key={approval.id}
                  className="cursor-pointer hover:bg-white/10 transition-colors border-white/10"
                  onClick={() => onApprovalClick(approval)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {approval.entity_type}
                        </Badge>
                        <p className="font-semibold text-sm">
                          {approval.related_deal?.name || approval.related_investor?.legal_name}
                        </p>
                      </div>
                      <Badge
                        className={
                          approval.priority === 'critical'
                            ? 'bg-red-500/20 text-red-300'
                            : approval.priority === 'high'
                            ? 'bg-orange-500/20 text-orange-300'
                            : approval.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }
                      >
                        {approval.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {approval.sla_breach_at && (
                        <span>Due {format(new Date(approval.sla_breach_at), 'MMM dd')}</span>
                      )}
                    </div>
                    {approval.entity_metadata?.indicative_amount && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        {approval.entity_metadata.indicative_currency}{' '}
                        {approval.entity_metadata.indicative_amount.toLocaleString()}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {approval.assigned_to_profile?.display_name || 'Unassigned'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### List View Component

**File to Create:** `src/components/approvals/views/approvals-list-view.tsx`

```typescript
'use client'

import { Approval } from '@/types/approvals'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  DollarSign,
  User,
  Building2,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface ApprovalsListViewProps {
  approvals: Approval[]
  onApprovalClick: (approval: Approval) => void
  onApprove?: (approvalId: string) => Promise<void>
  onReject?: (approvalId: string) => Promise<void>
}

export function ApprovalsListView({
  approvals,
  onApprovalClick,
  onApprove,
  onReject
}: ApprovalsListViewProps) {
  return (
    <div className="space-y-3">
      {approvals.map((approval) => (
        <Card
          key={approval.id}
          className="cursor-pointer hover:bg-white/5 transition-colors border-white/10"
          onClick={() => onApprovalClick(approval)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Left side - Main info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{approval.entity_type}</Badge>
                  <Badge
                    className={
                      approval.priority === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : approval.priority === 'high'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }
                  >
                    {approval.priority}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300">
                    {approval.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-lg">
                  {approval.related_deal?.name || approval.related_investor?.legal_name}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {approval.related_investor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{approval.related_investor.legal_name}</span>
                    </div>
                  )}

                  {approval.related_deal && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{approval.related_deal.deal_type || 'Deal'}</span>
                    </div>
                  )}

                  {approval.sla_breach_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Due {format(new Date(approval.sla_breach_at), 'MMM dd, HH:mm')}</span>
                    </div>
                  )}

                  {approval.entity_metadata?.indicative_amount && (
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {approval.entity_metadata.indicative_currency}{' '}
                        {approval.entity_metadata.indicative_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Assigned to {approval.assigned_to_profile?.display_name || 'Unassigned'}
                </p>
              </div>

              {/* Right side - Actions */}
              {approval.status === 'pending' && (onApprove || onReject) && (
                <div className="flex flex-col gap-2">
                  {onApprove && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onApprove(approval.id)
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReject(approval.id)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## Integration Steps

### Step 1: Add View State to Approvals Page Client

```typescript
// Add to approvals-page-client.tsx imports
import { ApprovalViewSwitcher, ViewType } from './approval-view-switcher'
import { ApprovalsKanbanView } from './views/approvals-kanban-view'
import { ApprovalsListView } from './views/approvals-list-view'

// Add state (around line 85)
const [currentView, setCurrentView] = useState<ViewType>('table')

// Save view preference to localStorage
useEffect(() => {
  const savedView = localStorage.getItem('approvals-view-preference')
  if (savedView) {
    setCurrentView(savedView as ViewType)
  }
}, [])

useEffect(() => {
  localStorage.setItem('approvals-view-preference', currentView)
}, [currentView])
```

### Step 2: Add View Switcher to UI

```typescript
// In the return statement, add above the approvals list
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-4">
    <h2 className="text-xl font-semibold">Approvals</h2>
    <Badge>{filteredApprovals.length} items</Badge>
  </div>

  <ApprovalViewSwitcher
    currentView={currentView}
    onViewChange={setCurrentView}
  />
</div>
```

### Step 3: Render Different Views

```typescript
// Replace the current table rendering with conditional rendering
{currentView === 'table' && (
  <Table>
    {/* existing table code */}
  </Table>
)}

{currentView === 'kanban' && (
  <ApprovalsKanbanView
    approvals={filteredApprovals}
    onApprovalClick={handleApprovalClick}
  />
)}

{currentView === 'list' && (
  <ApprovalsListView
    approvals={filteredApprovals}
    onApprovalClick={handleApprovalClick}
    onApprove={handleApprove}
    onReject={handleReject}
  />
)}

{currentView === 'database' && (
  <div className="text-center py-12 text-muted-foreground">
    Database view coming soon...
  </div>
)}
```

---

## Testing Checklist

### Detail Drawer
- [ ] Drawer opens when clicking an approval
- [ ] All tabs (Overview, Details, Timeline, Metadata) display correctly
- [ ] SLA progress bar shows accurate progress
- [ ] Deal timeline shows milestones
- [ ] Approve/Reject buttons work
- [ ] Drawer closes after approval/rejection

### View Switcher
- [ ] Can switch between all views
- [ ] View preference persists on page reload
- [ ] All views display approval data correctly

### Kanban View
- [ ] Approvals grouped into correct status columns
- [ ] Cards show key information
- [ ] Clicking a card opens detail drawer
- [ ] Priority badges display correctly

### List View
- [ ] Approvals display in vertical card layout
- [ ] Quick action buttons (Approve/Reject) work
- [ ] Clicking card opens detail drawer
- [ ] All metadata displays correctly

---

## Performance Optimization

### For Large Approval Lists (>100 items)

1. **Virtualization:** Use `react-virtual` or `react-window`
```bash
npm install react-virtual
```

2. **Pagination:** Already implemented in current page

3. **Lazy Loading:** Load detail data only when drawer opens

4. **Debounce Filters:** Add debouncing to search/filter inputs

---

## Next Steps

1. **Immediate:** Integrate the detail drawer (Steps 1-3 above)
2. **This Week:** Create view switcher and Kanban view
3. **Next Week:** Add List and Database views
4. **Future:** Add Gantt chart view using `react-gantt-chart` library

---

## Files Modified

- ✅ **Created:** `src/components/approvals/approval-detail-drawer.tsx`
- 🔄 **To Update:** `src/components/approvals/approvals-page-client.tsx`
- 🆕 **To Create:** `src/components/approvals/approval-view-switcher.tsx`
- 🆕 **To Create:** `src/components/approvals/views/approvals-kanban-view.tsx`
- 🆕 **To Create:** `src/components/approvals/views/approvals-list-view.tsx`
- 🆕 **To Create:** `src/components/approvals/views/approvals-database-view.tsx`

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all imports are correct
3. Ensure approval data structure matches TypeScript types
4. Test with a single approval first before scaling

**Estimated Implementation Time:**
- Detail Drawer Integration: 30 minutes
- View Switcher + Kanban View: 1-2 hours
- List View: 30 minutes
- Full Implementation: 3-4 hours
