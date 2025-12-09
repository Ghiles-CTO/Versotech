// Constants and configuration for Reports & Requests feature
// Business rules: SLAs, report types, categories, workflow mappings

import type {
  ReportType,
  RequestCategory,
  RequestPriority,
  ReportTypeConfig,
  CategoryConfig,
  RequestStatus,
} from '@/types/reports'

// ============================================
// Report Type Configurations
// ============================================

export const REPORT_TYPES: Record<ReportType, ReportTypeConfig> = {
  positions_statement: {
    label: 'Our Position Statement',
    description: 'Current holdings and positions across all your investments',
    icon: 'FileText',
    estimatedTime: '2-3 minutes',
    workflowKey: 'positions_statement',
    sla: 5 * 60 * 1000, // 5 minutes in milliseconds
    supportedScopes: ['all', 'vehicle', 'custom'],
    formFields: ['scope', 'vehicle', 'asOfRange', 'currency', 'delivery']
  },
  investment_summary: {
    label: 'Quarterly Report',
    description: 'Comprehensive quarterly performance and activity summary',
    icon: 'TrendingUp',
    estimatedTime: '3-5 minutes',
    workflowKey: 'quarterly_report',
    sla: 10 * 60 * 1000, // 10 minutes
    supportedScopes: ['all', 'vehicle', 'custom'],
    formFields: ['scope', 'vehicle', 'period', 'includeBenchmark', 'delivery']
  },
  capital_activity: {
    label: 'Monthly Report',
    description: 'Monthly investment activity, cashflows, and updates',
    icon: 'Calendar',
    estimatedTime: '2-4 minutes',
    workflowKey: 'monthly_report',
    sla: 10 * 60 * 1000, // 10 minutes
    supportedScopes: ['all', 'vehicle'],
    formFields: ['scope', 'vehicle', 'fromTo', 'includeExcel', 'delivery']
  },
  tax_pack: {
    label: 'Yearly Report (Ghiles)',
    description: 'Annual comprehensive report with all investment details',
    icon: 'FileBarChart',
    estimatedTime: '5-10 minutes',
    workflowKey: 'yearly_report_ghiles',
    sla: 15 * 60 * 1000, // 15 minutes
    supportedScopes: ['all', 'vehicle'],
    formFields: ['scope', 'vehicle', 'taxYear', 'delivery']
  },
  custom: {
    label: 'Custom Request',
    description: 'Submit a custom request to the team',
    icon: 'MessageSquare',
    estimatedTime: 'Varies by request',
    workflowKey: 'custom_request',
    sla: 24 * 60 * 60 * 1000, // 24 hours
    supportedScopes: ['custom'],
    formFields: ['details']
  },
}

// ============================================
// Request Category Configurations
// ============================================

export const REQUEST_CATEGORIES: Record<RequestCategory, CategoryConfig> = {
  analysis: {
    label: 'Custom Analysis',
    description: 'Bespoke investment analysis or portfolio insights',
  },
  tax_doc: {
    label: 'Tax Documentation',
    description: 'K-1s, tax summaries, and compliance documentation',
  },
  data_export: {
    label: 'Data Export',
    description: 'Capital activity, holdings, and transaction exports',
  },
  presentation: {
    label: 'Presentation',
    description: 'Investor decks, IC materials, and bespoke briefings',
  },
  communication: {
    label: 'Communication',
    description: 'Investor updates, newsletter requests, and follow-ups',
  },
  cashflow: {
    label: 'Cashflow',
    description: 'Contribution schedules, distribution forecasts, and history',
  },
  valuation: {
    label: 'Valuation',
    description: 'Asset and portfolio valuation support',
  },
  other: {
    label: 'Other',
    description: 'General requests not covered by other categories',
  },
}

// ============================================
// SLA Configurations by Priority
// ============================================

export const SLA_BY_PRIORITY: Record<RequestPriority, number> = {
  urgent: 1 * 24 * 60 * 60 * 1000, // 1 day
  high: 2 * 24 * 60 * 60 * 1000,   // 2 days
  normal: 3 * 24 * 60 * 60 * 1000, // 3 days
  low: 5 * 24 * 60 * 60 * 1000,    // 5 days
}

export const SLA_LABELS: Record<RequestPriority, string> = {
  urgent: '1 day',
  high: '2 days',
  normal: '3 days',
  low: '5 days',
}

// ============================================
// Status Display Configurations
// ============================================

export const REPORT_STATUS_CONFIG = {
  queued: {
    label: 'Queued',
    color: 'gray',
    icon: 'Clock',
    description: 'Waiting to process',
  },
  processing: {
    label: 'Processing',
    color: 'blue',
    icon: 'Loader',
    description: 'Generating report',
  },
  ready: {
    label: 'Ready',
    color: 'green',
    icon: 'CheckCircle',
    description: 'Download available',
  },
  failed: {
    label: 'Failed',
    color: 'red',
    icon: 'AlertCircle',
    description: 'Generation failed',
  },
}

export const REQUEST_STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string
    color: string
    icon: string
    description: string
  }
> = {
  open: {
    label: 'Open',
    color: 'gray',
    icon: 'CircleDot',
    description: 'Awaiting triage & assignment',
  },
  assigned: {
    label: 'Assigned',
    color: 'blue',
    icon: 'UserCheck',
    description: 'Assigned to staff member',
  },
  in_progress: {
    label: 'In Progress',
    color: 'blue',
    icon: 'Play',
    description: 'Fulfillment in progress',
  },
  awaiting_info: {
    label: 'Awaiting Info',
    color: 'amber',
    icon: 'MessageCircle',
    description: 'Paused while awaiting investor clarification',
  },
  ready: {
    label: 'Ready',
    color: 'green',
    icon: 'CheckCircle',
    description: 'Deliverables ready for review',
  },
  closed: {
    label: 'Closed',
    color: 'gray',
    icon: 'Check',
    description: 'Delivered and closed',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'gray',
    icon: 'X',
    description: 'Cancelled or withdrawn',
  },
}

export const PRIORITY_CONFIG: Record<
  RequestPriority,
  {
    label: string
    color: string
    badge: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  urgent: {
    label: 'Urgent',
    color: 'red',
    badge: 'destructive',
  },
  high: {
    label: 'High',
    color: 'orange',
    badge: 'default',
  },
  normal: {
    label: 'Normal',
    color: 'blue',
    badge: 'secondary',
  },
  low: {
    label: 'Low',
    color: 'gray',
    badge: 'outline',
  },
}

// ============================================
// Business Rules
// ============================================

/**
 * Window for duplicate detection (milliseconds)
 * If identical report requested within this window, reuse existing
 */
export const DUPLICATE_DETECTION_WINDOW = 5 * 60 * 1000 // 5 minutes

/**
 * Maximum number of concurrent report requests per investor
 */
export const MAX_CONCURRENT_REPORTS = 10

/**
 * Default pagination limit for request lists
 */
export const DEFAULT_PAGE_SIZE = 50

/**
 * Auto-refresh interval for real-time updates (milliseconds)
 */
export const REALTIME_POLL_INTERVAL = 30 * 1000 // 30 seconds

/**
 * Time before overdue status kicks in (grace period)
 */
export const OVERDUE_GRACE_PERIOD = 60 * 60 * 1000 // 1 hour

// ============================================
// Validation Rules
// ============================================

export const VALIDATION_RULES = {
  subject: {
    minLength: 5,
    maxLength: 200,
    required: true,
  },
  details: {
    maxLength: 5000,
    required: false,
  },
  completionNote: {
    minLength: 10,
    maxLength: 2000,
    required: false,
  },
}

// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  reportRequests: '/api/report-requests',
  reportRequestById: (id: string) => `/api/report-requests/${id}`,
  customRequests: '/api/requests',
  customRequestById: (id: string) => `/api/requests/${id}`,
  workflowTrigger: (key: string) => `/api/workflows/${key}/trigger`,
  documentDownload: (id: string) => `/api/documents/${id}/download`,
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get readable report type label
 */
export function getReportTypeLabel(type: ReportType): string {
  return REPORT_TYPES[type]?.label || type
}

/**
 * Get category label
 */
export function getCategoryLabel(category: RequestCategory): string {
  return REQUEST_CATEGORIES[category]?.label || category
}

/**
 * Get SLA in hours for priority
 */
export function getSLAHours(priority: RequestPriority): number {
  return Math.round(SLA_BY_PRIORITY[priority] / (60 * 60 * 1000))
}

/**
 * Check if request is overdue
 */
export function isOverdue(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (isNaN(due.getTime())) return false
  return due < new Date(Date.now() - OVERDUE_GRACE_PERIOD)
}

/**
 * Format time remaining until due date
 */
export function formatTimeRemaining(dueDate: string | Date | null | undefined): string {
  if (!dueDate) return 'No due date'
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (isNaN(due.getTime())) return 'No due date'
  const now = new Date()
  const diff = due.getTime() - now.getTime()

  if (diff < 0) {
    const hours = Math.abs(Math.floor(diff / (60 * 60 * 1000)))
    return `${hours}h overdue`
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  if (days > 0) {
    return `${days}d ${hours}h remaining`
  }
  return `${hours}h remaining`
}

export const CUSTOM_REQUEST_FORMATS = [
  { value: 'pdf', label: 'PDF Summary' },
  { value: 'excel', label: 'Excel Workbook' },
  { value: 'both', label: 'Both PDF & Excel' }
] as const

export const CUSTOM_REQUEST_DATA_FOCUS = [
  { value: 'performance', label: 'Performance & Returns' },
  { value: 'cashflows', label: 'Cashflows & Capital Activity' },
  { value: 'valuations', label: 'Valuations & NAV' },
  { value: 'holdings', label: 'Detailed Holdings' },
  { value: 'exits', label: 'Exits & Liquidity Events' },
  { value: 'other', label: 'Other / Miscellaneous' }
] as const
