# Legacy Components - Documents UI (Pre-Navigator Redesign)

**Deprecated Date**: 2025-11-17
**Status**: Backup only - Do not use in new code

## What Happened

These components were replaced as part of the **Documents Page Navigation Redesign**,
which transformed the filter-based folder tree into a true file explorer navigation system.

## Components Deprecated

### `folder-tree.tsx`
**Replaced by**:
- `navigation/FolderNavigator.tsx` - Main folder grid view
- `navigation/FolderTreeDrawer.tsx` - Collapsible tree sidebar (for quick access)

**Why replaced**:
- Old: Tree sidebar that filtered documents (not true navigation)
- New: File explorer-style navigation with breadcrumbs and folder grid
- New: Upload destination is clear, folder names fully visible

## Migration Path

If you're updating code that references these components:

```typescript
// ❌ OLD - Filter-based tree
import { FolderTree } from '@/components/documents/folder-tree'
<FolderTree onSelectFolder={setSelectedFolderId} />

// ✅ NEW - Navigation-based explorer
import { FolderNavigator } from '@/components/documents/navigation/FolderNavigator'
<FolderNavigator
  currentFolderId={currentFolderId}
  onNavigateToFolder={navigateToFolder}
/>
```

## Deletion Schedule

**Retention**: 2 sprints (~4 weeks)
**Delete after**: 2025-12-15 (if no issues reported)

## Rollback

If critical issues arise with the new implementation:
1. Restore from this legacy directory
2. Update imports in `staff-documents-client.tsx`
3. Restore old state management (`selectedFolderId`, `expandedFolders`)

## Documentation

- New component docs: `../navigation/README.md`
- Design system: `@/lib/design-tokens.ts`
- Migration guide: `../../../docs/DOCUMENTS_NAVIGATION_MIGRATION.md` (to be created)
