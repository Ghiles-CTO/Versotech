# Staff Documents - Full Context Handoff

## TL;DR

Staff documents module at `versotech-portal/src/components/documents/staff/`. The goal is a **sidebar tree for navigation + content area for documents only** (no folder/vehicle cards in content). Work was partially done but has **critical gaps** that make it not work yet.

---

## The Design Goal

```
+---------------------------+--------------------------------------+
|  SIDEBAR (Navigation)     |  CONTENT (Documents Only)            |
|                           |                                      |
|  Vehicle A                |  [Welcome: "Select a location"]      |
|    ├── Folder 1       <-- click --> [Documents in Folder 1]      |
|    ├── Folder 2           |                                      |
|    ├── Deals              |                                      |
|    │   ├── Deal X     <-- click --> [Data room docs for Deal X]  |
|    │   │   ├── Data Room  |                                      |
|    │   │   └── Investors  |                                      |
|    │   │       ├── Joe <-- click --> [Joe's subscription docs]   |
|    │   │       └── Jane   |                                      |
|    │   └── Deal Y         |                                      |
|    └── ...                |                                      |
|  Vehicle B                |                                      |
+---------------------------+--------------------------------------+
```

**Sidebar = WHERE to navigate** (full tree)
**Content = WHAT's there** (documents only, no folder/vehicle cards)

---

## What Was Done (This Session)

### 1. ContentGrid.tsx - Stripped folder/vehicle cards
**File**: `src/components/documents/staff/content/ContentGrid.tsx`

- Removed `VehicleCard`, `FolderCard` imports and all their rendering
- Root level now shows a "Select a location" welcome state instead of vehicle cards
- Content area ONLY renders `DocumentCard` components
- Removed `getSubfolders`, `navigateToFolder`, `navigateToVehicle` from its dependencies
- Removed the "child vehicles view" (compartments/series cards)

### 2. types.ts - Added investor navigation types
**File**: `src/components/documents/staff/context/types.ts`

- Added `Investor` interface: `{ id, display_name, email }`
- Added `selectedInvestorId: string | null` to `NavigationState`
- Added `investor` entry to `NavigationHistoryEntry` union
- Added `NAVIGATE_TO_INVESTOR` to `NavigationAction`
- Added `TOGGLE_DEAL_INVESTORS_EXPANDED` to `TreeAction`
- Added `SET_DEAL_INVESTORS`, `SET_LOADING_INVESTORS` to `DataAction`
- Added `expandedDealInvestors: Set<string>` to `TreeState`
- Added `dealInvestors: Map<string, Investor[]>`, `loadingInvestors: Set<string>` to `DataState`
- Added `investors-group` and `investor` to `TreeNodeProps.type`
- Added `navigateToInvestor`, `fetchInvestorsForDeal`, `fetchInvestorDocuments` to context value interface

### 3. StaffDocumentsContext.tsx - Added investor state management
**File**: `src/components/documents/staff/context/StaffDocumentsContext.tsx`

- Updated initial state with new fields (`selectedInvestorId`, `expandedDealInvestors`, `dealInvestors`, `loadingInvestors`)
- Added `NAVIGATE_TO_INVESTOR` reducer case (sets investorId, clears data room mode)
- Added `selectedInvestorId: null` to ALL existing navigation reducer cases
- Added `investor` case to `NAVIGATE_BACK` switch
- Added `TOGGLE_DEAL_INVESTORS_EXPANDED` tree reducer case
- Added `SET_DEAL_INVESTORS`, `SET_LOADING_INVESTORS` data reducer cases
- Added `fetchInvestorsForDeal()` function - **CALLS MISSING API ROUTE** (see critical bugs)
- Added `fetchInvestorDocuments()` function - fetches `/api/staff/documents?investor_id=X&deal_id=Y`
- Added `navigateToInvestor()` helper
- Updated document fetch `useEffect` to skip when investor is selected (investor docs fetched by navigateToInvestor)
- Added all new functions to context value and useMemo deps

### 4. VehicleTree.tsx - Added investors under deals
**File**: `src/components/documents/staff/sidebar/VehicleTree.tsx`

- Added `navigateToInvestor`, `fetchInvestorsForDeal` from context
- Added `handleInvestorsNodeToggle` and `handleInvestorClick` handlers
- Each deal node now always renders expanded with two children:
  - **Data Room** node (existing)
  - **Investors** node (NEW) - expands to show investor list
- Investors node lazy-loads investor list on first expand
- Each investor is a clickable `TreeNode` of type `investor`
- Updated dependency arrays for `renderVehicleNode`

### 5. TreeNode.tsx - Added investor icons
**File**: `src/components/documents/staff/sidebar/TreeNode.tsx`

- Added `Users` and `User` icons from lucide-react
- Added `investors-group` type → orange `Users` icon
- Added `investor` type → orange `User` icon
- Updated type union in local interface

### 6. ContentHeader.tsx - Shows investor context
**File**: `src/components/documents/staff/content/ContentHeader.tsx`

- Added `User` icon import
- Investor selection shows: `[User icon] Investor Name – Documents`
- Root title changed from "All Documents" to "Select a location"
- Breadcrumb condition updated to include `selectedInvestorId`

---

## CRITICAL BUGS - Must Fix Before This Works

### BUG 1: Missing API Route `/api/deals/[dealId]/investors`

**Where it's called**: `StaffDocumentsContext.tsx` line ~1276
```typescript
const response = await fetch(`/api/deals/${dealId}/investors`)
```

**Problem**: This route DOES NOT EXIST. When you expand "Investors" under a deal in the sidebar, it will 404.

**What exists instead**:
- `/api/deals/[id]/linkable-investors` - but this has a different response shape
- No direct "get investors for deal" endpoint

**Fix options**:
1. **Create the route** at `src/app/api/deals/[id]/investors/route.ts` that queries subscriptions for the deal and returns investor profiles
2. **Use existing data** - query `subscriptions` table joined with `profiles` where `deal_id = X`

**Suggested SQL for the route**:
```sql
SELECT DISTINCT
  p.id,
  p.display_name,
  p.email
FROM subscriptions s
JOIN profiles p ON p.id = s.investor_id
WHERE s.deal_id = $dealId
ORDER BY p.display_name
```

### BUG 2: `/api/staff/documents` may not support `investor_id` parameter

**Where it's called**: `StaffDocumentsContext.tsx` `fetchInvestorDocuments()`
```typescript
const params = new URLSearchParams({
  investor_id: investorId,
  deal_id: dealId,
})
const response = await fetch(`/api/staff/documents?${params.toString()}`)
```

**Problem**: The existing `/api/staff/documents/route.ts` needs to be checked - it likely doesn't filter by `investor_id`. It probably only supports `folder_id` and `vehicle_id`.

**Fix**: Update the route handler to accept `investor_id` + `deal_id` and query subscription documents for that investor/deal combo.

### BUG 3: StaffDocumentsBreadcrumb doesn't handle investor state

**File**: `src/components/documents/navigation/StaffDocumentsBreadcrumb.tsx`

The breadcrumb component reads navigation state to build path segments. It currently handles: home, vehicle, virtual-parent, folder, data-room. It does NOT handle `selectedInvestorId`, so when viewing investor docs the breadcrumb will be incomplete/wrong.

**Fix**: Add investor segment to breadcrumb builder.

---

## SECONDARY ISSUES

### Issue 4: Deal nodes always expanded
In `VehicleTree.tsx`, deal nodes now render with `isExpanded={true}` and `onToggle={() => {}}` (empty toggle). This means every deal is always expanded showing Data Room + Investors. This may look noisy. Consider making deals collapsible again.

### Issue 5: No loading state for investor documents
When clicking an investor, `fetchInvestorDocuments()` is called but there's no specific loading indicator in ContentGrid for this case. It relies on the generic `data.loading` flag, which should work but hasn't been tested.

### Issue 6: VehicleCard and FolderCard are now dead code
`src/components/documents/staff/cards/VehicleCard.tsx` and `FolderCard.tsx` are no longer imported anywhere in the content area. They might still be needed elsewhere, but if not, they're dead weight.

---

## FILE MAP (All Relevant Files)

```
src/components/documents/staff/
├── index.tsx                              # Main export, dialog wiring
├── context/
│   ├── types.ts                           # All types (MODIFIED)
│   └── StaffDocumentsContext.tsx           # State + fetching (MODIFIED, ~1800 lines)
├── layout/
│   └── StaffDocumentsLayout.tsx           # Shell with sidebar + content
├── sidebar/
│   ├── DocumentsSidebar.tsx               # Sidebar header + search + tree
│   ├── VehicleTree.tsx                    # Tree renderer (MODIFIED)
│   └── TreeNode.tsx                       # Individual tree item (MODIFIED)
├── content/
│   ├── DocumentsMainContent.tsx           # Routes to search OR grid
│   ├── ContentHeader.tsx                  # Title + breadcrumbs (MODIFIED)
│   ├── ContentToolbar.tsx                 # Search + sort + view toggle
│   ├── ContentGrid.tsx                    # Document display (HEAVILY MODIFIED)
│   ├── SearchResults.tsx                  # Global search results
│   └── BulkActionBar.tsx                  # Multi-select actions
└── cards/
    ├── VehicleCard.tsx                    # NOW UNUSED in content
    ├── FolderCard.tsx                     # NOW UNUSED in content
    └── DocumentCard.tsx                   # Still used

src/components/documents/navigation/
├── StaffDocumentsBreadcrumb.tsx           # Breadcrumb (NEEDS investor support)
└── FolderBreadcrumbs.tsx                  # Older breadcrumb (may be unused)

src/app/api/staff/documents/
├── route.ts                               # GET docs (NEEDS investor_id support)
├── search/route.ts                        # Search
├── folders/route.ts                       # List/create folders
├── data-room/[dealId]/route.ts           # Data room docs
└── ... (other routes)

src/app/api/deals/
├── route.ts                               # GET deals (supports ?vehicle_id=)
├── [id]/route.ts                         # Single deal
├── [id]/linkable-investors/route.ts      # Different purpose
└── [id]/investors/route.ts               # DOES NOT EXIST - MUST CREATE

src/lib/documents/
└── vehicle-hierarchy.ts                   # Parses flat vehicles → tree

src/app/(main)/versotech_main/documents/page.tsx    # Main page (staff check)
src/app/(staff)/versotech/staff/documents/page.tsx  # Legacy staff page
```

---

## WHAT TO DO NEXT (Priority Order)

### P0 - Make it actually work

1. **Create `/api/deals/[id]/investors/route.ts`**
   - Query subscriptions + profiles for deal
   - Return `{ investors: [{ id, display_name, email }] }`
   - Use `createClient()` (not service) to respect RLS

2. **Update `/api/staff/documents/route.ts`**
   - Add `investor_id` + `deal_id` query param support
   - Filter documents: subscription docs where investor matches
   - Probably query `subscription_documents` or `documents` with investor join

3. **Update `StaffDocumentsBreadcrumb.tsx`**
   - Add investor segment: Vehicle > Deal > Investor Name
   - Read `selectedInvestorId` from navigation state

### P1 - Polish

4. **Make deal nodes collapsible again** in VehicleTree
5. **Test the full flow**: sidebar click → document fetch → content display
6. **Remove dead card components** if VehicleCard/FolderCard aren't used elsewhere
7. **Verify breadcrumbs** display correctly at every navigation level

### P2 - Optional

8. **Add investor document count** to tree node badges
9. **Add recent documents view** at root instead of just "Select a location"

---

## Database Tables You'll Need

```sql
-- For /api/deals/[id]/investors
subscriptions (deal_id, investor_id, status)
profiles (id, display_name, email)

-- For investor documents
documents (id, name, type, subscription_id, ...)
subscription_documents (subscription_id, document_id, ...)
-- Check which table links docs to investors/subscriptions
```

---

## Test Credentials (from CLAUDE.md)

| Email | Password | Use For |
|-------|----------|---------|
| cto@versoholdings.com | 123123 | Staff access (CEO persona) |
| sales@aisynthesis.de | TempPass123! | Staff (arranger) |

---

## TypeScript Status

Zero new type errors from these changes. All pre-existing errors are in unrelated files (`holdings-page.tsx`, test files). Run `npx tsc --noEmit` to verify.
