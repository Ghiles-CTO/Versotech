# Holdings Documents Page PRD — Investor Portal

**Version:** 2.0  
**Product:** VERSO Holdings Investor Portal  
**Audience:** Business stakeholders, Product managers, Engineers  
**Last Updated:** January 2025

---

## Executive Summary

The Holdings Documents page is a secure, organized file repository where investors access all documents related to their fund investments. Documents are categorized into intuitive folders (Agreements, KYC, Position Statements, NDAs, Reports) for easy navigation, similar to a personal filing cabinet.

**Key Change from v1.0:** This version focuses exclusively on holdings (fund investments) and uses a category-based folder structure instead of grouping by deals or vehicles. Deal-specific documents are excluded and will be accessed through the Deals section separately.

---

## Part 1: Business Context (Non-Technical)

### What is the Holdings Documents Page?

The Holdings Documents page is your personal document vault for all fund investment paperwork. Instead of seeing a long list of files, documents are organized into folders by type—just like you'd organize physical files in a filing cabinet. You click on a folder (e.g., "Agreements") to see all your agreements, then download what you need.

### Why Does It Matter?

**For Investors:**
- **Quick navigation**: Click "Position Statements" to see all your statements—no searching through hundreds of files
- **Logical organization**: Documents grouped the way you think about them (agreements, reports, statements, etc.)
- **Clean interface**: Only see holdings documents; deal documents are in a separate section
- **Secure access**: Every download is watermarked and tracked for compliance
- **Always current**: Real-time updates when new documents are uploaded

**For VERSO Operations:**
- **Reduced confusion**: Investors know exactly where to find each document type
- **Lower support volume**: Self-service folder structure eliminates "where do I find X?" questions
- **Compliance guarantee**: Complete audit trail of every document access
- **Efficient uploads**: Staff categorize documents once; system handles the rest

### Who Uses It?

**Primary Users:**
- **Fund investors**: Individuals or entities invested in VERSO's main funds
- **Investor advisors**: Accountants, lawyers, financial advisors accessing client documents
- **Family office representatives**: Staff managing investments on behalf of principals

**Out of Scope:**
- **Deal participants**: Co-investors in specific deals use the Deals section instead
- **Prospective investors**: Documents here require active subscription

### Core Use Cases

**1. Quarterly Statement Download**
Sarah invests in VERSO Fund I. At quarter-end, she logs in, clicks "Position Statements," and sees her new Q4 2024 statement at the top of the list. She downloads it—automatically watermarked with her name and timestamp—and forwards it to her accountant.

**2. Tax Season Preparation**
Marcus needs all his tax documents from 2024. He clicks "Reports," filters his view (mentally or via search), and downloads all K-1s and tax statements. Each download is logged for regulatory compliance.

**3. Agreement Review for Audit**
Lisa's auditor needs her original subscription agreement from 2022. She clicks "Agreements," scrolls to find the subscription agreement, and downloads the signed PDF. The system logs who accessed it and when, satisfying audit requirements.

**4. KYC Document Update**
John needs to verify what KYC documents VERSO has on file. He clicks "KYC Documents" and sees his passport copy, proof of address, and source of funds declaration. Everything is organized and easy to review.

**5. NDA Verification**
An investor needs to verify the terms of an NDA signed before receiving confidential information. She clicks "NDAs," finds the document from the signing date, and reviews the terms.

### Document Categories Explained

All holdings documents are organized into five folders:

**1. Agreements** 📝
- Subscription agreements
- Limited partnership agreements
- Side letters
- Amendment agreements
- Any contractual documents

**2. KYC Documents** 📋
- Know Your Customer verification files
- Passport/ID copies
- Proof of address
- Source of funds declarations
- Beneficial ownership documents

**3. Position Statements** 📊
- Quarterly position statements
- Capital call notices
- Distribution notices
- Account summaries
- Transaction confirmations

**4. NDAs** 🔒
- Non-disclosure agreements
- Confidentiality agreements
- Information access agreements

**5. Reports** 📈
- Quarterly performance reports
- Annual reports
- Tax documents (K-1s, schedules)
- Investment memos
- Special notices

### Key Features (Business Language)

**Folder-Based Navigation:**
- Five clear category folders on the main page
- Click any folder to see documents in that category
- Each folder shows document count badge
- Visual icons and color coding for quick recognition

**Clean Document Lists:**
- Documents sorted newest first
- Clear file names
- Download button for each document
- Back button to return to folders

**Security & Compliance:**
- Every download watermarked with investor name and timestamp
- Download links expire after 15 minutes
- Complete audit trail: who accessed what, when, from where
- No direct file access—all downloads through secure gateway

**Holdings Focus:**
- Only shows documents related to fund investments
- Deal-specific documents excluded (accessed via Deals section)
- Clear separation prevents confusion

**Real-Time Updates:**
- New documents appear immediately when uploaded
- Visual notification when new document added
- No need to refresh page

### Business Rules

**Document Visibility:**
- Investors see only documents for funds they're invested in
- Documents tied to inactive subscriptions still visible (for record-keeping)
- No cross-investor visibility—strict data isolation

**Document Types Mapping:**
- System automatically categorizes documents based on type
- Staff select type during upload; system places in correct folder
- If document doesn't fit categories, goes to "Reports" by default

**Access Control:**
- Must be authenticated investor portal user
- Must have active or past subscription to at least one VERSO fund
- Advisors see same documents as their principals

**Compliance Requirements:**
- BVI FSC: All accesses logged, documents retained 7+ years
- GDPR: Access logs available for data subject requests, right to deletion honored
- Watermarking: Prevents unauthorized redistribution
- Audit trail: Hash-chained immutable logs for regulatory reviews

---

## Part 2: Technical Implementation

### Architecture Overview

**Page Structure:**
- **Single page application**: `/versoholdings/documents`
- **Server component**: Fetches initial data server-side for performance
- **Client component**: Manages category selection state
- **No routing changes**: State managed in React, not URL

**Component Hierarchy:**
```
page.tsx (Server Component)
  └─ CategorizedDocumentsClient (Client Component)
       ├─ Category View (main folders)
       └─ Document List View (when folder selected)
            └─ DocumentCard (individual document)
```

### Data Model

**Documents Table Schema:**
```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_investor_id uuid references investors(id),
  owner_user_id uuid references profiles(id),
  vehicle_id uuid references vehicles(id),
  deal_id uuid references deals(id),
  type text not null,  -- Subscription/Statement/KYC/Tax/Report/NDA/Agreement
  file_key text not null,
  watermark jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index idx_documents_vehicle_type on documents(vehicle_id, type, created_at desc);
create index idx_documents_created_at on documents(created_at desc);
```

**Holdings Filter Logic:**
```sql
-- Only fetch holdings documents (vehicle-scoped, not deal-scoped)
SELECT * FROM documents
WHERE vehicle_id IS NOT NULL  -- Must be tied to a vehicle
  AND deal_id IS NULL         -- Must NOT be deal-specific
ORDER BY created_at DESC;
```

**Category Mapping:**
```typescript
const DOCUMENT_CATEGORIES = {
  agreements: {
    name: 'Agreements',
    types: ['Subscription', 'Agreement', 'subscription', 'agreement']
  },
  kyc: {
    name: 'KYC Documents',
    types: ['KYC', 'kyc']
  },
  statements: {
    name: 'Position Statements',
    types: ['Statement', 'statement', 'capital_call']
  },
  ndas: {
    name: 'NDAs',
    types: ['NDA', 'nda']
  },
  reports: {
    name: 'Reports',
    types: ['Report', 'report', 'Tax', 'tax', 'memo']
  }
}
```

### Server Component (page.tsx)

**Purpose**: Fetch data server-side, pass to client component

**Implementation:**
```typescript
export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ /* ... */ }>
}) {
  const resolvedSearchParams = await searchParams // Next.js 15 requirement
  const supabase = await createClient()
  
  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/versoholdings/login')
  
  // 2. Get investor links
  const { data: investorLinks } = await supabase
    .from('investor_users')
    .select('investor_id')
    .eq('user_id', user.id)
  
  const investorIds = investorLinks.map(l => l.investor_id)
  
  // 3. Get vehicles for display
  const { data: vehicleData } = await supabase
    .from('subscriptions')
    .select('vehicle_id, vehicles!inner(id, name, type)')
    .in('investor_id', investorIds)
    .eq('status', 'active')
  
  const vehicles = vehicleData
    ?.map(v => v.vehicles)
    .filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i) // dedupe
    || []
  
  // 4. Fetch holdings documents only (RLS enforced)
  const { data: documentsData } = await supabase
    .from('documents')
    .select(`
      id, type, file_key, created_at, watermark,
      vehicle_id, deal_id, owner_investor_id,
      created_by_profile:created_by(display_name, email),
      investors:owner_investor_id(id, legal_name),
      vehicles:vehicle_id(id, name, type),
      deals:deal_id(id, name, status)
    `, { count: 'exact' })
    .not('vehicle_id', 'is', null)  // Only vehicle-scoped
    .is('deal_id', null)             // Exclude deals
    .order('created_at', { ascending: false })
  
  // 5. Transform to Document type
  const documents = documentsData?.map(doc => ({
    id: doc.id,
    type: doc.type,
    file_name: doc.file_key.split('/').pop(),
    file_key: doc.file_key,
    created_at: doc.created_at,
    created_by: doc.created_by_profile,
    scope: {
      investor: doc.investors,
      vehicle: doc.vehicles
    },
    watermark: doc.watermark
  })) || []
  
  return (
    <AppLayout brand="versoholdings">
      <CategorizedDocumentsClient
        initialDocuments={documents}
        vehicles={vehicles}
      />
    </AppLayout>
  )
}
```

### Client Component (CategorizedDocumentsClient)

**State Management:**
```typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
```

**Document Grouping:**
```typescript
// Filter holdings only
const holdingsDocuments = useMemo(() => {
  return initialDocuments.filter(doc => 
    doc.scope.vehicle && !doc.scope.deal
  )
}, [initialDocuments])

// Group by category
const categorizedDocuments = useMemo(() => {
  const grouped = {
    agreements: [],
    kyc: [],
    statements: [],
    ndas: [],
    reports: []
  }
  
  holdingsDocuments.forEach(doc => {
    const category = getCategoryForDocumentType(doc.type)
    if (category && grouped[category]) {
      grouped[category].push(doc)
    }
  })
  
  return grouped
}, [holdingsDocuments])
```

**View Logic:**
```typescript
// Category view: Show folders
if (!selectedCategory) {
  return <CategoryFolderView />
}

// Document list view: Show documents in selected category
return <DocumentListView 
  category={selectedCategory}
  documents={categorizedDocuments[selectedCategory]}
/>
```

### Document Download Flow

**Existing API Endpoint:** `POST /api/documents/:id/download`

**Flow:**
1. User clicks download button on document card
2. Client calls `/api/documents/{id}/download`
3. Server verifies RLS access
4. Server generates 15-minute pre-signed URL from Supabase Storage
5. Server logs access to audit table
6. Server returns URL + watermark metadata
7. Client shows watermark toast notification
8. Client opens URL in new tab (triggers browser download)

**Code:**
```typescript
const handleDownload = async (documentId: string) => {
  const response = await fetch(`/api/documents/${documentId}/download`, {
    method: 'POST'
  })
  
  const { download_url, watermark, expires_in_seconds } = await response.json()
  
  toast.info(`Watermarked with: ${watermark.downloaded_by}`)
  window.open(download_url, '_blank')
  toast.success(`Link expires in ${expires_in_seconds / 60} minutes`)
}
```

### RLS Policies

**Documents Read Policy:**
```sql
create policy documents_read_entitled on documents for select
using (
  -- Vehicle-scoped: user has subscription to vehicle
  (vehicle_id is not null and exists (
    select 1 from subscriptions s
    join investor_users iu on iu.investor_id = s.investor_id
    where s.vehicle_id = documents.vehicle_id
      and iu.user_id = auth.uid()
  ))
  -- Investor-scoped: user linked to investor
  or (owner_investor_id is not null and exists (
    select 1 from investor_users iu
    where iu.investor_id = documents.owner_investor_id
      and iu.user_id = auth.uid()
  ))
  -- User-scoped: document owner
  or owner_user_id = auth.uid()
  -- Staff: see everything
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role like 'staff_%'
  )
);
```

### Security Implementation

**Watermarking:**
```json
{
  "uploaded_by": "John Smith (staff)",
  "uploaded_at": "2025-01-15T10:30:00Z",
  "document_classification": "CONFIDENTIAL",
  "verso_holdings_notice": "Property of VERSO Holdings - Authorized Use Only",
  "compliance_notice": "Subject to BVI FSC regulation and GDPR",
  "original_filename": "Q4_2024_Statement.pdf",
  "file_hash": "sha256:abc123..."
}
```

**Runtime Watermark (on download):**
```json
{
  "downloaded_by": "Sarah Johnson",
  "downloaded_at": "2025-01-20T14:22:00Z",
  "document_id": "uuid",
  "access_token": "hex-token"
}
```

**Audit Logging:**
```typescript
await auditLogger.log({
  actor_user_id: user.id,
  action: AuditActions.DOCUMENT_DOWNLOAD,
  entity: AuditEntities.DOCUMENTS,
  entity_id: document.id,
  metadata: {
    file_key: document.file_key,
    document_type: document.type,
    category: getCategoryForDocumentType(document.type),
    user_role: profile.role,
    vehicle_name: document.vehicles?.name,
    ip_address: request.headers.get('x-forwarded-for'),
    user_agent: request.headers.get('user-agent')
  }
})
```

### UI Components

**CategoryFolderView:**
- Grid of 5 folder cards (3 columns on desktop)
- Each card shows: icon, category name, document count
- Color-coded: blue, green, purple, red, indigo
- Click handler: `setSelectedCategory(categoryId)`
- Holdings overview section showing all vehicles
- Security compliance notice

**DocumentListView:**
- Breadcrumb navigation: Home → Category Name
- Back button to return to folders
- Category header with icon and count
- List of DocumentCard components
- Empty state if no documents
- Security notice at bottom

**DocumentCard:**
- Document icon (based on type)
- File name (truncated if long)
- Metadata badges: type, vehicle, date
- Uploaded by attribution
- Watermark indicator
- Download button with loading state

### Performance Optimizations

**Database Indexes:**
```sql
create index idx_documents_vehicle_type 
  on documents(vehicle_id, type, created_at desc);

create index idx_documents_created_at 
  on documents(created_at desc);
```

**Client-Side Optimizations:**
- `useMemo` for document grouping (prevents recalculation on every render)
- `useMemo` for holdings filtering
- Lazy loading: only fetch documents needed for selected category (future enhancement)
- No pagination needed yet (most investors have < 100 documents)

**Server-Side Rendering:**
- Initial page load server-rendered for SEO and performance
- Data fetched once on server, hydrated to client
- No client-side waterfall requests

### Error Handling

**Server Errors:**
```typescript
// No documents found (not an error—show empty folders)
if (!documentsData || documentsData.length === 0) {
  return <CategorizedDocumentsClient initialDocuments={[]} vehicles={[]} />
}

// Database error
if (documentsError) {
  console.error('Documents query error:', documentsError)
  // Still render page with empty state
}
```

**Client Errors:**
```typescript
// Download fails
catch (error) {
  if (response.status === 404) {
    toast.error('Document not found or access denied')
  } else if (response.status === 401) {
    router.push('/versoholdings/login')
  } else {
    toast.error('Failed to download. Please try again.')
  }
}
```

**RLS Security:**
- RLS blocks access: returns 404 (not 403, to avoid leaking document existence)
- Pre-signed URL generation fails: return 500 with generic error
- Expired session: redirect to login

### Testing Requirements

**Unit Tests:**
- `getCategoryForDocumentType()` returns correct category for each type
- `groupDocumentsByScope()` filters holdings correctly
- Document count calculations accurate

**Integration Tests:**
- Server component fetches only holdings documents (no deals)
- RLS enforces access control (user A can't see user B's docs)
- Category grouping works for all document types

**E2E Tests:**
```typescript
test('investor can navigate folders and download documents', async () => {
  await login('investor@example.com')
  await page.goto('/versoholdings/documents')
  
  // Should see category folders
  expect(page.locator('[data-testid="category-folder"]').count()).toBe(5)
  
  // Click Agreements folder
  await page.click('text=Agreements')
  
  // Should see breadcrumb
  expect(page.locator('text=Holdings Documents')).toBeVisible()
  expect(page.locator('text=Agreements')).toBeVisible()
  
  // Should see documents
  expect(page.locator('[data-testid="document-card"]').count()).toBeGreaterThan(0)
  
  // Download first document
  await page.click('[data-testid="download-btn"]:first-child')
  
  // Should show watermark notification
  expect(page.locator('text=watermarked')).toBeVisible()
  
  // Should trigger download
  const download = await page.waitForEvent('download')
  expect(download.suggestedFilename()).toBeTruthy()
})

test('holdings documents exclude deals', async () => {
  await login('investor@example.com')
  await page.goto('/versoholdings/documents')
  
  // Check all documents visible
  await page.click('text=Reports')
  const documents = page.locator('[data-testid="document-card"]')
  const count = await documents.count()
  
  // Verify none are deal documents
  for (let i = 0; i < count; i++) {
    const scope = await documents.nth(i).locator('[data-testid="doc-scope"]').textContent()
    expect(scope).not.toContain('Deal')
  }
})
```

### Migration & Deployment

**Current State:**
- New page structure (categorized folders)
- Existing API endpoints unchanged
- Database schema unchanged
- RLS policies unchanged

**Deployment Steps:**
1. Deploy new client component code
2. Deploy updated server component
3. No database migrations needed
4. No API changes needed
5. Test in production with real user

**Backwards Compatibility:**
- Existing download endpoints still work
- Existing audit logging still works
- URL structure unchanged (`/versoholdings/documents`)
- No user data migration needed

**Rollback Plan:**
- If issues occur, revert to previous component
- No database changes to roll back
- No API changes to roll back

### Future Enhancements (Not MVP)

**Search & Filtering:**
- Search bar to filter documents by name
- Date range filters
- Vehicle-specific filters
- Save filter preferences

**Document Preview:**
- Inline PDF preview modal
- Thumbnail generation for quick identification
- Full-text search within PDFs

**Bulk Operations:**
- Select multiple documents
- Bulk download as ZIP
- Batch delete (for staff)

**Advanced Features:**
- Document versioning (track updates to same document)
- Document comments/notes (investor annotations)
- Share links with external parties
- Email document links
- Mobile app with offline access

**Analytics:**
- Most accessed document types
- Average time to first download
- Documents never downloaded (flag for review)

---

## Acceptance Criteria

**Must Have for MVP:**
- ✅ Investor sees 5 category folders on main page
- ✅ Each folder shows accurate document count
- ✅ Clicking folder shows documents in that category
- ✅ Breadcrumb navigation works (Home → Category)
- ✅ Back button returns to folders
- ✅ Only holdings documents shown (deals excluded)
- ✅ Download generates 15-minute pre-signed URL
- ✅ Every download logged to audit_log
- ✅ Watermark metadata displayed before download
- ✅ RLS blocks access to unauthorized documents (404 response)
- ✅ Empty state shown when category has no documents
- ✅ Security notice visible on all views
- ✅ Mobile responsive layout
- ✅ Page loads in <2 seconds with 100 documents

**Security Validation:**
- ✅ Cannot access other investor's documents via API manipulation
- ✅ Pre-signed URL expires after 15 minutes
- ✅ Regenerating URL creates new audit log entry
- ✅ Deal documents not visible in holdings view
- ✅ Unauthenticated requests return 401

**Compliance Validation:**
- ✅ Audit log includes: user ID, document ID, timestamp, IP, user agent
- ✅ Watermark shows investor name and download time
- ✅ Document access history available for GDPR requests
- ✅ All operations logged with hash-chain integrity

---

## Success Metrics

**Usage Metrics:**
- Category click-through rate (which folders most used)
- Average documents downloaded per investor per quarter
- Time from login to first download
- Percentage of investors using self-service vs. requesting via email
- Most accessed document types by category

**Performance Metrics:**
- Page load time: <2s for 50th percentile
- Document list render time: <500ms
- Pre-signed URL generation: <500ms
- Category grouping calculation: <100ms

**Business Metrics:**
- Reduction in "where is my document X?" support tickets
- Investor satisfaction score for document access experience
- Compliance audit findings: zero document access violations
- Staff time saved on manual document distribution

---

## Open Questions & Decisions

### ✅ Resolved

1. **Deal vs. Holdings Separation**
   - **Decision**: Separate completely. Holdings documents page shows only vehicle-scoped documents. Deal documents accessed via Deals section.
   - **Rationale**: Cleaner mental model, reduces confusion

2. **Category Structure**
   - **Decision**: 5 fixed categories (Agreements, KYC, Statements, NDAs, Reports)
   - **Rationale**: Covers 95% of document types, simple to understand

3. **Navigation Pattern**
   - **Decision**: Client-side state (no URL routing)
   - **Rationale**: Faster navigation, simpler implementation, single page experience

### 🔄 Pending

1. **Document Search**
   - **Question**: Should we add search bar in MVP or defer to v2.1?
   - **Recommendation**: Defer unless user testing shows strong need

2. **Vehicle Filtering**
   - **Question**: Should investors be able to filter by specific vehicle?
   - **Recommendation**: Not needed if most investors have 1-2 vehicles; add if >3 vehicles common

3. **Download History**
   - **Question**: Should investors see their own download history?
   - **Recommendation**: Nice-to-have for v2.1, not critical for MVP

4. **Category Customization**
   - **Question**: Should category names/icons be configurable by staff?
   - **Recommendation**: No, fixed categories are cleaner and easier to maintain

---

## Technical Debt & Monitoring

**Known Limitations (Post-MVP):**
- No pagination (will be needed if investors have >200 documents)
- No document preview (requires PDF.js integration)
- Watermark is metadata-only (not visually embedded in PDF)
- No virus scanning on upload
- No CDN caching for storage (Supabase Storage native CDN only)

**Monitoring Needed:**
- Pre-signed URL expiry rate (are 15 min sufficient?)
- Category distribution (are some categories empty for most users?)
- RLS policy performance (add query timing)
- Storage costs per document type
- Audit log growth rate (plan archival strategy)

**Future Optimization Opportunities:**
- Add cursor-based pagination for large document sets
- Implement document preview with PDF.js
- Add visual watermarking (PDF manipulation)
- Implement CDN for faster global access
- Add full-text search with Elasticsearch/Algolia

---

## Glossary

**Holdings**: Investment vehicles (funds) that investors have subscribed to, as opposed to one-time deal participations.

**Category**: One of five document type groups (Agreements, KYC, Statements, NDAs, Reports).

**Vehicle**: A VERSO fund or investment vehicle (e.g., "VERSO Fund I", "Real Empire Fund").

**Deal**: A one-time investment opportunity offered to select investors (excluded from this page).

**RLS**: Row Level Security—database-level access control that ensures users only see their own data.

**Pre-signed URL**: Temporary download link that expires after 15 minutes for security.

**Watermark**: Metadata (and future: visual) marking on documents showing who downloaded and when.

**Audit Trail**: Immutable log of all document access events for compliance.

---

**Document Version History:**
- v2.0 (January 2025): Complete rewrite for categorized folder structure, holdings-only focus
- v1.0 (January 2025): Initial PRD with data room structure, holdings + deals mixed
