export const DATA_ROOM_DEFAULT_FOLDERS = [
  'Term Sheets',
  'Data Room',
  'Subscription Documents',
  'Legal Documents',
  'Financial Reports',
  'Due Diligence',
  'Misc'
] as const

export type DataRoomFolder = (typeof DATA_ROOM_DEFAULT_FOLDERS)[number]

const INVALID_FOLDER_CHARS = /[<>:"|?*\\]/

export function validateFolderName(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Folder name cannot be empty' }
  }

  const trimmed = name.trim()

  if (trimmed.length > 100) {
    return { valid: false, error: 'Folder name must be 100 characters or less' }
  }

  if (trimmed.includes('/')) {
    return { valid: false, error: 'Folder name cannot contain "/"' }
  }

  if (trimmed === '..' || trimmed === '.') {
    return { valid: false, error: 'Invalid folder name' }
  }

  if (INVALID_FOLDER_CHARS.test(trimmed)) {
    return { valid: false, error: 'Folder name contains invalid characters (<>:"|?*\\)' }
  }

  return { valid: true }
}
