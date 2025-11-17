export enum DocumentType {
  NDA = 'NDA',
  SUBSCRIPTION = 'Subscription',
  AGREEMENT = 'Agreement',
  REPORT = 'Report',
  STATEMENT = 'Statement',
  KYC = 'KYC',
  TAX = 'Tax',
  TERM_SHEET = 'Term Sheet',
  LEGAL = 'Legal',
  OTHER = 'Other'
}

export interface DocumentScope {
  investor?: {
    id: string
    legal_name: string
  }
  vehicle?: {
    id: string
    name: string
    type: string
  }
  deal?: {
    id: string
    name: string
    status?: string
  }
}

export interface DocumentWatermark {
  uploaded_by?: string
  uploaded_at?: string
  document_classification?: string
  verso_holdings_notice?: string
  compliance_notice?: string
  original_filename?: string
}

export interface Document {
  id: string
  type: DocumentType | string
  file_name: string
  file_key: string
  file_size_bytes?: number
  created_at: string
  created_by?: {
    display_name: string
    email: string
  }
  scope: DocumentScope
  watermark?: DocumentWatermark
  metadata?: Record<string, unknown>
}

export interface DocumentFilters {
  type?: string
  vehicle_id?: string
  deal_id?: string
  from_date?: string
  to_date?: string
  search?: string
}

export interface DocumentsResponse {
  documents: Document[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
    current_page: number
    total_pages: number
  }
  filters_applied: DocumentFilters
}

export interface Vehicle {
  id: string
  name: string
  type: string
}

export interface Deal {
  id: string
  name: string
  status: string
}

// ============================================
// Navigation Types (Folder Explorer)
// ============================================

/**
 * Folder structure for document organization
 */
export interface DocumentFolder {
  id: string
  name: string
  path: string // Full path like "/Vehicle A/Investor Documents/KYC"
  parent_folder_id: string | null
  folder_type: 'vehicle_root' | 'category' | 'custom'
  vehicle_id?: string | null
  created_by?: string
  created_at: string
  updated_at: string
  // Virtual fields (from counts)
  subfolder_count?: number
  document_count?: number
}

/**
 * Breadcrumb segment for navigation
 */
export interface Breadcrumb {
  id: string | null // null for root/home
  name: string
  path: string
}

/**
 * Navigation state for folder explorer
 */
export interface NavigationState {
  currentFolderId: string | null
  navigationHistory: string[] // Stack for back navigation
  breadcrumbs: Breadcrumb[]
}

/**
 * Folder navigation actions
 */
export type NavigationAction =
  | { type: 'NAVIGATE_TO_FOLDER'; folderId: string | null }
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NAVIGATE_TO_ROOT' }
  | { type: 'UPDATE_BREADCRUMBS'; breadcrumbs: Breadcrumb[] }