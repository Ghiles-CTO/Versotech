# VERSO Fee System: Complete Analysis and Refactoring Plan

> **Created**: Day 5 - Based on meeting with Fred
> **Purpose**: Document what exists, what needs to change, and how to get there
> **Status**: Critical refactoring required before production launch

---

## Executive Summary

The current fee system implementation has **fundamental architectural problems** that conflict with Fred's business requirements. The core issue: **Term Sheet should be the backbone of deals**, with Fee Models being manually-created commercial agreements - NOT auto-generated from term sheets.

### Key Findings

| Aspect | Current State | Required State | Gap Severity |
|--------|---------------|----------------|--------------|
| Fee Plan Creation | Auto-generated from term sheet | Manual creation only | **CRITICAL** |
| Global/Default Fee Plans | Allowed | Must be removed | **CRITICAL** |
| Term Sheet → Fee Plan Relationship | Bidirectional sync | One-way derivation | **HIGH** |
| Fee Model Purpose | Investor-facing | Introducer/Partner agreements | **CRITICAL** |
| Fee Value Validation | None | Must be ≤ term sheet values | **HIGH** |
| Introducer Acceptance | Not required | Required before dispatch | **CRITICAL** |
| Certificate/Invoice Trigger | On funded subscription | On deal closing date | **HIGH** |
| Introducer Visibility | Can see term sheet | Cannot see term sheet | **MEDIUM** |

---

## Part 1: What Fred Requires (Target State)

### 1.1 The Correct Hierarchy

```
Deal
 │
 ├── Term Sheet 1 (investor-facing: subscription fees, mgmt fees, performance fees)
 │    │
 │    ├── Fee Model A (for Introducer X: 0% to max term sheet values)
 │    │    └── Linked to Investors referred by Introducer X
 │    │
 │    └── Fee Model B (for Partner Y: 0% to max term sheet values)
 │         └── Linked to Investors referred by Partner Y
 │
 └── Term Sheet 2 (different terms for different investor class)
      │
      └── Fee Model C (for Introducer Z)
           └── Linked to Investors referred by Introducer Z
```

### 1.2 Fred's Key Statements (Source of Truth)

These direct quotes from the meeting define requirements:

> **On Term Sheet as backbone:**
> "In a data model, we really need to have the term sheet as a backbone of a deal."

> **On no global fee plans:**
> "We should never do this because it's a very big risk... We should define every single time the information."

> **On manual creation:**
> "Is it something that is done manually as well?" - "Yes, manually."

> **On acceptance workflow:**
> "The introducer has a possibility to accept it or not to accept it. As soon as he accepts it, it means that the fee model is definitely associated to the introducer for that particular investment opportunity and that particular term sheet."

> **On fee model values:**
> "If the term sheet says 0% subscription fee then the upfront amount in a fee model with the introducer cannot be [more than that]."

> **On dispatch blocking:**
> "Before you dispatch to any investor, the partner needs to agree on a fee model."

> **On visibility:**
> "The term sheet was supposed to be hidden for the introducer... Partner has access [to term sheet]. Introducer does not."

> **On closing date triggers:**
> "It should be linked to the closing both the issuance of the certificate and the request of the invoices."

### 1.3 The Correct Workflow

#### CEO/Staff Creates Deal Structure:
1. Create Deal
2. Create Term Sheet(s) for the deal
   - Define investor fees: subscription %, management %, performance/carried interest %
3. Publish Term Sheet

#### CEO/Staff Creates Fee Model for Introducer/Partner:
4. **Manually** create Fee Model
5. Select the Term Sheet it derives from
6. Select the Introducer OR Partner
7. Set fee percentages (must be ≤ term sheet values)
8. Send Fee Model to Introducer/Partner for acceptance

#### Introducer/Partner Accepts:
9. Introducer/Partner reviews Fee Model
10. Accepts or Rejects
11. Only accepted Fee Models can be used for investor dispatch

#### Dispatch to Investor:
12. Select Term Sheet
13. Select Investor
14. Select Introducer/Partner (who referred investor)
15. System validates Fee Model is accepted
16. System links: Investor ↔ Term Sheet ↔ Fee Model ↔ Introducer/Partner

#### On Deal Close:
17. Closing date triggers:
    - Generate certificates for all funded subscriptions
    - Enable invoice request capability for introducers/partners

---

## Part 2: What Currently Exists (Current State)

### 2.1 Current Database Schema

#### Core Fee Tables:

**`fee_plans`** (the problematic table)
| Column | Type | Purpose | Problem |
|--------|------|---------|---------|
| `id` | uuid | Primary key | OK |
| `deal_id` | uuid | Links to deal | OK |
| `vehicle_id` | uuid | Links to vehicle | OK |
| `name` | text | Plan name | OK |
| `is_default` | boolean | **PROBLEM**: Allows global default | Should not exist |
| `is_active` | boolean | Active flag | OK |
| `partner_id` | uuid | Links to partner | OK (added recently) |
| `introducer_id` | uuid | Links to introducer | OK (added recently) |
| `commercial_partner_id` | uuid | Links to CP | OK (added recently) |
| **MISSING** | - | `term_sheet_id` | **CRITICAL MISSING** |
| **MISSING** | - | `accepted_at`, `accepted_by` | **CRITICAL MISSING** |
| **MISSING** | - | `invoice_requests_enabled` | **MISSING** |

**`deal_fee_structures`** (term sheet table)
| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `deal_id` | uuid | Links to deal |
| `subscription_fee_percent` | numeric | Investor subscription fee |
| `management_fee_percent` | numeric | Investor management fee |
| `carried_interest_percent` | numeric | Performance/carry fee |
| `status` | enum | draft/published/archived |
| `term_sheet_attachment_key` | text | S3 key for PDF |

**`fee_components`** (under fee_plans)
| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `fee_plan_id` | uuid | Links to fee_plan |
| `kind` | enum | subscription/management/performance/spread_markup/flat/bd_fee/finra_fee/other |
| `calc_method` | enum | percent_of_investment/percent_per_annum/etc |
| `rate_bps` | integer | Rate in basis points |
| `frequency` | enum | one_time/annual/quarterly/monthly/on_exit/on_event |

### 2.2 Current Pages & Routes

#### Staff Fee Management:

| Page | Route | Current Behavior | Problem |
|------|-------|------------------|---------|
| Fees Dashboard | `/versotech_main/fees` | 5 tabs: Overview, Fee Plans, Invoices, Schedule, Commissions | OK structure |
| Fee Plans Tab | `FeePlansTab.tsx` | List/create/edit fee plans | Missing term sheet selector, allows global |
| Fee Plan Edit Modal | `FeePlanEditModal.tsx` | Create fee plan with components | **Missing term sheet requirement** |

#### Arranger Fee Management:

| Page | Route | Current Behavior | Problem |
|------|-------|------------------|---------|
| Fee Plans | `/versotech_main/fee-plans` | Arranger creates fee plans for partners/introducers | **No term sheet link required** |
| Send to Partner | `/api/arrangers/me/fee-plans/[id]/send` | Sends fee plan to entity | OK but no acceptance tracking |

#### Partner/Introducer Views:

| Page | Route | Current Behavior | Problem |
|------|-------|------------------|---------|
| My Commissions | `/versotech_main/my-commissions` | View commissions, submit invoices | OK |
| Fee Models | `/api/partners/me/fee-models` | Partners see their fee models | **Also shows term sheets** (introducer shouldn't see) |
| Opportunity Page | Mandate detail | **Introducer can see term sheet** | Should be hidden |

### 2.3 Current Problematic Code

#### Problem 1: Auto-Sync Function

**File**: `src/lib/fees/term-sheet-sync.ts`

```typescript
// PROBLEM: This auto-creates fee plans from term sheets
export async function syncTermSheetToFeePlan(
  supabase: SupabaseClient,
  termSheet: {...},
  dealId: string,
  userId: string
): Promise<{ success: boolean; error?: string; feePlanId?: string }> {
  // Converts term sheet to fee plan automatically
  // Creates fee_components from term sheet percentages
  // THIS SHOULD NOT EXIST - Fee plans must be manual
}
```

**Called from**: `src/app/api/deals/[id]/fee-structures/route.ts`
- When term sheet is published, automatically syncs to fee plan
- **THIS MUST BE REMOVED**

#### Problem 2: Global Fee Plan Option

**File**: `src/components/fees/FeePlanEditModal.tsx`

```typescript
// PROBLEM: Allows creating fee plan without deal
<SelectItem value="none">Global Template</SelectItem>

// No validation that term_sheet_id is required
// No validation that entity (introducer/partner) is required
```

#### Problem 3: No Acceptance Tracking

**Current dispatch flow**: No check for fee model acceptance
- Investors can be dispatched without introducer accepting fee model
- No `accepted_at`, `accepted_by` columns exist

#### Problem 4: Wrong Trigger Timing

**Current**: Certificates generated when subscription is funded
**Required**: Certificates generated when deal closes

**Current**: Invoice capability always available
**Required**: Invoice capability enabled only after deal closes

### 2.4 Current API Endpoints

#### Staff Fee APIs:

| Endpoint | Method | Purpose | Problem |
|----------|--------|---------|---------|
| `/api/staff/fees/plans` | GET/POST | List/create fee plans | No term_sheet_id validation |
| `/api/staff/fees/plans/[id]` | PUT/DELETE | Update/delete fee plan | OK |
| `/api/staff/fees/events` | GET/POST | Manage fee events | OK |
| `/api/staff/fees/invoices` | GET/POST | Manage invoices | OK |
| `/api/staff/fees/invoices/generate` | POST | Generate invoice | OK |

#### Deal Fee APIs:

| Endpoint | Method | Purpose | Problem |
|----------|--------|---------|---------|
| `/api/deals/[id]/fee-plans` | GET/POST | Fee plans for deal | No term_sheet_id validation |
| `/api/deals/[id]/fee-structures` | POST | Create term sheet | **Calls syncTermSheetToFeePlan** |

#### Arranger Fee APIs:

| Endpoint | Method | Purpose | Problem |
|----------|--------|---------|---------|
| `/api/arrangers/me/fee-plans` | GET/POST | Arranger fee plans | No term_sheet_id |
| `/api/arrangers/me/fee-plans/[id]/send` | POST | Send to entity | No acceptance tracking |

#### Missing APIs:

- `POST /api/fee-plans/[id]/accept` - Introducer/partner accepts fee model
- `GET /api/introducers/me/fee-models` - Introducer-specific view (no term sheet)

### 2.5 Current Components

#### Fee Plan Creation:

| Component | File | Current State | Required Changes |
|-----------|------|---------------|------------------|
| `FeePlanEditModal` | `src/components/fees/FeePlanEditModal.tsx` | Creates fee plans with components | Add term sheet selector, entity selector, value validation |
| `create-fee-plan-modal` | `src/components/deals/create-fee-plan-modal.tsx` | Deal-specific fee plan creation | Same changes needed |
| `deal-fee-plans-tab` | `src/components/deals/deal-fee-plans-tab.tsx` | Lists fee plans for deal | Show term sheet link |

#### Partner/Introducer Views:

| Component | File | Current State | Required Changes |
|-----------|------|---------------|------------------|
| `mandate-detail-client` | `src/components/mandates/mandate-detail-client.tsx` | Shows term sheet to all personas | Hide term sheet from introducers |
| `FeeModelView` | `src/components/partner/FeeModelView.tsx` | Partner fee model view | Create introducer variant without term sheet |

---

## Part 3: Gap Analysis - Critical Issues

### 3.1 Critical Architecture Issues

| Issue | Severity | Current | Required |
|-------|----------|---------|----------|
| **Missing term_sheet_id in fee_plans** | CRITICAL | No foreign key | Add column + constraint |
| **Auto-sync creates fee plans** | CRITICAL | `syncTermSheetToFeePlan()` | Remove/deprecate function |
| **Global fee plans allowed** | CRITICAL | `is_default` + no deal required | Require deal + term sheet |
| **No acceptance workflow** | CRITICAL | No columns, no API | Add acceptance tracking |
| **No dispatch validation** | CRITICAL | Dispatch without acceptance check | Block until accepted |

### 3.2 Business Logic Issues

| Issue | Severity | Current | Required |
|-------|----------|---------|----------|
| **Fee values not validated** | HIGH | Any value allowed | Must be ≤ term sheet |
| **Wrong certificate trigger** | HIGH | On funded subscription | On deal close |
| **Wrong invoice trigger** | HIGH | Always available | On deal close |
| **Introducer sees term sheet** | MEDIUM | Visible | Hide from introducers |

### 3.3 Missing Features

| Feature | Priority | Status |
|---------|----------|--------|
| Term sheet selector in fee plan creation | CRITICAL | Not implemented |
| Entity (introducer/partner) selector | CRITICAL | Partially implemented |
| Fee model acceptance API | CRITICAL | Not implemented |
| Acceptance required for dispatch | CRITICAL | Not implemented |
| Deal close handler | HIGH | Not implemented |
| Value validation (fee ≤ term sheet) | HIGH | Not implemented |
| Introducer-specific fee models API | MEDIUM | Not implemented |

---

## Part 4: Detailed Migration Plan

### Phase 1: Database Schema Changes (Priority: CRITICAL)

#### Migration 1: Add term_sheet_id to fee_plans

```sql
-- File: supabase/migrations/YYYYMMDD_add_term_sheet_to_fee_plans.sql

-- Add term_sheet_id foreign key
ALTER TABLE fee_plans
ADD COLUMN IF NOT EXISTS term_sheet_id uuid
REFERENCES deal_fee_structures(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_fee_plans_term_sheet_id
ON fee_plans(term_sheet_id) WHERE term_sheet_id IS NOT NULL;

COMMENT ON COLUMN fee_plans.term_sheet_id IS
'Reference to the term sheet this fee model is derived from.
Fee model values must not exceed term sheet values.';
```

#### Migration 2: Add acceptance tracking

```sql
-- Add acceptance columns
ALTER TABLE fee_plans
ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS accepted_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS signature_data jsonb;

-- Extend status enum
ALTER TABLE fee_plans
DROP CONSTRAINT IF EXISTS fee_plans_status_check;

ALTER TABLE fee_plans
ADD CONSTRAINT fee_plans_status_check
CHECK (status IN ('draft', 'pending_signature', 'sent', 'accepted', 'rejected', 'archived'));

COMMENT ON COLUMN fee_plans.accepted_at IS 'When the introducer/partner accepted this fee model';
COMMENT ON COLUMN fee_plans.accepted_by IS 'User who accepted on behalf of the entity';
```

#### Migration 3: Add invoice capability tracking

```sql
-- Add invoice request capability (enabled on deal close)
ALTER TABLE fee_plans
ADD COLUMN IF NOT EXISTS invoice_requests_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS invoice_requests_enabled_at timestamptz;

COMMENT ON COLUMN fee_plans.invoice_requests_enabled IS
'Whether entity can request invoices. Enabled when deal closes.';
```

#### Migration 4: Add deal close tracking

```sql
-- Track when deal close was processed
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS closed_processed_at timestamptz;

COMMENT ON COLUMN deals.closed_processed_at IS
'When the closing date triggers were processed (certificates, invoice capability)';
```

### Phase 2: Remove Auto-Sync (Priority: CRITICAL)

#### Step 2.1: Deprecate term-sheet-sync.ts

**File**: `src/lib/fees/term-sheet-sync.ts`

```typescript
/**
 * @deprecated Fee models must be manually created. Auto-sync is disabled.
 * This function is kept for backward compatibility but does nothing.
 */
export async function syncTermSheetToFeePlan(
  supabase: SupabaseClient,
  termSheet: {...},
  dealId: string,
  userId: string
): Promise<{ success: boolean; error?: string; feePlanId?: string }> {
  console.warn(
    '[DEPRECATED] syncTermSheetToFeePlan called - auto fee plan generation is disabled. ' +
    'Fee models must be manually created by CEO/staff and linked to term sheets.'
  );
  return { success: true }; // No-op
}
```

#### Step 2.2: Remove sync calls from API

**File**: `src/app/api/deals/[id]/fee-structures/route.ts`

```typescript
// REMOVE this block from POST handler:
if (data.status === 'published') {
  const syncResult = await syncTermSheetToFeePlan(
    serviceSupabase,
    data,
    dealId,
    user.id
  );
  // ...
}

// REMOVE similar block from PATCH handler
```

### Phase 3: UI Changes (Priority: CRITICAL)

#### Step 3.1: Create TermSheetSelector Component

**New File**: `src/components/fees/TermSheetSelector.tsx`

```typescript
interface TermSheetSelectorProps {
  dealId: string;
  value?: string;
  onChange: (termSheetId: string, termSheet: TermSheet) => void;
}

export function TermSheetSelector({ dealId, value, onChange }: TermSheetSelectorProps) {
  // Fetch published term sheets for the deal
  // Display: version, date, fees summary
  // Return selected term sheet for validation
}
```

#### Step 3.2: Create EntitySelector Component

**New File**: `src/components/fees/EntitySelector.tsx`

```typescript
interface EntitySelectorProps {
  dealId: string;
  entityType: 'introducer' | 'partner' | 'commercial_partner';
  value?: string;
  onChange: (entityId: string) => void;
}

export function EntitySelector({ dealId, entityType, value, onChange }: EntitySelectorProps) {
  // Fetch entities dispatched to this deal
  // Filter by entity type
}
```

#### Step 3.3: Update FeePlanEditModal

**File**: `src/components/fees/FeePlanEditModal.tsx`

**Changes Required**:

1. **Remove Global Option**:
```typescript
// REMOVE this:
<SelectItem value="none">Global Template</SelectItem>

// Make deal_id REQUIRED
```

2. **Add Term Sheet Selector**:
```typescript
// Add state
const [selectedTermSheetId, setSelectedTermSheetId] = useState<string | undefined>();
const [selectedTermSheet, setSelectedTermSheet] = useState<TermSheet | null>(null);

// Add to form
<FormField name="term_sheet_id" required>
  <FormLabel>Term Sheet (Required)</FormLabel>
  <TermSheetSelector
    dealId={selectedDealId}
    value={selectedTermSheetId}
    onChange={(id, ts) => {
      setSelectedTermSheetId(id);
      setSelectedTermSheet(ts);
    }}
  />
</FormField>
```

3. **Add Entity Selector**:
```typescript
// Add state
const [entityType, setEntityType] = useState<'introducer' | 'partner' | 'commercial_partner'>();
const [entityId, setEntityId] = useState<string>();

// Add to form
<FormField name="entity_type" required>
  <FormLabel>Entity Type (Required)</FormLabel>
  <Select onValueChange={setEntityType} value={entityType}>
    <SelectItem value="introducer">Introducer</SelectItem>
    <SelectItem value="partner">Partner</SelectItem>
    <SelectItem value="commercial_partner">Commercial Partner</SelectItem>
  </Select>
</FormField>

<FormField name="entity_id" required>
  <FormLabel>{entityTypeLabel} (Required)</FormLabel>
  <EntitySelector
    dealId={selectedDealId}
    entityType={entityType}
    value={entityId}
    onChange={setEntityId}
  />
</FormField>
```

4. **Add Value Validation**:
```typescript
const validateComponentValues = (components: FeeComponent[]): string[] => {
  const errors: string[] = [];

  if (!selectedTermSheet) return errors;

  components.forEach((comp) => {
    const maxBps = getMaxBpsForKind(comp.kind, selectedTermSheet);
    if (comp.rate_bps && comp.rate_bps > maxBps) {
      errors.push(
        `${comp.kind} fee (${bpsToPercent(comp.rate_bps)}%) exceeds term sheet max (${bpsToPercent(maxBps)}%)`
      );
    }
  });

  return errors;
};

// Helper
function getMaxBpsForKind(kind: string, termSheet: TermSheet): number {
  switch (kind) {
    case 'subscription': return (termSheet.subscription_fee_percent || 0) * 100;
    case 'management': return (termSheet.management_fee_percent || 0) * 100;
    case 'performance': return (termSheet.carried_interest_percent || 0) * 100;
    default: return Infinity;
  }
}
```

#### Step 3.4: Update Introducer Opportunity View

**File**: `src/components/mandates/mandate-detail-client.tsx`

```typescript
// Add persona check
const isIntroducer = currentPersona?.type === 'introducer';

// Hide term sheet section for introducers
{!isIntroducer && (
  <TermSheetSection termSheet={termSheet} />
)}
```

### Phase 4: API Changes (Priority: CRITICAL)

#### Step 4.1: Update Fee Plan Creation API

**File**: `src/app/api/deals/[id]/fee-plans/route.ts`

```typescript
const createFeePlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  term_sheet_id: z.string().uuid(), // NOW REQUIRED
  entity_type: z.enum(['introducer', 'partner', 'commercial_partner']),
  entity_id: z.string().uuid(),
  components: z.array(feeComponentSchema).optional()
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  // ... auth ...

  const validatedData = createFeePlanSchema.parse(body);

  // 1. Validate term sheet exists and is published
  const { data: termSheet } = await supabase
    .from('deal_fee_structures')
    .select('*')
    .eq('id', validatedData.term_sheet_id)
    .eq('deal_id', dealId)
    .eq('status', 'published')
    .single();

  if (!termSheet) {
    return NextResponse.json({
      error: 'Term sheet not found or not published'
    }, { status: 400 });
  }

  // 2. Validate component values
  if (validatedData.components) {
    const errors = validateFeeComponents(validatedData.components, termSheet);
    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Fee values exceed term sheet limits',
        details: errors
      }, { status: 400 });
    }
  }

  // 3. Build entity link
  const entityLink = {
    introducer_id: validatedData.entity_type === 'introducer' ? validatedData.entity_id : null,
    partner_id: validatedData.entity_type === 'partner' ? validatedData.entity_id : null,
    commercial_partner_id: validatedData.entity_type === 'commercial_partner' ? validatedData.entity_id : null,
  };

  // 4. Create fee plan
  const { data: feePlan } = await supabase
    .from('fee_plans')
    .insert({
      deal_id: dealId,
      term_sheet_id: validatedData.term_sheet_id,
      ...entityLink,
      name: validatedData.name,
      description: validatedData.description,
      status: 'draft',
      is_active: true,
      created_by: user.id
    })
    .select()
    .single();

  // ... create components ...
}
```

#### Step 4.2: Create Acceptance API

**New File**: `src/app/api/fee-plans/[id]/accept/route.ts`

```typescript
export async function POST(request: NextRequest, { params }: RouteParams) {
  const feePlanId = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Get fee plan
  const { data: feePlan } = await supabase
    .from('fee_plans')
    .select('*, introducer_id, partner_id, commercial_partner_id')
    .eq('id', feePlanId)
    .single();

  if (!feePlan) {
    return NextResponse.json({ error: 'Fee plan not found' }, { status: 404 });
  }

  // 2. Verify user is linked to the entity
  const isAuthorized = await verifyUserEntityAccess(
    supabase,
    user.id,
    feePlan.introducer_id || feePlan.partner_id || feePlan.commercial_partner_id
  );

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // 3. Verify fee plan is in correct status
  if (feePlan.status !== 'sent') {
    return NextResponse.json({
      error: 'Fee plan must be sent before it can be accepted'
    }, { status: 400 });
  }

  // 4. Update to accepted
  const { data: updatedPlan } = await supabase
    .from('fee_plans')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: user.id
    })
    .eq('id', feePlanId)
    .select()
    .single();

  return NextResponse.json({ fee_plan: updatedPlan });
}
```

#### Step 4.3: Update Dispatch API

**File**: `src/app/api/deals/[id]/dispatch/route.ts`

```typescript
// Add to request validation
const dispatchSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1),
  role: z.enum([...]),
  term_sheet_id: z.string().uuid().optional(),
  introducer_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
});

// Add fee model validation when dispatching investor through introducer
if (body.role === 'investor' && (body.introducer_id || body.partner_id)) {
  if (!body.term_sheet_id) {
    return NextResponse.json({
      error: 'Term sheet required when dispatching through introducer/partner'
    }, { status: 400 });
  }

  // Find accepted fee model
  const { data: feeModel } = await supabase
    .from('fee_plans')
    .select('id, status, accepted_at')
    .eq('term_sheet_id', body.term_sheet_id)
    .eq(body.introducer_id ? 'introducer_id' : 'partner_id',
        body.introducer_id || body.partner_id)
    .single();

  if (!feeModel || feeModel.status !== 'accepted') {
    return NextResponse.json({
      error: 'Fee model not accepted',
      message: 'The introducer/partner must accept the fee model before investors can be dispatched.'
    }, { status: 400 });
  }

  // Link fee model to membership
  // ... include fee_plan_id in membership creation
}
```

#### Step 4.4: Create Introducer Fee Models API

**New File**: `src/app/api/introducers/me/fee-models/route.ts`

```typescript
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get introducer ID
  const { data: introducerUser } = await supabase
    .from('introducer_users')
    .select('introducer_id')
    .eq('user_id', user.id)
    .single();

  if (!introducerUser) {
    return NextResponse.json({ error: 'Not an introducer' }, { status: 403 });
  }

  // Get fee models - NO TERM SHEET DATA (introducers can't see term sheets)
  const { data: feeModels } = await supabase
    .from('fee_plans')
    .select(`
      id,
      name,
      description,
      status,
      accepted_at,
      invoice_requests_enabled,
      deal:deal_id (
        id,
        name
      ),
      fee_components (
        id,
        kind,
        rate_bps,
        flat_amount,
        calc_method,
        frequency
      )
    `)
    .eq('introducer_id', introducerUser.introducer_id)
    .eq('is_active', true);

  // NOTE: No term_sheet join - introducers don't see term sheets

  return NextResponse.json({ fee_models: feeModels });
}
```

### Phase 5: Deal Close Handler (Priority: HIGH)

#### Step 5.1: Create Deal Close Handler

**New File**: `src/lib/deals/deal-close-handler.ts`

```typescript
/**
 * Handles deal closing date triggers:
 * 1. Generate certificates for all funded subscriptions
 * 2. Enable invoice request capability for introducers/partners
 */
export async function handleDealClose(
  supabase: SupabaseClient,
  dealId: string,
  closingDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Get all active subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('deal_id', dealId)
      .eq('status', 'active');

    // 2. Generate certificates for funded subscriptions
    for (const sub of subscriptions || []) {
      if (sub.funded_amount > 0) {
        await generateCertificate(supabase, sub);
      }
    }

    // 3. Enable invoice requests for all accepted fee models
    await supabase
      .from('fee_plans')
      .update({
        invoice_requests_enabled: true,
        invoice_requests_enabled_at: closingDate.toISOString()
      })
      .eq('deal_id', dealId)
      .eq('status', 'accepted');

    // 4. Send notifications to introducers/partners
    await notifyEntitiesOfInvoiceCapability(supabase, dealId);

    return { success: true };
  } catch (error) {
    console.error('Error handling deal close:', error);
    return { success: false, error: error.message };
  }
}
```

#### Step 5.2: Create Cron Job

**New File**: `src/app/api/cron/deal-close-check/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date().toISOString().split('T')[0];

  // Find deals closing today that haven't been processed
  const { data: deals } = await supabase
    .from('deals')
    .select('id, name, closing_date')
    .eq('closing_date', today)
    .is('closed_processed_at', null);

  const results = [];

  for (const deal of deals || []) {
    const result = await handleDealClose(
      supabase,
      deal.id,
      new Date(deal.closing_date)
    );

    if (result.success) {
      // Mark as processed
      await supabase
        .from('deals')
        .update({
          closed_processed_at: new Date().toISOString(),
          status: 'closed'
        })
        .eq('id', deal.id);
    }

    results.push({ deal_id: deal.id, ...result });
  }

  return NextResponse.json({
    processed: results.length,
    results
  });
}
```

### Phase 6: Visibility/RLS Updates (Priority: MEDIUM)

#### Step 6.1: Update RLS Policies

```sql
-- Introducers see ONLY their fee models (not term sheets)
DROP POLICY IF EXISTS "introducers_view_fee_plans" ON fee_plans;
CREATE POLICY "introducers_view_fee_plans" ON fee_plans
FOR SELECT USING (
  introducer_id IN (
    SELECT introducer_id FROM introducer_users WHERE user_id = auth.uid()
  )
);

-- Partners see fee models assigned to them
DROP POLICY IF EXISTS "partners_view_fee_plans" ON fee_plans;
CREATE POLICY "partners_view_fee_plans" ON fee_plans
FOR SELECT USING (
  partner_id IN (
    SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
  )
);

-- Partners CAN see term sheets (via deal membership)
DROP POLICY IF EXISTS "partners_view_term_sheets" ON deal_fee_structures;
CREATE POLICY "partners_view_term_sheets" ON deal_fee_structures
FOR SELECT USING (
  deal_id IN (
    SELECT dm.deal_id FROM deal_memberships dm
    JOIN partner_users pu ON pu.user_id = dm.user_id
    WHERE pu.user_id = auth.uid()
  )
  AND status = 'published'
);

-- Introducers CANNOT see term sheets directly (no policy grants access)
-- They only see their fee models via the fee_plans policy above
```

---

## Part 5: Implementation Checklist

### Phase 1: Database & Core (Days 1-2)
- [ ] Migration: Add `term_sheet_id` to `fee_plans`
- [ ] Migration: Add acceptance columns (`accepted_at`, `accepted_by`)
- [ ] Migration: Add `invoice_requests_enabled` flag
- [ ] Migration: Add `closed_processed_at` to deals
- [ ] Deprecate `syncTermSheetToFeePlan()` function
- [ ] Remove sync calls from fee-structures API POST/PATCH

### Phase 2: UI Changes (Days 3-4)
- [ ] Create `TermSheetSelector` component
- [ ] Create `EntitySelector` component
- [ ] Update `FeePlanEditModal` - remove global option
- [ ] Update `FeePlanEditModal` - add term sheet selector (required)
- [ ] Update `FeePlanEditModal` - add entity selector (required)
- [ ] Update `FeePlanEditModal` - add value validation
- [ ] Update `deal-fee-plans-tab.tsx` - show term sheet link
- [ ] Update `mandate-detail-client.tsx` - hide term sheet from introducers

### Phase 3: API Changes (Days 5-6)
- [ ] Update fee-plans POST - require term_sheet_id
- [ ] Update fee-plans POST - require entity_type + entity_id
- [ ] Update fee-plans POST - validate values ≤ term sheet
- [ ] Create `/api/fee-plans/[id]/accept` endpoint
- [ ] Create `/api/introducers/me/fee-models` endpoint (no term sheet)
- [ ] Update `/api/partners/me/fee-models` (include term sheet)

### Phase 4: Workflow Changes (Days 7-8)
- [ ] Update dispatch API - require term_sheet_id for investor dispatch
- [ ] Update dispatch API - require introducer_id/partner_id
- [ ] Update dispatch API - validate fee model is accepted
- [ ] Create `handleDealClose()` function
- [ ] Create cron job for deal close detection
- [ ] Trigger certificates on deal close
- [ ] Enable invoice requests on deal close
- [ ] Send notifications to entities on deal close

### Phase 5: Visibility/RLS (Day 9)
- [ ] Add RLS policy: introducers see only fee models
- [ ] Add RLS policy: partners see fee models + term sheets
- [ ] Update UI: hide term sheet from introducer opportunity page

### Phase 6: Testing (Day 10)
- [ ] Test: Create fee plan requires term sheet
- [ ] Test: Create fee plan requires entity
- [ ] Test: Fee values validated against term sheet
- [ ] Test: Dispatch blocked without accepted fee model
- [ ] Test: Introducers cannot see term sheets
- [ ] Test: Partners can see term sheets
- [ ] Test: Deal close triggers certificates
- [ ] Test: Deal close enables invoice capability

---

## Summary

The current fee system was built with **auto-generation** in mind, but Fred's requirements demand **manual creation** with proper validation and acceptance workflows. This is a fundamental architectural change that affects:

- **4 database migrations**
- **6+ API endpoint changes**
- **5+ UI component updates**
- **New acceptance workflow**
- **New deal close handler**
- **RLS policy updates**

The refactoring is **critical for production launch** as the current system would create incorrect fee associations and potential financial discrepancies.
