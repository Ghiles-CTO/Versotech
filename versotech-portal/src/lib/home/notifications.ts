import { createServiceClient } from '@/lib/supabase/server'

type HomeInterestNotificationParams = {
  actorUserId: string
  investorId: string
  investorName: string
  itemId: string
  itemKind: string
  itemTitle: string
}

export async function notifyHomeInterestRecipients(params: HomeInterestNotificationParams) {
  const supabase = createServiceClient()

  const recipientIds = new Set<string>()

  const { data: profileRecipients, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['ceo', 'staff_admin'])

  if (profileError) {
    console.error('[home-notifications] Failed to fetch profile recipients:', profileError)
  }

  for (const recipient of profileRecipients ?? []) {
    if (recipient.id) {
      recipientIds.add(recipient.id)
    }
  }

  const { data: ceoUsers, error: ceoError } = await supabase
    .from('ceo_users')
    .select('user_id')

  if (ceoError) {
    console.error('[home-notifications] Failed to fetch CEO users:', ceoError)
  }

  for (const recipient of ceoUsers ?? []) {
    if (recipient.user_id) {
      recipientIds.add(recipient.user_id)
    }
  }

  if (!recipientIds.size) {
    return
  }

  const notifications = [...recipientIds].map((userId) => ({
    user_id: userId,
    investor_id: params.investorId,
    title: 'New home interest',
    message: `${params.investorName} registered interest in "${params.itemTitle}".`,
    link: '/versotech_main/admin',
    created_by: params.actorUserId,
    type: 'system',
    data: {
      home_item_id: params.itemId,
      home_item_kind: params.itemKind,
      investor_id: params.investorId,
    },
  }))

  const { error } = await supabase.from('investor_notifications').insert(notifications)

  if (error) {
    console.error('[home-notifications] Failed to create notifications:', error)
  }
}
