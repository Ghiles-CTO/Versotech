# Active Deals Page PRD - Investor Portal

**Version:** 2.0
**Product:** VERSO Holdings Investor Portal
**Audience:** Business stakeholders, Product managers, Engineers
**Last Updated:** October 2, 2025

---

## Executive Summary

The Active Deals page is the investor's gateway to exclusive investment opportunities within the VERSO ecosystem. It provides a curated view of deals the investor has been personally invited to, with detailed information about each opportunity, commitment options, and real-time status tracking. The page transforms the traditional private placement process into a transparent, self-service experience while maintaining the exclusivity and personalized touch expected in merchant banking.

Investors see beautifully designed deal cards showcasing company information, investment terms, fee structures, fundraising progress, and clear calls-to-action. The interface guides them from invitation acceptance through commitment submission and unit reservation, with full visibility into allocation status and deal timeline. Real-time updates ensure investors never miss critical deadlines or opportunities.

---

## Part 1: Business Context (Non-Technical)

### What is the Active Deals Page?

The Active Deals page is your personalized deal flow dashboard. Unlike public investment platforms, this page only shows opportunities that VERSO has specifically selected for you based on your investment profile, interests, and eligibility. Each deal card presents comprehensive information about the investment opportunity—company details, terms, minimum/maximum amounts, fee structure, and participation status.

Think of it as your private deal room where VERSO brings opportunities to you, rather than you searching through hundreds of listings. The page emphasizes quality over quantity, showing only deals relevant to your investment strategy.

### Why Does It Matter?

**For Investors:**
- **Exclusive Access**: See only hand-picked opportunities that match your profile
- **Complete Information**: All investment details, terms, and documents in one place
- **Self-Service**: Submit commitments, reserve units, and track status without email back-and-forth
- **Transparency**: Real-time progress tracking, clear deadlines, visual fundraising indicators
- **Peace of Mind**: Acceptance workflow ensures you understand terms before committing capital

**For VERSO Operations:**
- **Streamlined Process**: Reduces manual coordination for deal participation
- **Clear Audit Trail**: Every action (invitation, acceptance, commitment) is timestamped and logged
- **Scalability**: Can manage multiple concurrent deals without overwhelming investors or staff
- **Compliance**: Deal-specific access control ensures proper information barriers

### How It Connects to the Rest of the Portal

- **Deal Memberships**: Linked via `deal_memberships` table—you only see deals you're invited to
- **Documents**: Each deal has its own document repository (term sheets, due diligence materials, agreements)
- **Holdings**: Once allocated, deal positions appear in your Holdings page alongside fund investments
- **Messages**: Deal-specific conversations allow you to ask questions to VERSO deal team
- **Tasks**: Deal acceptance and commitment actions may create onboarding tasks

### Who Uses It?

**Primary Users:**
- **Qualified Investors**: Individuals or entities meeting minimum investment thresholds
- **Co-Investors**: Invited alongside primary investors for larger transactions
- **Family Office Representatives**: Staff managing investments on behalf of principals
- **Advisors with Power of Attorney**: Lawyers or financial advisors invited to review terms

**Out of Scope:**
- **Prospective Investors**: Must complete onboarding and KYC before seeing deals
- **Staff**: Have separate staff portal for deal management and operations

### Core Use Cases

**1. New Deal Invitation Review**
Sarah receives an email notification about a new Real Empire Series B opportunity. She logs in, sees the deal card with a green "New Invitation" badge, clicks "View Details" to review the investment thesis and fee structure, then clicks "Accept Invitation" to gain full access to documents and commitment options.

**2. Submitting an Investment Commitment**
Marcus reviews the VERSO Secondary Fund deal details, confirms the 2% management fee + 20% carry structure, and clicks "Submit Commitment." A modal opens where he enters his desired investment amount ($500K), selects his fee plan, and submits. The system records his commitment and notifies the VERSO deal team for review.

**3. Reserving Units Before Allocation**
Lisa wants to lock in her allocation before the deal closes. She clicks "Reserve Units" on the Concluder SPV deal, specifies 10,000 units at $125/unit, and submits her reservation. The system places a 48-hour hold on those units while VERSO reviews her commitment. She receives real-time updates as her reservation moves through approval.

**4. Tracking Deal Progress**
John checks the Active Deals page weekly to monitor his three pending opportunities. He sees one deal is 85% subscribed with only 5 days remaining (red urgency indicator), another is awaiting his signature on the subscription agreement (task badge), and a third has been successfully allocated (allocation confirmed badge).

**5. Deal Close Notification**
An investor logs in to find a deal they were considering is now marked "Closed" in red. The card clearly shows it's no longer accepting commitments, but provides a "View Details" button to review the final terms and outcome. The investor can see they missed the deadline and receives recommendations for similar upcoming opportunities.

### Key Features (Business Language)

**Deal Cards:**
- **Visual Design**: Company logo, gradient backgrounds, status badges, progress bars
- **Key Metrics**: Target amount, raised amount, minimum/maximum investment, unit price
- **Timeline**: Created date, opening date, closing deadline with countdown
- **Status Indicators**: Open, Closed, Allocation Pending, Invitation Pending
- **Urgency Signals**: Red warning when <7 days remain, amber when <30 days

**Summary Statistics:**
- **Available Deals**: Total count of all deals you've been invited to
- **Active Deals**: Currently open opportunities accepting commitments
- **Pending Commitments**: Your submitted commitments awaiting review
- **Active Reservations**: Units you've reserved pending allocation

**Investment Details:**
- **Target & Raised Amount**: Fundraising goal and current progress with visual progress bar
- **Min/Max Investment**: Participation thresholds clearly displayed
- **Unit Pricing**: Cost per unit with currency
- **Fee Structure**: Default fee plan shown prominently with description
- **Deal Type**: Secondary Equity, Primary Equity, Credit/Trade Finance, Other

**Action Buttons (Context-Aware):**
- **Accept Invitation** (green): For newly invited deals you haven't accepted yet
- **Submit Commitment** (blue): Primary action for accepted, open deals
- **Reserve Units** (outline): Optional action to lock in allocation
- **View Details** (outline): Opens comprehensive deal modal
- **Documents** (outline): Access deal-specific document repository
- **Request Report** (outline): Generate custom analysis for this deal

**Deal Status States:**
- **Open**: Accepting commitments (green badge)
- **Allocation Pending**: Commitments being processed (yellow badge)
- **Closed**: No longer accepting new commitments (red badge/card)
- **Draft**: Visible to staff only, not shown to investors
- **Cancelled**: Deal withdrawn (red with explanation)

### Business Rules

**Access Control:**
- Investors see only deals where they have a `deal_membership` record
- Deal details hidden until investor accepts invitation
- Closed deals remain visible for record-keeping but actions disabled
- Deal documents require separate entitlement check

**Invitation Workflow:**
1. VERSO staff creates deal and adds investor as member with role (investor/co-investor/advisor)
2. Investor receives email notification with portal link
3. Investor sees deal card with "Accept Invitation" button
4. Upon acceptance, `accepted_at` timestamp recorded, full access granted
5. Investor can now submit commitments and reservations

**Commitment Rules:**
- Must accept invitation before submitting commitment
- Commitment amount must be >= `minimum_investment`
- Commitment amount must be <= `maximum_investment` (if set)
- Multiple commitments allowed (latest supersedes earlier unless approved)
- Commitments remain editable until VERSO approves

**Reservation Rules:**
- Reservations create temporary holds on inventory (default 48 hours)
- Reservations pull from available `share_lots` in FIFO order
- Expired reservations auto-release units back to inventory
- Cannot reserve more units than available in inventory
- Reservations convert to allocations upon approval

**Timeline and Urgency:**
- **>30 days to close**: Normal gray text
- **≤30 days to close**: Amber warning text
- **≤7 days to close**: Red urgent warning with alert icon
- **Past close date**: Automatically marked "Closed" even if status was "Open"

### Visual Design Standards

**Color Coding:**
- **Green**: Open deals, acceptance actions, positive indicators
- **Blue**: Primary actions (submit commitment), information badges
- **Yellow/Amber**: Pending states, moderate urgency
- **Red**: Closed deals, urgent warnings, high priority
- **Purple/Indigo**: Deal-type badges, investment categories

**Card Layout:**
- Company logo or building icon (top-left)
- Company name as primary headline (large, bold)
- Status and type badges (top-right)
- Deal description (2 line clamp)
- Investment metrics in colored boxes (3-column grid)
- Fee plan section (blue gradient background)
- Timeline footer (small icons + text)
- Action buttons (right-aligned vertical stack)

**Empty States:**
- Friendly Handshake icon
- "No deals available" heading
- Explanation that VERSO will notify when opportunities arise
- Encouraging message about upcoming deal flow

**Closed Deal Treatment:**
- Red border and "Closed" badge
- Grayed-out metrics
- Warning icon with "No longer accepting commitments" message
- Only "View Details" button remains active

---

## Part 2: Technical Implementation (Current State)

### Architecture Overview

**Page Structure:**
- **Route**: `/versoholdings/deals/page.tsx`
- **Type**: Server Component (Next.js App Router)
- **Authentication**: Required via `AppLayout` wrapper
- **Data Flow**: Server-side fetch → Hydrate client components (modals) → User interactions

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ AppLayout (brand="versoholdings")
       ├─ Summary Cards (4 KPI cards)
       ├─ Deals List Card
       │    └─ Deal Cards (map over dealsData)
       │         ├─ Company Logo/Icon
       │         ├─ Deal Header (name, badges, metadata)
       │         ├─ Investment Details Grid
       │         ├─ Fee Plan Section
       │         ├─ Timeline Footer
       │         └─ Action Buttons:
       │              ├─ CommitmentModal
       │              ├─ ReservationModal
       │              ├─ DealDetailsModal
       │              └─ Link buttons (Documents, Reports)
       └─ Call to Action Card
```

### Data Model & Queries

**Primary Tables:**
```sql
deals (
  id uuid,
  name text,
  deal_type text, -- equity_secondary|equity_primary|credit_trade_finance|other
  status text, -- draft|open|allocation_pending|closed|cancelled
  currency text,
  offer_unit_price numeric(18,6),
  open_at timestamptz,
  close_at timestamptz,
  description text,
  investment_thesis text,
  minimum_investment numeric(18,2),
  maximum_investment numeric(18,2),
  target_amount numeric(18,2),
  raised_amount numeric(18,2),
  company_name text,
  company_logo_url text,
  sector text,
  stage text,
  location text,
  created_at timestamptz
)

deal_memberships (
  deal_id uuid references deals(id),
  user_id uuid references profiles(id),
  investor_id uuid references investors(id),
  role text, -- investor|co_investor|spouse|advisor|lawyer|banker|introducer|viewer|verso_staff
  invited_by uuid references profiles(id),
  invited_at timestamptz,
  accepted_at timestamptz,
  primary key (deal_id, user_id)
)

deal_commitments (
  id uuid,
  deal_id uuid references deals(id),
  investor_id uuid references investors(id),
  requested_units numeric(28,8),
  requested_amount numeric(18,2),
  status text, -- draft|submitted|approved|rejected|withdrawn
  created_at timestamptz,
  updated_at timestamptz
)

reservations (
  id uuid,
  deal_id uuid references deals(id),
  investor_id uuid references investors(id),
  requested_units numeric(28,8),
  proposed_unit_price numeric(18,6),
  expires_at timestamptz,
  status text, -- pending|approved|expired|cancelled
  created_at timestamptz
)

fee_plans (
  id uuid,
  deal_id uuid references deals(id),
  name text,
  description text,
  is_default boolean
)
```

**Server-Side Data Fetching (page.tsx:85-147):**
```typescript
// 1. Get current user
const { data: { user }, error: userError } = await supabase.auth.getUser()

// 2. Get investor IDs linked to this user
const { data: investorLinks } = await supabase
  .from('investor_users')
  .select('investor_id')
  .eq('user_id', user.id)

const investorIds = investorLinks.map(link => link.investor_id)

// 3. Get deals where user has membership (INNER JOIN filters to entitled deals only)
const { data: deals, error } = await supabase
  .from('deals')
  .select(`
    *,
    vehicles (id, name, type),
    deal_memberships!inner (role, accepted_at),
    fee_plans (id, name, description, is_default)
  `)
  .eq('deal_memberships.user_id', user.id)
  .order('created_at', { ascending: false })

// 4. Get deal commitments for investor (to show pending count)
const { data: commitments } = await supabase
  .from('deal_commitments')
  .select('id, deal_id, requested_units, requested_amount, status, created_at')
  .in('investor_id', investorIds)

// 5. Get reservations for investor (to show active count)
const { data: reservations } = await supabase
  .from('reservations')
  .select('id, deal_id, requested_units, proposed_unit_price, status, expires_at, created_at')
  .in('investor_id', investorIds)
```

**RLS Policies (Investor Access):**
```sql
-- Deals: Only see deals where you have membership
create policy deal_read on deals for select
using (
  exists (
    select 1 from deal_memberships dm
    where dm.deal_id = deals.id and dm.user_id = auth.uid()
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);

-- Deal Memberships: See your own memberships
create policy dm_read on deal_memberships for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);

-- Commitments: See only your investor's commitments
create policy commitments_read on deal_commitments for select
using (
  exists (
    select 1 from investor_users iu
    where iu.investor_id = deal_commitments.investor_id
      and iu.user_id = auth.uid()
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);
```

### UI Components & Logic

**Summary Cards (page.tsx:213-285):**
```typescript
const summary = {
  totalDeals: dealsData.length,
  activeDeals: dealsData.filter(d => d.status === 'open').length,
  pendingCommitments: commitments?.filter(c => c.status === 'submitted').length || 0,
  activeReservations: reservations?.filter(r => r.status === 'pending').length || 0
}

// Rendered as 4 Card components with gradients and hover effects
```

**Deal Card Logic (page.tsx:320-605):**
```typescript
dealsData.map((deal) => {
  // 1. Get user's membership status
  const myMembership = deal.deal_memberships[0] // Filtered by user in query
  const hasAccepted = myMembership?.accepted_at !== null

  // 2. Get default fee plan
  const defaultFeePlan = deal.fee_plans.find(fp => fp.is_default)

  // 3. Calculate fundraising progress
  const progressPercentage = deal.target_amount && deal.raised_amount
    ? Math.min((deal.raised_amount / deal.target_amount) * 100, 100)
    : 0

  // 4. Calculate days until close
  const daysUntilClose = deal.close_at
    ? Math.ceil((new Date(deal.close_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // 5. Determine if effectively closed
  const isEffectivelyClosed =
    deal.status === 'closed' ||
    deal.status === 'cancelled' ||
    (deal.close_at && new Date(deal.close_at) < new Date())

  // 6. Conditional action buttons (page.tsx:499-580)
  if (deal.status === 'open' && hasAccepted && !isEffectivelyClosed) {
    // Show: Submit Commitment, Reserve Units, View Details, Documents, Request Report
  } else if (deal.status === 'open' && !hasAccepted && !isEffectivelyClosed) {
    // Show: Accept Invitation (primary), View Details
  } else if (isEffectivelyClosed) {
    // Show: Red warning box + View Details (disabled actions)
  } else {
    // Show: View Details only
  }
})
```

**Status Badge Logic:**
```typescript
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  allocation_pending: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusDescriptions = {
  open: 'Accepting commitments',
  allocation_pending: 'Processing allocations',
  closed: 'Deal completed',
  draft: 'In preparation',
  cancelled: 'No longer available'
}

// Override for effectively closed deals (past deadline)
isEffectivelyClosed ? 'Closed' : statusDescriptions[deal.status]
```

**Timeline Warning Colors (page.tsx:473-482):**
```typescript
{daysUntilClose !== null && (
  <div className={`flex items-center gap-1 ${
    isEffectivelyClosed ? 'text-red-600' :
    daysUntilClose <= 7 ? 'text-red-600' :
    daysUntilClose <= 30 ? 'text-amber-600' : 'text-gray-500'
  }`}>
    <AlertTriangle className="h-4 w-4" />
    {isEffectivelyClosed ? 'Closed' :
     daysUntilClose > 0 ? `${daysUntilClose} days left` : 'Closed'}
  </div>
)}
```

### Modal Components (Client Interactions)

**1. CommitmentModal (`@/components/deals/commitment-modal.tsx`)**
```typescript
// Props
interface CommitmentModalProps {
  deal: InvestorDeal
  investorId: string
  children: React.ReactNode // Trigger button
}

// Functionality
- Opens dialog on button click
- Form: amount, fee plan selection, notes
- Validates: amount >= min_investment && amount <= max_investment
- Calls: POST /api/deals/{deal.id}/commitments
- Creates deal_commitments record with status='submitted'
- Triggers notification to staff
```

**2. ReservationModal (`@/components/deals/reservation-modal.tsx`)**
```typescript
// Props
interface ReservationModalProps {
  deal: InvestorDeal
  investorId: string
  children: React.ReactNode
}

// Functionality
- Opens dialog on button click
- Form: requested units, proposed unit price (pre-filled from deal.offer_unit_price)
- Calls: POST /api/deals/{deal.id}/reservations
- Server invokes: fn_reserve_inventory(deal_id, investor_id, requested_units, proposed_unit_price, hold_minutes)
- Database function locks share_lots FOR UPDATE SKIP LOCKED (prevents oversell)
- Creates reservation with expires_at = now() + hold_minutes
- Returns reservation_id and expiry time
```

**3. DealDetailsModal (`@/components/deals/deal-details-modal.tsx`)**
```typescript
// Props
interface DealDetailsModalProps {
  deal: InvestorDeal
  investorId: string
  children: React.ReactNode
}

// Functionality
- Opens large dialog with tabbed interface:
  - Overview: Full investment thesis, company details, deal structure
  - Terms: Complete fee breakdown, carry calculations, hurdle rates
  - Timeline: Milestones, close date, expected settlement
  - Documents: List of deal-scoped documents with download buttons
  - Team: Deal sponsors, introducers, advisors attached
- Fetches additional data client-side:
  - GET /api/deals/{deal.id}/details
  - GET /api/deals/{deal.id}/inventory-summary
  - GET /api/deals/{deal.id}/memberships
```

### API Routes (Referenced but not shown in page code)

**Deal Commitments:**
```
POST /api/deals/[id]/commitments
Body: { investorId, amount, feePlanId, notes }
Response: { commitmentId, status: 'submitted' }
```

**Reservations:**
```
POST /api/deals/[id]/reservations
Body: { investorId, requestedUnits, proposedUnitPrice }
Response: { reservationId, expiresAt }
Server calls: fn_reserve_inventory()
```

**Deal Details:**
```
GET /api/deals/[id]
Response: { deal, inventory, allocations, commitments, documents }
```

**Invitation Acceptance:**
```
POST /api/deals/[id]/accept
Body: { userId }
Response: Updates deal_memberships.accepted_at = now()
```

### Performance Optimizations

**Server-Side Rendering:**
- All deal data fetched server-side for SEO and fast initial load
- No client-side waterfall requests
- Supabase query includes all related tables via JOIN (single round-trip)

**Data Prefetching:**
```typescript
// Single query gets deals + vehicles + memberships + fee_plans
.select(`
  *,
  vehicles (id, name, type),
  deal_memberships!inner (role, accepted_at),
  fee_plans (id, name, description, is_default)
`)
```

**Conditional Rendering:**
- Action buttons only render when deal state allows (reduces DOM size)
- Modals use lazy loading (children pattern) - only mount when clicked
- Progress bars animate on mount with CSS transitions (no JS calculations)

**Database Indexes:**
```sql
create index idx_deal_memberships_user on deal_memberships(user_id, deal_id);
create index idx_deals_status_created on deals(status, created_at desc);
create index idx_deal_commitments_investor on deal_commitments(investor_id, deal_id, status);
```

### Empty States & Error Handling

**No Investor Profile (page.tsx:108-118):**
```typescript
if (!investorLinks || investorLinks.length === 0) {
  return (
    <AppLayout brand="versoholdings">
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No investor profile found</h3>
        <p className="text-gray-500">Please contact VERSO staff to set up your investor profile.</p>
      </div>
    </AppLayout>
  )
}
```

**No Deals Available (page.tsx:310-317):**
```typescript
{dealsData.length === 0 ? (
  <div className="text-center py-12">
    <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No deals available</h3>
    <p className="text-gray-500 mb-4">
      You haven't been invited to any deals yet. VERSO will notify you when new opportunities become available.
    </p>
  </div>
) : (
  // Deal cards...
)}
```

**RLS Denies Access:**
- Supabase RLS returns empty array for deals query
- Page renders empty state (not an error)
- Investor sees friendly message, not database error

**Authentication Failure:**
- `AppLayout` wrapper handles auth redirect
- If auth check fails, user redirected to `/versoholdings/login`
- No deal data exposed to unauthenticated requests

### Security Considerations

**Server-Side Data Fetching:**
- All deal queries use server Supabase client (not client-side)
- User authentication verified before any data fetch
- RLS policies enforce access control at database level

**Deal Membership Enforcement:**
```typescript
// INNER JOIN ensures only deals with membership are returned
.select(`
  *,
  deal_memberships!inner (role, accepted_at)
`)
.eq('deal_memberships.user_id', user.id)
```

**No Direct Deal ID Access:**
- Cannot browse to `/versoholdings/deals/[arbitrary-uuid]` without membership
- Individual deal pages also check membership via RLS
- Document downloads require both deal membership AND document ownership

**Commitment Validation:**
- Min/max investment checks happen server-side (not just client-side)
- Reservation inventory locking uses database-level pessimistic locks
- Fee plan selection validated against deal.fee_plans relationship

### Responsive Design

**Desktop (≥1024px):**
- 4-column summary cards
- Deal cards full-width with side-by-side layout (content left, actions right)
- 3-column investment detail grid

**Tablet (768-1023px):**
- 2-column summary cards
- Deal cards still full-width, actions stack below content
- 2-column investment detail grid

**Mobile (<768px):**
- 1-column summary cards (stacked)
- Deal cards: all elements stack vertically
- 1-column investment detail grid
- Action buttons full-width

---

## Part 3: Feature Enhancements & Roadmap

### Phase 1 Complete ✅
- Deal listing with membership filtering
- Summary statistics
- Commitment and reservation modals
- Deal details modal
- Status badges and urgency indicators
- Responsive design

### Phase 2 (Next Sprint)
- **Realtime Updates**: Supabase channel for deal status changes
- **Deal Filters**: Filter by status, deal type, sector
- **Search**: Free-text search across deal names and companies
- **Sorting**: Sort by close date, target amount, alphabetical
- **Saved Views**: Remember user's filter/sort preferences

### Phase 3 (Backlog)
- **Deal Watchlist**: Star favorite deals for quick access
- **Email Digests**: Weekly summary of new deals and status changes
- **Mobile App**: Native iOS/Android with push notifications
- **Deal Comparison**: Side-by-side comparison of multiple deals
- **Investment Calculator**: Model returns based on different commitment amounts

### Future Considerations
- **Secondary Market**: Allow investors to sell allocations to other qualified investors
- **Co-Investment Syndication**: Form investor groups within deal
- **Deal Chat**: Real-time Q&A with deal sponsors
- **Video Pitch Decks**: Embedded video presentations from founders

---

## Part 4: Success Metrics

**Engagement:**
- % of invited investors who accept invitations within 48 hours
- Average time from invitation to commitment submission
- Number of deal detail modal opens per investor
- Reservation-to-allocation conversion rate

**Business Impact:**
- Deal close rate (# committed / # invited)
- Average commitment size per deal
- Time to full subscription (days from open to target met)
- Repeat participation rate (investors participating in multiple deals)

**User Experience:**
- Page load time <2 seconds
- Zero oversell incidents (inventory control working)
- Investor satisfaction score for deal participation experience
- Support ticket volume (should decrease with self-service)

---

## Part 5: Testing Requirements

### Unit Tests
- Deal card status calculation logic
- Days until close calculation
- Progress percentage calculation
- Button visibility conditionals

### Integration Tests
- RLS policies block unauthorized access
- Deal membership INNER JOIN returns only entitled deals
- Commitment submission creates correct database records
- Reservation creates inventory lock

### E2E Tests
```typescript
test('investor can view and accept deal invitation', async () => {
  await login('investor@example.com')
  await page.goto('/versoholdings/deals')

  // Should see summary cards
  expect(page.locator('[data-testid="summary-card"]').count()).toBe(4)

  // Should see deal card
  const dealCard = page.locator('[data-testid="deal-card"]').first()
  expect(dealCard).toBeVisible()

  // Click accept invitation
  await dealCard.locator('text=Accept Invitation').click()

  // Verify acceptance API called
  const response = await page.waitForResponse('/api/deals/*/accept')
  expect(response.status()).toBe(200)

  // Button should change to "Submit Commitment"
  await expect(dealCard.locator('text=Submit Commitment')).toBeVisible()
})

test('closed deal shows disabled state', async () => {
  await login('investor@example.com')
  await page.goto('/versoholdings/deals')

  // Find closed deal
  const closedDeal = page.locator('[data-testid="deal-card"]:has-text("Closed")')

  // Should show warning
  expect(closedDeal.locator('text=No longer accepting commitments')).toBeVisible()

  // Action buttons should be disabled/hidden
  expect(closedDeal.locator('text=Submit Commitment')).not.toBeVisible()

  // Only View Details remains
  expect(closedDeal.locator('text=View Details')).toBeVisible()
})
```

---

## Glossary

**Deal**: A discrete investment opportunity offered by VERSO to select investors.
**Deal Membership**: Relationship between a user and deal defining access rights and role.
**Commitment**: Non-binding expression of interest to invest a specific amount.
**Reservation**: Temporary hold on inventory units preventing oversell.
**Allocation**: Final assignment of units to investor after approval.
**Fee Plan**: Package of fee components (subscription, management, performance, spread).
**Introducer**: Person who referred the investor to the deal (may earn commission).
**Unit Price**: Cost per share/unit in the investment.
**Target Amount**: Fundraising goal for the deal.
**Raised Amount**: Total committed capital to date.

---

**Document Version History**
- v2.0 (October 2, 2025): Complete rewrite for investor portal with implementation details
- v1.0 (September 2025): Initial staff portal PRD (deprecated)
