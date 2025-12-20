'use client'

import { usePersona } from '@/contexts/persona-context'
import { useTheme } from '@/components/theme-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  UserPlus,
  Briefcase,
  Scale,
  User,
  TrendingUp,
  FileText,
  CheckSquare
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

export default function UnifiedDashboardPage() {
  const { activePersona, personas, isCEO } = usePersona()
  const { theme } = useTheme()

  // Use actual theme system (user-controlled via toggle in header)
  const isDark = theme === 'staff-dark'

  if (!activePersona) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const ActiveIcon = PERSONA_ICONS[activePersona.persona_type] || User

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
                ? activePersona.role_in_entity?.toUpperCase()
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
                      ? persona.role_in_entity
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

      {/* Quick Stats (placeholder) */}
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

      {/* CEO Notice */}
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
