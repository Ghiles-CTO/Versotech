# PRD: Staff Document Management System

## Problem Statement

The current Staff Documents page is unusable:
- Navigation is confusing (flat folder list with no business context)
- No clear relationship between documents and business entities (vehicles, deals, investors)
- Hard to find documents without knowing exact folder location
- UI is broken (hardcoded dark theme, layout issues)
- Search is client-side and will break at scale
- Features exist in code but have no UI (versioning, watermarks, tags)

Staff spend too much time searching for documents instead of managing them.

---

## Users

**Primary**: CEO and Staff members (all part of the CEO entity)

**Frequency**: Daily use for document management tasks

---

## Vision

**"Google Drive for Versotech"** — A unified document management system where staff can organize, find, and manage all platform documents with intuitive hierarchy, powerful search, and professional features.

---

## User Needs (Prioritized)

| Need | Priority |
|------|----------|
| Find documents quickly via hierarchy or search | P0 |
| Upload documents to any folder | P0 |
| Navigate via always-visible tree sidebar | P0 |
| Organize with drag-and-drop | P0 |
| Preview documents without downloading | P1 |
| Bulk operations (move, delete, download) | P1 |
| Tag documents for organization | P1 |
| View document version history | P1 |
| See watermarks on confidential docs | P2 |

---

## Information Architecture

### Business Hierarchy

Documents belong to business entities in this order:

```
🏢 Parent Vehicle (REAL Empire, VERSO Capital 1 SCSP)
├── 📁 Agreements/
├── 📁 NDAs/
├── 📁 Reports/
├── 📁 KYC Documents/
│
└── 📦 Compartment (Series 101, Compartment 1)
    ├── 📁 Compartment-level folders/
    │
    └── 💼 Deals/
        └── 💼 Deal Name
            ├── 📁 Data Room/     ← virtual folder (from deal_data_room_documents table)
            ├── 📁 Legal/
            └── 👤 Investors/
                └── 👤 Investor Name/
                    └── Their subscription docs
```

### Compartment Grouping (Name Parsing)

No `parent_vehicle_id` exists in database. Parse vehicle names to infer hierarchy:

| Pattern | Rule |
|---------|------|
| `type = fund` or `securitization` | Parent vehicle |
| `"Real Empire Capital Compartment X"` | Child of "REAL Empire" |
| `"VERSO Capital 1 SCSP Series XXX"` | Child of virtual "VERSO Capital 1 SCSP" |
| No pattern match | Create virtual parent from extracted prefix |

### Two Document Tables (Kept Separate)

| Table | Purpose | Managed By |
|-------|---------|------------|
| `documents` | General documents (86 columns) | Staff Documents page |
| `deal_data_room_documents` | Deal-specific data room | Deal detail page |

**Integration**: Data Room appears as a **virtual folder** under each deal in the tree, but data stays in its own table.

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔍 Search documents...                    [+ Upload]  [Bulk ▼]     │
├───────────────────────┬──────────────────────────────────────────────┤
│                       │                                              │
│  TREE SIDEBAR         │  BREADCRUMB                                  │
│  (always visible)     │  📍 REAL Empire > Comp 1 > Deal Alpha        │
│  ─────────────────    │  ────────────────────────────────────────────│
│                       │                                              │
│  🏢 REAL Empire       │  FOLDERS                     [Grid│List] ↕️  │
│  ├─ 📁 Agreements (3) │  ┌────────────┐ ┌────────────┐              │
│  ├─ 📁 NDAs (2)       │  │ 📁 Data    │ │ 📁 Legal   │              │
│  ├─ 📁 Reports (1)    │  │    Room    │ │            │              │
│  ├─ 📦 Comp 1         │  │   (5)      │ │   (2)      │              │
│  │  ├─ 📁 Docs        │  └────────────┘ └────────────┘              │
│  │  └─ 💼 Deals       │                                              │
│  │     └─ Alpha       │  DOCUMENTS                                   │
│  └─ 📦 Comp 2         │  ┌────────────────────────────────────────┐ │
│                       │  │ ☐ 📄 Term Sheet.pdf     2.4MB   Jan 15 │ │
│  🏢 VERSO Cap 1       │  │ ☐ 📄 Model.xlsx        1.1MB   Jan 14 │ │
│  └─ 📦 Series 101     │  │   🏷️ Confidential                      │ │
│     └─ ...            │  └────────────────────────────────────────┘ │
│                       │                                              │
│  📦 Standalone        │  Drag files here to upload                   │
│  └─ Other vehicles    │                                              │
│                       │                                              │
└───────────────────────┴──────────────────────────────────────────────┘
```

---

## Functional Requirements

### FR1: Tree Sidebar Navigation

**Description**: Permanent left sidebar showing full folder/vehicle hierarchy.

**Acceptance Criteria**:
- Always visible on desktop (no toggle needed)
- Shows vehicle → compartment → deal → investor hierarchy
- Folders show document count badge (e.g., "Agreements (12)")
- Expandable/collapsible nodes
- Click to navigate
- Current location highlighted
- Search filter for tree

### FR2: Breadcrumb Navigation

**Description**: Shows current path, clickable to navigate up.

**Acceptance Criteria**:
- Shows full path: `REAL Empire > Compartment 1 > Deal Alpha`
- Each segment clickable
- Responsive (collapse middle segments on small screens)

### FR3: Folder Contents View

**Description**: Main area shows current folder's contents.

**Acceptance Criteria**:
- Grid or list view toggle
- Folders shown as cards with name + count
- Documents shown in table: checkbox, icon, name, size, date, tags
- Sort by name, date, type, size
- Empty state with upload prompt

### FR4: Server-Side Search

**Description**: Fast search across all documents.

**Acceptance Criteria**:
- Search by document name
- Search by vehicle/deal/investor name
- Search by tag
- Results show full path context
- Works with 100k+ documents
- Debounced input (300ms)

### FR5: Document Upload

**Description**: Upload documents to current folder.

**Acceptance Criteria**:
- Upload button in header
- Drag-and-drop onto content area
- Drag-and-drop onto folder in tree (uploads there)
- Multi-file upload
- Progress indicator per file
- Max 50MB per file
- Supported types: PDF, DOCX, XLSX, TXT, JPG, PNG

### FR6: Document Actions

**Description**: Actions on individual documents.

**Acceptance Criteria**:
- Preview (PDF/images in-app, Office triggers download)
- Download
- Rename
- Move to different folder
- Delete (with confirmation)
- View version history
- Add/remove tags

### FR7: Bulk Operations

**Description**: Actions on multiple selected documents.

**Acceptance Criteria**:
- Checkbox selection
- "Select all" toggle
- Bulk move to folder
- Bulk delete (confirmation shows count)
- Bulk download as ZIP
- Bulk add tag

### FR8: Drag-and-Drop Organization

**Description**: Move documents/folders via drag-and-drop.

**Acceptance Criteria**:
- Drag document to folder (in tree or content area)
- Drag document to different folder in tree
- Visual feedback during drag (highlight drop target)
- Cancel drag with Escape key

### FR9: Folder Management

**Description**: Create and manage folders.

**Acceptance Criteria**:
- Create new folder (in current location or via right-click in tree)
- Rename folder
- Delete folder (warns if contains documents)
- Folders auto-created for new vehicles: Agreements, NDAs, Reports, KYC Documents

### FR10: Document Tagging

**Description**: Organize documents with tags.

**Acceptance Criteria**:
- Add custom tags to documents
- Filter by tag
- Tags displayed as badges on document rows
- Autocomplete from existing tags
- Remove tag from document

### FR11: Version History

**Description**: Track document versions.

**Acceptance Criteria**:
- Upload new version of existing document
- View version list (date, uploader, size)
- Download previous version
- Current version highlighted
- Version number displayed on document

### FR12: Watermark Display

**Description**: Show watermarks on confidential documents.

**Acceptance Criteria**:
- PDFs display watermark overlay when previewing
- Watermark shows: "CONFIDENTIAL - VERSO Holdings"
- Watermark shows upload timestamp
- Downloads include watermark

### FR13: Expired Document Warning

**Description**: Warn when viewing expired documents.

**Acceptance Criteria**:
- Banner shown when document is expired (based on `document_expiry_date`)
- Warning: "This document expired on [date]"
- Document still accessible (not blocked)
- No automated notifications

### FR14: Data Room Integration

**Description**: Show deal data room as virtual folder.

**Acceptance Criteria**:
- When navigating to a deal, "Data Room" folder appears
- Contents come from `deal_data_room_documents` table
- Same actions available (preview, download)
- Upload goes to data room table (not documents table)

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load time | < 2 seconds |
| Search response | < 500ms |
| Tree render | < 1 second for 1000+ folders |
| Upload feedback | Immediate progress indicator |
| Max file size | 50MB per file |
| Theme support | Respect system light/dark mode |
| Responsive | Desktop-first, mobile usable |

---

## Data Model Notes

### Documents Table (86 columns - keep as-is)

**Key columns used**:
- `id`, `name`, `file_key`, `type`, `status`
- `folder_id` → folder location
- `vehicle_id`, `deal_id`, `owner_investor_id` → ownership (multiple FKs intentional)
- `tags[]` → for tagging feature
- `current_version` → for versioning
- `watermark` (jsonb) → for watermark display
- `document_expiry_date` → for expiry warning

### Document Folders Table

- `id`, `name`, `path`, `parent_folder_id`, `vehicle_id`
- `folder_type`: vehicle_root, category, custom

### Deal Data Room Documents Table (separate - keep as-is)

- `id`, `deal_id`, `folder`, `file_key`, `file_name`
- `visible_to_investors`, `version`

---

## Out of Scope (This PRD)

- Document approval workflow
- Publishing/visibility controls
- Expiry notifications/alerts
- Full-text search (content search)
- Document sharing via external link
- Audit log UI (handled in separate audit page)
- Investor-facing document view (separate component)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to find document | < 30 seconds |
| Staff adoption | 100% within 1 week |
| Documents with correct location | 100% |
| Search success rate | > 95% first query |

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Merge document tables? | No, keep separate |
| Simplify ownership columns? | No, keep multiple FKs |
| Need approval workflow? | No |
| Need versioning? | Yes |
| Show watermarks? | Yes |
| Bulk operations? | Yes (move, delete, download) |
| Audit log location? | Dedicated audit page |
| Expired doc behavior? | Warning only, not blocked |
| Expiry alerts? | No |
| Search approach? | Server-side |
| Tagging? | Yes, custom tags |
| Publishing controls? | Out of scope |
| Drag-and-drop? | Yes, full support |
| Tree sidebar? | Always visible |
| Document counts? | Yes, show in tree |
| Default folders? | Yes, auto-create for new vehicles |
