'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  ChevronRight,
  Users,
  FileText,
  Clock,
  MessageSquare,
  TrendingUp,
  Shield,
  Database,
  Workflow,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Building2,
  Activity,
  PlayCircle,
  Zap,
  BarChart3,
  Target,
  Globe,
  Calendar,
  Receipt,
  UserCheck,
  FileSearch,
  GitPullRequest,
  DollarSign,
  UserPlus,
  BellRing,
  FolderOpen,
  Calculator,
  Building,
  GanttChart,
  MessageCircle,
  User,
  Settings,
  FileSignature,
  Search,
  PlusCircle,
  RefreshCw,
  ArrowUpRight,
  Briefcase,
  Bot,
  Send,
  Download,
  Upload,
  Filter,
  AlertOctagon
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ActionItem {
  label: string
  href?: string
  onClick?: () => void
  icon: any
  description?: string
  badge?: string | number
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info'
  disabled?: boolean
}

interface ActionSection {
  title: string
  icon: any
  items: ActionItem[]
  collapsed?: boolean
}

export function StaffActionCenter({
  className,
  onWorkflowTrigger
}: {
  className?: string
  onWorkflowTrigger?: (workflowKey: string) => void
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['quick', 'operations'])
  )

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const actionSections: ActionSection[] = [
    {
      title: 'Quick Actions',
      icon: Zap,
      items: [
        {
          label: 'New Deal',
          href: '/versotech/staff/deals/new',
          icon: PlusCircle,
          description: 'Create opportunity',
          variant: 'success'
        },
        {
          label: 'KYC Review',
          href: '/versotech/staff/kyc-review',
          icon: UserCheck,
          description: 'Pending reviews',
          variant: 'warning'
        },
        {
          label: 'Messages',
          href: '/versotech/staff/messages',
          icon: MessageCircle,
          description: 'Investor comms',
          variant: 'info'
        },
        {
          label: 'Reconciliation',
          href: '/versotech/staff/reconciliation',
          icon: Calculator,
          description: 'Match transactions',
          variant: 'default'
        },
        {
          label: 'Documents',
          href: '/versotech/staff/documents',
          icon: Upload,
          description: 'Document library',
          variant: 'default'
        },
        {
          label: 'Approvals',
          href: '/versotech/staff/approvals',
          icon: CheckCircle,
          description: 'Pending approvals',
          variant: 'warning'
        }
      ]
    },
    {
      title: 'Operations',
      icon: Activity,
      items: [
        {
          label: 'Deal Pipeline',
          href: '/versotech/staff/deals',
          icon: Building2,
          description: 'Active deals'
        },
        {
          label: 'Investors',
          href: '/versotech/staff/investors',
          icon: Users,
          description: 'LP management'
        },
        {
          label: 'Subscriptions',
          href: '/versotech/staff/subscriptions',
          icon: FileSignature,
          description: 'Commitments'
        },
        {
          label: 'Entities',
          href: '/versotech/staff/entities',
          icon: Building,
          description: 'Entity registry'
        },
        {
          label: 'Introducers',
          href: '/versotech/staff/introducers',
          icon: Briefcase,
          description: 'Source tracking'
        },
        {
          label: 'Requests',
          href: '/versotech/staff/requests',
          icon: ClipboardList,
          description: 'Service tickets'
        }
      ]
    },
    {
      title: 'Compliance',
      icon: Shield,
      items: [
        {
          label: 'Approvals',
          href: '/versotech/staff/approvals',
          icon: CheckCircle,
          description: 'Pending approvals'
        },
        {
          label: 'Audit Trail',
          href: '/versotech/staff/audit',
          icon: FileSearch,
          description: 'Activity logs'
        },
        {
          label: 'KYC Processing',
          href: '/versotech/staff/kyc-review',
          icon: UserCheck,
          description: 'Verification queue'
        },
        {
          label: 'Documents',
          href: '/versotech/staff/documents',
          icon: FolderOpen,
          description: 'Document library'
        }
      ]
    },
    {
      title: 'Financial',
      icon: DollarSign,
      items: [
        {
          label: 'Fee Management',
          href: '/versotech/staff/fees',
          icon: Receipt,
          description: 'Calculate fees'
        },
        {
          label: 'Reconciliation',
          href: '/versotech/staff/reconciliation',
          icon: GitPullRequest,
          description: 'Bank matching'
        },
        {
          label: 'Vehicle Summary',
          href: '/versotech/staff/subscriptions/vehicle-summary',
          icon: BarChart3,
          description: 'Fund overview'
        }
      ]
    },
    {
      title: 'Workflow Automation',
      icon: Workflow,
      items: [
        {
          label: 'Trigger Workflows',
          href: '/versotech/staff/processes',
          icon: PlayCircle,
          description: 'n8n automation'
        },
        {
          label: 'Position Statement',
          onClick: () => onWorkflowTrigger?.('generate-position-statement'),
          icon: BarChart3,
          description: 'Auto-generate'
        },
        {
          label: 'NDA Processing',
          onClick: () => onWorkflowTrigger?.('process-nda'),
          icon: FileText,
          description: 'DocuSign flow'
        },
        {
          label: 'Capital Call',
          onClick: () => onWorkflowTrigger?.('capital-call-processing'),
          icon: Send,
          description: 'Notice & wires'
        },
        {
          label: 'KYC/AML Check',
          onClick: () => onWorkflowTrigger?.('kyc-aml-processing'),
          icon: Shield,
          description: 'Due diligence'
        },
        {
          label: 'Reporting Agent',
          onClick: () => onWorkflowTrigger?.('reporting-agent'),
          icon: Bot,
          description: 'Custom reports'
        }
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      items: [
        {
          label: 'Request Analytics',
          href: '/versotech/staff/requests/analytics',
          icon: TrendingUp,
          description: 'SLA metrics'
        },
        {
          label: 'Audit Trail',
          href: '/versotech/staff/audit',
          icon: FileSearch,
          description: 'Activity logs'
        }
      ]
    },
    {
      title: 'Administration',
      icon: Settings,
      items: [
        {
          label: 'Admin Panel',
          href: '/versotech/staff/admin',
          icon: Settings,
          description: 'System config'
        },
        {
          label: 'My Profile',
          href: '/versotech/staff/profile',
          icon: User,
          description: 'Account settings'
        }
      ]
    }
  ]

  return (
    <Card className={cn(
      'bg-black/95 backdrop-blur-xl border-white/10 shadow-2xl',
      'transition-all duration-300',
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-purple-500/20 backdrop-blur">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg font-semibold">
                Action Center
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Quick access to all portal features
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs"
          >
            <Activity className="mr-1 h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-5">
        {actionSections.map((section, sectionIdx) => {
          const isExpanded = expandedSections.has(section.title)
          const Icon = section.icon

          return (
            <div key={section.title} className="space-y-2">
              {sectionIdx > 0 && (
                <Separator className="bg-white/5 my-3" />
              )}

              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between p-3 rounded-md hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-slate-400 group-hover:text-slate-200" />
                  <span className="text-base font-medium text-slate-200 group-hover:text-white">
                    {section.title}
                  </span>
                  <Badge variant="outline" className="ml-2 border-white/10 text-xs text-slate-400">
                    {section.items.length}
                  </Badge>
                </div>
                <ChevronRight
                  className={cn(
                    "h-5 w-5 text-slate-500 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="grid grid-cols-1 gap-2 pl-4 pr-2">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon
                    const content = (
                      <div
                        className={cn(
                          "group relative flex items-center gap-3 p-3 rounded-lg",
                          "border border-transparent",
                          "hover:bg-white/10 hover:border-white/20",
                          "transition-all duration-200 cursor-pointer",
                          item.disabled && "opacity-50 cursor-not-allowed",
                          item.variant === 'success' && "hover:border-emerald-500/30 hover:bg-emerald-500/10",
                          item.variant === 'warning' && "hover:border-amber-500/30 hover:bg-amber-500/10",
                          item.variant === 'destructive' && "hover:border-red-500/30 hover:bg-red-500/10",
                          item.variant === 'info' && "hover:border-sky-500/30 hover:bg-sky-500/10"
                        )}
                      >
                        <ItemIcon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          item.variant === 'success' ? "text-emerald-400" :
                          item.variant === 'warning' ? "text-amber-400" :
                          item.variant === 'destructive' ? "text-red-400" :
                          item.variant === 'info' ? "text-sky-400" :
                          "text-slate-400 group-hover:text-slate-200"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                              {item.label}
                            </span>
                            {item.badge && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "h-5 px-2 text-xs",
                                  typeof item.badge === 'number'
                                    ? "bg-red-500/20 border-red-500/30 text-red-200"
                                    : "bg-sky-500/20 border-sky-500/30 text-sky-200"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <span className="text-xs text-slate-500 block mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </div>
                        {!item.disabled && (
                          <ArrowUpRight className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        )}
                      </div>
                    )

                    if (item.href) {
                      return (
                        <Link key={item.label} href={item.href}>
                          {content}
                        </Link>
                      )
                    } else if (item.onClick) {
                      return (
                        <div key={item.label} onClick={item.onClick}>
                          {content}
                        </div>
                      )
                    } else {
                      return (
                        <div key={item.label}>
                          {content}
                        </div>
                      )
                    }
                  })}
                </div>
              )}
            </div>
          )
        })}

        <Separator className="bg-white/5 my-4" />

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">All systems operational</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-slate-400 hover:text-slate-200"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}