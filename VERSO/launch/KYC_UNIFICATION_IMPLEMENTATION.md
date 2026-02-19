# KYC System Unification & Account Activation

**Implementation Date:** January 30, 2026
**Phase 1 Status:** Complete ✅
**Phase 2 Status:** Complete ✅ (Non-Investor Personas)
**Environments:** Dev (mcp__supabase-old) and Prod (mcp__supabase)

---

## Executive Summary

This implementation unifies personal KYC storage to member tables for all 6 personas, adds a submit/approve flow for Personal Info and Entity Info KYC, and builds an Account Activation approval system.

---

## Goals

1. **Unify KYC Storage**: Store personal KYC information in `*_members` tables (not entity tables) for all personas
2. **Link Users to Members**: Create `linked_user_id` column to connect system users to their member KYC records
3. **Personal KYC Flow**: Allow users to edit and submit their personal info for staff review
4. **Entity KYC Flow**: Allow admins to submit entity info for staff review
5. **Account Activation**: Require CEO approval after all KYC is complete before full platform access

---

## Database Changes

### New Columns Added

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `investor_members` | `linked_user_id` | UUID FK → profiles | Links user to their member record |
| `partner_members` | `linked_user_id` | UUID FK → profiles | Links user to their member record |
| `introducer_members` | `linked_user_id` | UUID FK → profiles | Links user to their member record |
| `lawyer_members` | `linked_user_id` | UUID FK → profiles | Links user to their member record |
| `commercial_partner_members` | `linked_user_id` | UUID FK → profiles | Links user to their member record |
| `arranger_members` | `linked_user_id` | UUID FK → profiles | Links user to their member record |
| `partners` | `onboarding_status` | TEXT | Tracks onboarding progress |
| `introducers` | `onboarding_status` | TEXT | Tracks onboarding progress |
| `lawyers` | `onboarding_status` | TEXT | Tracks onboarding progress |
| `commercial_partners` | `onboarding_status` | TEXT | Tracks onboarding progress |
| `arranger_entities` | `onboarding_status` | TEXT | Tracks onboarding progress |
| ALL 6 entity tables | `account_approval_status` | TEXT | pending_onboarding → pending_approval → approved/rejected |
| ALL 6 entity tables | `account_rejection_reason` | TEXT | Reason if account is rejected |

### New Indexes

```sql
idx_investor_members_linked_user ON investor_members(linked_user_id)
idx_partner_members_linked_user ON partner_members(linked_user_id)
idx_introducer_members_linked_user ON introducer_members(linked_user_id)
idx_lawyer_members_linked_user ON lawyer_members(linked_user_id)
idx_commercial_partner_members_linked_user ON commercial_partner_members(linked_user_id)
idx_arranger_members_linked_user ON arranger_members(linked_user_id)
```

### New Triggers

| Trigger | Table | Action |
|---------|-------|--------|
| `trg_investor_users_create_member` | `investor_users` | Auto-creates `investor_members` record on user add |
| `trg_partner_users_create_member` | `partner_users` | Auto-creates `partner_members` record on user add |
| `trg_introducer_users_create_member` | `introducer_users` | Auto-creates `introducer_members` record on user add |
| `trg_lawyer_users_create_member` | `lawyer_users` | Auto-creates `lawyer_members` record on user add |
| `trg_commercial_partner_users_create_member` | `commercial_partner_users` | Auto-creates `commercial_partner_members` record on user add |
| `trg_arranger_users_create_member` | `arranger_users` | Auto-creates `arranger_members` record on user add |

### Migrations Applied

1. `add_linked_user_id_to_members` - Schema changes
2. `backfill_account_approval_v3` - Auto-approve existing active accounts
3. `auto_create_member_triggers` - Trigger functions
4. `backfill_linked_members_v2` - Create member records for existing users
5. `fix_arranger_trigger_and_backfill` - Fixed arranger column name

---

## New API Endpoints

### Personal KYC Submission (Generic - Phase 2)

**POST** `/api/me/personal-kyc/submit`

- **Supports all 6 entity types:** investor, partner, introducer, lawyer, commercial_partner, arranger
- Request body: `{ entityType: string, memberId: string }`
- Submits user's personal KYC for staff review
- Creates `kyc_submissions` record with `document_type: 'personal_info'`
- Updates member `kyc_status` to `'submitted'`
- Validates required fields are complete
- Uses configuration map for table/column lookups

### Entity KYC Submission (Generic - Phase 2)

**POST** `/api/me/entity-kyc/submit`

- **Supports all 6 entity types:** investor, partner, introducer, lawyer, commercial_partner, arranger
- Request body: `{ entityType: string, entityId: string }`
- Submits entity info for staff review
- Only available for entity-type entities (not individuals)
- Only primary contacts or admins can submit
- Creates `kyc_submissions` record with `document_type: 'entity_info'`
- Updates entity `kyc_status` to `'submitted'`

### Legacy Endpoints (Still Functional)

**POST** `/api/investors/me/members/[memberId]/submit-kyc` - Investor-specific (Phase 1)
**POST** `/api/investors/me/submit-entity-kyc` - Investor-specific (Phase 1)

---

## New Components

### PersonalKYCSection (Updated in Phase 2)

**File:** `src/components/profile/personal-kyc-section.tsx`

- Displays user's personal KYC information from their member record
- Shows KYC status badge (Pending, Submitted, Approved, Rejected)
- Edit button opens MemberKYCEditDialog
- Submit for Review button when info is complete
- Shows rejection notes if KYC was rejected
- **Phase 2:** Updated to use generic `/api/me/personal-kyc/submit` endpoint
- **Phase 2:** Exports `MemberKYCData` type for use in non-investor profiles

### New API Route Files (Phase 2)

**Personal KYC Submit:**
`src/app/api/me/personal-kyc/submit/route.ts`
- Configuration-driven approach using `ENTITY_CONFIGS` map
- Dynamically builds table/column names based on entity type
- Single codebase handles all 6 personas

**Entity KYC Submit:**
`src/app/api/me/entity-kyc/submit/route.ts`
- Same pattern as personal KYC but for entity-level submissions
- Validates admin/primary permissions before allowing submission

---

## Modified Files

### Profile Pages (Phase 1 - Investor)

**Files:**
- `src/app/(main)/versotech_main/profile/page.tsx`
- `src/components/profile/profile-page-client.tsx`

**Changes:**
- Fetches user's linked member record via `linked_user_id`
- Displays PersonalKYCSection for entity-type investors
- Added "Submit Entity Info for Review" button
- Added entity KYC submission handler

### Profile Pages (Phase 2 - Non-Investor Personas)

**Introducer Profile:**
- `src/app/(main)/versotech_main/introducer-profile/page.tsx`
- `src/components/introducer-profile/introducer-profile-client.tsx`

**Arranger Profile:**
- `src/app/(main)/versotech_main/arranger-profile/page.tsx`
- `src/app/(main)/versotech_main/arranger-profile/arranger-profile-client.tsx`

**Commercial Partner Profile:**
- `src/app/(main)/versotech_main/commercial-partner-profile/page.tsx`
- `src/components/commercial-partner-profile/commercial-partner-profile-client.tsx`

**Changes (All Non-Investor Profiles):**
- Added member data fetching from `*_members` table using `linked_user_id`
- Added `memberInfo` prop to client components
- Added `PersonalKYCSection` component to display "Your Personal Information"
- Uses generic `/api/me/personal-kyc/submit` endpoint for submission

### KYC Review Endpoint

**File:** `src/app/api/staff/kyc-submissions/[id]/review/route.ts`

**Changes:**
- Queries all entity types (not just investors)
- Calls generic `handleKYCApproval()` for all entity types
- Updates member `kyc_status` on personal_info approval
- Updated audit logging with entity type info
- Improved notification messages

### Generic KYC Checker

**File:** `src/lib/kyc/check-entity-kyc-status.ts` (NEW)

**Functions:**
- `getEntityTypeFromSubmission()` - Determines entity type from submission
- `updateMemberKYCStatus()` - Updates member KYC status
- `checkAndUpdateEntityKYCStatus()` - Checks if all KYC requirements met
- `handleKYCApproval()` - Main handler for KYC approval flow
- Creates `account_activation` approval when all KYC complete

### Approvals System

**Files:**
- `src/types/approvals.ts` - Added `account_activation` entity type
- `src/app/api/approvals/route.ts` - Added handler for account activation

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER ADDED TO ENTITY                        │
│                              ↓                                  │
│  Trigger fires → Creates *_members record with linked_user_id   │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PERSONAL KYC FLOW                            │
│  1. User logs in → sees "Your Personal Information" section    │
│  2. User clicks Edit → fills personal KYC form                  │
│  3. User clicks "Submit for Review"                             │
│  4. Creates kyc_submission (document_type: personal_info)       │
│  5. member.kyc_status = 'submitted'                             │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                     ENTITY KYC FLOW                             │
│  1. Admin fills entity info (legal name, address, etc.)         │
│  2. Admin clicks "Submit Entity Info for Review"                │
│  3. Creates kyc_submission (document_type: entity_info)         │
│  4. entity.kyc_status = 'submitted'                             │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STAFF KYC REVIEW                             │
│  1. Staff goes to KYC Review page                               │
│  2. Staff sees personal_info and entity_info submissions        │
│  3. Staff approves/rejects each submission                      │
│  4. On approve: member.kyc_status = 'approved'                  │
│  5. When all approved: entity.kyc_status = 'approved'           │
│  6. Creates account_activation approval                         │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                  ACCOUNT ACTIVATION                             │
│  1. CEO sees account_activation approval in Approvals page      │
│  2. CEO approves account                                        │
│  3. entity.account_approval_status = 'approved'                 │
│  4. User now has full platform access                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status Values

### member.kyc_status
- `pending` - Initial state, user needs to fill info
- `submitted` - User submitted, awaiting staff review
- `approved` - Staff approved
- `rejected` - Staff rejected (with notes)

### entity.kyc_status
- `pending` - Not started
- `submitted` - Submitted for review
- `approved` - All KYC complete

### entity.account_approval_status
- `pending_onboarding` - Initial state (KYC not complete)
- `pending_approval` - KYC complete, awaiting CEO approval
- `approved` - Account activated
- `rejected` - Account rejected (with reason)

---

## Testing Checklist

See: `KYC_UNIFICATION_TEST_SCENARIO.md`

---

## Rollback Plan

If issues arise, run these SQL statements:

```sql
-- Remove triggers
DROP TRIGGER IF EXISTS trg_investor_users_create_member ON investor_users;
DROP TRIGGER IF EXISTS trg_partner_users_create_member ON partner_users;
DROP TRIGGER IF EXISTS trg_introducer_users_create_member ON introducer_users;
DROP TRIGGER IF EXISTS trg_lawyer_users_create_member ON lawyer_users;
DROP TRIGGER IF EXISTS trg_commercial_partner_users_create_member ON commercial_partner_users;
DROP TRIGGER IF EXISTS trg_arranger_users_create_member ON arranger_users;

-- Remove columns (optional - data will be preserved)
-- ALTER TABLE investor_members DROP COLUMN linked_user_id;
-- etc.
```

---

## Future Enhancements

1. ~~**Personal KYC for non-investor entities**~~ ✅ Complete (Phase 2)
2. **Notification support for non-investor entities** - Currently only investors get notifications
3. **Account locking middleware** - Block unapproved accounts from accessing platform
4. **KYC expiry tracking** - Alert when KYC documents are expiring
5. **Bulk KYC review** - Review multiple submissions at once

---

## Phase 2 Summary (January 30, 2026)

### Completed Work

| Task | Status |
|------|--------|
| Generic `/api/me/personal-kyc/submit` endpoint | ✅ |
| Generic `/api/me/entity-kyc/submit` endpoint | ✅ |
| Introducer profile - member fetching + PersonalKYCSection | ✅ |
| Arranger profile - member fetching + PersonalKYCSection | ✅ |
| Commercial Partner profile - member fetching + PersonalKYCSection | ✅ |
| Updated PersonalKYCSection to use generic endpoint | ✅ |

### Files Created

```
src/app/api/me/personal-kyc/submit/route.ts
src/app/api/me/entity-kyc/submit/route.ts
```

### Files Modified

```
src/components/profile/personal-kyc-section.tsx
src/app/(main)/versotech_main/introducer-profile/page.tsx
src/components/introducer-profile/introducer-profile-client.tsx
src/app/(main)/versotech_main/arranger-profile/page.tsx
src/app/(main)/versotech_main/arranger-profile/arranger-profile-client.tsx
src/app/(main)/versotech_main/commercial-partner-profile/page.tsx
src/components/commercial-partner-profile/commercial-partner-profile-client.tsx
```

### Architecture Decision: Generic Endpoints

Instead of creating 6 separate endpoints (one per persona), we created 2 generic endpoints that use a configuration-driven approach:

```typescript
const ENTITY_CONFIGS = {
  investor: { memberTable: 'investor_members', entityIdColumn: 'investor_id', ... },
  partner: { memberTable: 'partner_members', entityIdColumn: 'partner_id', ... },
  introducer: { memberTable: 'introducer_members', entityIdColumn: 'introducer_id', ... },
  // ... etc
}
```

**Benefits:**
- Single codebase to maintain
- Consistent behavior across all personas
- Easy to extend for new entity types
- Reduced code duplication
