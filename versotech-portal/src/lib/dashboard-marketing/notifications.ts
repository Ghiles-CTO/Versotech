import { createServiceClient } from '@/lib/supabase/server'
import { createInvestorNotification } from '@/lib/notifications'

type MarketingLeadNotificationParams = {
  actorUserId: string
  investorId: string
  investorName: string
  cardId: string
  cardType: string
  cardTitle: string
}

export async function notifyMarketingLeadRecipients(params: MarketingLeadNotificationParams) {
  const supabase = createServiceClient()
  const recipientIds = new Set<string>()

  const { data: ceoUsers, error: ceoError } = await supabase
    .from('ceo_users')
    .select('user_id')

  if (ceoError) {
    console.error('[marketing-notifications] Failed to fetch CEO users:', ceoError)
  }

  for (const ceo of ceoUsers ?? []) {
    if (ceo.user_id) {
      recipientIds.add(ceo.user_id)
    }
  }

  if (!recipientIds.size) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'ceo')

    if (profileError) {
      console.error('[marketing-notifications] Failed to fetch CEO profiles:', profileError)
    }

    for (const profile of profiles ?? []) {
      if (profile.id) {
        recipientIds.add(profile.id)
      }
    }
  }

  await Promise.all(
    [...recipientIds].map((recipientId) =>
      createInvestorNotification({
        userId: recipientId,
        investorId: params.investorId,
        title: 'New marketing interest',
        message: `${params.investorName} clicked "${params.cardTitle}".`,
        link: '/versotech_main/admin/marketing',
        type: 'system',
        createdBy: params.actorUserId,
        sendEmailNotification: false,
        extraMetadata: {
          marketing_card_id: params.cardId,
          marketing_card_type: params.cardType,
        },
      }).catch((error) => {
        console.error('[marketing-notifications] Failed to create notification:', error)
      })
    )
  )
}
