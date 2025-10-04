// Constants and configuration for Reports & Requests feature
// Business rules: SLAs, report types, categories, workflow mappings

import type { ReportType, RequestCategory, RequestPriority, ReportTypeConfig, CategoryConfig } from '@/types/reports'

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
  },
  investment_summary: {
    label: 'Quarterly Report',
    description: 'Comprehensive quarterly performance and activity summary',
    icon: 'TrendingUp',
    estimatedTime: '3-5 minutes',
    workflowKey: 'quarterly_report',
    sla: 10 * 60 * 1000, // 10 minutes
  },
  capital_activity: {
    label: 'Monthly Report',
    description: 'Monthly investment activity, cashflows, and updates',
    icon: 'Calendar',
    estimatedTime: '2-4 minutes',
    workflowKey: 'monthly_report',
    sla: 10 * 60 * 1000, // 10 minutes
  },
  tax_pack: {
    label: 'Yearly Report (Ghiles)',
    description: 'Annual comprehensive report with all investment details',
    icon: 'FileBarChart',
    estimatedTime: '5-10 minutes',
    workflowKey: 'yearly_report_ghiles',
    sla: 15 * 60 * 1000, // 15 minutes
  },
  custom: {
    label: 'Custom Request',
    description: 'Submit a custom request to the team',
    icon: 'MessageSquare',
    estimatedTime: 'Varies by request',
    workflowKey: 'custom_request',
    sla: 24 * 60 * 60 * 1000, // 24 hours
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
    description: 'Tax-related documents, forms, or summaries',
  },
  cashflow: {
    label: 'Cashflow Schedule',
    description: 'Projected or historical cashflow analysis',
  },
  valuation: {
    label: 'Valuation Report',
    description: 'Portfolio or asset valuation reports',
  },
  other: {
    label: 'Other Request',
    description: 'General requests not covered by other categories',
  },
}

// ============================================
// SLA Configurations by Priority
// ============================================

export const SLA_BY_PRIORITY: Record<RequestPriority, number> = {
  high: 24 * 60 * 60 * 1000,      // 1 day
  normal: 3 * 24 * 60 * 60 * 1000, // 3 days
  low: 7 * 24 * 60 * 60 * 1000,    // 7 days
}

export const SLA_LABELS: Record<RequestPriority, string> = {
  high: '1 day',
  normal: '3 days',
  low: '7 days',
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

export const REQUEST_STATUS_CONFIG = {
  open: {
    label: 'Open',
    color: 'gray',
    icon: 'CircleDot',
    description: 'Awaiting assignment',
  },
  assigned: {
    label: 'Assigned',
    color: 'yellow',
    icon: 'UserCheck',
    description: 'Assigned to staff',
  },
  in_progress: {
    label: 'In Progress',
    color: 'blue',
    icon: 'Loader',
    description: 'Staff working on it',
  },
  ready: {
    label: 'Ready',
    color: 'green',
    icon: 'CheckCircle',
    description: 'Completed, ready for review',
  },
  closed: {
    label: 'Closed',
    color: 'gray',
    icon: 'Check',
    description: 'Request closed',
  },
}

export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'gray',
    badge: 'secondary',
  },
  normal: {
    label: 'Normal',
    color: 'blue',
    badge: 'default',
  },
  high: {
    label: 'High',
    color: 'red',
    badge: 'destructive',
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
  return SLA_BY_PRIORITY[priority] / (60 * 60 * 1000)
}

/**
 * Check if request is overdue
 */
export function isOverdue(dueDate: string | Date): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return due < new Date(Date.now() - OVERDUE_GRACE_PERIOD)
}

/**
 * Format time remaining until due date
 */
export function formatTimeRemaining(dueDate: string | Date): string {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
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
