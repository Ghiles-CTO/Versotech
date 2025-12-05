'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Users, CheckCircle, Calendar } from 'lucide-react'

interface AdminKpiCardsProps {
  security: {
    failed_logins_24h: number
    failed_logins_7d: number
    new_accounts_7d: number
    pending_approvals: number
  }
  complianceForecast: {
    next_7_days: number
    next_30_days: number
    next_90_days: number
    total: number
  }
}

export function AdminKpiCards({ security, complianceForecast }: AdminKpiCardsProps) {
  const kpis = [
    {
      title: 'Failed Logins',
      value: security?.failed_logins_24h || 0,
      subtitle: `${security?.failed_logins_7d || 0} in 7 days`,
      icon: AlertTriangle,
      color: security?.failed_logins_24h > 0 ? 'text-red-400' : 'text-emerald-400',
      bgColor: security?.failed_logins_24h > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      borderColor: security?.failed_logins_24h > 0 ? 'border-red-500/20' : 'border-emerald-500/20',
    },
    {
      title: 'New Accounts',
      value: security?.new_accounts_7d || 0,
      subtitle: 'Past 7 days',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Pending Approvals',
      value: security?.pending_approvals || 0,
      subtitle: 'Waiting review',
      icon: CheckCircle,
      color: security?.pending_approvals > 5 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: security?.pending_approvals > 5 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      borderColor: security?.pending_approvals > 5 ? 'border-amber-500/20' : 'border-emerald-500/20',
    },
    {
      title: 'KYC Expiring',
      value: complianceForecast?.next_30_days || 0,
      subtitle: `${complianceForecast?.next_7_days || 0} critical (7d)`,
      icon: Calendar,
      color: complianceForecast?.next_7_days > 0 ? 'text-red-400' : 'text-zinc-400',
      bgColor: complianceForecast?.next_7_days > 0 ? 'bg-red-500/10' : 'bg-zinc-500/10',
      borderColor: complianceForecast?.next_7_days > 0 ? 'border-red-500/20' : 'border-zinc-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card
            key={index}
            className={`${kpi.bgColor} ${kpi.borderColor} border`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${kpi.color}`} />
                <span className="text-xs text-zinc-500">{kpi.subtitle}</span>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-zinc-400 mt-1">{kpi.title}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
