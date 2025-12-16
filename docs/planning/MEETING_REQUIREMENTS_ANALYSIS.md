# Meeting1.md Requirements Analysis

**Date:** December 16, 2025
**Meeting Duration:** 2 hours 8 minutes
**Attendees:** Fred Demargne (Client), Ghiles Moussaoui (Developer)

This document provides a comprehensive extraction of ALL requirements from the client meeting, compared against the current PHASE2_BASE_PLAN.md, with categorization by phase.

---

## 1. Requirements Already Covered in Plan (Confirmed)

These items from the meeting are already properly addressed in PHASE2_BASE_PLAN.md:

| # | Requirement | Meeting Reference | Plan Section |
|---|-------------|-------------------|--------------|
| 1 | Two portals: `/versotech_main/` + `/versotech_admin/` | Lines 1-50 | Section 1, 8 |
| 2 | Seven personas with entity-user model | Lines 200-500 | Section 2, 3 |
| 3 | `is_signatory` boolean for entity members | Lines 443-471 | Section 6.2, 7 |
| 4 | Partner CAN see investor journey progress (read-only) | Lines 216-224 | Section 9.1 |
| 5 | Commercial Partner CAN execute for clients | Lines 237 | Section 9.2 |
| 6 | Theme: white/blue default with dark mode toggle | Lines 1530-1542 | Section 11.6 |
| 7 | Merge portals approach (not separate per persona) | Lines 261-268 | Section 1 |
| 8 | User linking tables pattern | Lines 1405-1479 | Section 3.2, 6.1 |
| 9 | Profile: KYC vs Compliance split | Lines 363-391 | Section 11.4 |
| 10 | January 10th deadline focus | Lines 279-286 | Implied in scope |

---

## 2. Requirements MISSING from Plan (Must Add)

### 2.1 Database Schema Changes

#### A. NEW TABLE: `companies` (Critical - High Impact)

**Meeting Reference:** Lines 802-814, 968-984, 1005-1007

Fred explicitly states that vehicle and company are SEPARATE entities:
- **Vehicle** = The investment structure (series, compartment) - e.g., "VC2 SCSP Series 215"
- **Company** = The underlying company being invested in - e.g., "Anthropic"

**Required Fields:**
```
companies table:
- id (uuid, primary key)
- legal_name (text)
- address (text) - domicile of the company
- country (text)
- logo_url (text)
- website (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**Relationships to move FROM vehicles TO companies:**
- Stakeholders (lawyers, accountants, auditors, administrators)
- Directors
- Valuations

**Add to vehicles table:**
- `company_id` (uuid, references companies) - Links vehicle to underlying company

**Impact:** This is a structural change that affects:
- Vehicle detail pages
- Investment opportunity creation
- Document generation (subscription packs reference both vehicle AND company)

#### B. NEW FIELD: `deals.stock_type` (Critical)

**Meeting Reference:** Lines 706-724

Fred explains that the same vehicle can have multiple investment opportunities with DIFFERENT stock types:
- Series 215 (Anthropic) could offer: Common Stock, Preferred Stock, Series B Stock

**Current State:** Investment name comes from vehicle, no separate stock type field.

**Required Change:**
```sql
ALTER TABLE deals ADD COLUMN stock_type TEXT;
-- Values: 'common_stock', 'preferred_stock', 'series_a', 'series_b', etc.
```

**UI Impact:** CEO must specify stock type when creating investment opportunity.

#### C. Vehicle REQUIRED for Investment Opportunity

**Meeting Reference:** Lines 932-936

Fred says vehicle should NOT be optional when creating an investment opportunity:
> "it is required because otherwise you told me before the logo...lots of things are coming from the vehicle"

**Required Change:** Make `deals.vehicle_id` required (NOT NULL) in both database and UI validation.

#### D. Maximum Signatories = 10

**Meeting Reference:** Line 595

> "we should put a maximum of 10 maybe, but more likely it will be two or three"

**Impact:** UI templates for subscription packs must handle up to 10 signature blocks.

---

### 2.2 Subscription Pack Workflow (CRITICAL - Overrides Julian)

**Meeting Reference:** Lines 605-648

Fred explicitly overrules the draft-first approach that Julian described:

> "what we are trying to do is to make it as standard as possible. So what we want is as soon as the investor says I want to invest $1 million he clicks on it if all the checks that we have done before are okay then immediately it's generating the subscription pack"

**Current Assumption (WRONG):** Draft → CEO Review → Final → Sign
**Correct Workflow:** Click "Invest" → Auto-generate → Goes to signing queue immediately

#### Workflow Details:

1. Investor clicks "Invest $X"
2. System checks prerequisites (KYC complete, NDA signed, etc.)
3. System auto-generates subscription pack with:
   - All entity signatories identified
   - CEO signature block(s)
   - All dynamic fields populated
4. System creates signature requests for ALL signatories
5. Goes directly to signing queue (NO draft review step)
6. If comments needed, handled AFTER first version shared (not before)

#### NDA vs Subscription Pack Signature Handling:

**Meeting Reference:** Lines 539-546

- **NDA:** One NDA per signatory (multiple NDAs for entity with multiple signatories)
- **Subscription Pack:** ONE pack with MULTIPLE signature blocks

> "for the subscription document, for the subscription pack, it needs to be one pack with multiple scenarios [signatories]"

---

### 2.3 Data Room Access Rule (Entity-Level)

**Meeting Reference:** Lines 513-527

Fred clarifies the data room access rule:

> "the access of data room is a bit different but it's going to be open so for the data room to be accessible ALL the users who are signatory for an entity needs to have signed"

**Rule:** ALL signatories of an entity must sign NDA before ANY entity user can access data room.

**Logic:**
1. Entity has 3 signatories
2. All 3 must sign NDA
3. THEN all users (signatories + non-signatories) linked to entity get data room access
4. Address used in NDA = ENTITY address (not individual address)

---

### 2.4 KYC Requirements

#### A. Fresh KYC for Launch

**Meeting Reference:** ~Line 357 (implied from discussion context)

The platform should treat all KYC as needing re-submission for the launch.

**Impact:** Plan should include KYC reset/re-request strategy.

#### B. KYC Document Type Cleanup

**Meeting Reference:** Lines 1260-1276

Fred says NDA and DNC should NOT be in KYC document types:
> "NDA...that's not a that's a that's a mistake. It's not a KYC and NDA"

**Correct KYC Document Types (for entities):**
- Incorporation Certificate
- Memorandum of Association
- Register of Members
- Register of Directors
- ID for each member
- Proof of Address for each member
- Bank confirmation (for wire instructions)

**NOT KYC documents:**
- NDA (investment document)
- DNC (investment document)
- Questionnaire (compliance, not KYC)

#### C. Terminology: "Utility bill" → "Proof of Address"

**Meeting Reference:** Lines 1294-1298

> "Instead of utility bills, you need to say proof of address... And utility bill is one example"

---

### 2.5 Introducer Process Details

**Meeting Reference:** Lines 201-207

The introducer process requires fee agreement BEFORE introduction:

> "the introducer needs to agree And then if he agrees, he's going to be able to introduce us to a user into the platform"

**Process:**
1. CEO sends fee proposal to introducer (e.g., "1% fee on total investment")
2. Introducer AGREES to fee terms
3. THEN introducer can either:
   - Invite user directly (requires CEO approval), OR
   - Send contact details to VERSO (VERSO invites)

**Key Distinction from Partner:**
> "for the partner and the client there is no such process...the partner will tell us so we're just going to invite him"

---

### 2.6 CEO Entity Structure

**Meeting Reference:** Lines 479-509

Fred confirms CEO is an ENTITY (not just a role):

> "So you know we're going to when we launch we have one issuer one CEO company which is Verso Capital. Verso Capital will have probably three users Julian, myself and Ashish. Julian is the only one that can sign documents."

**CEO Entity:**
- Entity Name: VERSO Capital
- Users: Julian (signatory), Fred (non-signatory), Ashish (non-signatory)
- All users have same access EXCEPT signing capability

**Implication:** Consider creating `ceo_entities` + `ceo_users` tables, OR use existing organization structure with `is_signatory` flag.

---

### 2.7 Terminology/UI Changes

#### A. "Investors" tab → "Subscriptions" tab (Vehicle Detail)

**Meeting Reference:** Lines 1031-1039

Fred says the tab showing investors on a vehicle should be called "Subscriptions":
> "instead of investor it should be subscriptions"

Because:
- Subscription = in-progress investment journey
- Position = completed/funded investment

#### B. "Entity" → "Vehicle" Terminology

**Meeting Reference:** Lines 778-779

> "instead of entity, we need to say...maybe vehicle is the right term"

The UI currently shows "Entities" for series/compartments. Should be "Vehicles".

#### C. Processes Tab → Admin Portal

**Meeting Reference:** Lines 1554-1560

The "Processes" feature (automations) should be in the Admin Portal, not Main Portal.

---

### 2.8 Entity/Counterparty Consolidation

**Meeting Reference:** Lines 1217-1222, 1317-1320

Fred clarifies that "entity" and "counterparty" are the SAME thing conceptually:
> "there is no difference whatsoever between entity as an investor and what before was called investor counterparty"

**Current State:** Separate `investors` (with type=entity) and `investor_counterparties` tables.

**Fred's Direction:** One unified concept. For launch, keep current structure but understand they're the same. Refactor post-launch.

> "I just care about having one table which has all the entity information"

---

### 2.9 Post-Launch Refactoring (Acknowledged)

**Meeting Reference:** Lines 1395-1399, 1463-1469

Fred acknowledges the database structure needs refactoring after launch:
> "for the launch we should leave it like this but we should probably refactor it moving forward"

> "after that we going to need to do some refactoring because here we are multiplying tables which we don't need"

**Implication:** Plan should note this as technical debt to be addressed post-launch.

---

### 2.10 Notifications Multi-Persona Support

**Meeting Reference:** Lines 1491-1497

> "when you add the other type of users so for one action for one trigger you will have multiple notification and notification will not be the same"

**Implication:** Notification system must support persona-specific messaging for the same event.

---

## 3. Phase Categorization

### Phase 1: Database Schema (Must Add)

| Item | Type | Effort |
|------|------|--------|
| Create `companies` table | New table | 2-3 hours |
| Add `deals.stock_type` field | New field | 30 min |
| Make `deals.vehicle_id` required | Schema change | 30 min |
| Add `vehicles.company_id` foreign key | New field | 30 min |
| Move stakeholders/directors/valuations to company level | Migration | 2-4 hours |

**Total Additional Phase 1:** ~6-8 hours

### Phase 2: Auth & Portal (No Changes Needed)

Current plan covers this adequately.

### Phase 3: Investor Journey (Must Add)

| Item | Type | Effort |
|------|------|--------|
| Subscription pack auto-generation (no draft step) | Workflow change | 4-6 hours |
| Multiple signatories per subscription pack | Template update | 3-4 hours |
| Entity-level data room access logic | RLS + logic | 2-3 hours |
| Stock type field in deal creation UI | UI update | 1-2 hours |

**Total Additional Phase 3:** ~10-15 hours

### Phase 4: UI/UX (Must Add)

| Item | Type | Effort |
|------|------|--------|
| KYC document type cleanup | Enum update | 1 hour |
| "Proof of Address" terminology | UI text | 30 min |
| "Subscriptions" tab in vehicle detail | UI rename | 30 min |
| "Vehicles" terminology (not "Entities") | UI rename | 30 min |

**Total Additional Phase 4:** ~2.5 hours

### Phase 6: Introducer Features (Must Add)

| Item | Type | Effort |
|------|------|--------|
| Introducer agreement must precede introduction | Logic | 2-3 hours |
| Block introduction until agreement signed | UI + API | 1-2 hours |

**Total Additional Phase 6:** ~3-5 hours

### New: KYC Reset Strategy (Recommend as Phase 0)

| Item | Type | Effort |
|------|------|--------|
| Plan KYC re-submission for existing users | Strategy | 1 hour |
| Add KYC reset trigger/notification | Feature | 2-3 hours |

**Total Phase 0:** ~3-4 hours

---

## 4. Impact on Timeline

Current plan: 160 hours over 20 days

Additional work identified: ~25-35 hours

**Options:**
1. **Extend timeline** to 22-23 days
2. **Defer some items** to post-launch (companies table refactor is most complex)
3. **Increase daily hours** (not recommended for quality)

**Recommendation:** Add the critical items (subscription pack workflow, stock_type field, data room access logic) and defer the companies table full implementation to post-launch. Use a simpler approach for launch:
- Keep stakeholders/directors/valuations on vehicles for now
- Add `companies` table and migrate data post-launch

---

## 5. Questions Resolved by Meeting

| Question | Answer | Reference |
|----------|--------|-----------|
| Can Commercial Partner sign for clients? | YES | Line 237 |
| Subscription pack: draft or auto-generate? | AUTO-GENERATE (no draft) | Lines 605-648 |
| Theme default? | Light (white/blue), dark optional | Lines 1530-1542 |
| Vehicle required for deals? | YES | Lines 932-936 |
| Entity vs Counterparty difference? | SAME THING | Lines 1217-1222 |
| Multiple signatories allowed? | YES, up to 10 | Lines 595 |
| Data room access granularity? | Entity-level (all signatories sign) | Lines 513-527 |
| Partner vs Introducer visibility? | Partner sees more than Introducer | Lines 201-224 |

---

## 6. Summary: Action Items for Plan Update

### MUST ADD to Phase 1:
1. `deals.stock_type` field
2. Make `deals.vehicle_id` required

### MUST ADD to Phase 3:
1. Auto-generate subscription pack workflow (CRITICAL)
2. Multiple signatories per subscription pack
3. Entity-level data room access logic
4. Stock type in deal creation UI

### MUST ADD to Phase 4:
1. KYC document type cleanup
2. Terminology updates (Proof of Address, Vehicles, Subscriptions)

### MUST ADD to Phase 6:
1. Introducer agreement prerequisite for introduction

### DEFER to Post-Launch:
1. Full `companies` table with migration
2. Entity/Counterparty consolidation refactoring
3. Notification multi-persona optimization

### ADD to Plan Documentation:
1. Subscription pack workflow (auto-generate, not draft)
2. Data room access rule (entity-level, all signatories)
3. CEO entity structure (VERSO Capital with 3 users)
4. Post-launch refactoring acknowledgment

---

**END OF DOCUMENT**
