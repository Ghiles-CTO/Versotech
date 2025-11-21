'use client'

import { useMemo } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Activity,
  FileText,
  Users,
  User,
  Briefcase,
  ShieldCheck,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { runEntityHealthChecks, type HealthCheck, type HealthStatus } from '@/lib/entity-health-checker'
import { useState } from 'react'

interface EntityHealthMonitorProps {
  entity: any
  directors: any[]
  stakeholders: any[]
  documents: any[]
  folders: any[]
  deals: any[]
  investors: any[]
  onAction?: (action: string) => void
}

type IconType = React.ComponentType<{ className?: string }>

const categoryIcons: Record<string, IconType> = {
  metadata: Info,
  stakeholders: Users,
  directors: User,
  documents: FileText,
  deals: Briefcase,
  investors: ShieldCheck
}

const categoryLabels: Record<string, string> = {
  metadata: 'Metadata Completeness',
  stakeholders: 'Stakeholder Coverage',
  directors: 'Director Status',
  documents: 'Document Requirements',
  deals: 'Deal Activity',
  investors: 'Investor Status'
}

function getStatusIcon(status: HealthStatus) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-400" />
    case 'fail':
      return <AlertCircle className="h-4 w-4 text-red-400" />
  }
}

function getStatusColor(status: HealthStatus) {
  switch (status) {
    case 'pass':
      return 'text-emerald-400'
    case 'warning':
      return 'text-amber-400'
    case 'fail':
      return 'text-red-400'
  }
}

function getStatusBadgeColor(status: HealthStatus) {
  switch (status) {
    case 'pass':
      return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
    case 'warning':
      return 'bg-amber-500/20 border-amber-400/40 text-amber-100'
    case 'fail':
      return 'bg-red-500/20 border-red-400/40 text-red-100'
  }
}

function HealthCheckItem({ check, onAction }: { check: HealthCheck; onAction?: (action: string) => void }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="pt-0.5">{getStatusIcon(check.status)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{check.title}</p>
            <p className={`text-xs mt-0.5 ${check.status === 'pass' ? 'text-muted-foreground' : getStatusColor(check.status)}`}>
              {check.message}
            </p>
            {check.details && (
              <p className="text-xs text-muted-foreground mt-1 italic">{check.details}</p>
            )}
          </div>
          <Badge className={getStatusBadgeColor(check.status)} variant="outline">
            {check.status}
          </Badge>
        </div>
        {check.actionable && onAction && check.status !== 'pass' && (
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-7 text-xs"
            onClick={() => onAction(check.actionable!.action)}
          >
            {check.actionable.label}
          </Button>
        )}
      </div>
    </div>
  )
}

export function EntityHealthMonitor({
  entity,
  directors,
  stakeholders,
  documents,
  folders,
  deals,
  investors,
  onAction
}: EntityHealthMonitorProps) {
  const healthResult = useMemo(() => {
    return runEntityHealthChecks({
      entity,
      directors,
      stakeholders,
      documents,
      folders,
      deals,
      investors
    })
  }, [entity, directors, stakeholders, documents, folders, deals, investors])

  const checksByCategory = useMemo(() => {
    const grouped: Record<string, HealthCheck[]> = {}
    healthResult.checks.forEach((check) => {
      if (!grouped[check.category]) {
        grouped[check.category] = []
      }
      grouped[check.category].push(check)
    })
    return grouped
  }, [healthResult.checks])

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['metadata']))

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="border border-white/10 bg-gradient-to-br from-white/5 to-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">Entity Health Score</CardTitle>
                <CardDescription>Real-time monitoring of entity compliance and completeness</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getStatusColor(healthResult.overallStatus)}`}>
                {healthResult.overallScore}%
              </div>
              <Badge className={getStatusBadgeColor(healthResult.overallStatus)}>
                {healthResult.overallStatus === 'pass' && 'Healthy'}
                {healthResult.overallStatus === 'warning' && 'Needs Attention'}
                {healthResult.overallStatus === 'fail' && 'Critical Issues'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={healthResult.overallScore} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-foreground font-medium">{healthResult.passCount}</span>
                  <span className="text-muted-foreground">Passed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-foreground font-medium">{healthResult.warningCount}</span>
                  <span className="text-muted-foreground">Warnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-foreground font-medium">{healthResult.failCount}</span>
                  <span className="text-muted-foreground">Failed</span>
                </div>
              </div>
              <span className="text-muted-foreground">
                {healthResult.checks.length} total checks
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Checks by Category */}
      <div className="space-y-3">
        {Object.entries(checksByCategory).map(([category, checks]) => {
          const Icon: IconType = categoryIcons[category] || Info
          const isExpanded = expandedCategories.has(category)
          const categoryPassCount = checks.filter(c => c.status === 'pass').length
          const categoryWarningCount = checks.filter(c => c.status === 'warning').length
          const categoryFailCount = checks.filter(c => c.status === 'fail').length

          let categoryStatus: HealthStatus = 'pass'
          if (categoryFailCount > 0) categoryStatus = 'fail'
          else if (categoryWarningCount > 0) categoryStatus = 'warning'

          return (
            <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
              <Card className="border border-white/10 bg-white/5">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          categoryStatus === 'pass'
                            ? 'bg-emerald-500/20'
                            : categoryStatus === 'warning'
                            ? 'bg-amber-500/20'
                            : 'bg-red-500/20'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            categoryStatus === 'pass'
                              ? 'text-emerald-400'
                              : categoryStatus === 'warning'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{categoryLabels[category]}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {checks.length} check{checks.length > 1 ? 's' : ''}
                            </span>
                            {categoryFailCount > 0 && (
                              <Badge className="bg-red-500/20 border-red-400/40 text-red-100 text-xs h-5">
                                {categoryFailCount} failed
                              </Badge>
                            )}
                            {categoryWarningCount > 0 && categoryFailCount === 0 && (
                              <Badge className="bg-amber-500/20 border-amber-400/40 text-amber-100 text-xs h-5">
                                {categoryWarningCount} warning{categoryWarningCount > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusIcon(categoryStatus)}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-2 pt-0">
                    <div className="h-px bg-white/10 mb-3" />
                    {checks.map((check) => (
                      <HealthCheckItem key={check.id} check={check} onAction={onAction} />
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {/* Quick Actions */}
      {healthResult.overallStatus !== 'pass' && (
        <Card className="border border-emerald-400/40 bg-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-emerald-100 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
            <CardDescription className="text-emerald-200/80">
              Take these actions to improve your entity health score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {healthResult.checks
              .filter(c => c.status !== 'pass' && c.actionable)
              .slice(0, 5)
              .map((check) => (
                <div key={check.id} className="flex items-center justify-between p-3 rounded-lg border border-emerald-400/20 bg-emerald-500/5">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-100">{check.title}</p>
                    <p className="text-xs text-emerald-200/70">{check.message}</p>
                  </div>
                  {check.actionable && onAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-3 border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/20"
                      onClick={() => onAction(check.actionable!.action)}
                    >
                      {check.actionable.label}
                    </Button>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
