// Approval entity types that can be approved/rejected
export type ApprovalEntityType =
  | 'deal_interest'
  | 'deal_subscription'
  | 'allocation'
  | 'withdrawal'
  | 'kyc_change'
  | 'profile_update'
  | 'fee_override'
  | 'document_access'
  | 'permission_grant'
  | 'gdpr_deletion_request'
  | 'member_invitation'

// Approval status values
export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'awaiting_info'
  | 'escalated'
  | 'cancelled'

// Priority levels for approvals
export type ApprovalPriority = 'low' | 'medium' | 'high' | 'critical'

// Approval action types
export type ApprovalAction = 'approve' | 'reject' | 'revise'

// History action types
export type ApprovalHistoryAction =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'info_requested'
  | 'cancelled'
  | 'secondary_approved'

// User profile reference (minimal)
export interface ApprovalUserProfile {
  id: string
  display_name: string
  email: string
  role?: string
}

// Related entity references
export interface ApprovalDeal {
  id: string
  name: string
  status?: string
  deal_type?: string
}

export interface ApprovalInvestor {
  id: string
  legal_name: string
  kyc_status?: string
}

// Core approval interface
export interface Approval {
  id: string
  entity_type: ApprovalEntityType
  entity_id: string
  entity_metadata?: Record<string, any>

  action: ApprovalAction
  status: ApprovalStatus
  priority: ApprovalPriority

  // Request details
  requested_by: string
  request_reason?: string

  // Assignment
  assigned_to?: string

  // Decision
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  notes?: string

  // SLA tracking
  sla_breach_at?: string
  sla_paused_at?: string
  sla_resumed_at?: string
  actual_processing_time_hours?: number

  // Secondary approval workflow
  requires_secondary_approval: boolean
  secondary_approver_role?: string
  secondary_approved_by?: string
  secondary_approved_at?: string

  // Related entities
  related_deal_id?: string
  related_investor_id?: string

  // Timestamps
  created_at: string
  updated_at?: string
  resolved_at?: string

  // Joined relations (when fetched from API)
  requested_by_profile?: ApprovalUserProfile
  assigned_to_profile?: ApprovalUserProfile
  approved_by_profile?: ApprovalUserProfile
  related_deal?: ApprovalDeal
  related_investor?: ApprovalInvestor
}

// Approval history entry
export interface ApprovalHistory {
  id: string
  approval_id: string
  action: ApprovalHistoryAction
  actor_id: string
  notes?: string
  metadata?: Record<string, any>
  created_at: string

  // Joined relation
  actor?: ApprovalUserProfile
}

// SLA status calculation result
export interface SLAStatus {
  text: string
  isOverdue: boolean
  urgency: 'low' | 'medium' | 'high'
  hoursRemaining?: number
}

// Approval statistics
export interface ApprovalStats {
  total_pending: number
  overdue_count: number
  avg_processing_time_hours: number
  approval_rate_24h: number
  total_approved_30d: number
  total_rejected_30d: number
  total_awaiting_info: number
}

// API request/response types

export interface CreateApprovalRequest {
  entity_type: ApprovalEntityType
  entity_id: string
  entity_metadata?: Record<string, any>
  action: ApprovalAction
  notes?: string
  priority?: ApprovalPriority
  assigned_to?: string
  related_deal_id?: string
  related_investor_id?: string
}

export interface UpdateApprovalRequest {
  approval_id: string
  action?: ApprovalAction
  status?: ApprovalStatus
  notes?: string
  rejection_reason?: string
  assigned_to?: string
}

export interface ApproveRejectRequest {
  notes?: string
  rejection_reason?: string // Required for reject
}

export interface BulkApprovalRequest {
  approval_ids: string[]
  action: 'approve' | 'reject'
  notes?: string
  rejection_reason?: string
}

export interface ApprovalsListParams {
  status?: ApprovalStatus
  entity_type?: ApprovalEntityType
  priority?: ApprovalPriority
  assigned_to?: string | 'me'
  related_deal_id?: string
  related_investor_id?: string
  limit?: number
  offset?: number
}

export interface ApprovalsListResponse {
  approvals: Approval[]
  stats?: ApprovalStats
  counts?: {
    pending: number
    approved: number
    rejected: number
  }
  pagination?: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  hasData: boolean
}

export interface ApprovalActionResponse {
  success: boolean
  approval: Approval
  message: string
}

export interface BulkApprovalResponse {
  success: boolean
  approved_count: number
  rejected_count: number
  failed_count: number
  results: Array<{
    approval_id: string
    success: boolean
    error?: string
  }>
}

// UI-specific types

export interface ApprovalFilters {
  status: ApprovalStatus[]
  entity_types: ApprovalEntityType[]
  priorities: ApprovalPriority[]
  assigned_to_me: boolean
  search?: string
}

export interface ApprovalRowData extends Approval {
  slaStatus: SLAStatus
  canApprove: boolean
  canReject: boolean
  displayName: string
  entitySummary: string
}
