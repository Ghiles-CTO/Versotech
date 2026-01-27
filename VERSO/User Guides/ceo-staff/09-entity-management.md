# CEO & Staff Guide: Entity Management

Create and manage entities (companies, trusts, etc.) on the platform.

---

## Overview

Entities are organizations that can invest, arrange, or participate in deals. Management includes creation, configuration, and member management.

---

## Accessing Entity Management

### Navigation

1. Go to **Entities** in left sidebar
2. See all entities
3. Filter and search

### Entity List

Displays:
- Entity name
- Type
- Jurisdiction
- Status
- Members

---

## Creating Entities

### Step 1: Start Creation

1. Click **"+ Add Entity"**
2. Creation form opens

### Step 2: Basic Information

| Field | Required |
|-------|----------|
| **Legal Name** | Yes |
| **Entity Type** | Yes |
| **Jurisdiction** | Yes |
| **Registration Number** | Recommended |

### Entity Types

- Company/Corporation
- Limited Partnership
- Trust
- Family Office
- Foundation
- Other

### Step 3: Additional Details

| Field | Purpose |
|-------|---------|
| **Registered Address** | Official address |
| **Tax ID** | Tax registration |
| **Formation Date** | When established |
| **LEI** | Legal Entity Identifier |

### Step 4: Save Entity

1. Review information
2. Click **"Create Entity"**
3. Entity created
4. Status: `active`

---

## Entity Statuses

| Status | Meaning |
|--------|---------|
| `active` | Can be used |
| `pending_kyc` | Awaiting KYC completion |
| `inactive` | Temporarily disabled |
| `archived` | No longer in use |

---

## Managing Entity Members

### What Are Members

Members are individuals associated with the entity:
- Directors/Trustees
- Authorized Signatories
- Beneficial Owners
- Administrators

### Adding Members

1. Open entity
2. Go to **Members** tab
3. Click **"+ Add Member"**
4. Enter:
   - Name
   - Role
   - Email
   - Ownership % (if applicable)
5. Save

### Member Roles

| Role | Purpose |
|------|---------|
| **Director** | Governance |
| **Signatory** | Can sign documents |
| **UBO** | Ultimate Beneficial Owner |
| **Admin** | Administrative access |

### Signatory Configuration

For investment documents:
1. Identify signatories
2. Ensure accounts exist
3. Link to entity
4. All must sign for entity investments

---

## Entity KYC

### KYC Requirements

Entities need:
- Constitutional documents
- Ownership structure
- UBO identification
- KYC for each UBO

### Tracking KYC

1. Go to entity **KYC** tab
2. See status
3. Review submitted documents
4. Approve or request more

---

## Editing Entities

### Modifying Information

1. Open entity
2. Click **"Edit"**
3. Update fields
4. Save changes

### What Can Change

| Can Edit | Cannot Edit |
|----------|-------------|
| Contact details | Registration number (usually) |
| Address | Jurisdiction |
| Members | Formation date |
| Status | |

### Changes Requiring Documentation

Some changes need supporting docs:
- Name change
- Structure change
- Significant ownership change

---

## Entity Relationships

### Entity Hierarchy

For complex structures:
- Parent entities
- Subsidiary entities
- Structure visualization

### Linking Entities

1. Go to entity **Relationships** tab
2. Add parent or subsidiary
3. Define relationship
4. Document ownership

---

## Entity Documents

### Document Storage

Entity documents stored:
- Constitutional documents
- Board resolutions
- Ownership certificates
- KYC documents

### Managing Documents

1. Go to **Documents** tab
2. Upload new documents
3. Organize by type
4. Track versions

---

## Common Tasks

### Verifying Entity

Before entity can invest:
1. Check KYC complete
2. Verify signatories set up
3. Confirm members correct

### Updating Ownership

When ownership changes:
1. Update member ownership %
2. Add/remove UBOs
3. Update KYC if needed

### Deactivating Entity

If entity no longer needed:
1. Confirm no active investments
2. Change status to `inactive` or `archived`
3. Document reason

---

## Best Practices

### Accuracy

Ensure:
- Legal names exact
- Registration details correct
- Current information

### Completeness

Maintain:
- All required documents
- Complete member list
- Up-to-date ownership

### Regular Review

Periodically:
- Audit entity list
- Verify information current
- Update as needed

---

## Next Steps

1. [Delegation](./10-delegation.md)
2. [Reconciliation & Reporting](./11-reconciliation-reporting.md)
