# Document Systems Separation: documents vs deal_data_room_documents

**Date:** 2025-01-20
**Status:** Active Architecture Decision
**Purpose:** Explain the separation between the two document management systems

---

## Executive Summary

The VERSOTECH platform maintains **TWO distinct document management systems**:

1. **General Documents System** (`documents` table) - For permanent, published investor/vehicle/entity documents
2. **Deal Data Room System** (`deal_data_room_documents` table) - For temporary, access-controlled deal documents

This separation is **intentional and should be maintained** for the following reasons:

- Different access control models (permanent vs. time-limited)
- Different visibility workflows (published vs. investor-visible flag)
- Different organizational structures (hierarchical folders vs. simple string folders)
- Different use cases (long-term records vs. deal lifecycle)

---

## System 1: General Documents (`documents` table)

### Purpose
Permanent document storage for investor-facing materials that persist beyond deal lifecycles.

### Use Cases
- Investor quarterly statements
- Annual tax documents (K-1s)
- Vehicle performance reports
- Subscription agreements (finalized)
- KYC/AML documentation
- Legal notices and disclosures
- Entity formation documents

### Key Characteristics

| Aspect | Details |
|--------|---------|
| **Scope** | Multi-level: investor, vehicle, entity, OR deal |
| **Access Model** | Published/unpublished with RLS based on ownership |
| **Lifespan** | Permanent - documents remain after deal closes |
| **Visibility** | `is_published` boolean + status workflow |
| **Organization** | Hierarchical folders (optional, advanced feature) |
| **Versioning** | Supported via `document_versions` table |
| **Storage Bucket** | `documents` |
| **Download Expiry** | 15 minutes |
| **Audit Logging** | Yes, server-side |

### Database Schema (Simplified)

```sql
documents (
  id uuid PRIMARY KEY,
  name text,
  type text,
  file_key text,  -- Storage path

  -- Multi-scope (choose one or more)
  owner_investor_id uuid,
  owner_user_id uuid,
  vehicle_id uuid,
  entity_id uuid,
  deal_id uuid,  -- Can reference deals, but not primary use case

  -- Organization
  folder_id uuid → document_folders,
  tags text[],

  -- Publication workflow
  status text,  -- draft, pending_approval, approved, published, archived
  is_published boolean,
  published_at timestamptz,

  -- Metadata
  watermark jsonb,
  current_version int,

  -- External links
  external_url text,
  link_type text
)
```

### Access Control

**Staff:**
- Full access to all documents
- Can upload, edit, delete, publish

**Investors:**
- Read-only access
- Only see documents where:
  - `is_published = true` AND
  - They have an ownership relationship (investor_id, vehicle subscription, entity position, or deal membership)

### Workflows

#### Upload Workflow
```
1. Staff uploads file via /api/documents/upload
2. File stored in 'documents' bucket
3. Document record created with status='draft', is_published=false
4. Initial version created in document_versions
5. Audit log entry created
6. Staff can later publish (set is_published=true)
```

#### Download Workflow
```
1. User requests /api/documents/[id]/download
2. RLS checks access permissions
3. Generate 15-minute pre-signed URL
4. Log audit event with user details
5. Return URL with watermark info
```

---

## System 2: Deal Data Room (`deal_data_room_documents` table)

### Purpose
Temporary, access-controlled document storage for active deal due diligence and closing processes.

### Use Cases
- Term sheets (draft versions)
- Due diligence materials
- Financial projections
- Legal documents during negotiation
- Confidential investor presentations
- NDA-protected materials
- Deal-specific fee structures

### Key Characteristics

| Aspect | Details |
|--------|---------|
| **Scope** | Deal-only (single deal_id foreign key) |
| **Access Model** | Explicit grant via `deal_data_room_access` table |
| **Lifespan** | Temporary - typically deleted/archived after deal closes |
| **Visibility** | `visible_to_investors` boolean (simple flag) |
| **Organization** | String-based folders (no hierarchy) |
| **Versioning** | Self-referential replacement via `replaced_by_id` |
| **Storage Bucket** | `deal-documents` |
| **Download Expiry** | 2 minutes |
| **Audit Logging** | Yes, server-side (as of 2025-01-20 fix) |

### Database Schema (Simplified)

```sql
deal_data_room_documents (
  id uuid PRIMARY KEY,
  deal_id uuid NOT NULL,  -- Single scope: deals only

  file_key text,
  file_name text,
  folder text,  -- Simple string, not FK

  -- Access control
  visible_to_investors boolean DEFAULT false,

  -- Versioning
  version int DEFAULT 1,
  replaced_by_id uuid → deal_data_room_documents,

  -- Metadata
  metadata_json jsonb,
  document_notes text,
  document_expires_at timestamptz,
  tags text[],

  created_by uuid,
  created_at timestamptz
)
```

### Access Control System

Access is managed via a **separate access table**:

```sql
deal_data_room_access (
  id uuid PRIMARY KEY,
  deal_id uuid,
  investor_id uuid,

  granted_by uuid,
  granted_at timestamptz,

  expires_at timestamptz,  -- Time-based expiry
  revoked_at timestamptz,  -- Manual revocation
  revoked_by uuid,

  auto_granted boolean,  -- Automated vs. manual grant
  notes text,
  last_warning_sent_at timestamptz  -- Expiry warnings
)
```

**Staff:**
- Full access to all deal documents
- Can upload, manage folders, set visibility

**Investors:**
- Must have **active access grant** in `deal_data_room_access`:
  - `revoked_at IS NULL`
  - `expires_at IS NULL OR expires_at > now()`
- Can only see documents where `visible_to_investors = true`

### Workflows

#### Upload Workflow
```
1. Staff uploads file via /api/deals/[id]/documents/upload
2. File stored in 'deal-documents' bucket with path: deals/{dealId}/{folder}/{filename}
3. Document record created with visible_to_investors=false (default)
4. Audit log entry created
5. Staff manually sets visible_to_investors=true when ready
```

#### Access Grant Workflow
```
1. Staff grants data room access via /api/deals/[id]/data-room-access
2. Creates deal_data_room_access record
3. Optional: Set expires_at for time-limited access
4. Investor can now see visible documents
5. Automated warnings sent before expiry
6. Access can be revoked anytime
```

#### Download Workflow (Fixed 2025-01-20)
```
1. Investor requests /api/deals/[id]/documents/[documentId]/download
2. Verify investor has active data room access
3. Verify document.visible_to_investors = true
4. Generate 2-minute pre-signed URL
5. Log audit event with deal context
6. Return URL with watermark info
```

---

## Key Differences

| Feature | documents | deal_data_room_documents |
|---------|-----------|--------------------------|
| **Primary Use** | Long-term investor records | Deal due diligence |
| **Scope** | Multi-entity (investor, vehicle, entity, deal) | Deal-only |
| **Access Model** | Published + ownership-based RLS | Explicit grant + visibility flag |
| **Lifecycle** | Permanent | Temporary (deal lifecycle) |
| **Folder System** | Hierarchical (optional) | Flat string-based |
| **Versioning** | Full version history table | Simple replacement chain |
| **Storage Bucket** | `documents` | `deal-documents` |
| **URL Expiry** | 15 minutes | 2 minutes (more secure) |
| **Access Expiry** | N/A | Supported via `expires_at` |
| **Revocation** | N/A (unpublish instead) | Supported via `revoked_at` |
| **Approval Workflow** | Supported (status field) | Not needed |
| **Scheduled Publishing** | Supported | Not needed |

---

## Why Keep Them Separate?

### 1. Different Security Models

**Documents:**
- Once published, permanently visible to entitled investors
- Access based on ownership relationships
- No time limits

**Deal Data Rooms:**
- Temporary, revocable access
- Time-limited (expiring URLs and access grants)
- NDA-like confidentiality
- Can revoke access if deal falls through

### 2. Different Organizational Needs

**Documents:**
- Need structured organization (folders)
- Long-term categorization
- Search by type, tags
- Part of permanent investor record

**Deal Data Rooms:**
- Quick folder organization (string-based is sufficient)
- Temporary grouping by deal phase
- Will be archived/deleted after deal closes

### 3. Different Workflows

**Documents:**
- Draft → Review → Approve → Publish cycle
- Version control for regulatory compliance
- Scheduled publishing for reports

**Deal Data Rooms:**
- Upload → Mark visible → Grant access
- Replace outdated files
- Expire access after deal closes

### 4. Different Performance Characteristics

**Documents:**
- Larger dataset (grows over years)
- Needs efficient indexing for search
- Higher query complexity (multi-scope joins)

**Deal Data Rooms:**
- Smaller dataset per deal
- Simple queries (single deal_id filter)
- Can be archived/purged after deal lifecycle

### 5. Different Compliance Requirements

**Documents:**
- Must retain for 7+ years (regulatory)
- Full audit trail of versions
- Watermarking for legal protection

**Deal Data Rooms:**
- Temporary retention
- Audit trail of who accessed when
- Expiry tracking for NDA compliance

---

## When to Use Which System?

### Use `documents` for:
- ✅ Quarterly investor statements
- ✅ Annual tax documents (K-1s)
- ✅ Finalized subscription agreements
- ✅ Fund performance reports
- ✅ Legal notices to all investors
- ✅ KYC/AML documentation
- ✅ Entity formation documents
- ✅ Any document that outlives a deal

### Use `deal_data_room_documents` for:
- ✅ Draft term sheets
- ✅ Due diligence materials
- ✅ Confidential investor presentations
- ✅ Deal-specific financial projections
- ✅ Legal documents under negotiation
- ✅ NDA-protected materials
- ✅ Documents that expire when deal closes

### Gray Areas (Consider Context):

**Finalized Term Sheets:**
- During deal: `deal_data_room_documents`
- After closing: Copy to `documents` for permanent record

**Subscription Agreements:**
- During signing: `deal_data_room_documents`
- After execution: `documents` (permanent investor record)

**Fee Structures:**
- Deal-specific: `deal_data_room_documents`
- Standard vehicle fees: `documents`

---

## Implementation Details

### Storage Buckets

```env
# Normal documents
STORAGE_BUCKET_NAME=documents
NEXT_PUBLIC_STORAGE_BUCKET_NAME=documents

# Deal data room documents
DEAL_DOCUMENTS_BUCKET=deal-documents
NEXT_PUBLIC_DEAL_DOCUMENTS_BUCKET=deal-documents
```

### API Endpoints

**Documents:**
- `GET /api/documents` - List/search documents
- `POST /api/documents/upload` - Upload file
- `POST /api/documents/link` - Link external document
- `GET /api/documents/[id]/download` - Download with audit

**Deal Data Rooms:**
- `POST /api/deals/[id]/documents/upload` - Upload to data room
- `GET /api/deals/[id]/documents/[documentId]/download` - Download with audit
- `GET /api/deals/[id]/data-room-access` - Manage access grants
- `POST /api/deals/[id]/data-room-access` - Grant/revoke access

### RLS Policies

**Documents Table:**
- Staff: Full access
- Investors: Published documents they own/subscribe to

**Deal Data Room Documents Table:**
- Staff: Full access
- Investors: Visible documents in deals with active access grants

**Storage Buckets:**
- `documents`: Authenticated read (RLS enforced at API)
- `deal-documents`: Investor read requires active data room access

---

## Migration Strategy

### DO NOT Unify

Attempting to unify these systems would:
- ❌ Complicate access control logic
- ❌ Mix permanent and temporary data
- ❌ Confuse workflows
- ❌ Reduce security granularity
- ❌ Complicate data retention policies

### Instead, Maintain Separation

For deals that close:
1. Keep deal data room documents in `deal_data_room_documents`
2. Copy important finalized documents to `documents` table
3. Mark deal data room as archived (don't delete for audit)
4. Revoke investor access to data room
5. Investors access finalized documents via `documents` system

---

## Best Practices

### For Staff Users

1. **Use Documents System For:**
   - Anything investors need long-term access to
   - Regulatory/compliance documents
   - Regular reports (quarterly, annual)

2. **Use Deal Data Room For:**
   - Active deal materials
   - Time-sensitive information
   - Materials under NDA
   - Documents that will change during deal process

3. **Lifecycle Management:**
   - Start deals with data room documents
   - Grant temporary access to interested investors
   - After deal closes, move finalized docs to documents system
   - Revoke data room access
   - Archive (don't delete) data room for audit trail

### For Developers

1. **Document Creation:**
   - Always specify clear scope (investor_id, vehicle_id, etc.)
   - Set appropriate status/visibility flags
   - Include descriptive names and metadata

2. **Access Control:**
   - Never bypass RLS checks
   - Always use API endpoints for downloads (audit logging)
   - Respect expiry times and revocations

3. **Testing:**
   - Test both staff and investor access
   - Test access expiry and revocation
   - Test across deal lifecycle stages

---

## Future Considerations

### Potential Enhancements

**Documents System:**
- Complete folder hierarchy UI
- Advanced version comparison
- Scheduled publishing automation
- Full-text search
- Document preview

**Deal Data Rooms:**
- Virtual data room packages (bundle download)
- Access analytics (who viewed what)
- Automated NDA tracking
- Watermark embedding in PDFs
- Download restrictions (view-only mode)

### Keeping Them Separate Allows:
- Independent feature development
- Different performance optimizations
- Separate data retention policies
- Clear security boundaries

---

## Conclusion

The separation between `documents` and `deal_data_room_documents` is a **deliberate architectural decision** that:

- ✅ Provides appropriate security models for different use cases
- ✅ Simplifies access control logic for each domain
- ✅ Aligns with business workflows (permanent vs. temporary)
- ✅ Allows independent optimization and enhancement
- ✅ Maintains clear compliance and audit trails

**Do not attempt to unify these systems.** The complexity of merging would outweigh any perceived benefits of consolidation.

---

**End of Document**
