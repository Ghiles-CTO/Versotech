import { AppLayout } from '@/components/layout/app-layout'
import { InvestorChat } from '@/components/messaging/investor-chat'
import { requireAuth } from '@/lib/auth'

export default async function MessagesPage() {
  const profile = await requireAuth(['investor'])

  return (
    <AppLayout brand="versoholdings">
      <div className="h-[calc(100vh-4rem)]">
        <InvestorChat />
      </div>
    </AppLayout>
  )
}