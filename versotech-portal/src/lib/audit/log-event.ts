import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type AuditEventType = 'authentication' | 'data_modification' | 'access_control' | 'system' | 'compliance'
export type RiskLevel = 'low' | 'medium' | 'high'

interface LogAuditEventParams {
  eventType: AuditEventType
  action: string
  actorId?: string
  entityType?: string
  entityId?: string
  entityName?: string
  actionDetails?: Record<string, any>
  beforeValue?: Record<string, any>
  afterValue?: Record<string, any>
  riskLevel?: RiskLevel
  complianceFlag?: boolean
  retentionCategory?: 'operational' | 'financial' | 'legal_hold'
}

export async function logAuditEvent(params: LogAuditEventParams) {
  const supabase = await createClient()

  const h = await headers()
  const ipAddress = h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'unknown'
  const userAgent = h.get('user-agent') ?? 'unknown'

  const payload = {
    ...params,
    actionDetails: {
      ...params.actionDetails,
      ip_address: ipAddress,
      user_agent: userAgent
    }
  }

  const { data, error } = await supabase.rpc('log_audit_event', {
    p_event_type: payload.eventType,
    p_action: payload.action,
    p_actor_id: payload.actorId,
    p_entity_type: payload.entityType,
    p_entity_id: payload.entityId,
    p_entity_name: payload.entityName,
    p_action_details: payload.actionDetails ?? {},
    p_before: payload.beforeValue ?? {},
    p_after: payload.afterValue ?? {},
    p_risk_level: payload.riskLevel ?? 'low',
    p_compliance_flag: payload.complianceFlag ?? false,
    p_retention_category: payload.retentionCategory ?? 'operational'
  })

  if (error) {
    console.error('Failed to log audit event', error)
    return null
  }

  return data
}
