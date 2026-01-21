# PRD: VERSO Admin Portal

**Version:** 1.0
**Date:** January 2026
**Author:** Engineering Team
**Status:** Draft

---

## 1. Executive Summary

The Admin Portal (`/versotech_admin`) is a dedicated platform administration interface for VERSO's internal team. It provides centralized user management, platform analytics, and growth insights using **existing database infrastructure** and **reusable components**.

### Scope
| Feature | Included | Notes |
|---------|----------|-------|
| Users Management | ✅ | Full CRUD, permissions, activity |
| Growth Analytics | ✅ | Engagement, retention, funnel analysis |
| Agents | ✅ | Placeholder for future AI/automation |
| Platform Dashboard | ✅ | System health, KPIs |
| CMS | ❌ | Handled by Wix |
| SaaS Billing | ❌ | Future phase |

### Access Control
- **URL:** `/versotech_admin/*`
- **Access:** CEO and `staff_admin` roles only
- **Enforcement:** Middleware + Layout level (already implemented)

---

## 2. Information Architecture

```
/versotech_admin
├── /dashboard          # Platform overview & health
├── /users              # User management hub
│   ├── /               # All users list
│   ├── /[id]           # User detail page
│   ├── /staff          # Staff members only
│   ├── /investors      # Investors only
│   └── /entities       # Entity-linked users
├── /growth             # Analytics & insights
│   ├── /               # Overview dashboard
│   ├── /engagement     # User engagement metrics
│   ├── /retention      # Retention & churn
│   ├── /funnel         # Conversion funnels
│   └── /cohorts        # Cohort analysis
├── /agents             # AI & automation (placeholder)
└── /settings           # Platform settings
```

---

## 3. Feature Specifications

---

### 3.1 PLATFORM DASHBOARD (`/versotech_admin/dashboard`)

#### 3.1.1 Purpose
Real-time overview of platform health, key metrics, and alerts requiring attention.

#### 3.1.2 Data Sources (Existing Tables)
| Metric | Table | Query |
|--------|-------|-------|
| Total Users | `profiles` | `COUNT(*)` |
| Active Users (30d) | `audit_logs` | `COUNT(DISTINCT actor_id) WHERE timestamp > now() - 30 days` |
| Total Investors | `investors` | `COUNT(*) WHERE status = 'active'` |
| Total AUM | `positions` | `SUM(units * last_nav)` |
| Pending Approvals | `approvals` | `COUNT(*) WHERE status = 'pending'` |
| Open Tickets | `request_tickets` | `COUNT(*) WHERE status IN ('open', 'assigned', 'in_progress')` |
| KYC Pending | `investors` | `COUNT(*) WHERE kyc_status = 'pending'` |
| Compliance Alerts | `compliance_alerts` | `COUNT(*) WHERE status = 'open'` |

#### 3.1.3 UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ADMIN PORTAL                                          [User] [Logout]  │
├──────────┬──────────────────────────────────────────────────────────────┤
│          │                                                              │
│ Dashboard│  Platform Overview                          [Last 7 days ▼] │
│ Users    │  ─────────────────────────────────────────────────────────── │
│ Growth   │                                                              │
│ Agents   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ Settings │  │Total Users│ │Active(30d)│ │Total AUM │ │Investors │        │
│          │  │   1,247   │ │    892    │ │  $45.2M  │ │   156    │        │
│          │  │ +12% ▲    │ │ +5% ▲     │ │ +8% ▲    │ │ +3 new   │        │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│          │                                                              │
│          │  ┌──────────────────────┐ ┌──────────────────────┐          │
│          │  │ User Activity Chart  │ │ Approval Queue       │          │
│          │  │ (Line chart - 30d)   │ │ • KYC Review (12)    │          │
│          │  │                      │ │ • Subscriptions (8)  │          │
│          │  │                      │ │ • Documents (3)      │          │
│          │  └──────────────────────┘ └──────────────────────┘          │
│          │                                                              │
│          │  ┌──────────────────────┐ ┌──────────────────────┐          │
│          │  │ Compliance Alerts    │ │ Recent Activity      │          │
│          │  │ 🔴 KYC Expiring (5)  │ │ • John created deal  │          │
│          │  │ 🟡 AML Review (3)    │ │ • Sarah approved KYC │          │
│          │  │ 🟢 All clear (142)   │ │ • New user signup    │          │
│          │  └──────────────────────┘ └──────────────────────┘          │
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

#### 3.1.4 Components to Use
| Section | Component | Source |
|---------|-----------|--------|
| KPI Cards | `kpi-card.tsx` | `/components/dashboard/` |
| Activity Chart | `chart.tsx` + Recharts | `/components/ui/` |
| Approval Queue | `Card` + `Badge` | shadcn/ui |
| Compliance Alerts | `compliance-alerts.tsx` | `/components/audit/` |
| Activity Feed | `real-time-activity-feed.tsx` | `/components/dashboard/` |

#### 3.1.5 API Endpoints (Existing)
- `GET /api/admin/metrics/dashboard` - All dashboard KPIs
- `GET /api/admin/activity-feed` - Recent activity
- `GET /api/admin/compliance/alerts` - Compliance alerts

---

### 3.2 USERS MANAGEMENT (`/versotech_admin/users`)

#### 3.2.1 Purpose
Centralized management of all platform users - view, search, filter, edit, and manage access.

#### 3.2.2 Data Sources (Existing Tables)
| Data | Table | Key Columns |
|------|-------|-------------|
| User Profiles | `profiles` | id, email, display_name, role, created_at |
| Investor Links | `investor_users` | investor_id, user_id |
| Partner Links | `partner_users` | partner_id, user_id |
| Lawyer Links | `lawyer_users` | lawyer_id, user_id |
| Arranger Links | `arranger_users` | arranger_id, user_id |
| Introducer Links | `introducer_users` | introducer_id, user_id |
| Activity | `audit_logs` | actor_id, timestamp, action |
| Permissions | `staff_permissions` | user_id, permission |

#### 3.2.3 User List Page (`/versotech_admin/users`)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Users Management                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [🔍 Search users...]  [Role ▼] [Status ▼] [Entity Type ▼] [+ Invite]  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ □  User                  Email              Role      Status    │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ □  John Smith           john@acme.com      Investor  ● Active   │   │
│  │    └─ Acme Capital (Primary)                                    │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ □  Sarah Johnson        sarah@verso.com    Staff     ● Active   │   │
│  │    └─ staff_admin                                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ □  Mike Chen            mike@law.com       Lawyer    ○ Pending  │   │
│  │    └─ Chen & Associates                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [Batch Actions ▼]                          Showing 1-50 of 1,247      │
│  • Invite to Entity                         [< Prev] [1] [2] [3] [Next >]
│  • Deactivate Selected                                                  │
│  • Export Selected                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Filters:**
| Filter | Type | Options |
|--------|------|---------|
| Search | Text input | Name, email |
| Role | Multi-select | investor, staff_admin, staff_ops, staff_rm, ceo |
| Status | Multi-select | active, pending, deactivated, locked |
| Entity Type | Multi-select | investor, arranger, introducer, partner, lawyer |
| KYC Status | Multi-select | pending, review, completed |
| Has Entities | Toggle | Yes/No |

**Table Columns:**
| Column | Sortable | Content |
|--------|----------|---------|
| Checkbox | No | Batch selection |
| User | Yes | Avatar + Name + Entity badges |
| Email | Yes | Email address |
| Role | Yes | Role badge |
| Entity Type | No | Icon indicators |
| Status | Yes | Status badge with color |
| Last Active | Yes | Relative timestamp |
| Created | Yes | Date |
| Actions | No | Menu: View, Edit, Deactivate, Reset Password |

**Components to Use:**
| Element | Component | Adaptation |
|---------|-----------|------------|
| Data Table | `investors-data-table.tsx` | Adapt columns for users |
| Filters | `investor-filters.tsx` | Add role, entity type filters |
| Search | `investor-search.tsx` | Reuse directly |
| Batch Actions | `subscription-bulk-actions.tsx` | Adapt for user actions |
| Status Badge | `Badge` | Color-coded status |
| Avatar | `Avatar` | User initials/photo |

#### 3.2.4 User Detail Page (`/versotech_admin/users/[id]`)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Users                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  [Avatar]  John Smith                              [Edit] [⋮]  │    │
│  │            john@acme.com                                       │    │
│  │            ● Active   Investor   Last seen: 2 hours ago        │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────┬─────────┬─────────┬─────────┐                             │
│  │ Profile │ Entities│ Activity│ Security│                             │
│  └─────────┴─────────┴─────────┴─────────┘                             │
│                                                                         │
│  [PROFILE TAB]                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │ Personal Information     │  │ Account Settings         │            │
│  │ ─────────────────────    │  │ ─────────────────────    │            │
│  │ Display Name: John Smith │  │ Role: investor           │            │
│  │ Email: john@acme.com     │  │ MFA: Enabled ✓           │            │
│  │ Phone: +1 555-0123       │  │ Created: Jan 15, 2024    │            │
│  │ Title: Managing Partner  │  │ Last Login: 2 hours ago  │            │
│  └──────────────────────────┘  └──────────────────────────┘            │
│                                                                         │
│  [ENTITIES TAB]                                                         │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Linked Entities                                    [+ Add]   │      │
│  │ ─────────────────────────────────────────────────────────    │      │
│  │ 🏢 Acme Capital           Investor    Primary    [Remove]    │      │
│  │ 🏢 Smith Family Office    Investor    Member     [Remove]    │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  [ACTIVITY TAB]                                                         │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Recent Activity                              [Export] [Filter]│      │
│  │ ─────────────────────────────────────────────────────────    │      │
│  │ 2 hrs ago   Viewed deal "Series B - TechCo"                  │      │
│  │ 5 hrs ago   Downloaded document "Q4 Report.pdf"              │      │
│  │ 1 day ago   Submitted subscription $500,000                  │      │
│  │ 2 days ago  Logged in from 192.168.1.1                       │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  [SECURITY TAB]                                                         │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Security Settings                                             │      │
│  │ ─────────────────────────────────────────────────────────    │      │
│  │ Account Status: ● Active                    [Deactivate]     │      │
│  │ Account Lock:   Unlocked                    [Lock Account]   │      │
│  │ Password:       Last changed 30 days ago    [Reset Password] │      │
│  │ Sessions:       2 active sessions           [Revoke All]     │      │
│  │ Failed Logins:  0 in last 24 hours                           │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Tabs Specification:**

| Tab | Data Source | Content |
|-----|-------------|---------|
| Profile | `profiles` | Display name, email, phone, title, role |
| Entities | `investor_users`, `partner_users`, etc. | Linked entities with role |
| Activity | `audit_logs` WHERE actor_id = user_id | Timeline of actions |
| Security | `profiles` + auth metadata | Status, lock, password, sessions |

**Components to Use:**
| Element | Component |
|---------|-----------|
| Header Card | `Card` with `Avatar` |
| Tabs | `Tabs` from shadcn |
| Info Grid | `Card` with label/value pairs |
| Entity List | `Table` with action buttons |
| Activity Timeline | `audit-log-table.tsx` adapted |
| Action Buttons | `Button` + `AlertDialog` for confirmations |

#### 3.2.5 API Endpoints (Existing)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/users` | GET | List users with filters |
| `/api/admin/users/[id]` | GET | User detail |
| `/api/admin/users/[id]` | PATCH | Update user |
| `/api/admin/users/[id]/activity` | GET | User activity logs |
| `/api/admin/users/[id]/deactivate` | PATCH | Deactivate user |
| `/api/admin/users/[id]/reactivate` | PATCH | Reactivate user |
| `/api/admin/users/[id]/toggle-lock` | PATCH | Lock/unlock |
| `/api/admin/users/[id]/reset-password` | POST | Reset password |
| `/api/admin/batch-invite` | POST | Batch invite |
| `/api/admin/entity-invite` | POST | Invite to entity |

#### 3.2.6 Staff Sub-Page (`/versotech_admin/users/staff`)

Pre-filtered view showing only staff members (role IN staff_admin, staff_ops, staff_rm, ceo).

**Additional Columns:**
- Permissions (list of granted permissions)
- Assigned Investors (count)
- Activity Score (actions in last 7 days)

**Additional Actions:**
- Manage Permissions
- View Assigned Investors
- Transfer Assignments

**API:** `GET /api/admin/staff`

---

### 3.3 GROWTH ANALYTICS (`/versotech_admin/growth`)

#### 3.3.1 Purpose
Data-driven insights into user behavior, engagement patterns, retention metrics, and conversion funnels to optimize the platform experience.

#### 3.3.2 Data Sources (Existing Tables)

| Metric Category | Tables | Key Queries |
|-----------------|--------|-------------|
| **Engagement** | `audit_logs` | Actions per user, session frequency |
| **Retention** | `audit_logs`, `profiles` | Return rate, days since last login |
| **Investment Funnel** | `deals`, `deal_commitments`, `subscriptions`, `allocations` | Conversion at each stage |
| **User Journey** | `investors`, `tasks` | Onboarding completion, KYC timing |
| **Feature Usage** | `audit_logs` (entity_type) | Which features are used most |
| **Financial Health** | `subscriptions`, `positions`, `performance_snapshots` | Investment patterns |

#### 3.3.3 Growth Overview Dashboard (`/versotech_admin/growth`)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Growth Analytics                                   [Last 30 days ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  KEY METRICS                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   DAU    │ │   WAU    │ │   MAU    │ │ Stickiness│ │Avg Session│      │
│  │   245    │ │   892    │ │  1,124   │ │   21.8%   │ │  8m 32s  │      │
│  │ +5% ▲    │ │ +3% ▲    │ │ +2% ▲    │ │ -1% ▼    │ │ +12% ▲   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Active Users Trend                                              │   │
│  │  ════════════════════════════════════════════════════════════   │   │
│  │  300│          ╭─╮                                               │   │
│  │     │    ╭────╯   ╰────╮      ╭────────╮                        │   │
│  │  200│───╯              ╰─────╯          ╰────                   │   │
│  │     │                                                            │   │
│  │  100│                                                            │   │
│  │     └────────────────────────────────────────────────────────   │   │
│  │      Jan 1        Jan 8        Jan 15       Jan 22              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────┐              │
│  │  Feature Usage          │  │  User Segments          │              │
│  │  ─────────────────      │  │  ─────────────────      │              │
│  │  Portfolio View   45%   │  │  Power Users     15%    │              │
│  │  Deal Browse      32%   │  │  Regular         48%    │              │
│  │  Documents        18%   │  │  Occasional      27%    │              │
│  │  Messages          5%   │  │  At Risk         10%    │              │
│  └─────────────────────────┘  └─────────────────────────┘              │
│                                                                         │
│  QUICK INSIGHTS                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️  23 users haven't logged in for 30+ days                     │   │
│  │ 📈  Deal "Series C - FinTech" has 89% view-to-interest rate     │   │
│  │ 🎯  Users who complete KYC in <3 days have 2x investment rate   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Metrics Definitions:**

| Metric | Formula | Source |
|--------|---------|--------|
| DAU | Distinct users with audit_log entry today | `audit_logs` |
| WAU | Distinct users with audit_log entry in last 7 days | `audit_logs` |
| MAU | Distinct users with audit_log entry in last 30 days | `audit_logs` |
| Stickiness | DAU / MAU * 100 | Calculated |
| Avg Session | Avg time between first and last action per session | `audit_logs` grouped by session_id |

#### 3.3.4 Engagement Page (`/versotech_admin/growth/engagement`)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  User Engagement                                    [Last 30 days ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Actions by Type                                                 │   │
│  │  ════════════════════════════════════════════════════════════   │   │
│  │  [Bar Chart]                                                     │   │
│  │  view_deal        ████████████████████████  2,450                │   │
│  │  view_portfolio   ██████████████████  1,890                      │   │
│  │  download_doc     ████████████  1,234                            │   │
│  │  submit_sub       ███████  780                                   │   │
│  │  send_message     ████  456                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────┐              │
│  │  Engagement by Day      │  │  Peak Activity Hours    │              │
│  │  [Heatmap]              │  │  [Bar Chart]            │              │
│  │  Mon ██████████ 890     │  │  9AM  ████████          │              │
│  │  Tue ████████ 720       │  │  10AM ██████████████    │              │
│  │  Wed █████████ 810      │  │  2PM  ██████████        │              │
│  │  Thu ███████████ 920    │  │  4PM  ████████████      │              │
│  │  Fri ██████ 580         │  │                         │              │
│  └─────────────────────────┘  └─────────────────────────┘              │
│                                                                         │
│  TOP ENGAGED USERS                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Rank │ User              │ Actions │ Sessions │ Avg Duration    │   │
│  ├──────┼───────────────────┼─────────┼──────────┼─────────────────┤   │
│  │ 1    │ John Smith        │ 245     │ 34       │ 12m 30s         │   │
│  │ 2    │ Sarah Johnson     │ 198     │ 28       │ 9m 45s          │   │
│  │ 3    │ Mike Chen         │ 167     │ 22       │ 11m 20s         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**SQL Queries:**

```sql
-- Actions by Type
SELECT
  action,
  COUNT(*) as count
FROM audit_logs
WHERE timestamp > now() - interval '30 days'
GROUP BY action
ORDER BY count DESC
LIMIT 10;

-- Engagement by Day of Week
SELECT
  EXTRACT(dow FROM timestamp) as day_of_week,
  COUNT(DISTINCT actor_id) as unique_users
FROM audit_logs
WHERE timestamp > now() - interval '30 days'
GROUP BY day_of_week
ORDER BY day_of_week;

-- Top Engaged Users
SELECT
  p.id,
  p.display_name,
  p.email,
  COUNT(*) as action_count,
  COUNT(DISTINCT DATE(a.timestamp)) as active_days
FROM audit_logs a
JOIN profiles p ON a.actor_id = p.id
WHERE a.timestamp > now() - interval '30 days'
GROUP BY p.id, p.display_name, p.email
ORDER BY action_count DESC
LIMIT 20;
```

#### 3.3.5 Retention Page (`/versotech_admin/growth/retention`)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Retention Analysis                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  RETENTION METRICS                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 7-Day    │ │ 30-Day   │ │ 90-Day   │ │ Churn    │                   │
│  │ Retention│ │ Retention│ │ Retention│ │ Rate     │                   │
│  │   78%    │ │   62%    │ │   45%    │ │   8%     │                   │
│  │ +2% ▲    │ │ -1% ▼    │ │ stable   │ │ -3% ▼   │                   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                   │
│                                                                         │
│  RETENTION COHORT MATRIX                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Cohort   │ Week 0 │ Week 1 │ Week 2 │ Week 3 │ Week 4 │         │   │
│  ├──────────┼────────┼────────┼────────┼────────┼────────┤         │   │
│  │ Jan W1   │ 100%   │  72%   │  58%   │  51%   │  48%   │ n=45    │   │
│  │ Jan W2   │ 100%   │  75%   │  62%   │  54%   │   -    │ n=38    │   │
│  │ Jan W3   │ 100%   │  68%   │  55%   │   -    │   -    │ n=52    │   │
│  │ Jan W4   │ 100%   │  71%   │   -    │   -    │   -    │ n=41    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  [Color gradient: 100% = dark green → 0% = red]                        │
│                                                                         │
│  AT-RISK USERS (No activity in 30+ days)                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ User              │ Last Active    │ Total Invested │ Actions   │   │
│  ├───────────────────┼────────────────┼────────────────┼───────────┤   │
│  │ Alice Wong        │ 45 days ago    │ $250,000       │ [Contact] │   │
│  │ Bob Martinez      │ 38 days ago    │ $0             │ [Contact] │   │
│  │ Carol Davis       │ 32 days ago    │ $1,200,000     │ [Contact] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**SQL Queries:**

```sql
-- Retention by Period
WITH user_first_action AS (
  SELECT
    actor_id,
    MIN(DATE(timestamp)) as first_active_date
  FROM audit_logs
  GROUP BY actor_id
),
retention AS (
  SELECT
    ufa.actor_id,
    ufa.first_active_date,
    CASE WHEN EXISTS (
      SELECT 1 FROM audit_logs a
      WHERE a.actor_id = ufa.actor_id
      AND DATE(a.timestamp) BETWEEN ufa.first_active_date + 1 AND ufa.first_active_date + 7
    ) THEN 1 ELSE 0 END as returned_week_1
  FROM user_first_action ufa
)
SELECT
  COUNT(*) as total_users,
  SUM(returned_week_1) as retained_week_1,
  ROUND(SUM(returned_week_1)::numeric / COUNT(*) * 100, 1) as retention_rate
FROM retention;

-- At-Risk Users (30+ days inactive)
SELECT
  p.id,
  p.display_name,
  p.email,
  MAX(a.timestamp) as last_active,
  COALESCE(SUM(s.commitment), 0) as total_invested
FROM profiles p
LEFT JOIN audit_logs a ON p.id = a.actor_id
LEFT JOIN investor_users iu ON p.id = iu.user_id
LEFT JOIN subscriptions s ON iu.investor_id = s.investor_id
WHERE p.role = 'investor'
GROUP BY p.id, p.display_name, p.email
HAVING MAX(a.timestamp) < now() - interval '30 days'
ORDER BY total_invested DESC;
```

#### 3.3.6 Funnel Page (`/versotech_admin/growth/funnel`)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Conversion Funnels                                 [Last 30 days ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INVESTMENT FUNNEL                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ████████████████████████████████████████████████  1,247        │   │
│  │  Viewed Deal (100%)                                              │   │
│  │                                                                  │   │
│  │  ██████████████████████████████████  892  (71.5%)               │   │
│  │  Showed Interest                                                 │   │
│  │                                                                  │   │
│  │  ████████████████████  456  (36.6%)                             │   │
│  │  Started Subscription                                            │   │
│  │                                                                  │   │
│  │  ██████████████  312  (25.0%)                                   │   │
│  │  Completed Subscription                                          │   │
│  │                                                                  │   │
│  │  ████████████  256  (20.5%)                                     │   │
│  │  Allocated                                                       │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ONBOARDING FUNNEL                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ████████████████████████████████████████████████  156          │   │
│  │  Account Created (100%)                                          │   │
│  │                                                                  │   │
│  │  ██████████████████████████████████████  134  (85.9%)           │   │
│  │  Profile Completed                                               │   │
│  │                                                                  │   │
│  │  ████████████████████████████  98  (62.8%)                      │   │
│  │  KYC Submitted                                                   │   │
│  │                                                                  │   │
│  │  ████████████████████████  82  (52.6%)                          │   │
│  │  KYC Approved                                                    │   │
│  │                                                                  │   │
│  │  ██████████████████  67  (42.9%)                                │   │
│  │  First Investment                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  DROP-OFF ANALYSIS                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Biggest Drop-off: Interest → Subscription (-35%)                 │   │
│  │                                                                  │   │
│  │ Users stuck at this stage: 436                                   │   │
│  │ Avg time at stage: 8.5 days                                      │   │
│  │ Common reasons:                                                  │   │
│  │   • Minimum investment too high (45%)                            │   │
│  │   • KYC not completed (32%)                                      │   │
│  │   • Document not downloaded (23%)                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**SQL Queries:**

```sql
-- Investment Funnel
WITH funnel AS (
  SELECT
    (SELECT COUNT(DISTINCT investor_id) FROM audit_logs WHERE action = 'view_deal') as viewed,
    (SELECT COUNT(DISTINCT investor_id) FROM deal_commitments) as interested,
    (SELECT COUNT(DISTINCT investor_id) FROM subscriptions WHERE status = 'pending') as started,
    (SELECT COUNT(DISTINCT investor_id) FROM subscriptions WHERE status = 'completed') as completed,
    (SELECT COUNT(DISTINCT investor_id) FROM allocations WHERE status = 'settled') as allocated
)
SELECT * FROM funnel;

-- Onboarding Funnel
SELECT
  COUNT(*) as total_investors,
  COUNT(*) FILTER (WHERE onboarding_status = 'completed') as profile_done,
  COUNT(*) FILTER (WHERE kyc_status IN ('review', 'completed')) as kyc_submitted,
  COUNT(*) FILTER (WHERE kyc_status = 'completed') as kyc_approved
FROM investors
WHERE created_at > now() - interval '90 days';
```

#### 3.3.7 Cohorts Page (`/versotech_admin/growth/cohorts`)

**Purpose:** Analyze user behavior by signup cohort (week/month) to understand how different groups perform over time.

**Cohort Definitions:**
| Cohort Type | Grouping |
|-------------|----------|
| Signup Week | `profiles.created_at` grouped by ISO week |
| Signup Month | `profiles.created_at` grouped by month |
| First Investment Month | `subscriptions.created_at` MIN grouped by month |
| Investor Type | `investors.type` |

**Metrics per Cohort:**
- Size (n users)
- Activation Rate (% who completed onboarding)
- Investment Rate (% who invested)
- Avg Investment Size
- Avg Time to First Investment
- 30/60/90 Day Retention

#### 3.3.8 Components to Use

| Section | Component | Source |
|---------|-----------|--------|
| KPI Cards | `kpi-card.tsx` | `/components/dashboard/` |
| Charts | `chart.tsx` + Recharts | `/components/ui/` |
| Data Tables | `Table` | shadcn/ui |
| Cohort Matrix | Custom grid with `Card` | New component |
| Funnel Viz | Custom with `Progress` | New component |
| User Lists | `investors-data-table.tsx` adapted | `/components/investors/` |

#### 3.3.9 New API Endpoints Needed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/growth/overview` | GET | Overview metrics (DAU, WAU, MAU, stickiness) |
| `/api/admin/growth/engagement` | GET | Engagement metrics by action, time |
| `/api/admin/growth/retention` | GET | Retention cohort data |
| `/api/admin/growth/funnel` | GET | Funnel conversion data |
| `/api/admin/growth/cohorts` | GET | Cohort analysis data |
| `/api/admin/growth/at-risk` | GET | At-risk user list |

---

### 3.4 AGENTS (`/versotech_admin/agents`)

#### 3.4.1 Purpose
Placeholder for future AI-powered automation, workflows, and intelligent assistants.

#### 3.4.2 Initial Scope (Placeholder)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Agents & Automation                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                         🤖                                       │   │
│  │                                                                  │   │
│  │              AI-Powered Automation                               │   │
│  │                                                                  │   │
│  │     Intelligent agents to automate workflows,                    │   │
│  │     provide insights, and enhance operations.                    │   │
│  │                                                                  │   │
│  │                   Coming Soon                                    │   │
│  │                                                                  │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                     │   │
│  │  │  KYC Review Bot  │  │  Deal Matching   │                     │   │
│  │  │  Auto-verify     │  │  Smart investor  │                     │   │
│  │  │  documents       │  │  recommendations │                     │   │
│  │  │  [Planned]       │  │  [Planned]       │                     │   │
│  │  └──────────────────┘  └──────────────────┘                     │   │
│  │                                                                  │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                     │   │
│  │  │  Risk Alerts     │  │  Report Gen      │                     │   │
│  │  │  Proactive       │  │  Auto-generate   │                     │   │
│  │  │  monitoring      │  │  investor reports│                     │   │
│  │  │  [Planned]       │  │  [Planned]       │                     │   │
│  │  └──────────────────┘  └──────────────────┘                     │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Want to suggest an automation? [Contact Product Team]                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 3.4.3 Future Agent Ideas (For Discussion)

| Agent | Purpose | Data Sources |
|-------|---------|--------------|
| KYC Review Bot | Auto-verify documents, flag anomalies | `investors`, documents, external APIs |
| Deal Matching | Recommend deals to investors based on history | `subscriptions`, `investors`, `deals` |
| Risk Monitor | Proactive alerts for compliance issues | `audit_logs`, `compliance_alerts` |
| Report Generator | Auto-generate periodic investor reports | `performance_snapshots`, `positions` |
| Onboarding Assistant | Guide new users through setup | `tasks`, `profiles` |
| Churn Predictor | Identify at-risk users before they leave | `audit_logs`, ML model |

---

### 3.5 SETTINGS (`/versotech_admin/settings`)

#### 3.5.1 Purpose
Platform configuration and system settings (already has placeholder page).

#### 3.5.2 Settings Sections

| Section | Contents | Priority |
|---------|----------|----------|
| General | Platform name, timezone, currency defaults | Medium |
| Security | MFA policies, session timeout, IP allowlist | High |
| Notifications | Email templates, notification rules | Medium |
| Integrations | API keys, webhook URLs, external services | Low |
| Audit | Log retention, export settings | Medium |

#### 3.5.3 Existing Page
Location: `/src/app/(admin)/versotech_admin/settings/page.tsx`

Expand from placeholder to include actual settings forms.

---

## 4. Navigation & Layout

### 4.1 Admin Sidebar

```typescript
const adminNavItems = [
  {
    name: 'Dashboard',
    href: '/versotech_admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/versotech_admin/users',
    icon: Users,
    children: [
      { name: 'All Users', href: '/versotech_admin/users' },
      { name: 'Staff', href: '/versotech_admin/users/staff' },
      { name: 'Investors', href: '/versotech_admin/users/investors' },
    ],
  },
  {
    name: 'Growth',
    href: '/versotech_admin/growth',
    icon: TrendingUp,
    children: [
      { name: 'Overview', href: '/versotech_admin/growth' },
      { name: 'Engagement', href: '/versotech_admin/growth/engagement' },
      { name: 'Retention', href: '/versotech_admin/growth/retention' },
      { name: 'Funnels', href: '/versotech_admin/growth/funnel' },
      { name: 'Cohorts', href: '/versotech_admin/growth/cohorts' },
    ],
  },
  {
    name: 'Agents',
    href: '/versotech_admin/agents',
    icon: Bot,
    badge: 'Soon',
  },
  {
    name: 'Settings',
    href: '/versotech_admin/settings',
    icon: Settings,
  },
];
```

### 4.2 Admin Layout Component

Create: `/src/app/(admin)/versotech_admin/components/admin-sidebar.tsx`

Adapt from: `/src/components/layout/persona-sidebar.tsx`

---

## 5. Technical Implementation

### 5.1 File Structure

```
src/app/(admin)/versotech_admin/
├── layout.tsx                    # Existing - add sidebar
├── page.tsx                      # Redirect to dashboard
├── components/
│   ├── admin-sidebar.tsx         # Admin navigation
│   ├── admin-kpi-card.tsx        # KPI card wrapper
│   └── growth/
│       ├── retention-matrix.tsx  # Cohort retention grid
│       ├── funnel-chart.tsx      # Funnel visualization
│       └── engagement-chart.tsx  # Engagement visualizations
├── dashboard/
│   └── page.tsx                  # Platform dashboard
├── users/
│   ├── page.tsx                  # User list
│   ├── [id]/
│   │   └── page.tsx              # User detail
│   ├── staff/
│   │   └── page.tsx              # Staff only
│   └── components/
│       ├── user-table.tsx        # User data table
│       ├── user-filters.tsx      # Filter controls
│       └── user-detail-tabs.tsx  # Detail page tabs
├── growth/
│   ├── page.tsx                  # Overview
│   ├── engagement/
│   │   └── page.tsx
│   ├── retention/
│   │   └── page.tsx
│   ├── funnel/
│   │   └── page.tsx
│   └── cohorts/
│       └── page.tsx
├── agents/
│   └── page.tsx                  # Placeholder
└── settings/
    └── page.tsx                  # Existing - expand
```

### 5.2 API Structure

```
src/app/api/admin/
├── growth/
│   ├── overview/route.ts         # NEW
│   ├── engagement/route.ts       # NEW
│   ├── retention/route.ts        # NEW
│   ├── funnel/route.ts           # NEW
│   ├── cohorts/route.ts          # NEW
│   └── at-risk/route.ts          # NEW
└── [existing endpoints...]
```

### 5.3 Component Reuse Map

| New Component | Base Component | Modifications |
|---------------|----------------|---------------|
| User Table | `investors-data-table.tsx` | Change columns, add role filter |
| User Filters | `investor-filters.tsx` | Add role, entity type |
| User Detail | `entity-detail-client.tsx` | Adapt tabs for user data |
| Dashboard KPIs | `admin-kpi-cards.tsx` | Already exists |
| Activity Feed | `real-time-activity-feed.tsx` | Already exists |
| Retention Matrix | New | Use `Table` + color styling |
| Funnel Chart | New | Use `Progress` + custom |

---

## 6. Success Metrics

### 6.1 Admin Portal Usage
- Admin login frequency
- Time spent per session
- Most used features

### 6.2 Operational Efficiency
- Time to resolve user issues
- User management actions per week
- Export/report generation frequency

### 6.3 Growth Impact
- Improvement in retention rates after insights
- Reduction in churn after at-risk interventions
- Funnel conversion improvements

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Admin sidebar navigation
- [ ] Dashboard page with existing KPIs
- [ ] Route structure setup

### Phase 2: Users (Week 2)
- [ ] User list page with table
- [ ] User detail page with tabs
- [ ] Staff sub-page
- [ ] Batch operations

### Phase 3: Growth Core (Week 3)
- [ ] Growth overview page
- [ ] Engagement metrics
- [ ] API endpoints for analytics

### Phase 4: Growth Advanced (Week 4)
- [ ] Retention cohort matrix
- [ ] Funnel visualization
- [ ] At-risk user detection
- [ ] Cohort analysis

### Phase 5: Polish (Week 5)
- [ ] Agents placeholder
- [ ] Settings expansion
- [ ] Performance optimization
- [ ] Testing & QA

---

## 8. Open Questions

1. **Real-time vs Cached:** Should growth metrics be real-time or cached/refreshed periodically?

2. **Export Formats:** What export formats are needed for growth data? (CSV, PDF reports?)

3. **Alerting:** Should at-risk users trigger automatic notifications to RMs?

4. **Agent Priorities:** Which agent should be built first after the placeholder?

---

## Appendix A: Existing API Reference

See Section 3.2.5 and explore results for complete API documentation.

## Appendix B: Database Schema Reference

See exploration results for complete table and column documentation.
