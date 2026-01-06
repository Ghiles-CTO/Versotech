# PERSONA FIELDS IMPLEMENTATION STATE
> This file tracks the state of persona KYC fields implementation.
> **CRITICAL**: Reference this file when context is compacted to maintain continuity.

## LAST UPDATED: 2026-01-06

---

## REQUIRED INDIVIDUAL USER FIELDS (From User Requirements)

### Personal Information
- [x] First Name - `first_name`
- [x] Middle Name - `middle_name`
- [ ] Middle Initial - NOT IN DB (user said minor, skip)
- [x] Last Name - `last_name`
- [x] Suffix - `name_suffix`
- [x] Date of Birth - `date_of_birth`
- [x] Country of Birth - `country_of_birth`
- [x] Nationality - `nationality`

### Contact Information
- [x] Mobile Number - `phone_mobile`
- [x] Office Number - `phone_office`
- [x] Email - `email`

### Residential Address
- [x] Street Address - `residential_street`
- [x] Address Line 2 - `residential_line_2`
- [x] City - `residential_city`
- [x] State/Province - `residential_state`
- [x] Postal Code - `residential_postal_code`
- [x] Country - `residential_country`

### Tax Information
- [x] US Citizen Check - `is_us_citizen`
- [x] US Taxpayer Check - `is_us_taxpayer`
- [x] US Taxpayer ID - `us_taxpayer_id`
- [x] Country of Tax Residency - `country_of_tax_residency`
- [x] Tax ID Number - `tax_id_number`

### Identification Documents
- [x] ID Type - `id_type`
- [x] ID Number - `id_number`
- [x] ID Issue Date - `id_issue_date`
- [x] ID Expiry Date - `id_expiry_date`
- [x] ID Issuing Country - `id_issuing_country`

### Proof of Address
- [x] Proof of Address Date - `proof_of_address_date`
- [x] Proof of Address Expiry - `proof_of_address_expiry`

### Entity Member Specific (for Directors/UBOs/Signatories)
- [x] Role - `role`
- [x] Ownership Percentage - `ownership_percentage`
- [x] Is Beneficial Owner - `is_beneficial_owner`
- [x] Is Signatory - `is_signatory`
- [x] Signature Specimen URL - `signature_specimen_url`

---

## REQUIRED ENTITY USER FIELDS (From User Requirements)

### Company Information
- [x] Company Name - `legal_name` / `company_name` / `firm_name`
- [x] Registration Number - `registration_number`
- [x] Country of Incorporation - `country_of_incorporation`
- [x] Tax ID - `tax_id`

### Company Address
- [x] Address Line 1 - `address_line_1`
- [x] Address Line 2 - `address_line_2`
- [x] City - `city`
- [x] State/Province - `state_province`
- [x] Postal Code - `postal_code`
- [x] Country - `country`

### Beneficial Owners (UBOs with >25% ownership)
- [x] Name - stored in `*_members` tables with `is_beneficial_owner=true`
- [x] Ownership % - `ownership_percentage` in member tables

### Required Certificates (tracked via KYC documents)
- [x] Certificate of Incorporation - `incorporation_certificate`
- [x] Register of Directors - `register_directors`
- [x] Certificate of Good Standing - `certificate_of_good_standing`
- [x] Certificate of Incumbency - `certificate_of_incumbency`
- [x] Register of Members - `register_members`
- [x] Beneficial Ownership Declaration - `beneficial_ownership`

---

## DATABASE STATUS BY TABLE

### Entity Tables (for type='individual' personas)

| Table | All Individual KYC Fields | Status |
|-------|--------------------------|--------|
| `investors` | first_name, middle_name, last_name, name_suffix, date_of_birth, country_of_birth, nationality, phone_mobile, phone_office, residential_*, is_us_citizen, is_us_taxpayer, us_taxpayer_id, country_of_tax_residency, tax_id_number, id_type, id_number, id_issue_date, id_expiry_date, id_issuing_country | ✅ COMPLETE |
| `arranger_entities` | Same fields | ✅ COMPLETE |
| `partners` | Same fields + residential address | ✅ COMPLETE |
| `introducers` | Same fields + residential address | ✅ COMPLETE |
| `lawyers` | Entity-only (law firms don't have individual KYC) | ✅ N/A |
| `commercial_partners` | Same fields | ✅ COMPLETE |

### Member Tables (for entity members - Directors/UBOs/Signatories)

| Table | All Individual KYC Fields | Status |
|-------|--------------------------|--------|
| `investor_members` | ALL fields present | ✅ COMPLETE |
| `arranger_members` | ALL fields present | ✅ COMPLETE |
| `partner_members` | ALL fields present | ✅ COMPLETE |
| `introducer_members` | ALL fields present | ✅ COMPLETE |
| `lawyer_members` | ALL fields present | ✅ COMPLETE |
| `commercial_partner_members` | ALL fields present | ✅ COMPLETE |

---

## API STATUS

### Profile APIs (for Individual-type Persona KYC)

| API Route | Supports All Individual Fields | Status |
|-----------|-------------------------------|--------|
| `/api/investors/me` | Yes (via EntityKYCEditDialog) | ✅ COMPLETE |
| `/api/arrangers/me/profile` | Yes - all individual + entity fields | ✅ COMPLETE |
| `/api/partners/me` | Yes - all individual + residential | ✅ COMPLETE |
| `/api/introducers/me/profile` | Yes - all individual + residential | ✅ COMPLETE |
| `/api/lawyers/me/profile` | Entity fields only (appropriate) | ✅ COMPLETE |
| `/api/commercial-partners/me/profile` | NEED TO VERIFY | ❓ CHECK |

### Member APIs (for Entity Member KYC - Directors/UBOs/Signatories)

| API Route | CRUD Operations | Status |
|-----------|----------------|--------|
| `/api/investors/me/members` | GET, POST | ✅ EXISTS |
| `/api/investors/me/members/[memberId]` | GET, PATCH, DELETE | ✅ EXISTS |
| `/api/arrangers/me/members` | - | ❌ MISSING - CREATE |
| `/api/arrangers/me/members/[memberId]` | - | ❌ MISSING - CREATE |
| `/api/partners/me/members` | - | ❌ MISSING - CREATE |
| `/api/partners/me/members/[memberId]` | - | ❌ MISSING - CREATE |
| `/api/introducers/me/members` | - | ❌ MISSING - CREATE |
| `/api/introducers/me/members/[memberId]` | - | ❌ MISSING - CREATE |
| `/api/lawyers/me/members` | - | ❌ MISSING - CREATE |
| `/api/lawyers/me/members/[memberId]` | - | ❌ MISSING - CREATE |
| `/api/commercial-partners/me/members` | - | ❌ MISSING - CREATE |
| `/api/commercial-partners/me/members/[memberId]` | - | ❌ MISSING - CREATE |

---

## UI COMPONENT STATUS

### Reusable KYC Form Components (ALL EXIST AND ARE COMPLETE)

| Component | Location | Status |
|-----------|----------|--------|
| `PersonalInfoFormSection` | `src/components/kyc/personal-info-form-section.tsx` | ✅ EXISTS |
| `AddressFormSection` | `src/components/kyc/address-form-section.tsx` | ✅ EXISTS |
| `TaxInfoFormSection` | `src/components/kyc/tax-info-form-section.tsx` | ✅ EXISTS |
| `IdentificationFormSection` | `src/components/kyc/identification-form-section.tsx` | ✅ EXISTS |
| `MemberKYCEditDialog` | `src/components/shared/member-kyc-edit-dialog.tsx` | ✅ EXISTS - HAS ALL FIELDS |
| `EntityKYCEditDialog` | `src/components/shared/entity-kyc-edit-dialog.tsx` | ✅ EXISTS |

### Profile Page UI Integration

| Profile Page | Individual KYC Edit | Entity Member Edit | Status |
|--------------|--------------------|--------------------|--------|
| `investor-profile-client.tsx` | Uses EntityKYCEditDialog | Uses investor-members-tab (BASIC FORM) | ⚠️ NEEDS FIX |
| `arranger-profile-client.tsx` | Uses EntityKYCEditDialog | NO MEMBER TAB | ❌ NEEDS MEMBER TAB |
| `partner-profile-client.tsx` | VERIFY | NO MEMBER TAB | ❌ NEEDS MEMBER TAB |
| `introducer-profile-client.tsx` | VERIFY | NO MEMBER TAB | ❌ NEEDS MEMBER TAB |
| `lawyer-profile-client.tsx` | N/A (entity only) | NO MEMBER TAB | ❌ NEEDS MEMBER TAB |
| `commercial-partner-profile-client.tsx` | VERIFY | NO MEMBER TAB | ❌ NEEDS MEMBER TAB |

### Member Tabs Status

| Component | Uses MemberKYCEditDialog | Status |
|-----------|-------------------------|--------|
| `investor-members-tab.tsx` | NO - uses basic inline form | ❌ NEEDS UPDATE |
| Arranger members tab | DOES NOT EXIST | ❌ CREATE |
| Partner members tab | DOES NOT EXIST | ❌ CREATE |
| Introducer members tab | DOES NOT EXIST | ❌ CREATE |
| Lawyer members tab | DOES NOT EXIST | ❌ CREATE |
| Commercial partner members tab | DOES NOT EXIST | ❌ CREATE |

---

## IMPLEMENTATION TASKS

### TASK 1: Update investor-members-tab.tsx to use MemberKYCEditDialog
- File: `src/components/profile/investor-members-tab.tsx`
- Change: Replace inline dialog with MemberKYCEditDialog
- API: Already exists at `/api/investors/me/members/[memberId]`
- Status: ❌ TODO

### TASK 2: Create Arranger Member APIs
- Create: `src/app/api/arrangers/me/members/route.ts` (GET, POST)
- Create: `src/app/api/arrangers/me/members/[memberId]/route.ts` (GET, PATCH, DELETE)
- Table: `arranger_members`
- Status: ❌ TODO

### TASK 3: Create Partner Member APIs
- Create: `src/app/api/partners/me/members/route.ts` (GET, POST)
- Create: `src/app/api/partners/me/members/[memberId]/route.ts` (GET, PATCH, DELETE)
- Table: `partner_members`
- Status: ❌ TODO

### TASK 4: Create Introducer Member APIs
- Create: `src/app/api/introducers/me/members/route.ts` (GET, POST)
- Create: `src/app/api/introducers/me/members/[memberId]/route.ts` (GET, PATCH, DELETE)
- Table: `introducer_members`
- Status: ❌ TODO

### TASK 5: Create Lawyer Member APIs
- Create: `src/app/api/lawyers/me/members/route.ts` (GET, POST)
- Create: `src/app/api/lawyers/me/members/[memberId]/route.ts` (GET, PATCH, DELETE)
- Table: `lawyer_members`
- Status: ❌ TODO

### TASK 6: Create Commercial Partner Member APIs
- Create: `src/app/api/commercial-partners/me/members/route.ts` (GET, POST)
- Create: `src/app/api/commercial-partners/me/members/[memberId]/route.ts` (GET, PATCH, DELETE)
- Table: `commercial_partner_members`
- Status: ❌ TODO

### TASK 7: Create Generic Entity Members Tab Component
- Create: `src/components/profile/generic-entity-members-tab.tsx`
- Uses: MemberKYCEditDialog
- Props: entityType, entityId, apiEndpoint
- Status: ❌ TODO

### TASK 8: Add Members Tab to Arranger Profile
- File: `src/components/arranger/arranger-profile-client.tsx`
- Add: Members tab using generic component
- Status: ❌ TODO

### TASK 9: Add Members Tab to Partner Profile
- File: `src/components/partner/partner-profile-client.tsx`
- Add: Members tab using generic component
- Status: ❌ TODO

### TASK 10: Add Members Tab to Introducer Profile
- File: `src/components/introducer/introducer-profile-client.tsx`
- Add: Members tab using generic component
- Status: ❌ TODO

### TASK 11: Add Members Tab to Lawyer Profile
- File: `src/components/lawyer/lawyer-profile-client.tsx`
- Add: Members tab using generic component
- Status: ❌ TODO

### TASK 12: Add Members Tab to Commercial Partner Profile
- Verify file location and add members tab
- Status: ❌ TODO

### TASK 13: Verify Commercial Partner Profile API
- Check if `/api/commercial-partners/me/profile` exists with all individual fields
- Status: ❌ TODO

---

## REFERENCE FILES

### Existing Complete Components (USE AS TEMPLATES)
- `/api/investors/me/members/route.ts` - Template for member list API
- `/api/investors/me/members/[memberId]/route.ts` - Template for member CRUD API
- `member-kyc-edit-dialog.tsx` - Complete dialog with ALL fields
- `entity-kyc-edit-dialog.tsx` - Complete dialog for individual-type entities

### KYC Document Types
- `src/constants/kyc-document-types.ts` - 40+ document types defined

### Database Tables
- All `*_members` tables have identical schema with all KYC fields

---

## PROGRESS TRACKER

- [x] Database audit complete
- [x] API audit complete
- [x] UI component audit complete
- [x] State file created
- [ ] TASK 1: Update investor-members-tab
- [ ] TASK 2: Arranger member APIs
- [ ] TASK 3: Partner member APIs
- [ ] TASK 4: Introducer member APIs
- [ ] TASK 5: Lawyer member APIs
- [ ] TASK 6: Commercial partner member APIs
- [ ] TASK 7: Generic entity members tab
- [ ] TASK 8: Arranger profile members tab
- [ ] TASK 9: Partner profile members tab
- [ ] TASK 10: Introducer profile members tab
- [ ] TASK 11: Lawyer profile members tab
- [ ] TASK 12: Commercial partner profile members tab
- [ ] TASK 13: Verify commercial partner profile API

---

## NOTES

1. The `MemberKYCEditDialog` component is COMPLETE and has ALL required fields organized into 5 tabs:
   - Role (role selection, ownership %)
   - Personal (first_name, middle_name, last_name, name_suffix, date_of_birth, country_of_birth, nationality, email, phone_mobile, phone_office)
   - Address (residential_street, residential_line_2, residential_city, residential_state, residential_postal_code, residential_country)
   - Tax (is_us_citizen, is_us_taxpayer, us_taxpayer_id, country_of_tax_residency, tax_id_number)
   - ID (id_type, id_number, id_issue_date, id_expiry_date, id_issuing_country)

2. The dialog accepts an `apiEndpoint` prop, making it reusable across all personas.

3. Lawyers are entity-only (law firms), so they don't need individual KYC fields on the main entity, but they DO need member management for firm partners/associates.

4. `entity_notice_contacts` table exists for contact for notices functionality.
