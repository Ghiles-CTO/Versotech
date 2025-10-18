# Approvals Page UI Enhancement Plan

**Created:** October 18, 2025
**Objective:** Transform the approvals page into a comprehensive, multi-view approval management system

---

## Overview

Enhance the staff approvals page with multiple visualization modes and comprehensive detail views to improve approval workflow efficiency.

## View Types to Implement

### 1. **Kanban View** (Priority: HIGH)
- **Columns:** By status (Pending → Approved/Rejected) or by priority (Low → Critical)
- **Features:**
  - Drag-and-drop to change status/priority
  - Card-based layout showing key info
  - Visual priority indicators
  - SLA countdown badges
  - Quick actions on cards

### 2. **Table View** (Priority: HIGH - Enhancement)
- **Current Implementation:** Basic table exists
- **Enhancements:**
  - More columns (Deal type, Amount, SLA, Assigned to, etc.)
  - Sortable columns
  - Inline actions
  - Row selection for bulk actions
  - Expandable rows for quick details

### 3. **List View** (Priority: MEDIUM)
- **Layout:** Vertical card list with comprehensive info per approval
- **Features:**
  - Large cards with all key details visible
  - Avatar/entity icon
  - Status timeline preview
  - Inline approve/reject buttons
  - Comfortable spacing for scanning

### 4. **Database View** (Priority: MEDIUM)
- **Layout:** Airtable-style grid
- **Features:**
  - Column customization
  - Inline editing (priority, assigned to, notes)
  - Filters sidebar
  - Column resizing
  - Grouping by entity type or priority

### 5. **Gantt View** (Priority: LOW - Future)
- **Layout:** Timeline chart
- **Features:**
  - X-axis: Time
  - Y-axis: Approvals grouped by deal/investor
  - Bars showing SLA deadlines
  - Today marker
  - Overdue highlighting

### 6. **Calendar View** (Priority: LOW - Future)
- **Layout:** Calendar grid
- **Features:**
  - Approvals placed on SLA breach dates
  - Color-coded by priority
  - Click to view details
  - Multi-day view options

---

## Detail Drawer/Modal

### Purpose
Comprehensive view when clicking any approval from any view

### Sections

1. **Header**
   - Entity type badge
   - Priority indicator
   - SLA countdown (with progress bar)
   - Quick actions (Approve/Reject/Reassign)

2. **Overview Card**
   - Deal name (linked)
   - Investor name (linked)
   - Requested by + date
   - Assigned to + role
   - Amount (if applicable)
   - Current status

3. **Deal Timeline** (NEW!)
   - Visual timeline showing deal milestones:
     - Deal created
     - Interest submitted
     - Approval requested ← Current
     - NDA signed (future)
     - Data room access (future)
     - Subscription (future)
     - Deal closed (future)

4. **Entity Details**
   - Different content based on entity_type:
     - deal_interest: Indicative amount, notes
     - deal_commitment: Commitment amount, allocation
     - deal_subscription: Subscription details
     - etc.

5. **Metadata**
   - Full entity_metadata JSON (prettified)
   - Custom fields based on type

6. **Activity History**
   - Timeline of all actions:
     - Created
     - Assigned
     - Reassigned
     - Approved/Rejected
     - Comments added
   - Actor avatars and timestamps

7. **Comments/Notes**
   - Internal staff notes
   - Add new comment functionality
   - @mentions for other staff

8. **Related Items**
   - Other approvals for same deal
   - Other approvals for same investor
   - Related documents

9. **Actions Panel**
   - Primary actions (Approve/Reject with reason)
   - Secondary actions (Reassign, Request Info, Escalate)
   - Bulk select similar approvals

---

## Data Requirements

### Additional Fields to Fetch

```typescript
// Extend approval query to include:
- deal.created_at
- deal.target_close_date
- deal.minimum_ticket
- deal.maximum_ticket
- investor.kyc_status
- investor.aum_range
- approval_history (via separate query)
- related_approvals_count
- entity-specific data based on entity_type
```

### New Queries

1. `getApprovalHistory(approval_id)` - Full activity log
2. `getRelatedApprovals(deal_id, investor_id)` - Context approvals
3. `getDealTimeline(deal_id)` - Milestone events
4. `getApprovalComments(approval_id)` - Internal notes

---

## Component Architecture

```
/components/approvals/
├── approval-detail-drawer.tsx          (Main detail view)
├── approval-timeline.tsx               (Deal timeline viz)
├── approval-history.tsx                (Activity history)
├── approval-comments.tsx               (Comments section)
├── views/
│   ├── kanban-view.tsx                (Kanban implementation)
│   ├── table-view.tsx                 (Enhanced table)
│   ├── list-view.tsx                  (Card list)
│   ├── database-view.tsx              (Grid view)
│   └── gantt-view.tsx                 (Timeline - future)
└── view-switcher.tsx                   (View toggle controls)
```

---

## Implementation Phases

### Phase 1: Foundation (Immediate)
- [x] Create view switcher component
- [x] Enhance table view with more columns
- [x] Create basic detail drawer
- [x] Add deal timeline to drawer

### Phase 2: Primary Views (Week 1)
- [ ] Implement Kanban view
- [ ] Implement List view
- [ ] Add approval history to drawer
- [ ] Add comments functionality

### Phase 3: Advanced Features (Week 2)
- [ ] Implement Database view
- [ ] Add drag-and-drop to Kanban
- [ ] Add bulk actions to all views
- [ ] Add column customization

### Phase 4: Polish & Future (Week 3+)
- [ ] Implement Gantt view
- [ ] Implement Calendar view
- [ ] Add keyboard shortcuts
- [ ] Add saved view configurations
- [ ] Add export functionality per view

---

## Technical Dependencies

### Libraries to Add
```json
{
  "@dnd-kit/core": "^6.1.0",           // Drag and drop for Kanban
  "@dnd-kit/sortable": "^8.0.0",        // Sortable lists
  "react-beautiful-dnd": "^13.1.1",     // Alternative DnD
  "date-fns": "^2.30.0",                // Already installed
  "recharts": "^2.10.0"                 // Timeline charts (if needed)
}
```

### UI Components Needed
- Sheet/Drawer (for detail view) - Use shadcn
- Tabs (for view switcher) - Use shadcn
- Progress bars (for SLA) - Use shadcn
- Timeline component - Custom build
- Kanban board - Custom with dnd-kit

---

## UX Improvements

1. **View Persistence**
   - Remember last selected view in localStorage
   - Persist filter state per view

2. **Keyboard Shortcuts**
   - `1-6`: Switch views
   - `Enter`: Open selected approval
   - `A`: Approve
   - `R`: Reject
   - `Esc`: Close drawer
   - `/`: Focus search

3. **Quick Actions**
   - Hover actions on cards/rows
   - Right-click context menu
   - Bulk select with checkboxes

4. **Smart Grouping**
   - Group by deal (all approvals for same deal together)
   - Group by investor
   - Group by assigned staff member

5. **Filters Enhancement**
   - Saved filter presets ("My Approvals", "Urgent", "High Value")
   - Complex filters (AND/OR logic)
   - Date range filters (Created, SLA breach)

---

## Success Metrics

- [ ] Staff can switch between 4+ views
- [ ] Detail drawer shows comprehensive approval context
- [ ] Deal timeline visualizes progress
- [ ] Kanban view supports drag-and-drop
- [ ] All views support bulk actions
- [ ] Page load time < 2s for 100 approvals
- [ ] Mobile responsive (at least for table/list views)

---

## Notes

- Maintain backward compatibility with existing approval actions API
- Ensure all views use same data source (no duplicate queries)
- Optimize for performance with virtualization for large lists
- Consider accessibility (ARIA labels, keyboard navigation)
