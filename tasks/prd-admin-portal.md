# PRD: VERSO Admin Portal

## Introduction

The Admin Portal (`/versotech_admin`) is a dedicated platform administration interface for VERSO's internal team. It provides centralized user management, platform analytics, and growth insights. This PRD covers the full foundation implementation including navigation, dashboard, user management (all four tabs), and growth analytics with real-time data.

**Access Control:** CEO and `staff_admin` roles only (enforced via existing middleware + layout).

**Key Insight:** Most backend APIs already exist (37 endpoints). This is primarily a frontend implementation effort, with new endpoints needed only for growth analytics.

---

## Goals

- Provide admins with a unified view of platform health via real-time KPIs
- Enable complete user lifecycle management (view, edit, deactivate, lock, reset password)
- Deliver actionable growth insights (engagement, retention, funnels, cohorts)
- Reuse existing components and APIs to minimize new backend work
- Create a scalable navigation structure for future admin features

---

## User Stories

### Phase 1: Foundation

#### US-001: Admin Sidebar Navigation
**Description:** As an admin, I want a dedicated sidebar navigation so I can access all admin features from any page.

**Acceptance Criteria:**
- [ ] Create `admin-sidebar.tsx` component at `/versotech_admin/components/`
- [ ] Navigation items: Dashboard, Users (with sub-items: All Users, Staff, Investors), Growth (with sub-items: Overview, Engagement, Retention, Funnels, Cohorts), Agents (with "Soon" badge), Settings
- [ ] Active route highlighting with nested route support
- [ ] Collapsible sub-navigation for Users and Growth sections
- [ ] Mobile-responsive (hamburger menu on small screens)
- [ ] Integrate into existing `/versotech_admin/layout.tsx`
- [ ] Typecheck passes (`npm run build`)
- [ ] Verify in browser: navigation renders, routes work, active states correct

#### US-002: Admin Layout Integration
**Description:** As a developer, I need the admin layout to use the new sidebar so all admin pages have consistent navigation.

**Acceptance Criteria:**
- [ ] Update `/versotech_admin/layout.tsx` to include `AdminSidebar`
- [ ] Main content area with proper padding/margins
- [ ] Header shows current page title and user avatar/logout
- [ ] Breadcrumb navigation for nested routes
- [ ] Existing auth guard preserved (CEO/staff_admin only)
- [ ] Typecheck passes
- [ ] Verify in browser: layout renders on all admin routes

#### US-003: Root Page Redirect
**Description:** As an admin, when I visit `/versotech_admin`, I should be redirected to the dashboard.

**Acceptance Criteria:**
- [ ] Update `/versotech_admin/page.tsx` to redirect to `/versotech_admin/dashboard`
- [ ] Redirect is server-side (not client flash)
- [ ] Typecheck passes

---

### Phase 2: Dashboard

#### US-004: Dashboard Page Structure
**Description:** As an admin, I want a dashboard page that shows platform health at a glance.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/dashboard/page.tsx`
- [ ] Page title "Platform Overview" with date range selector (Last 7 days, 30 days, 90 days)
- [ ] Loading skeleton while data fetches
- [ ] Error state if API fails
- [ ] Typecheck passes
- [ ] Verify in browser: page loads, skeleton shows during fetch

#### US-005: Dashboard KPI Cards
**Description:** As an admin, I want to see key metrics (Total Users, Active Users, Total AUM, Investors) as cards with trend indicators.

**Acceptance Criteria:**
- [ ] Fetch data from `GET /api/admin/metrics/dashboard`
- [ ] Display 4 KPI cards in a responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] Each card shows: metric name, value, percentage change with up/down arrow
- [ ] Cards use existing `Card` component from shadcn/ui
- [ ] Format numbers appropriately (1,247 for users, $45.2M for AUM)
- [ ] Typecheck passes
- [ ] Verify in browser: cards display with real data, responsive layout works

#### US-006: Dashboard Activity Chart
**Description:** As an admin, I want to see a line chart of user activity over the selected time period.

**Acceptance Criteria:**
- [ ] Line chart showing daily active users
- [ ] X-axis: dates, Y-axis: user count
- [ ] Use Recharts (already in project) with existing `chart.tsx` wrapper
- [ ] Chart responds to date range selector from US-004
- [ ] Tooltip on hover showing exact date and count
- [ ] Typecheck passes
- [ ] Verify in browser: chart renders, tooltip works, updates on date range change

#### US-007: Dashboard Approval Queue Widget
**Description:** As an admin, I want to see pending approvals so I know what needs attention.

**Acceptance Criteria:**
- [ ] Card showing pending approval counts by type (KYC Review, Subscriptions, Documents)
- [ ] Each item is clickable (links to relevant section - can be placeholder links initially)
- [ ] Data from `/api/admin/metrics/dashboard` (pending items already included)
- [ ] Badge showing count for each type
- [ ] Typecheck passes
- [ ] Verify in browser: widget displays counts, items are clickable

#### US-008: Dashboard Recent Activity Feed
**Description:** As an admin, I want to see recent platform activity so I can monitor operations.

**Acceptance Criteria:**
- [ ] Fetch from `GET /api/admin/activity-feed`
- [ ] Display last 10 activities with: timestamp (relative, e.g., "2 hours ago"), actor name, action description
- [ ] Scrollable list within fixed height container
- [ ] "View All" link to full activity logs (can be placeholder)
- [ ] Typecheck passes
- [ ] Verify in browser: feed shows real activities, timestamps are relative

#### US-009: Dashboard Compliance Alerts Widget
**Description:** As an admin, I want to see compliance alerts categorized by severity.

**Acceptance Criteria:**
- [ ] Fetch from `GET /api/admin/compliance/alerts`
- [ ] Group by severity: Critical (red), Warning (yellow), Clear (green)
- [ ] Show count for each severity level
- [ ] Expandable to show alert details
- [ ] Typecheck passes
- [ ] Verify in browser: alerts display with correct colors, expandable works

---

### Phase 3: User Management

#### US-010: Users List Page
**Description:** As an admin, I want to see all platform users in a searchable, filterable table.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/users/page.tsx`
- [ ] Fetch from `GET /api/admin/users` with pagination
- [ ] Table columns: Checkbox, User (avatar + name + entity badges), Email, Role (badge), Status (colored badge), Last Active (relative), Created (date), Actions (dropdown menu)
- [ ] Pagination controls at bottom (showing X-Y of Z)
- [ ] Default sort by created_at descending
- [ ] Empty state when no users match filters
- [ ] Typecheck passes
- [ ] Verify in browser: table renders with data, pagination works

#### US-011: Users Search and Filters
**Description:** As an admin, I want to search and filter users so I can find specific people quickly.

**Acceptance Criteria:**
- [ ] Search input (searches name and email, debounced 300ms)
- [ ] Filter dropdowns: Role (multi-select), Status (multi-select), Entity Type (multi-select), KYC Status (multi-select)
- [ ] Filters update URL params (shareable/bookmarkable)
- [ ] Clear all filters button
- [ ] Filter state persists on page refresh (read from URL)
- [ ] Typecheck passes
- [ ] Verify in browser: search works, filters apply, URL updates

#### US-012: Users Batch Actions
**Description:** As an admin, I want to perform actions on multiple users at once.

**Acceptance Criteria:**
- [ ] Checkbox in table header selects/deselects all visible rows
- [ ] When users selected, show batch action bar with: "X selected" count, Deactivate button, Export button
- [ ] Deactivate shows confirmation dialog listing selected users
- [ ] Export downloads CSV of selected users
- [ ] Batch action bar fixed at bottom of screen
- [ ] Typecheck passes
- [ ] Verify in browser: selection works, batch bar appears, deactivate confirmation shows

#### US-013: User Detail Page - Header
**Description:** As an admin, I want to see a user's key info at the top of their detail page.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/users/[id]/page.tsx`
- [ ] Fetch from `GET /api/admin/users/[id]`
- [ ] Header card with: Avatar (large), Display name, Email, Status badge, Role badge, "Last seen: X ago"
- [ ] Edit button (opens edit modal)
- [ ] Actions dropdown: Deactivate/Reactivate, Lock/Unlock, Reset Password
- [ ] Back button "← Back to Users"
- [ ] Typecheck passes
- [ ] Verify in browser: header displays correct user data

#### US-014: User Detail - Profile Tab
**Description:** As an admin, I want to view and edit a user's profile information.

**Acceptance Criteria:**
- [ ] Tab navigation component with 4 tabs (Profile active by default)
- [ ] Profile tab shows two cards: "Personal Information" (display name, email, phone, title) and "Account Settings" (role, MFA status, created date, last login)
- [ ] Edit button opens modal with form for editable fields (display_name, title, phone, office_location)
- [ ] Form uses react-hook-form + zod validation
- [ ] Save calls `PATCH /api/admin/users/[id]`
- [ ] Success toast on save, error toast on failure
- [ ] Typecheck passes
- [ ] Verify in browser: profile displays, edit modal works, save persists changes

#### US-015: User Detail - Entities Tab
**Description:** As an admin, I want to see which entities a user is linked to.

**Acceptance Criteria:**
- [ ] Entities tab shows table of linked entities
- [ ] Columns: Entity icon (by type), Entity name, Type (investor, partner, etc.), Role (Primary, Member), Actions (Remove)
- [ ] Add button "+" to link user to new entity (opens search modal)
- [ ] Remove shows confirmation dialog
- [ ] Empty state "No linked entities" with Add button
- [ ] Data from `GET /api/admin/users/[id]` (entities already included in response)
- [ ] Typecheck passes
- [ ] Verify in browser: entities list displays, add/remove work

#### US-016: User Detail - Activity Tab
**Description:** As an admin, I want to see a user's activity history.

**Acceptance Criteria:**
- [ ] Fetch from `GET /api/admin/users/[id]/activity`
- [ ] Timeline view showing: timestamp, action description, entity affected (if any)
- [ ] Filter by date range and action type
- [ ] Export button downloads activity as CSV
- [ ] Pagination for long histories (load more button)
- [ ] Empty state "No activity recorded"
- [ ] Typecheck passes
- [ ] Verify in browser: activity timeline displays, filters work, export downloads

#### US-017: User Detail - Security Tab
**Description:** As an admin, I want to manage a user's security settings.

**Acceptance Criteria:**
- [ ] Security tab shows: Account Status (Active/Inactive with toggle), Account Lock (Locked/Unlocked with toggle), Password section (last changed date + Reset Password button), Sessions (count of active sessions + Revoke All button), Failed Logins (count in last 24 hours)
- [ ] Status toggle calls `PATCH /api/admin/users/[id]/deactivate` or `/reactivate`
- [ ] Lock toggle calls `PATCH /api/admin/users/[id]/toggle-lock`
- [ ] Reset Password calls `POST /api/admin/users/[id]/reset-password` with confirmation dialog
- [ ] Revoke All shows confirmation, then calls appropriate endpoint
- [ ] All actions show success/error toasts
- [ ] Typecheck passes
- [ ] Verify in browser: all toggles and buttons work, confirmations appear

#### US-018: Staff Sub-Page
**Description:** As an admin, I want a dedicated view for staff members with staff-specific data.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/users/staff/page.tsx`
- [ ] Fetch from `GET /api/admin/staff`
- [ ] Table with columns: User, Email, Role, Permissions (list), Assigned Investors (count), Activity Score (actions in 7 days), Status, Actions
- [ ] Additional actions: Manage Permissions, View Assigned Investors
- [ ] Reuse table component from US-010 with different columns
- [ ] Typecheck passes
- [ ] Verify in browser: staff table displays with correct columns

---

### Phase 4: Growth Analytics

#### US-019: Growth Overview Page
**Description:** As an admin, I want an overview of growth metrics so I can understand platform health.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/growth/page.tsx`
- [ ] KPI cards: DAU, WAU, MAU, Stickiness (DAU/MAU), Avg Session Duration
- [ ] Active Users Trend chart (line chart, 30 days default)
- [ ] Feature Usage breakdown (horizontal bar chart)
- [ ] User Segments pie chart (Power Users, Regular, Occasional, At Risk)
- [ ] Quick Insights section (3 auto-generated insights)
- [ ] Date range selector affects all metrics
- [ ] Typecheck passes
- [ ] Verify in browser: all charts render, date range changes data

#### US-020: Growth API - Overview Endpoint
**Description:** As a developer, I need an API endpoint for growth overview metrics.

**Acceptance Criteria:**
- [ ] Create `GET /api/admin/growth/overview`
- [ ] Returns: dau, wau, mau, stickiness, avgSessionDuration, activeUsersTrend (array), featureUsage (array), userSegments (array)
- [ ] Accepts `days` query param (7, 30, 90)
- [ ] Queries `audit_logs` table for activity data
- [ ] Requires super_admin permission
- [ ] Response time < 2 seconds
- [ ] Typecheck passes

#### US-021: Engagement Page
**Description:** As an admin, I want to see detailed engagement metrics.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/growth/engagement/page.tsx`
- [ ] Actions by Type bar chart (top 10 actions)
- [ ] Engagement by Day of Week heatmap/bar chart
- [ ] Peak Activity Hours bar chart
- [ ] Top Engaged Users table (rank, user, actions, sessions, avg duration)
- [ ] Date range selector
- [ ] Typecheck passes
- [ ] Verify in browser: all visualizations render correctly

#### US-022: Growth API - Engagement Endpoint
**Description:** As a developer, I need an API endpoint for engagement metrics.

**Acceptance Criteria:**
- [ ] Create `GET /api/admin/growth/engagement`
- [ ] Returns: actionsByType, engagementByDay, peakHours, topEngagedUsers
- [ ] Uses SQL queries from PRD specification
- [ ] Accepts `days` query param
- [ ] Requires super_admin permission
- [ ] Typecheck passes

#### US-023: Retention Page
**Description:** As an admin, I want to analyze user retention and identify at-risk users.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/growth/retention/page.tsx`
- [ ] Retention KPI cards: 7-Day, 30-Day, 90-Day Retention, Churn Rate
- [ ] Retention Cohort Matrix (weekly cohorts, colored cells by retention %)
- [ ] At-Risk Users table (users inactive 30+ days) with columns: User, Last Active, Total Invested, Contact button
- [ ] Contact button opens email compose (mailto link)
- [ ] Typecheck passes
- [ ] Verify in browser: matrix renders with colors, at-risk table shows data

#### US-024: Growth API - Retention Endpoint
**Description:** As a developer, I need an API endpoint for retention metrics.

**Acceptance Criteria:**
- [ ] Create `GET /api/admin/growth/retention`
- [ ] Returns: retentionRates (7d, 30d, 90d), churnRate, cohortMatrix (2D array), atRiskUsers (array)
- [ ] Cohort matrix calculates week-over-week retention
- [ ] At-risk users: no activity in 30+ days, sorted by total invested
- [ ] Requires super_admin permission
- [ ] Typecheck passes

#### US-025: Funnel Page
**Description:** As an admin, I want to visualize conversion funnels.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/growth/funnel/page.tsx`
- [ ] Investment Funnel visualization: Viewed Deal → Showed Interest → Started Subscription → Completed Subscription → Allocated
- [ ] Each stage shows count and percentage of previous stage
- [ ] Funnel uses horizontal bars with decreasing widths
- [ ] Onboarding Funnel: Account Created → Profile Completed → KYC Submitted → KYC Approved → First Investment
- [ ] Drop-off Analysis card showing biggest drop-off point with suggestions
- [ ] Typecheck passes
- [ ] Verify in browser: funnels render, percentages are correct

#### US-026: Growth API - Funnel Endpoint
**Description:** As a developer, I need an API endpoint for funnel data.

**Acceptance Criteria:**
- [ ] Create `GET /api/admin/growth/funnel`
- [ ] Returns: investmentFunnel (array of stages), onboardingFunnel (array of stages), biggestDropoff (stage info)
- [ ] Each stage has: name, count, percentageOfTotal, percentageOfPrevious
- [ ] Queries deals, deal_commitments, subscriptions, allocations, investors tables
- [ ] Requires super_admin permission
- [ ] Typecheck passes

#### US-027: Cohorts Page
**Description:** As an admin, I want to analyze user behavior by signup cohort.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/growth/cohorts/page.tsx`
- [ ] Cohort selector: By Signup Week, By Signup Month, By First Investment Month
- [ ] Cohort table with columns: Cohort, Size, Activation Rate, Investment Rate, Avg Investment, Avg Time to First Investment, 30/60/90 Day Retention
- [ ] Sortable columns
- [ ] Trend charts comparing cohorts over time
- [ ] Typecheck passes
- [ ] Verify in browser: cohort data displays, sorting works

#### US-028: Growth API - Cohorts Endpoint
**Description:** As a developer, I need an API endpoint for cohort analysis.

**Acceptance Criteria:**
- [ ] Create `GET /api/admin/growth/cohorts`
- [ ] Accepts `groupBy` param: signup_week, signup_month, first_investment_month
- [ ] Returns array of cohorts with: cohortName, size, activationRate, investmentRate, avgInvestment, avgTimeToFirstInvestment, retention30d, retention60d, retention90d
- [ ] Requires super_admin permission
- [ ] Typecheck passes

---

### Phase 5: Agents & Settings

#### US-029: Agents Placeholder Page
**Description:** As an admin, I want to see a placeholder for upcoming AI/automation features.

**Acceptance Criteria:**
- [ ] Create `/versotech_admin/agents/page.tsx`
- [ ] Centered content with robot icon and "AI-Powered Automation" heading
- [ ] "Coming Soon" subheading
- [ ] 4 placeholder cards for future agents: KYC Review Bot, Deal Matching, Risk Alerts, Report Generator
- [ ] Each card shows: icon, title, brief description, "Planned" badge
- [ ] "Contact Product Team" link at bottom
- [ ] Typecheck passes
- [ ] Verify in browser: placeholder renders correctly

#### US-030: Settings Page Expansion
**Description:** As an admin, I want the settings page to have organized sections instead of just placeholders.

**Acceptance Criteria:**
- [ ] Update `/versotech_admin/settings/page.tsx`
- [ ] Tab navigation for sections: General, Security, Notifications, Integrations, Audit
- [ ] Each tab shows relevant settings (can be read-only display initially)
- [ ] General: Platform name, timezone, default currency
- [ ] Security: MFA policy display, session timeout display
- [ ] Notifications: Email template list (read-only)
- [ ] Integrations: API keys list (masked), webhook URLs
- [ ] Audit: Log retention policy, export button
- [ ] Typecheck passes
- [ ] Verify in browser: tabs work, content displays

---

## Functional Requirements

### Navigation & Layout
- FR-1: Admin sidebar must display on all `/versotech_admin/*` routes
- FR-2: Sidebar must highlight active route including nested routes
- FR-3: Root `/versotech_admin` must redirect to `/versotech_admin/dashboard`
- FR-4: Layout must preserve existing CEO/staff_admin authorization check

### Dashboard
- FR-5: Dashboard must display KPIs: Total Users, Active Users (30d), Total AUM, Total Investors
- FR-6: Dashboard must show activity chart responding to date range selector
- FR-7: Dashboard must display pending approvals count by type
- FR-8: Dashboard must show last 10 activity feed items with relative timestamps
- FR-9: Dashboard must display compliance alerts grouped by severity

### User Management
- FR-10: User list must support search by name and email
- FR-11: User list must support filtering by role, status, entity type, KYC status
- FR-12: User list must support pagination with 50 items per page
- FR-13: User list must support sorting by any column
- FR-14: User detail must display all four tabs: Profile, Entities, Activity, Security
- FR-15: Profile tab must allow editing display_name, title, phone, office_location
- FR-16: Security tab must allow deactivate, reactivate, lock, unlock, reset password
- FR-17: Batch actions must support deactivate and export for selected users
- FR-18: Staff page must show staff-specific columns including permissions

### Growth Analytics
- FR-19: Growth endpoints must query audit_logs for activity metrics
- FR-20: All growth pages must respond to date range selector (7, 30, 90 days)
- FR-21: Retention matrix must show weekly cohorts with color-coded cells
- FR-22: Funnel visualization must calculate percentage at each stage
- FR-23: At-risk users must be defined as no activity in 30+ days
- FR-24: Cohort analysis must support grouping by signup week, signup month, or first investment month

### Agents & Settings
- FR-25: Agents page must be a static placeholder with no functional elements
- FR-26: Settings page must organize content into tabbed sections

---

## Non-Goals (Out of Scope)

- **Real-time WebSocket updates** - Use polling/refresh for now
- **User creation from admin** - Users self-register or are invited via existing flows
- **Permission editing UI** - Permissions managed via database for now
- **Automated alerts/notifications** - At-risk users displayed but not auto-notified
- **Agent functionality** - Placeholder only, no AI features
- **Settings editing** - Display only, actual settings changes via database
- **Mobile app** - Web responsive only
- **Dark mode** - Use existing theme system
- **Internationalization** - English only
- **Export to PDF** - CSV export only

---

## Design Considerations

### UI Components to Reuse
| Need | Existing Component | Location |
|------|-------------------|----------|
| Data tables | `DataTable` pattern | `components/investors/` |
| KPI cards | `Card` + custom styling | shadcn/ui |
| Charts | Recharts + `chart.tsx` | `components/ui/` |
| Filters | `Select`, `Input` | shadcn/ui |
| Activity feed | `real-time-activity-feed.tsx` | `components/dashboard/` |
| Tabs | `Tabs` | shadcn/ui |
| Badges | `Badge` | shadcn/ui |
| Dialogs | `AlertDialog`, `Dialog` | shadcn/ui |
| Forms | react-hook-form + zod | Existing pattern |

### New Components to Create
| Component | Location | Purpose |
|-----------|----------|---------|
| `admin-sidebar.tsx` | `/versotech_admin/components/` | Admin navigation |
| `retention-matrix.tsx` | `/versotech_admin/components/growth/` | Cohort grid visualization |
| `funnel-chart.tsx` | `/versotech_admin/components/growth/` | Funnel visualization |
| `user-table.tsx` | `/versotech_admin/users/components/` | User list table |
| `user-filters.tsx` | `/versotech_admin/users/components/` | Filter controls |
| `user-detail-tabs.tsx` | `/versotech_admin/users/components/` | Tab content |

### Color Coding
- Status badges: Active (green), Pending (yellow), Inactive (gray), Locked (red)
- Retention matrix: 100% (dark green) → 0% (red) gradient
- Compliance alerts: Critical (red), Warning (yellow), Clear (green)
- Priority: High (red), Medium (yellow), Low (gray)

---

## Technical Considerations

### Existing API Endpoints (Ready to Use)
- `GET /api/admin/users` - List with filters, search, pagination
- `GET /api/admin/users/[id]` - Full user detail with entities
- `PATCH /api/admin/users/[id]` - Update user profile
- `GET /api/admin/users/[id]/activity` - User activity history
- `PATCH /api/admin/users/[id]/deactivate` - Deactivate
- `PATCH /api/admin/users/[id]/reactivate` - Reactivate
- `PATCH /api/admin/users/[id]/toggle-lock` - Lock/unlock
- `POST /api/admin/users/[id]/reset-password` - Reset password
- `GET /api/admin/metrics/dashboard` - Dashboard KPIs
- `GET /api/admin/activity-feed` - Recent activity
- `GET /api/admin/compliance/alerts` - Compliance alerts
- `GET /api/admin/staff` - Staff list with permissions

### New API Endpoints (To Create)
- `GET /api/admin/growth/overview` - DAU, WAU, MAU, stickiness
- `GET /api/admin/growth/engagement` - Actions, peak hours, top users
- `GET /api/admin/growth/retention` - Retention rates, cohort matrix, at-risk
- `GET /api/admin/growth/funnel` - Investment and onboarding funnels
- `GET /api/admin/growth/cohorts` - Cohort analysis data

### Performance Requirements
- Dashboard page load < 2 seconds
- User list pagination response < 500ms
- Growth analytics queries < 3 seconds (complex aggregations)
- Use React Suspense for loading states

### Authorization
- All endpoints require `super_admin` permission OR CEO role
- Reuse existing `isSuperAdmin()` helper from other admin endpoints
- Service client for queries that bypass RLS

---

## Success Metrics

- **Adoption:** 100% of admin users access dashboard within first week
- **Efficiency:** User lookup time reduced to < 10 seconds (from manual DB queries)
- **Coverage:** All user management actions available without database access
- **Performance:** Dashboard loads in < 2 seconds on average
- **Data Quality:** Growth metrics match manual calculations within 1% margin

---

## Open Questions

1. **Session Tracking:** Should we implement session_id grouping for accurate session duration? (Currently not tracked in audit_logs)

2. **Cohort Size Threshold:** What's the minimum cohort size to display? (Avoid misleading percentages from tiny cohorts)

3. **At-Risk Threshold:** Is 30 days the right threshold for at-risk? Should it vary by user type?

4. **Export Rate Limits:** Should CSV exports be rate-limited to prevent large data dumps?

5. **Insights Algorithm:** How should "Quick Insights" be generated? Rule-based or ML-based?

---

## Implementation Order

Recommended implementation sequence based on dependencies:

1. **US-001, US-002, US-003** - Navigation foundation (blocks everything else)
2. **US-004, US-005, US-008** - Basic dashboard (quick win, validates layout)
3. **US-006, US-007, US-009** - Complete dashboard
4. **US-010, US-011** - User list (high operational value)
5. **US-013, US-014** - User detail basics
6. **US-015, US-016, US-017** - Complete user detail tabs
7. **US-012, US-018** - Batch actions and staff page
8. **US-020, US-019** - Growth overview (API then UI)
9. **US-022, US-021** - Engagement
10. **US-024, US-023** - Retention
11. **US-026, US-025** - Funnels
12. **US-028, US-027** - Cohorts
13. **US-029, US-030** - Agents placeholder and settings

---

## Appendix: SQL Query Reference

### DAU/WAU/MAU Calculation
```sql
-- Daily Active Users
SELECT COUNT(DISTINCT actor_id) as dau
FROM audit_logs
WHERE timestamp >= CURRENT_DATE;

-- Weekly Active Users
SELECT COUNT(DISTINCT actor_id) as wau
FROM audit_logs
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days';

-- Monthly Active Users
SELECT COUNT(DISTINCT actor_id) as mau
FROM audit_logs
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days';

-- Stickiness
SELECT (dau::float / NULLIF(mau, 0) * 100) as stickiness
FROM (SELECT COUNT(DISTINCT actor_id) as dau FROM audit_logs WHERE timestamp >= CURRENT_DATE) d,
     (SELECT COUNT(DISTINCT actor_id) as mau FROM audit_logs WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days') m;
```

### Retention Cohort Query
```sql
WITH user_first_action AS (
  SELECT actor_id, DATE_TRUNC('week', MIN(timestamp)) as cohort_week
  FROM audit_logs
  GROUP BY actor_id
),
weekly_activity AS (
  SELECT actor_id, DATE_TRUNC('week', timestamp) as activity_week
  FROM audit_logs
  GROUP BY actor_id, DATE_TRUNC('week', timestamp)
)
SELECT
  ufa.cohort_week,
  COUNT(DISTINCT ufa.actor_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN wa.activity_week = ufa.cohort_week + INTERVAL '1 week' THEN ufa.actor_id END) as week_1,
  COUNT(DISTINCT CASE WHEN wa.activity_week = ufa.cohort_week + INTERVAL '2 weeks' THEN ufa.actor_id END) as week_2,
  COUNT(DISTINCT CASE WHEN wa.activity_week = ufa.cohort_week + INTERVAL '3 weeks' THEN ufa.actor_id END) as week_3,
  COUNT(DISTINCT CASE WHEN wa.activity_week = ufa.cohort_week + INTERVAL '4 weeks' THEN ufa.actor_id END) as week_4
FROM user_first_action ufa
LEFT JOIN weekly_activity wa ON ufa.actor_id = wa.actor_id
GROUP BY ufa.cohort_week
ORDER BY ufa.cohort_week DESC;
```

### At-Risk Users Query
```sql
SELECT
  p.id,
  p.display_name,
  p.email,
  MAX(a.timestamp) as last_active,
  COALESCE(SUM(s.commitment), 0) as total_invested
FROM profiles p
LEFT JOIN audit_logs a ON p.id = a.actor_id
LEFT JOIN investor_users iu ON p.id = iu.user_id
LEFT JOIN subscriptions s ON iu.investor_id = s.investor_id AND s.status = 'completed'
WHERE p.role = 'investor'
GROUP BY p.id, p.display_name, p.email
HAVING MAX(a.timestamp) < NOW() - INTERVAL '30 days'
   OR MAX(a.timestamp) IS NULL
ORDER BY total_invested DESC
LIMIT 50;
```
