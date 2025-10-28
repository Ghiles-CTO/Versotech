import { createClient } from './supabase/server'
import crypto from 'crypto'

export interface AuditLogEntry {
  actor_user_id?: string
  action: string
  entity: string
  entity_id?: string
  metadata?: Record<string, any>
}

class AuditLogger {
  private static instance: AuditLogger
  private lastHash: string | null = null

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  private async getLastHash(): Promise<string | null> {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('audit_log')
        .select('hash')
        .order('ts', { ascending: false })
        .limit(1)
        .single()

      return data?.hash || null
    } catch {
      return null
    }
  }

  private generateHash(entry: AuditLogEntry, prevHash: string | null, timestamp: string): string {
    const hashInput = `${entry.actor_user_id || 'system'}:${entry.action}:${entry.entity}:${entry.entity_id || ''}:${timestamp}:${prevHash || ''}`
    return crypto.createHash('sha256').update(hashInput).digest('hex')
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const supabase = await createClient()
      
      // Get the last hash for chain integrity
      if (!this.lastHash) {
        this.lastHash = await this.getLastHash()
      }

      const timestamp = new Date().toISOString()
      const hash = this.generateHash(entry, this.lastHash, timestamp)

      await supabase.from('audit_log').insert({
        actor_user_id: entry.actor_user_id || null,
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entity_id || null,
        ts: timestamp,
        hash,
        prev_hash: this.lastHash
      })

      // Update our local cache of the last hash
      this.lastHash = hash

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
  PAYMENTS: 'payments'
} as const

