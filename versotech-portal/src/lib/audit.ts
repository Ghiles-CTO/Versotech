import { createClient } from './supabase/server'

export interface AuditLogEntry {
  actor_user_id?: string
  action: string
  entity: string
  entity_id?: string
  metadata?: Record<string, any>
}

class AuditLogger {
  private static instance: AuditLogger

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const supabase = await createClient()

      // Insert into audit_logs with correct column names
      await supabase.from('audit_logs').insert({
        event_type: 'system',
        actor_id: entry.actor_user_id || null,
        action: entry.action,
        entity_type: entry.entity,
        entity_id: entry.entity_id || null,
        action_details: entry.metadata || null,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Audit logging failed:', error)
      // Don't throw to avoid breaking the main operation
    }
  }

  async logMany(entries: AuditLogEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.log(entry)
    }
  }
}

export const auditLogger = AuditLogger.getInstance()

// Common audit actions as constants
export const AuditActions = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',

  // Data operations
  CREATE: 'create',
  READ: 'read', 
  UPDATE: 'update',
  DELETE: 'delete',

  // Documents
  DOCUMENT_UPLOAD: 'document_upload',
  DOCUMENT_DOWNLOAD: 'document_download',
  DOCUMENT_DELETE: 'document_delete',

  // Workflows
  WORKFLOW_TRIGGER: 'workflow_trigger',
  WORKFLOW_COMPLETED: 'workflow_completed',
  WORKFLOW_FAILED: 'workflow_failed',

  // System operations
  USER_CREATED: 'user_created',
  PROFILE_UPDATED: 'profile_updated',
  ROLE_CHANGED: 'role_changed',

  // Business operations
  SUBSCRIPTION_CREATED: 'subscription_created',
  CAPITAL_CALL_CREATED: 'capital_call_created',
  DISTRIBUTION_CREATED: 'distribution_created',
  REPORT_REQUESTED: 'report_requested',
  MESSAGE_SENT: 'message_sent'
} as const

// Entity types
export const AuditEntities = {
  USERS: 'users',
  PROFILES: 'profiles',
  INVESTORS: 'investors',
  VEHICLES: 'vehicles',
  SUBSCRIPTIONS: 'subscriptions',
  POSITIONS: 'positions',
  DOCUMENTS: 'documents',
  WORKFLOWS: 'workflows',
  WORKFLOW_RUNS: 'workflow_runs',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  REQUEST_TICKETS: 'request_tickets',
  CAPITAL_CALLS: 'capital_calls',
  DISTRIBUTIONS: 'distributions',
  DEALS: 'deals',
  // RESERVATIONS: 'reservations', // Deprecated - removed from workflow
  ALLOCATIONS: 'allocations',
  FEE_EVENTS: 'fee_events',
  INVOICES: 'invoices',
  BANK_TRANSACTIONS: 'bank_transactions',
  PAYMENTS: 'payments',
  ARRANGER: 'arranger_entities',
  INTRODUCER: 'introducers',
  PARTNER: 'partners',
  FEE_PLANS: 'arranger_fee_plans',
  CEO_ENTITY: 'ceo_entity',
  CEO_USERS: 'ceo_users',
} as const

