// Validation utilities for Reports & Requests feature
// Form validation, business rule enforcement, data sanitization

import type {
  CreateReportRequest,
  CreateCustomRequest,
  UpdateRequestTicket,
  ReportType,
  RequestCategory,
  RequestPriority
} from '@/types/reports'
import { VALIDATION_RULES, REPORT_TYPES, REQUEST_CATEGORIES } from './constants'

// ============================================
// Validation Error Types
// ============================================

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// ============================================
// Report Request Validation
// ============================================

export function validateReportRequest(data: CreateReportRequest): ValidationResult {
  const errors: ValidationError[] = []

  // Validate report type
  if (!data.reportType) {
    errors.push({
      field: 'reportType',
      message: 'Report type is required'
    })
  } else if (!REPORT_TYPES[data.reportType]) {
    errors.push({
      field: 'reportType',
      message: 'Invalid report type'
    })
  }

  // Validate vehicle ID format if provided
  if (data.vehicleId && !isValidUUID(data.vehicleId)) {
    errors.push({
      field: 'vehicleId',
      message: 'Invalid vehicle ID format'
    })
  }

  // Validate scope
  if (data.scope && !['all', 'vehicle', 'custom'].includes(data.scope)) {
    errors.push({
      field: 'scope',
      message: 'Invalid report scope'
    })
  }

  // Validate filters if provided
  if (data.filters && typeof data.filters !== 'object') {
    errors.push({
      field: 'filters',
      message: 'Filters must be an object'
    })
  }

  // Validate date range
  if (data.fromDate && data.toDate) {
    const from = new Date(data.fromDate)
    const to = new Date(data.toDate)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      errors.push({
        field: 'fromDate',
        message: 'Invalid date range'
      })
    }
  }

  if (data.year && (data.year < 2000 || data.year > new Date().getFullYear())) {
    errors.push({
      field: 'year',
      message: 'Invalid year'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================
// Custom Request Validation
// ============================================

export function validateCustomRequest(data: CreateCustomRequest): ValidationResult {
  const errors: ValidationError[] = []

  // Validate subject
  if (!data.subject || data.subject.trim().length === 0) {
    errors.push({
      field: 'subject',
      message: 'Subject is required'
    })
  } else if (data.subject.length < VALIDATION_RULES.subject.minLength) {
    errors.push({
      field: 'subject',
      message: `Subject must be at least ${VALIDATION_RULES.subject.minLength} characters`
    })
  } else if (data.subject.length > VALIDATION_RULES.subject.maxLength) {
    errors.push({
      field: 'subject',
      message: `Subject must not exceed ${VALIDATION_RULES.subject.maxLength} characters`
    })
  }

  // Validate category
  if (data.category && !REQUEST_CATEGORIES[data.category]) {
    errors.push({
      field: 'category',
      message: 'Invalid category'
    })
  }

  // Validate priority
  if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
    errors.push({
      field: 'priority',
      message: 'Invalid priority level'
    })
  }

  // Validate details length
  if (data.details && data.details.length > VALIDATION_RULES.details.maxLength) {
    errors.push({
      field: 'details',
      message: `Details must not exceed ${VALIDATION_RULES.details.maxLength} characters`
    })
  }

  // Validate deal ID format if provided
  if (data.dealId && !isValidUUID(data.dealId)) {
    errors.push({
      field: 'dealId',
      message: 'Invalid deal ID format'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================
// Request Update Validation (Staff)
// ============================================

export function validateRequestUpdate(data: UpdateRequestTicket): ValidationResult {
  const errors: ValidationError[] = []

  // Validate status if provided
  if (
    data.status &&
    !['open', 'assigned', 'in_progress', 'awaiting_info', 'ready', 'closed', 'cancelled'].includes(data.status)
  ) {
    errors.push({
      field: 'status',
      message: 'Invalid status'
    })
  }

  // Validate priority if provided
  if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
    errors.push({
      field: 'priority',
      message: 'Invalid priority level'
    })
  }

  // Validate assigned_to UUID if provided
  if (data.assigned_to && !isValidUUID(data.assigned_to)) {
    errors.push({
      field: 'assigned_to',
      message: 'Invalid assignee ID format'
    })
  }

  // Validate completion_note length
  if (data.completion_note) {
    if (data.completion_note.length < VALIDATION_RULES.completionNote.minLength) {
      errors.push({
        field: 'completion_note',
        message: `Completion note must be at least ${VALIDATION_RULES.completionNote.minLength} characters`
      })
    }
    if (data.completion_note.length > VALIDATION_RULES.completionNote.maxLength) {
      errors.push({
        field: 'completion_note',
        message: `Completion note must not exceed ${VALIDATION_RULES.completionNote.maxLength} characters`
      })
    }
  }

  // Validate result_doc_id UUID if provided
  if (data.result_doc_id && !isValidUUID(data.result_doc_id)) {
    errors.push({
      field: 'result_doc_id',
      message: 'Invalid document ID format'
    })
  }

  // Business rule: closing requires completion_note or result_doc_id
  if (data.status === 'closed' && !data.completion_note && !data.result_doc_id) {
    errors.push({
      field: 'status',
      message: 'Closing requires either a completion note or result document'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================
// Sanitization Functions
// ============================================

/**
 * Sanitize subject text (trim, remove excessive whitespace)
 */
export function sanitizeSubject(subject: string): string {
  return subject
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, VALIDATION_RULES.subject.maxLength)
}

/**
 * Sanitize details text
 */
export function sanitizeDetails(details: string): string {
  return details
    .trim()
    .slice(0, VALIDATION_RULES.details.maxLength)
}

/**
 * Sanitize completion note
 */
export function sanitizeCompletionNote(note: string): string {
  return note
    .trim()
    .slice(0, VALIDATION_RULES.completionNote.maxLength)
}

// ============================================
// Helper Functions
// ============================================

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Check if value is a valid report type
 */
export function isValidReportType(value: any): value is ReportType {
  return typeof value === 'string' && value in REPORT_TYPES
}

/**
 * Check if value is a valid request category
 */
export function isValidRequestCategory(value: any): value is RequestCategory {
  return typeof value === 'string' && value in REQUEST_CATEGORIES
}

/**
 * Check if value is a valid request priority
 */
export function isValidRequestPriority(value: any): value is RequestPriority {
  return typeof value === 'string' && ['low', 'normal', 'high', 'urgent'].includes(value)
}

/**
 * Validate and sanitize form data for custom request
 */
export function sanitizeCustomRequestData(data: CreateCustomRequest): CreateCustomRequest {
  return {
    category: data.category || 'other',
    subject: sanitizeSubject(data.subject),
    details: data.details ? sanitizeDetails(data.details) : undefined,
    priority: data.priority || 'normal',
    vehicleId: data.vehicleId,
    dealId: data.dealId,
    dueDate: data.dueDate,
    preferredFormat: data.preferredFormat || 'pdf',
    dataFocus: data.dataFocus || [],
    includeBenchmark: !!data.includeBenchmark,
    followUpCall: !!data.followUpCall,
  }
}

/**
 * Get user-friendly error message from validation result
 */
export function getErrorMessage(result: ValidationResult): string {
  if (result.isValid) return ''
  return result.errors.map(e => e.message).join('. ')
}

/**
 * Get field-specific error message
 */
export function getFieldError(result: ValidationResult, field: string): string | undefined {
  const error = result.errors.find(e => e.field === field)
  return error?.message
}
