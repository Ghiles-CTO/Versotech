'use client'

import { useEffect, useState } from 'react'
import { usePersona } from '@/contexts/persona-context'
import { useTheme } from '@/components/theme-provider'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvestorDashboard } from './investor-dashboard'
import { IntroducerDashboard } from './introducer-dashboard'
import { PartnerDashboard } from './partner-dashboard'
import { LawyerDashboard } from './lawyer-dashboard'
import { ArrangerDashboard } from './arranger-dashboard'
import {
  Building2,
  Users,
  UserPlus,
  Briefcase,
  Scale,
  User,
  TrendingUp,
  FileText,
  CheckSquare,
  Loader2,
  Wallet,
  ArrowLeftRight
} from 'lucide-react'

const PERSONA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  staff: Building2,
  investor: User,
  arranger: Briefcase,
  introducer: UserPlus,
  partner: Users,
  commercial_partner: Building2,
  lawyer: Scale,
}

const PERSONA_COLORS: Record<string, string> = {
  staff: 'bg-blue-500',
  investor: 'bg-green-500',
  arranger: 'bg-purple-500',
  introducer: 'bg-orange-500',
  partner: 'bg-pink-500',
  commercial_partner: 'bg-cyan-500',
  lawyer: 'bg-indigo-500',
}

/**
 * Persona-aware dashboard for non-CEO users
 * Routes to persona-specific dashboards based on active persona type
 */
// Check if a partner/introducer also has investments
async function checkUserHasInvestments(userId: string): Promise<{
  hasInvestments: boolean
  investorId: string | null
  investmentCount: number
}> {
  try {
    const supabase = createClient()

    // Check if user is linked to an investor entity
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', userId)
      .limit(1)

    if (!investorLinks || investorLinks.length === 0) {
      // No investor entity - check if they have subscriptions via deal_memberships
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .or(`investor_id.in.(select investor_id from investor_users where user_id=${userId})`)
        .limit(1)

      return { hasInvestments: false, investorId: null, investmentCount: 0 }
    }

    const investorId = investorLinks[0].investor_id

    // Count active subscriptions for this investor
    const { data: subscriptions, count } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('investor_id', investorId)
      .in('status', ['active', 'signed', 'funded', 'pending'])

    return {
      hasInvestments: (count || 0) > 0,
      investorId,
      investmentCount: count || 0
    }
  } catch (error) {
    console.error('Error checking investments:', error)
    return { hasInvestments: false, investorId: null, investmentCount: 0 }
  }
}

export function PersonaDashboard() {
  const { activePersona, personas, isCEO } = usePersona()
  const { theme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [investmentInfo, setInvestmentInfo] = useState<{
    hasInvestments: boolean
    investorId: string | null
    investmentCount: number
  } | null>(null)
  const [activeView, setActiveView] = useState<'partner' | 'investor'>('partner')

  // Fetch the current user ID on mount
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      setLoadingUser(false)
    }
    fetchUser()
  }, [])

  // Check if partner/introducer has investments
  useEffect(() => {
    async function checkInvestments() {
      if (!userId || !activePersona) return

      // Only check for partners and introducers
      if (activePersona.persona_type === 'partner' || activePersona.persona_type === 'introducer') {
        const info = await checkUserHasInvestments(userId)
        setInvestmentInfo(info)
      }
    }
    checkInvestments()
  }, [userId, activePersona])

  // Use actual theme system (user-controlled via toggle in header)
  const isDark = theme === 'staff-dark'

  // Show loading state while fetching user
  if (loadingUser || !activePersona) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  // Route investor personas to the investor-specific dashboard
  if (activePersona.persona_type === 'investor' && userId) {
    return (
      <InvestorDashboard
        investorId={activePersona.entity_id}
        userId={userId}
        persona={activePersona}
      />
    )
  }

  // Route introducer personas to the introducer-specific dashboard
  // If introducer also has investments, show a tabbed view
  if (activePersona.persona_type === 'introducer' && userId) {
    // Introducer also has investments - show dual view
    if (investmentInfo?.hasInvestments && investmentInfo.investorId) {
      return (
        <div className="space-y-4">
          {/* View Switcher Banner */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gradient-to-r from-orange-900/50 to-amber-900/50 border border-orange-500/20' : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                  <ArrowLeftRight className={`h-5 w-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    You have multiple roles
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Introducer referrals & {investmentInfo.investmentCount} personal investment{investmentInfo.investmentCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeView === 'partner' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('partner')}
                  className={activeView === 'partner' ? '' : isDark ? 'border-gray-700' : ''}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Introducer View
                </Button>
                <Button
                  variant={activeView === 'investor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('investor')}
                  className={activeView === 'investor' ? '' : isDark ? 'border-gray-700' : ''}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  My Investments
                </Button>
              </div>
            </div>
          </div>

          {/* Active Dashboard */}
          {activeView === 'partner' ? (
            <IntroducerDashboard
              introducerId={activePersona.entity_id}
              userId={userId}
              persona={activePersona}
            />
          ) : (
            <InvestorDashboard
              investorId={investmentInfo.investorId}
              userId={userId}
              persona={{
                ...activePersona,
                persona_type: 'investor',
                entity_id: investmentInfo.investorId,
                entity_name: 'My Investments'
              }}
            />
          )}
        </div>
      )
    }

    // Regular introducer view (no investments)
    return (
      <IntroducerDashboard
        introducerId={activePersona.entity_id}
        userId={userId}
        persona={activePersona}
      />
    )
  }

  // Route partner personas to the partner-specific dashboard
  // If partner also has investments, show a tabbed view
  if (activePersona.persona_type === 'partner' && userId) {
    // Partner also has investments - show dual view
    if (investmentInfo?.hasInvestments && investmentInfo.investorId) {
      return (
        <div className="space-y-4">
          {/* View Switcher Banner */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/20' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                  <ArrowLeftRight className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    You have multiple roles
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Partner referrals & {investmentInfo.investmentCount} personal investment{investmentInfo.investmentCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeView === 'partner' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('partner')}
                  className={activeView === 'partner' ? '' : isDark ? 'border-gray-700' : ''}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Partner View
                </Button>
                <Button
                  variant={activeView === 'investor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('investor')}
                  className={activeView === 'investor' ? '' : isDark ? 'border-gray-700' : ''}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  My Investments
                </Button>
              </div>
            </div>
          </div>

          {/* Active Dashboard */}
          {activeView === 'partner' ? (
            <PartnerDashboard
              partnerId={activePersona.entity_id}
              userId={userId}
              persona={activePersona}
            />
          ) : (
            <InvestorDashboard
              investorId={investmentInfo.investorId}
              userId={userId}
              persona={{
                ...activePersona,
                persona_type: 'investor',
                entity_id: investmentInfo.investorId,
                entity_name: 'My Investments'
              }}
            />
          )}
        </div>
      )
    }

    // Regular partner view (no investments)
    return (
      <PartnerDashboard
        partnerId={activePersona.entity_id}
        userId={userId}
        persona={activePersona}
      />
    )
  }

  // Route lawyer personas to the lawyer-specific dashboard
  if (activePersona.persona_type === 'lawyer' && userId) {
    return (
      <LawyerDashboard
        lawyerId={activePersona.entity_id}
        userId={userId}
        persona={activePersona}
      />
    )
  }

  // Route arranger personas to the arranger-specific dashboard
  if (activePersona.persona_type === 'arranger' && userId) {
    return (
      <ArrangerDashboard
        arrangerId={activePersona.entity_id}
        userId={userId}
        persona={activePersona}
      />
    )
  }

  const ActiveIcon = PERSONA_ICONS[activePersona.persona_type] || User

  // Generic dashboard for other persona types (arranger, commercial_partner, lawyer, etc.)
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome to VERSO
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Unified Platform Dashboard
          </p>
        </div>

        {/* Active Persona Badge */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
          <div className={`h-10 w-10 rounded-full ${PERSONA_COLORS[activePersona.persona_type]} flex items-center justify-center`}>
            <ActiveIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {activePersona.entity_name}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {activePersona.persona_type === 'staff'
                ? (activePersona.role_in_entity === 'staff_admin' || activePersona.role_in_entity === 'ceo' ? 'CEO' : activePersona.role_in_entity?.toUpperCase())
                : activePersona.persona_type.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Persona Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => {
          const Icon = PERSONA_ICONS[persona.persona_type] || User
          const isActive = activePersona?.entity_id === persona.entity_id

          return (
            <Card
              key={persona.entity_id}
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} ${isActive ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`h-12 w-12 rounded-full ${PERSONA_COLORS[persona.persona_type]} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {persona.entity_name}
                  </CardTitle>
                  <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {persona.persona_type === 'staff'
                      ? (persona.role_in_entity === 'staff_admin' || persona.role_in_entity === 'ceo' ? 'CEO' : persona.role_in_entity)
                      : persona.persona_type.replace('_', ' ')}
                  </CardDescription>
                </div>
                {isActive && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    Active
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {persona.can_sign && (
                    <Badge variant="outline" className={isDark ? 'border-white/20 text-gray-300' : ''}>
                      Can Sign
                    </Badge>
                  )}
                  {persona.can_execute_for_clients && (
                    <Badge variant="outline" className={isDark ? 'border-white/20 text-gray-300' : ''}>
                      Can Execute
                    </Badge>
                  )}
                  {persona.is_primary && (
                    <Badge variant="outline" className={isDark ? 'border-white/20 text-gray-300' : ''}>
                      Primary
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats (placeholder for non-CEO users) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Pending Tasks
            </CardTitle>
            <CheckSquare className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>0</div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              No pending tasks
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Active Deals
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>-</div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Data loading...
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Documents
            </CardTitle>
            <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>-</div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Data loading...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CEO Notice - shown for staff who might have CEO access but viewing persona dashboard */}
      {isCEO && (
        <Card className={`${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  CEO Access Enabled
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You have access to KYC Review, Fees, Audit, and Admin sections.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
