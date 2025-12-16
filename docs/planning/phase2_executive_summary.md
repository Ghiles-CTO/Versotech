# VERSO Phase 2: What We're Building (Plain English)

**Last Updated:** 2024-12-16
**Status:** CORRECTED - Scope reduced, terminology fixed

---

## The Big Picture

**Today:** Two separate portals (Investor Portal and CEO Portal) that work independently. Each user can only be one thing.

**After:** One unified Main Portal where users log in once and can wear multiple "hats". Plus an Admin Portal section for platform management.

---

## What Changed From the Original Plan

| Original | Corrected |
|----------|-----------|
| 7 user types (including Partner & Commercial Partner) | **5 user types** - Partner/Commercial Partner removed |
| ~200 hours of work | **~85 hours** - cut 60% |
| Separate Admin Portal app | **Same app, different section** |
| Used "staff_admin", "staff_ops" | **Use real names**: CEO, Arranger, Lawyer |
| Many database changes | **Only 1 new table** needed |

---

## Who Uses What

### Main Portal (5 User Types)

| User Type | What They See | Can Also Be |
|-----------|---------------|-------------|
| **Investor** | Portfolio, opportunities, documents | + Introducer |
| **CEO** | Full control, approvals, user management | - |
| **Arranger** | Deal structuring, vehicle management | - |
| **Introducer** | Referrals, commissions | + Investor |
| **Lawyer** | Assigned deals, document review | - |

**Hybrid Example:** Sarah is an Introducer who also invests personally. One login, she switches between "Introducer" and "Investor" views with a dropdown.

### Admin Portal (same app, different section)

- Platform settings
- User management
- Growth/analytics dashboards
- CMS for marketing (placeholder)

---

## What's NOT Being Built (Removed)

| Removed | Why |
|---------|-----|
| Partner portal | 0% built, no database tables |
| Commercial Partner portal | 0% built, no database tables |
| GDPR compliance module | Not in core requirements |
| Check-in feature | Not built anywhere |
| Escrow management | Infrastructure missing |

*These can be added later as separate phases.*

---

## What Changes for Investors

### 1. Investment Journey Made Visual
When looking at a deal, investors see where they are:

```
Interest → NDA → Data Room → Subscription → Funding → Active
    ^
   [You are here]
```

### 2. Tasks + Notifications Combined
One notification bell in the header instead of two sidebar items. Click it, see everything grouped by deal:

```
Deal: ABC Opportunity
  - Sign subscription docs (due tomorrow)
  - Upload accreditation letter
  - New quarterly report available
```

### 3. Data Rooms Simplified

**Before investing (Due Diligence):**
- Data room lives inside the deal detail page
- Access granted after NDA, expires after 7 days

**After investing (Ongoing):**
- Documents live inside their Portfolio position
- K-1s, quarterly statements, distribution notices
- Always accessible while investment is active

**Result:** No more separate "Data Rooms" in the sidebar.

### 4. Profile Reorganized

Today: One confusing "KYC & Onboarding" tab.

After:
- **KYC Tab:** Document uploads (passport, proof of address)
- **Compliance Tab:** Questionnaires, accreditation status
- **Investment Entities Tab:** The legal entities they invest through

### 5. Documents Simplified
- "Reports" renamed to "Documents"
- One place for all documents

### 6. Theme Choice
Light mode, dark mode, or follow system preference.

---

## What Changes for CEO

### 1. Consolidated User Management
One "Users" page with tabs instead of separate pages:

```
[Investors] [Arrangers] [Introducers] [All]
```

### 2. Unified Inbox
Approvals and Messages combined:

```
[All] [Approvals] [Messages]
```

Priority items bubble to top.

---

## The Build Sequence

### Why This Order Matters

**Foundation MUST be first** because everything else needs the new login system that knows your roles. After that, we can work on multiple things in parallel without stepping on each other.

```
Week 1-2:  FOUNDATION (must do first)
           └── Login system that knows your roles
           └── Light/dark theme toggle
           └── One new database table

Week 3:    QUICK WINS (can do at same time)
           ├── Move Tasks+Notifications to header
           └── Rename "Reports" to "Documents"

Week 3-4:  CORE CHANGES (can do at same time)
           ├── Investment journey progress bar
           ├── Data room inside deal pages
           └── Combined user management for CEO

Week 5:    POLISH
           ├── Split KYC tab into KYC + Compliance
           └── Admin Portal section
```

---

## Effort Breakdown

| Phase | Work | Risk |
|-------|------|------|
| Foundation | ~25h | HIGH (touches login) |
| Investor Journey | ~15h | MEDIUM |
| Tasks/Notifications | ~10h | LOW |
| Documents rename | ~4h | LOW |
| Profile Tabs | ~6h | LOW |
| CEO Tools | ~15h | MEDIUM |
| Admin Portal | ~10h | LOW |
| **Total** | **~85h** | - |

---

## Decisions Already Made

1. **Admin Portal**: Same app with route groups (not separate application)
2. **Terminology**: Use CEO/Arranger/Lawyer/Investor/Introducer (not staff_*)
3. **Scope**: Partner/Commercial Partner removed (can add later)
4. **Data Rooms**: Pre-investment in Deal Detail, Post-investment in Portfolio
5. **Database**: Only 1 new table needed (`arranger_users`)

---

## Why Admin Portal Stays in Same App

**Not a separate application.** Here's why:

- 60% of the code is shared (login, components, database access)
- Security is handled at the database level, not the app level
- One deployment instead of coordinating two
- Changes to shared code work everywhere at once
- Simpler for developers

**Would reconsider if:** Team grows to 10+ developers who need to release independently.

---

## Risk Prevention

| Risk | How We Avoid It |
|------|-----------------|
| Breaking existing logins | Old URLs redirect to new ones |
| Users confused by changes | Roll out to internal team first |
| Something goes wrong | Feature flags let us turn things off |
| Database migration errors | Test thoroughly, keep old system as backup |

---

## Bottom Line

**Before:** Two separate portals. Each person can only be one thing.

**After:** One portal. Log in once, switch between roles. Cleaner UI. ~85 hours of work across 5 weeks.
