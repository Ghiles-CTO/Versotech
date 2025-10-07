// Types and interfaces for Reports & Requests feature
// Business domain: Report generation and custom request management

// ============================================
// Report Types
// ============================================

export type ReportType =
  | 'positions_statement'      // Current holdings across all vehicles
  | 'investment_summary'       // Comprehensive investment overview
  | 'capital_activity'        // Calls, distributions, cashflow history
  | 'tax_pack'               // K-1s, capital gains, tax summaries
  | 'custom'                 // Custom or ad-hoc reports

export type ReportStatus =
  | 'queued'                 // Request created, waiting to process
  | 'processing'             // n8n workflow actively generating
  | 'ready'                  // Complete, document available
  | 'failed'                 // Generation failed with error

// ============================================
// Request Types
// ============================================

export type RequestStatus =
  | 'open'                   // Newly created, unassigned
  | 'assigned'               // Assigned to staff member
  | 'in_progress'            // Staff actively working
  | 'awaiting_info'          // Waiting on investor clarification
  | 'ready'                  // Completed, deliverable attached
  | 'closed'                 // Finalized with completion note
  | 'cancelled'

export type RequestPriority =
  | 'low'                    // Deprioritized requests
  | 'normal'                 // Standard SLA (3 days)
  | 'high'                   // Expedited (2 days)

export type RequestCategory =
  | 'analysis'               // Custom analysis request
  | 'tax_doc'                // Tax documentation
  | 'cashflow'               // Cashflow schedule
  | 'valuation'              // Valuation report
  | 'data_export'
  | 'presentation'
  | 'communication'
  | 'other'                  // Uncategorized

// ============================================
// Database Entities
// ============================================

export interface ReportRequest {
  id: string
  investor_id: string
  vehicle_id: string | null
  report_type: ReportType
  filters: Record<string, unknown> | null
  status: ReportStatus
  result_doc_id: string | null
  workflow_run_id: string | null
  error_message: string | null
  created_by: string
  created_at: string
  completed_at: string | null
}

export interface RequestTicket {
  id: string
  investor_id: string
  created_by: string
  category: RequestCategory
  subject: string
  details: string | null
  priority: RequestPriority
  status: RequestStatus
  assigned_to: string | null
  linked_workflow_run: string | null
  result_doc_id: string | null
  completion_note: string | null
  deal_id: string | null
  due_date: string
  closed_at: string | null
  created_at: string
  updated_at: string
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateReportRequest {
  reportType: ReportType
  vehicleId?: string
  scope?: 'all' | 'vehicle' | 'custom'
  fromDate?: string
  toDate?: string
  year?: number
  currency?: string
  includeExcel?: boolean
  includePdf?: boolean
  notes?: string
  filters?: Record<string, unknown>
}

export interface CreateReportResponse {
  id: string
  status: ReportStatus
  workflow_run_id?: string
  estimated_completion: string
  message?: string
}

export interface CreateCustomRequest {
  category: RequestCategory
  subject: string
  details?: string
  priority?: RequestPriority
  vehicleId?: string | null
  dealId?: string | null
  dueDate?: string
  preferredFormat?: 'pdf' | 'excel' | 'both'
  dataFocus?: string[]
  includeBenchmark?: boolean
  followUpCall?: boolean
}

export interface CreateCustomRequestResponse {
  id: string
  due_date: string
  message: string
}

export interface UpdateRequestTicket {
  status?: RequestStatus
  assigned_to?: string
  completion_note?: string
  result_doc_id?: string
}

// ============================================
// Extended Types with Relations
// ============================================

export interface ReportRequestWithRelations extends ReportRequest {
  vehicles?: {
    id: string
    name: string
    type: string
  } | null
  documents?: {
    id: string
    file_key: string
    created_at: string
  } | null
  workflow_runs?: {
    id: string
    status: string
  } | null
}

export interface RequestTicketWithRelations extends RequestTicket {
  investor?: {
    id: string
    legal_name: string
  }
  created_by_profile?: {
    id: string
    display_name: string
    email: string
  }
  assigned_to_profile?: {
    id: string
    display_name: string
    email: string
  } | null
  documents?: {
    id: string
    file_key: string
    type: string
  } | null
}

// ============================================
// UI/Display Types
// ============================================

export interface ReportTypeConfig {
  label: string
  description: string
  icon: string
  estimatedTime: string
  workflowKey: string
  sla: number // milliseconds
  supportedScopes: Array<'all' | 'vehicle' | 'custom'>
  formFields: string[]
}

export interface CategoryConfig {
  label: string
  description?: string
}

export interface SLAInfo {
  dueDate: Date
  isOverdue: boolean
  remainingTime: number // milliseconds
  formattedRemaining: string
}

// ============================================
// Utility Types
// ============================================

export type ReportRequestListResponse = {
  requests: ReportRequestWithRelations[]
  totalCount?: number
}

export type RequestTicketListResponse = {
  tickets: RequestTicketWithRelations[]
  totalCount?: number
  overdueCount?: number
}

// ============================================
// Constants Type Guards
// ============================================

export function isValidReportType(value: unknown): value is ReportType {
  return ['positions_statement', 'investment_summary', 'capital_activity', 'tax_pack', 'custom'].includes(value as string)
}

export function isValidRequestCategory(value: unknown): value is RequestCategory {
  return ['analysis', 'tax_doc', 'cashflow', 'valuation', 'other'].includes(value as string)
}

export function isValidRequestPriority(value: unknown): value is RequestPriority {
  return ['low', 'medium', 'high', 'urgent'].includes(value as string)
}

// ============================================
// Business Logic Types
// ============================================

export interface DuplicateCheckParams {
  investorId: string
  reportType: ReportType
  vehicleId?: string
  windowMinutes?: number
}

export interface SLACalculationResult {
  dueDate: Date
  slaHours: number
  priority: RequestPriority
}
