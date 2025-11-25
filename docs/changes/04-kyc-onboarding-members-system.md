# Change Log #04: KYC, Onboarding & Entity Members System

**Date**: November 23-25, 2025
**Author**: Claude Code
**Status**: Completed - Production Ready
**Priority**: HIGH
**Affected Systems**: KYC submissions, Entity members, Onboarding automation, Investor portal tasks, Compliance questionnaire

---

## Executive Summary

This change implements a comprehensive KYC and onboarding system including:
1. **Entity Members Tables** - Track directors, beneficial owners, and authorized signatories for both investors and counterparty entities
2. **KYC Document System** - Flexible document submission with member linking
3. **10-Step KYC Questionnaire Wizard** - Regulatory compliance questionnaire with conditional US Person steps
4. **Onboarding Task Automation** - Database trigger for automatic task creation
5. **Tasks Page Visibility Fix** - Filter to show only the logged-in user's tasks

**Impact**: Enables complete investor onboarding workflow with proper KYC tracking and compliance documentation.

---

## Table of Contents

1. [Background & Requirements](#background--requirements)
2. [Database Schema Changes](#database-schema-changes)
3. [API Endpoints Created](#api-endpoints-created)
4. [Frontend Components](#frontend-components)
5. [KYC Questionnaire Wizard](#kyc-questionnaire-wizard)
6. [Onboarding Automation](#onboarding-automation)
7. [Bug Fixes](#bug-fixes)
8. [Testing & Verification](#testing--verification)
9. [Files Changed Summary](#files-changed-summary)

---

## Background & Requirements

### Business Context

VERSO Holdings requires a comprehensive KYC system that:
- Tracks all entity members (directors, beneficial owners, authorized signatories)
- Links KYC documents to specific entity members
- Collects investor compliance information via a structured questionnaire
- Automatically creates onboarding tasks when users are invited
- Supports both individual and corporate/entity investors

### Regulatory Requirements

- **Luxembourg CSSF Regulations**: Require identification of beneficial owners with >25% ownership
- **US SEC Regulations**: Require special handling for US Persons (Steps 5-7 of questionnaire)
- **AML/KYC Standards**: Track document expiry, version history, and approval workflows

---

## Database Schema Changes

### 1. investor_members Table

Stores members (directors, beneficial owners, authorized signatories) for investor entities.

```sql
CREATE TABLE investor_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'director', 'beneficial_owner', 'authorized_signatory', 'ubo', 'shareholder'
  role_title TEXT,     -- e.g., 'Managing Director', 'CEO'

  -- Contact information
  email TEXT,
  phone TEXT,

  -- Residential address (required for KYC)
  residential_street TEXT,
  residential_city TEXT,
  residential_state TEXT,
  residential_postal_code TEXT,
  residential_country TEXT,

  -- Identity
  nationality TEXT,
  id_type TEXT,        -- 'passport', 'national_id', 'drivers_license'
  id_number TEXT,
  id_expiry_date DATE,

  -- Ownership
  ownership_percentage NUMERIC,
  is_beneficial_owner BOOLEAN DEFAULT false,

  -- KYC status
  kyc_status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'expired', 'rejected'
  kyc_approved_at TIMESTAMPTZ,
  kyc_approved_by UUID REFERENCES profiles(id),
  kyc_expiry_date DATE,

  -- Lifecycle
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);
```

### 2. counterparty_entity_members Table

Mirror structure for counterparty entities (arranger entities, external parties).

```sql
CREATE TABLE counterparty_entity_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counterparty_entity_id UUID NOT NULL REFERENCES arranger_entities(id),
  -- Same fields as investor_members
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_title TEXT,
  email TEXT,
  phone TEXT,
  residential_street TEXT,
  residential_city TEXT,
  residential_state TEXT,
  residential_postal_code TEXT,
  residential_country TEXT,
  nationality TEXT,
  id_type TEXT,
  id_number TEXT,
  id_expiry_date DATE,
  ownership_percentage NUMERIC,
  is_beneficial_owner BOOLEAN DEFAULT false,
  kyc_status TEXT DEFAULT 'pending',
  kyc_approved_at TIMESTAMPTZ,
  kyc_approved_by UUID REFERENCES profiles(id),
  kyc_expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);
```

### 3. kyc_submissions Table Enhancements

Added columns for member linking and custom document types:

```sql
ALTER TABLE kyc_submissions ADD COLUMN
  counterparty_entity_id UUID REFERENCES arranger_entities(id),
  custom_label TEXT,           -- For custom document types
  investor_member_id UUID REFERENCES investor_members(id),
  counterparty_member_id UUID REFERENCES counterparty_entity_members(id);
```

**Key Fields**:
- `document_type` - Predefined types (passport, utility_bill, etc.) or 'other'
- `custom_label` - User-provided label for custom documents
- `investor_member_id` - Links document to specific investor member
- `counterparty_member_id` - Links document to specific counterparty member
- `metadata` - JSONB for questionnaire data (stores all 10 steps)
- `version` - Tracks document resubmissions
- `previous_submission_id` - Links to superseded submission

---

## API Endpoints Created

### KYC Submissions API

#### GET `/api/investors/me/kyc-submissions`
Returns all KYC submissions for the authenticated investor.

**Response**:
```json
{
  "success": true,
  "submissions": [...],
  "grouped_submissions": {...},
  "suggested_documents": [...],
  "investor_type": "individual|corporate|entity",
  "is_entity_investor": boolean,
  "investor_members": [...]
}
```

**File**: `versotech-portal/src/app/api/investors/me/kyc-submissions/route.ts`

#### POST `/api/investors/me/kyc-submissions`
Creates a new KYC submission (document or questionnaire).

**Request Body**:
```json
{
  "document_type": "passport|questionnaire|other",
  "custom_label": "Optional custom name",
  "metadata": { "wizardVersion": "2.0", "step1": {...}, ... },
  "status": "draft|pending"
}
```

#### PATCH `/api/investors/me/kyc-submissions/[id]`
Updates an existing submission (for draft saves and final submission).

**File**: `versotech-portal/src/app/api/investors/me/kyc-submissions/[id]/route.ts`

---

## Frontend Components

### KYC Components Structure

```
versotech-portal/src/components/kyc/
├── KYCQuestionnaire.tsx           # Main entry point component
├── schemas/
│   └── kyc-questionnaire-schema.ts # Zod schemas & step config
└── wizard/
    ├── KYCQuestionnaireWizard.tsx  # Wizard wrapper
    ├── WizardContext.tsx          # React Context for state
    ├── WizardNavigation.tsx       # Back/Next/Submit buttons
    ├── WizardProgress.tsx         # Progress indicator
    └── steps/
        ├── Step1AboutYou.tsx      # Personal information
        ├── Step2InvestmentType.tsx # Investment type selection
        ├── Step3WellInformed.tsx  # Well-informed investor status
        ├── Step4Compliance.tsx    # General compliance
        ├── Step5USPerson.tsx      # US Person determination
        ├── Step6OfferDetails.tsx  # Offer details (US only)
        ├── Step7USCompliance.tsx  # US compliance (US only)
        ├── Step8Suitability.tsx   # Investor suitability
        ├── Step9WaiverRisk.tsx    # Risk acknowledgements
        └── Step10ReviewSign.tsx   # Review and signature
```

### KYC Document Types

Defined in `versotech-portal/src/constants/kyc-document-types.ts`:

**Individual Documents**:
- Passport
- National ID
- Driver's License
- Proof of Address (utility bill, bank statement)
- Tax ID Certificate
- Source of Wealth Declaration
- Professional Investor Certificate

**Entity Documents**:
- Certificate of Incorporation
- Memorandum & Articles of Association
- Register of Directors
- Register of Shareholders
- UBO Declaration
- Corporate Resolution
- Bank Reference Letter
- Certificate of Good Standing
- Financial Statements

---

## KYC Questionnaire Wizard

### Step Configuration

10 steps with conditional visibility based on US Person status:

| Step | Title | Required | US Person Only |
|------|-------|----------|----------------|
| 1 | About You | Yes | No |
| 2 | Investment Type | Yes | No |
| 3 | Well-Informed Investor | Yes | No |
| 4 | Compliance | Yes | No |
| 5 | US Person Determination | Yes | No |
| 6 | Offer Details | If US Person | Yes |
| 7 | US Compliance | If US Person | Yes |
| 8 | Suitability | Yes | No |
| 9 | Waivers & Risk | Yes | No |
| 10 | Review & Sign | Yes | No |

### Key Features

1. **Auto-save**: Progress saved every 30 seconds when modified
2. **Conditional Steps**: Steps 6-7 only visible for US Persons
3. **Validation**: Zod schema validation per step
4. **Version Tracking**: Stores `wizardVersion: '2.0'` in metadata
5. **Resume Capability**: Loads existing draft on component mount
6. **Submission Status**: draft -> pending -> approved/rejected

### Schema Highlights

```typescript
// Step 1: About You
step1Schema = z.object({
  investorType: z.enum(['individual', 'corporate_entity', 'investment_fund', 'pension_fund', 'trust', 'other']),
  entityName: z.string().optional(),
  fullName: z.string().min(2),
  nationality: z.string().min(2),
  countryOfResidence: z.string().min(2),
  dateOfBirth: z.string(),
  taxIdNumber: z.string().optional(),
})

// Step 5: US Person Determination
step5Schema = z.object({
  isUSPerson: z.boolean(),
  usPersonBasis: z.array(z.string()).optional(),
  usPersonDetails: z.string().optional(),
})

// Step 10: Review & Sign
step10Schema = z.object({
  confirmAccuracy: z.boolean(),
  confirmUnderstanding: z.boolean(),
  electronicSignature: z.string().min(2),
  signatureDate: z.string(),
})
```

---

## Onboarding Automation

### Database Trigger

Created trigger to auto-create onboarding tasks when a user is linked to an investor:

**Migration**: `supabase/migrations/20251123000000_fix_onboarding_tasks_automation.sql`

```sql
CREATE OR REPLACE FUNCTION trigger_investor_user_onboarding_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_count int;
BEGIN
  SELECT COUNT(*) INTO v_task_count
  FROM create_tasks_from_templates(
    NEW.user_id,
    NEW.investor_id,
    'investor_created'
  );

  RAISE NOTICE 'Created % onboarding tasks for user % linked to investor %',
    v_task_count, NEW.user_id, NEW.investor_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create onboarding tasks: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER investor_users_create_onboarding_tasks
  AFTER INSERT ON investor_users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_investor_user_onboarding_tasks();
```

### Task Templates

Tasks created automatically based on templates with `trigger_event = 'investor_created'`:
- Complete your profile
- Add banking details
- Complete KYC verification
- Review and sign NDA
- Complete compliance questionnaire

---

## Bug Fixes

### 1. Tasks Page Filter Bug

**Problem**: Tasks page showed ALL tasks in the system instead of just the logged-in user's tasks.

**Location**: `versotech-portal/src/app/(investor)/versoholdings/tasks/page.tsx`

**Fix**: Added `.eq('owner_user_id', user.id)` filter to query:

```typescript
// Before (WRONG - no user filter)
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .order('created_at', { ascending: false })

// After (CORRECT - filtered by user)
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('owner_user_id', user.id)  // Added filter
  .order('created_at', { ascending: false })
```

### 2. Query Ordering Fix (Related - from previous session)

**Problem**: `.order('created_at')` was being called incorrectly in signature client.

**Location**: `versotech-portal/src/lib/signature/client.ts`

**Fix**: Ensured proper ordering syntax and ascending/descending specification.

---

## Testing & Verification

### KYC Questionnaire Testing

1. **Load Empty State**: Navigate to KYC page with no existing questionnaire
2. **Complete Step 1-4**: Fill personal info, investment type, well-informed status, compliance
3. **US Person Test**:
   - If US Person = Yes: Steps 5, 6, 7 visible
   - If US Person = No: Steps 5, 8, 9, 10 visible (skips 6, 7)
4. **Auto-save Test**: Make changes, wait 30 seconds, verify saved
5. **Resume Test**: Refresh page, verify data loaded
6. **Submit Test**: Complete all steps, submit, verify status = 'pending'

### Entity Members Testing

1. **Create Member**: Add beneficial owner via API
2. **Link Document**: Upload passport linked to member
3. **Query**: Verify member returned in KYC submissions response

### Onboarding Automation Testing

1. **Invite User**: Staff portal -> Investors -> Add User
2. **Check Tasks**: Query `SELECT * FROM tasks WHERE owner_user_id = '<new_user_id>'`
3. **Verify**: 4-6 onboarding tasks created automatically

---

## Files Changed Summary

### Database Migrations

| File | Description |
|------|-------------|
| `20251123000000_fix_onboarding_tasks_automation.sql` | Auto-create tasks trigger |

### API Routes

| File | Description |
|------|-------------|
| `api/investors/me/kyc-submissions/route.ts` | GET & POST KYC submissions |
| `api/investors/me/kyc-submissions/[id]/route.ts` | PATCH individual submission |

### Frontend Components (New)

| File | Description |
|------|-------------|
| `components/kyc/KYCQuestionnaire.tsx` | Main questionnaire component |
| `components/kyc/schemas/kyc-questionnaire-schema.ts` | Zod schemas & config |
| `components/kyc/wizard/KYCQuestionnaireWizard.tsx` | Wizard wrapper |
| `components/kyc/wizard/WizardContext.tsx` | State management |
| `components/kyc/wizard/WizardNavigation.tsx` | Navigation buttons |
| `components/kyc/wizard/WizardProgress.tsx` | Progress indicator |
| `components/kyc/wizard/steps/Step1AboutYou.tsx` | Step 1 |
| `components/kyc/wizard/steps/Step2InvestmentType.tsx` | Step 2 |
| `components/kyc/wizard/steps/Step3WellInformed.tsx` | Step 3 |
| `components/kyc/wizard/steps/Step4Compliance.tsx` | Step 4 |
| `components/kyc/wizard/steps/Step5USPerson.tsx` | Step 5 |
| `components/kyc/wizard/steps/Step6OfferDetails.tsx` | Step 6 (US only) |
| `components/kyc/wizard/steps/Step7USCompliance.tsx` | Step 7 (US only) |
| `components/kyc/wizard/steps/Step8Suitability.tsx` | Step 8 |
| `components/kyc/wizard/steps/Step9WaiverRisk.tsx` | Step 9 |
| `components/kyc/wizard/steps/Step10ReviewSign.tsx` | Step 10 |

### Constants

| File | Description |
|------|-------------|
| `constants/kyc-document-types.ts` | Document type definitions |

### Bug Fixes

| File | Change |
|------|--------|
| `app/(investor)/versoholdings/tasks/page.tsx` | Added user filter to tasks query |

---

## Architecture Decisions

### Why Entity Members Tables?

1. **Regulatory Requirement**: Must track UBOs, directors, authorized signatories
2. **Document Linking**: KYC documents (passport, ID) belong to specific individuals
3. **Historical Tracking**: `is_active`, `effective_from`, `effective_to` for audit trail
4. **Separate Tables**: Investors vs Counterparties have different parent relationships

### Why Wizard Pattern for Questionnaire?

1. **Complexity**: 10 steps too much for single form
2. **Conditional Logic**: US Person determines visible steps
3. **Progress Saving**: Users can complete over multiple sessions
4. **Validation**: Per-step validation provides better UX
5. **Maintainability**: Each step is isolated component

### Why JSONB Metadata?

1. **Flexibility**: Questionnaire structure may evolve
2. **Version Tracking**: `wizardVersion` field for migrations
3. **Complete History**: All answers stored together
4. **Query Capability**: PostgreSQL JSONB is indexable

---

## Known Limitations & Future Work

### Minor Cleanup Needed

1. **Unused Import**: `Step9WaiverRisk.tsx` has unused `useState` import (line 3)
2. **Schema Enhancement**: `wellInformedBasis` should use `z.enum()` instead of `z.string()`

### Future Enhancements

1. **Document Upload Integration**: Wire up document uploads to member linking
2. **Staff Review UI**: Admin interface for reviewing questionnaire submissions
3. **Email Notifications**: Notify staff when questionnaire submitted
4. **Expiry Tracking**: Alert before KYC documents expire
5. **Bulk Member Import**: CSV import for entity members

---

## Related Changes

This change builds on and relates to:

- **Change #01**: Authentication and query ordering fixes
- **Change #02**: Signature workflow race condition fixes
- **Change #03**: Authentication security hardening

---

## Deployment Notes

### Pre-Deployment

1. Run migration: `20251123000000_fix_onboarding_tasks_automation.sql`
2. Verify task templates exist with `trigger_event = 'investor_created'`
3. Test onboarding flow in staging

### Post-Deployment

1. Verify trigger fires on new user invitations
2. Check investor portal tasks page shows correct tasks
3. Test KYC questionnaire submission flow
4. Monitor for any errors in Supabase logs

---

**End of Change Log #04**
