'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, CheckCircle2, Inbox as InboxIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

// Lazy load tab content components
const MessagesContent = dynamic(
  () => import('./messages-content'),
  {
    loading: () => <LoadingState label="messages" />,
    ssr: false
  }
)

const ApprovalsContent = dynamic(
  () => import('./approvals-content'),
  {
    loading: () => <LoadingState label="approvals" />,
    ssr: false
  }
)

const RequestsContent = dynamic(
  () => import('./requests-content'),
  {
    loading: () => <LoadingState label="requests" />,
    ssr: false
  }
)

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Loading {label}...</span>
    </div>
  )
}

type InboxTab = 'messages' | 'approvals' | 'requests'

const TAB_CONFIG = [
  { value: 'messages', label: 'Messages', icon: MessageSquare },
  { value: 'approvals', label: 'Approvals', icon: CheckCircle2 },
  { value: 'requests', label: 'Requests', icon: InboxIcon },
] as const

function InboxPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab') as InboxTab | null
  const [activeTab, setActiveTab] = useState<InboxTab>(tabParam || 'messages')
  const [counts, setCounts] = useState({ messages: 0, approvals: 0, requests: 0 })

  // Fetch unread/pending counts
  useEffect(() => {
    async function fetchCounts() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get unread messages count (simplified)
        const { count: msgCount } = await supabase
          .from('conversation_participants')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('last_read_at', 'is', null)

        // Get pending approvals count
        const { count: approvalCount } = await supabase
          .from('approvals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        // Get open requests count (using request_tickets table)
        const { count: requestCount } = await supabase
          .from('request_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        setCounts({
          messages: msgCount || 0,
          approvals: approvalCount || 0,
          requests: requestCount || 0,
        })
      } catch (err) {
        console.error('[Inbox] Error fetching counts:', err)
      }
    }

    fetchCounts()
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value as InboxTab)
    // Update URL without full page reload
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/versotech_main/inbox?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          <p className="text-muted-foreground mt-1">
            Messages, approvals, and requests in one place
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {counts[value as keyof typeof counts] > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {counts[value as keyof typeof counts]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <Suspense fallback={<LoadingState label="messages" />}>
            <MessagesContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Suspense fallback={<LoadingState label="approvals" />}>
            <ApprovalsContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Suspense fallback={<LoadingState label="requests" />}>
            <RequestsContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Unified Inbox Page for Unified Portal (versotech_main)
 *
 * Combines Messages, Approvals, and Requests into a single page with tabs.
 * URL param: ?tab=messages|approvals|requests
 */
export default function InboxPage() {
  return (
    <Suspense fallback={<LoadingState label="inbox" />}>
      <InboxPageContent />
    </Suspense>
  )
}
