'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, CheckCircle2, Inbox as InboxIcon, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { usePersona, type Persona } from '@/contexts/persona-context'

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

interface TabConfig {
  value: InboxTab
  label: string
  icon: typeof MessageSquare
}

// Full tab config - filtered by persona type below
const ALL_TABS: TabConfig[] = [
  { value: 'messages', label: 'Messages', icon: MessageSquare },
  { value: 'approvals', label: 'Approvals', icon: CheckCircle2 },
  { value: 'requests', label: 'Requests', icon: InboxIcon },
]

/**
 * Get tabs visible to a persona type and role
 * - Staff Ops/RM: Messages, Approvals, Requests (they process all)
 * - Staff CEO/Admin: Messages, Approvals (they approve, not triage requests)
 * - Everyone else: Messages only
 */
function getTabsForPersona(personaType: string | undefined, roleInEntity: string | undefined): TabConfig[] {
  if (personaType === 'staff') {
    // CEO doesn't triage operational requests - that's Ops/RM work
    const isCEO = roleInEntity === 'ceo' || roleInEntity === 'staff_admin'
    if (isCEO) {
      return ALL_TABS.filter(tab => tab.value !== 'requests')
    }
    // Ops and RM see everything
    return ALL_TABS
  }
  // Investors, Arrangers, Introducers, Partners, Lawyers - Messages only
  return ALL_TABS.filter(tab => tab.value === 'messages')
}

function InboxPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { activePersona, isLoading: personaLoading } = usePersona()

  // Get tabs based on persona type and role
  const visibleTabs = useMemo(() => {
    return getTabsForPersona(activePersona?.persona_type, activePersona?.role_in_entity)
  }, [activePersona?.persona_type, activePersona?.role_in_entity])

  const tabParam = searchParams.get('tab') as InboxTab | null
  // Ensure default tab is valid for this persona
  const defaultTab = visibleTabs.some(t => t.value === tabParam) ? tabParam! : 'messages'
  const [activeTab, setActiveTab] = useState<InboxTab>(defaultTab)
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

        // Get pending approvals count (scoped to user's assigned items or unassigned)
        const { count: approvalCount } = await supabase
          .from('approvals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .or(`assigned_to.eq.${user.id},assigned_to.is.null`)

        // Get open requests count (scoped to user's assigned items or unassigned)
        const { count: requestCount } = await supabase
          .from('request_tickets')
          .select('*', { count: 'exact', head: true })
          .in('status', ['open', 'assigned', 'in_progress', 'awaiting_info'])
          .or(`assigned_to.eq.${user.id},assigned_to.is.null`)

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

  // Determine page subtitle based on persona
  const isStaffPersona = activePersona?.persona_type === 'staff'
  const isCEO = activePersona?.role_in_entity === 'ceo' || activePersona?.role_in_entity === 'staff_admin'
  const showApprovals = isStaffPersona
  const showRequests = isStaffPersona && !isCEO // Ops/RM only

  const pageSubtitle = !isStaffPersona
    ? 'Your conversations and notifications'
    : isCEO
      ? 'Messages and approvals for your review'
      : 'Messages, approvals, and requests in one place'

  // Dynamic grid columns based on number of tabs
  const gridColsClass = visibleTabs.length === 1
    ? 'grid-cols-1'
    : visibleTabs.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-3'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          <p className="text-muted-foreground mt-1">
            {pageSubtitle}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {visibleTabs.length > 1 && (
          <TabsList className={`grid w-full ${gridColsClass} lg:w-auto lg:inline-grid`}>
            {visibleTabs.map(({ value, label, icon: Icon }) => (
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
        )}

        <TabsContent value="messages" className={visibleTabs.length === 1 ? 'mt-0' : 'mt-6'}>
          <Suspense fallback={<LoadingState label="messages" />}>
            <MessagesContent />
          </Suspense>
        </TabsContent>

        {showApprovals && (
          <TabsContent value="approvals" className="mt-6">
            <Suspense fallback={<LoadingState label="approvals" />}>
              <ApprovalsContent />
            </Suspense>
          </TabsContent>
        )}

        {showRequests && (
          <TabsContent value="requests" className="mt-6">
            <Suspense fallback={<LoadingState label="requests" />}>
              <RequestsContent />
            </Suspense>
          </TabsContent>
        )}
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
