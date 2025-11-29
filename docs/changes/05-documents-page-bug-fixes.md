# Change Log #05: Documents Page Bug Fixes

**Date**: November 29, 2025
**Author**: Claude Code
**Status**: Completed - Production Ready
**Priority**: HIGH
**Affected Systems**: Staff Documents Portal, Deal Data Room, Document Management

---

## Executive Summary

This change fixes three verified bugs in the documents system:

1. **Multi-file Upload Toast Bug** - Upload success incorrectly showed as failure due to stale React state
2. **Move to Root Folder Bug** - Moving documents to root folder sent invalid `"__root__"` string instead of `null`
3. **Deal Data Room Size Validation** - Added missing server-side file size validation (50MB limit)

**Impact**: Fixes confusing UX for document uploads and restores broken "move to root" functionality.

---

## Table of Contents

1. [Background & Investigation](#background--investigation)
2. [Bug #1: Multi-file Upload Toast](#bug-1-multi-file-upload-toast)
3. [Bug #2: Move to Root Folder](#bug-2-move-to-root-folder)
4. [Bug #3: Deal Data Room Validation](#bug-3-deal-data-room-validation)
5. [Issues Investigated But Not Bugs](#issues-investigated-but-not-bugs)
6. [Files Changed Summary](#files-changed-summary)
7. [Testing & Verification](#testing--verification)

---

## Background & Investigation

### Investigation Process

A deep-dive analysis was performed on the documents page covering:
- UI components in `versotech-portal/src/components/documents/`
- API routes in `versotech-portal/src/app/api/` (25+ endpoints)
- Database tables (`documents`, `document_folders`, `document_versions`, `deal_data_room_documents`)

### Initial Findings vs Reality

| Initially Claimed | After Verification |
|-------------------|-------------------|
| ~30 potential issues | 3 real bugs |
| No folder loading indicator | WRONG - Loading spinner exists (lines 300-304) |
| Move dialog allows invalid selection | PARTIALLY CORRECT - Only "Root" option was broken |

**Lesson**: Always verify findings by reading actual code, not just searching patterns.

---

## Bug #1: Multi-file Upload Toast

### Problem

When uploading multiple files successfully, users saw an error toast: "X files failed to upload" even though all files uploaded correctly.

### Root Cause

**Stale React State Closure**

The upload function checked file status using `files.every()` after the async loop completed. However, due to React's state closure behavior, the `files` array referenced the state from when the function started, not the updated state after each upload.

```typescript
// BEFORE (BROKEN) - files array is stale
for (const file of files) {
  // ... upload logic that calls setFiles()
}
// This check uses the ORIGINAL files array, not the updated one
const allSucceeded = files.every(f => f.status === 'success')
if (!allSucceeded) {
  toast.error(`${failed} files failed`)  // Always triggers!
}
```

### Solution

Track success/failure counts during the loop instead of checking React state after:

```typescript
// AFTER (FIXED) - Track counts directly
let successCount = 0
let failedCount = 0
const totalFiles = files.length

for (const file of files) {
  try {
    const response = await fetch('/api/documents/upload', { ... })
    if (response.ok) {
      successCount++  // Track success immediately
    } else {
      throw new Error('Upload failed')
    }
  } catch (error) {
    failedCount++  // Track failure immediately
  }
}

// Check using tracked counts, not stale state
if (failedCount === 0) {
  toast.success(`Successfully uploaded ${totalFiles} file(s)`)
} else {
  toast.error(`${failedCount} file(s) failed to upload`)
}
```

### File Changed

`versotech-portal/src/components/documents/document-upload-dialog.tsx`

**Lines modified**: 104-176

### User Impact

- **Before**: Users confused by false failure messages, may re-upload files unnecessarily
- **After**: Toast accurately reflects upload results

---

## Bug #2: Move to Root Folder

### Problem

When moving a document to "Root (No Folder)", the API received the string `"__root__"` instead of `null`, causing the move to fail or behave unexpectedly.

### Root Cause

The Select component used `"__root__"` as a placeholder value for the root folder option, but this value was sent directly to the API without conversion:

```typescript
// UI Component
<SelectItem value="__root__">
  Root (No Folder)
</SelectItem>

// BEFORE (BROKEN) - Sent "__root__" string directly
const response = await fetch(`/api/staff/documents/${documentId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    folder_id: selectedFolderId  // Sends "__root__" string!
  })
})
```

### Solution

Convert the placeholder value to `null` before sending to the API:

```typescript
// AFTER (FIXED) - Convert placeholder to null
const handleMove = async () => {
  // Convert "__root__" placeholder to null for the API
  const folderId = selectedFolderId === '__root__' ? null : selectedFolderId || null

  const response = await fetch(`/api/staff/documents/${documentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      folder_id: folderId  // Now sends null correctly
    })
  })
}
```

### Verification

Confirmed the API accepts `null` for `folder_id`:

```typescript
// API Route Schema (staff/documents/[id]/route.ts line 11)
const updateSchema = z.object({
  folder_id: z.string().uuid().nullable().optional(),
  // ...
})
```

Also confirmed 18+ other files in the codebase use the `folder_id || null` pattern.

### File Changed

`versotech-portal/src/components/documents/move-document-dialog.tsx`

**Lines modified**: 70-83

### User Impact

- **Before**: "Move to Root" feature completely broken
- **After**: Documents can be moved to root folder successfully

---

## Bug #3: Deal Data Room Validation

### Problem

The deal data room upload endpoint (`/api/deals/[id]/documents/upload`) had no server-side file size validation, allowing arbitrarily large files to be uploaded.

### Initial (Wrong) Fix

Initially added both file TYPE and SIZE restrictions, copying from the main documents upload:

```typescript
// WRONG - This broke the deal data room!
const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-...', ...]
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
}
```

### Why This Was Wrong

The deal data room is **intentionally designed** to accept ANY file type. Evidence:

1. `data-room-document-upload.tsx` line 95-98: Dropzone has NO `accept` filter
2. UI explicitly states: "Supports all document types (PDF, DOCX, XLSX, JSON, etc.)"
3. Data rooms commonly contain JSON configs, CSV data, ZIP archives, etc.

This is different from the main `/documents` page which restricts to office documents.

### Corrected Solution

Keep only the file SIZE limit, remove file TYPE restriction:

```typescript
// CORRECT - Size limit only
if (!file) {
  return NextResponse.json({ error: 'No file provided' }, { status: 400 })
}

// Validate file size (50MB max)
// Note: Deal data room intentionally accepts ALL file types (JSON, CSV, ZIP, etc.)
const maxSize = 50 * 1024 * 1024
if (file.size > maxSize) {
  return NextResponse.json({
    error: 'File size too large. Maximum size is 50MB'
  }, { status: 400 })
}
```

### File Changed

`versotech-portal/src/app/api/deals/[id]/documents/upload/route.ts`

**Lines modified**: 39-50

### User Impact

- **Before**: No server-side size validation (potential abuse)
- **After**: 50MB limit enforced server-side, all file types still accepted

---

## Issues Investigated But Not Bugs

### "No Folder Loading Indicator"

**Claim**: Upload dialog shows no loading state while fetching folders.

**Reality**: WRONG. Lines 300-304 of `document-upload-dialog.tsx` show:
```tsx
{loadingFolders ? (
  <span className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    Loading folders...
  </span>
) : ...}
```

### "Search Ignores Current Folder"

**Claim**: Search should filter by current folder.

**Reality**: Global search is an intentional UX choice, not a bug. Users expect to search across all documents.

### "No Rate Limiting"

**Claim**: No upload rate limits.

**Reality**: Rate limiting is typically handled at infrastructure level (Cloudflare, Vercel) not application code. This is a common pattern.

### "Orphaned Files on Failure"

**Claim**: Files may get stuck in storage if database insert fails.

**Reality**: The code DOES attempt cleanup (line 88 in upload route), though it doesn't verify cleanup succeeded. This is a minor edge case, not a blocking bug.

---

## Files Changed Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `components/documents/document-upload-dialog.tsx` | Bug Fix | Track upload results correctly |
| `components/documents/move-document-dialog.tsx` | Bug Fix | Convert `__root__` to `null` |
| `app/api/deals/[id]/documents/upload/route.ts` | Enhancement | Add 50MB size limit |

### Code Diff Summary

**document-upload-dialog.tsx** (~30 lines changed):
- Added `successCount`, `failedCount`, `totalFiles` variables
- Track results during loop instead of checking state after
- Updated toast logic to use tracked counts

**move-document-dialog.tsx** (~5 lines changed):
- Added conversion: `selectedFolderId === '__root__' ? null : selectedFolderId || null`

**deals/[id]/documents/upload/route.ts** (~10 lines changed):
- Added 50MB file size validation
- Added comment explaining why no type restriction

---

## Testing & Verification

### Bug #1 Testing

1. Navigate to Staff Documents page
2. Click "Upload Documents"
3. Select 3+ files
4. Click Upload
5. **Expected**: "Successfully uploaded 3 file(s)" toast
6. **Before fix**: "3 files failed to upload" toast (incorrect)

### Bug #2 Testing

1. Navigate to Staff Documents page
2. Select any document in a folder
3. Click "Move" action
4. Select "Root (No Folder)"
5. Click Move
6. **Expected**: Document moved to root successfully
7. **Before fix**: API error or document stays in original folder

### Bug #3 Testing

1. Navigate to any Deal's Data Room
2. Try uploading a file > 50MB
3. **Expected**: "File size too large. Maximum size is 50MB" error
4. Try uploading a JSON or CSV file
5. **Expected**: Upload succeeds (no type restriction)

### Build Verification

```bash
npm run build
# Exit code: 0
# All routes compiled successfully
```

---

## Related Changes

This change is independent but follows patterns from:

- **Change #01**: Authentication and query ordering fixes
- **Change #02**: Signature workflow race condition fixes
- **Change #03**: Authentication security hardening
- **Change #04**: KYC, onboarding & entity members system

---

## Architecture Notes

### Why React State Closures Cause Issues

React's `useState` hook captures state at render time. When an async function runs over multiple event loop cycles (like sequential file uploads), it references the state from when it started, not current state.

**Solutions**:
1. Track values in local variables (used here)
2. Use `useRef` for mutable values
3. Use functional updates: `setFiles(prev => ...)` and read from `prev`

### Why Different Upload Restrictions?

| Endpoint | File Types | Size Limit | Reason |
|----------|-----------|------------|--------|
| `/api/documents/upload` | PDF, DOCX, XLSX, TXT, JPG, PNG | 50MB | Staff documents - structured office files |
| `/api/deals/[id]/documents/upload` | ALL | 50MB | Data room - may contain any technical files |

---

## Minor Issue Not Fixed

### Duplicate Helper Function

**File**: `staff-documents-client.tsx`

**Issue**: `getDescendantFolderIds` function appears twice in the file.

**Impact**: No functional bug, but code duplication. Should be deduplicated in future refactor.

**Not fixed**: Out of scope for this bug fix batch.

---

**End of Change Log #05**
