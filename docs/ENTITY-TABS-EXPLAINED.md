# Entity Page - Tab Navigation Explained

**File:** [versotech-portal/src/components/entities/entity-detail-enhanced.tsx](versotech-portal/src/components/entities/entity-detail-enhanced.tsx:754-788)

## Tab Navigation Bar

The entity detail page uses a horizontal tab navigation system with 8 tabs. Each tab shows a count of items in parentheses where applicable.

```tsx
<TabsList>
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="investors">Investors (3)</TabsTrigger>
  <TabsTrigger value="documents">Documents & Folders</TabsTrigger>
  <TabsTrigger value="stakeholders">Stakeholders (5)</TabsTrigger>
  <TabsTrigger value="directors">Directors (2)</TabsTrigger>
  <TabsTrigger value="deals">Deals (1)</TabsTrigger>
  <TabsTrigger value="flags">Flags (2)</TabsTrigger>
  <TabsTrigger value="activity">Activity</TabsTrigger>
</TabsList>
```

---

## Tab 1: Overview
**Icon:** Building2
**Purpose:** Display all entity metadata

**What you see:**
- Entity code, legal name, type, status
- Platform, investment name, former entity
- Domicile, jurisdiction, registration number
- Currency, formation date
- Reporting type and requirements
- Notes field

**Actions:** None (read-only view of entity details)

---

## Tab 2: Investors (count shown)
**Icon:** ShieldCheck
**Purpose:** Manage investor allocations and commitments

**What you see:**
- List of investors linked to this entity
- Each investor shows:
  - Name, type, email
  - Allocation status (Active, Committed, Pending, Closed, Cancelled)
  - Subscription details (commitment amount, units, dates)
  - Relationship role and notes

**Actions:**
- **Link Investor button** - Add existing investor to this entity
- **Refresh button** - Reload investor data
- **Status dropdown** - Change allocation status per investor
- **Remove button** - Unlink investor from entity

**Key features:**
- Color-coded status badges (green for active, red for cancelled, etc.)
- Shows subscription commitment amounts with currency formatting
- Inline status updates without page reload

---

## Tab 3: Documents & Folders
**Icon:** FolderOpen
**Purpose:** Organize and access all documents

**What you see:**

### Section 1: Folder List
- Pre-created folders (KYC, Legal, Redemption, General, etc.)
- Each folder shows:
  - Folder name and type
  - Document count badge
  - Full path
  - Visual hierarchy (indented based on folder depth)

### Section 2: Documents List
- All documents in selected folder (or all if none selected)
- Each document shows:
  - Name, type badge, external link indicator
  - Upload/link date and creator
  - Folder location
  - Description (if provided)

**Actions:**
- **Upload Document button** - Add file or external link
- **Click folder** - Filter documents by folder
- **Download/Open buttons** - Access documents

**Key features:**
- Supports both stored files and external URL links
- Folder-based filtering
- Automatic folder creation for standard types

---

## Tab 4: Stakeholders (count shown)
**Icon:** Users
**Purpose:** Track service providers and strategic partners

**What you see:**
- 7 predefined categories:
  1. Shareholders
  2. Legal & Counsel
  3. Accounting
  4. Auditors
  5. Administrators
  6. Strategic Partners
  7. Other Stakeholders

- Each stakeholder shows:
  - Company name or contact person
  - Contact details (email, phone)
  - Active vs Former status
  - Effective date range
  - Notes

**Actions:**
- **Add Stakeholder button** - Create new stakeholder record

**Key features:**
- Organized by role category
- Shows count per category
- Active/Former badge based on effective_to date

---

## Tab 5: Directors (count shown)
**Icon:** Users
**Purpose:** Maintain board and officer records

**What you see:**
- List of all directors and officers
- Each director shows:
  - Full name
  - Role (e.g., "Director", "CEO", "CFO")
  - Email address
  - Active vs Former status
  - Effective date range
  - Notes

**Actions:**
- **Add Director button** - Create new director record

**Key features:**
- Active/Former badge (Former = has effective_to date)
- Shows appointment date ranges
- Chronological listing (newest first)

---

## Tab 6: Deals (count shown)
**Icon:** Briefcase
**Purpose:** View investment opportunities using this entity

**What you see:**
- List of deals linked to this entity
- Each deal shows:
  - Deal name
  - Deal type (e.g., "direct_investment")
  - Currency

**Actions:**
- **Open Deal button** - Navigate to deal detail page

**Key features:**
- Simple read-only list
- Quick navigation to related deals
- Shows how many investment opportunities use this entity

---

## Tab 7: Flags (count shown)
**Icon:** AlertTriangle
**Purpose:** Track compliance issues and action items

**What you see:**
- List of flags sorted by:
  1. Status (open → in_progress → closed)
  2. Creation date (newest first)

- Each flag shows:
  - Severity icon (critical, warning, info, success)
  - Title and description
  - Flag type (e.g., "missing_document", "compliance_issue")
  - Status badge (open, in_progress, closed)
  - Due date (if set)

**Actions:**
- **Add Flag button** - Create new flag
- **Refresh button** - Reload flags
- **Resolve button** - Mark flag as closed
- **Mark In Progress button** - Update status (only for open flags)
- **Reopen button** - Restore closed flag to open status
- **Remove button** - Delete flag entirely

**Key features:**
- Color-coded severity levels:
  - Critical: Red (urgent)
  - Warning: Amber (important)
  - Info: Blue (informational)
  - Success: Green (positive)
- Status workflow: Open → In Progress → Closed
- Can reopen closed flags if needed

**Common flag types:**
- Missing documents
- Compliance issues
- Pending approvals
- Data quality issues
- Regulatory requirements

---

## Tab 8: Activity
**Icon:** Activity
**Purpose:** Audit trail of all changes

**What you see:**
- Timeline of recent events (last 50)
- Each event shows:
  - Event type (e.g., "entity_updated", "director_added")
  - Timestamp (full date and time)
  - User who made the change (display name)
  - Description (if available)
  - Event payload (JSON data)

**Actions:**
- **Refresh button** - Reload activity log

**Key features:**
- Vertical timeline with emerald border
- Scrollable area (max height 384px)
- Newest events at top
- Shows who did what and when
- Automatic event creation for entity changes

**Event types tracked:**
- Entity metadata updates
- Director/stakeholder additions
- Document uploads
- Flag creation/resolution
- Investor link changes
- Deal associations

---

## How Tab Navigation Works

### State Management
```typescript
const [activeTab, setActiveTab] = useState('overview')
```

### Tab Switching
- Click any tab to switch view
- URL doesn't change (client-side only)
- Previous tab data remains in memory
- No page reload needed

### Dynamic Counts
Counts update in real-time when:
- Adding/removing investors
- Creating/deleting flags
- Adding directors or stakeholders
- Linking/unlinking deals

### Default Tab
- Always opens to "Overview" tab first
- Can be changed via `activeTab` state

---

## Navigation Flow Example

**User Journey: Reviewing an Entity**

1. **Start:** Land on page → Overview tab shows
2. **Check compliance:** Click Flags tab → See 2 unresolved flags
3. **View action items:** See missing KYC document flag
4. **Get document:** Click Documents tab → Upload to KYC folder
5. **Resolve flag:** Back to Flags tab → Click "Resolve" button
6. **Check investors:** Click Investors tab → See 3 linked investors
7. **Update status:** Change investor allocation from Pending → Active
8. **Audit trail:** Click Activity tab → See all recent changes logged

---

## Key Design Principles

1. **Tab Isolation:** Each tab is independent, can be used without others
2. **Real-time Updates:** Actions update counts and data immediately
3. **No Data Loss:** Switching tabs preserves unsaved state (via React state)
4. **Progressive Disclosure:** Only show relevant actions per tab
5. **Contextual Actions:** Header buttons change based on active tab

---

## End of Document
