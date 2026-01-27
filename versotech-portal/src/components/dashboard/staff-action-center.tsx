'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  ChevronRight,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Workflow,
  ClipboardList,
  CheckCircle,
  Building2,
  Activity,
  PlayCircle,
  Zap,
  BarChart3,
  Receipt,
  UserCheck,
  FileSearch,
  GitPullRequest,
  DollarSign,
  FolderOpen,
  Calculator,
  Building,
  MessageCircle,
  User,
  Settings,
  FileSignature,
  PlusCircle,
  RefreshCw,
  ArrowUpRight,
  Briefcase,
  Bot,
  Send,
  Upload
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

const ActionItem = React.memo(({ item }: { item: ActionItem }) => {
    const ItemIcon = item.icon
    const content = (
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md group/item",
        "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/5",
        "transition-all duration-200 cursor-pointer",
        item.variant === 'success' && "hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30",
        item.variant === 'warning' && "hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-950/30",
        item.variant === 'info' && "hover:text-sky-600 hover:bg-sky-50 dark:hover:text-sky-400 dark:hover:bg-sky-950/30"
      )}>
        <ItemIcon className="h-4 w-4 opacity-70 group-hover/item:opacity-100" />
        <span className="text-sm">{item.label}</span>
        {item.badge && (
           <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-zinc-300">
              {item.badge}
           </span>
        )}
      </div>
    )

    if (item.href) {
      return <Link href={item.href}>{content}</Link>
    }
    return <div onClick={item.onClick}>{content}</div>
})
ActionItem.displayName = 'ActionItem'

const ActionSection = React.memo(({ section }: { section: ActionSection }) => {
    const Icon = section.icon
    return (
      <div className="bg-gray-50 dark:bg-zinc-950 p-6 space-y-4 group/section hover:bg-gray-100 dark:hover:bg-zinc-900/20 transition-colors">
        <div className="flex items-center gap-2 mb-4">
           <Icon className="h-4 w-4 text-gray-500 group-hover/section:text-gray-700 dark:text-zinc-500 dark:group-hover/section:text-zinc-300 transition-colors" />
           <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">{section.title}</h3>
        </div>
        <div className="space-y-1">
          {section.items.map((item) => (
            <ActionItem key={item.label} item={item} />
          ))}
        </div>
      </div>
    )
})
ActionSection.displayName = 'ActionSection'

export const StaffActionCenter = React.memo(function StaffActionCenter({
  className,
  onWorkflowTrigger
}: {
  className?: string
  onWorkflowTrigger?: (workflowKey: string) => void
}) {
  // Removed local state for expanded sections as we are using a grid layout now
  
  const actionSections: ActionSection[] = [
    {
      title: 'Quick Actions',
      icon: Zap,
      items: [
        {
          label: 'New Deal',
          href: '/versotech_main/deals/new',
          icon: PlusCircle,
          description: 'Create opportunity',
          variant: 'success'
        },
        {
          label: 'KYC Review',
          href: '/versotech_main/kyc-review',
          icon: UserCheck,
          description: 'Pending reviews',
          variant: 'warning'
        },
        {
          label: 'Messages',
          href: '/versotech_main/messages',
          icon: MessageCircle,
          description: 'Investor comms',
          variant: 'info'
        },
        {
          label: 'Reconciliation',
          href: '/versotech_main/reconciliation',
          icon: Calculator,
          description: 'Match transactions',
          variant: 'default'
        },
        {
          label: 'Documents',
          href: '/versotech_main/documents',
          icon: Upload,
          description: 'Document library',
          variant: 'default'
        },
        {
          label: 'Approvals',
          href: '/versotech_main/approvals',
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
          href: '/versotech_main/deals',
          icon: Building2,
          description: 'Active deals'
        },
        {
          label: 'Investors',
          href: '/versotech_main/investors',
          icon: Users,
          description: 'LP management'
        },
        {
          label: 'Subscriptions',
          href: '/versotech_main/subscriptions',
          icon: FileSignature,
          description: 'Commitments'
        },
        {
          label: 'Entities',
          href: '/versotech_main/entities',
          icon: Building,
          description: 'Entity registry'
        },
        {
          label: 'Introducers',
          href: '/versotech_main/introducers',
          icon: Briefcase,
          description: 'Source tracking'
        },
        {
          label: 'Requests',
          href: '/versotech_main/requests',
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
          href: '/versotech_main/approvals',
          icon: CheckCircle,
          description: 'Pending approvals'
        },
        {
          label: 'Audit Trail',
          href: '/versotech_main/audit',
          icon: FileSearch,
          description: 'Activity logs'
        },
        {
          label: 'KYC Processing',
          href: '/versotech_main/kyc-review',
          icon: UserCheck,
          description: 'Verification queue'
        },
        {
          label: 'Documents',
          href: '/versotech_main/documents',
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
          href: '/versotech_main/fees',
          icon: Receipt,
          description: 'Calculate fees'
        },
        {
          label: 'Reconciliation',
          href: '/versotech_main/reconciliation',
          icon: GitPullRequest,
          description: 'Bank matching'
        },
        {
          label: 'Vehicle Summary',
          href: '/versotech_main/subscriptions/vehicle-summary',
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
          href: '/versotech_main/processes',
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
          href: '/versotech_main/requests/analytics',
          icon: TrendingUp,
          description: 'SLA metrics'
        },
        {
          label: 'Audit Trail',
          href: '/versotech_main/audit',
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
          href: '/versotech_main/admin',
          icon: Settings,
          description: 'System config'
        },
        {
          label: 'My Profile',
          href: '/versotech_main/profile',
          icon: User,
          description: 'Account settings'
        }
      ]
    }
  ]

  return (
    <Card className={cn(
      'bg-white dark:bg-zinc-900/30 backdrop-blur-md border-gray-200 dark:border-white/5 shadow-lg dark:shadow-2xl',
      'transition-all duration-300',
      className
    )}>
      <CardHeader className="pb-6 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-white/10 shadow-inner">
              <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400/90" />
            </div>
            <div>
              <CardTitle className="text-gray-900 dark:text-zinc-100 text-xl font-medium tracking-tight">
                Operations Center
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">
                Control Panel & Quick Actions
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">System Online</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-200 dark:bg-white/5">
          {actionSections.map((section) => (
            <ActionSection key={section.title} section={section} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
