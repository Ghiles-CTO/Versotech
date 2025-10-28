'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  Activity,
  Calendar,
  MessageSquare,
  UserCheck,
  Settings,
  Plus,
  Search,
  TrendingUp,
  Workflow,
  ClipboardList,
  HandHeart,
  Calculator,
  CreditCard,
  Package,
  Shield,
  Database
} from 'lucide-react'

interface CommandPaletteProps {
  onQuickAddSubscription?: () => void
  brand?: 'versoholdings' | 'versotech'
}

interface CommandAction {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  keywords?: string[]
  action: () => void
  group: 'navigation' | 'actions' | 'recent'
}

export function CommandPalette({ onQuickAddSubscription, brand = 'versotech' }: CommandPaletteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Detect platform for keyboard shortcuts
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'

  // Define commands based on brand
  const staffCommands: CommandAction[] = [
    // Navigation - Staff Portal
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Operations overview',
      icon: LayoutDashboard,
      keywords: ['home', 'overview', 'metrics'],
      action: () => router.push('/versotech/staff'),
      group: 'navigation'
    },
    {
      id: 'nav-investors',
      label: 'Investors',
      description: 'Manage investor accounts',
      icon: Users,
      keywords: ['clients', 'kyc', 'accounts'],
      action: () => router.push('/versotech/staff/investors'),
      group: 'navigation'
    },
    {
      id: 'nav-subscriptions',
      label: 'Subscriptions',
      description: 'Manage subscriptions',
      icon: FileText,
      keywords: ['commitments', 'deals'],
      action: () => router.push('/versotech/staff/subscriptions'),
      group: 'navigation'
    },
    {
      id: 'nav-entities',
      label: 'Entities',
      description: 'Manage vehicles and entities',
      icon: Building2,
      keywords: ['vehicles', 'funds', 'spvs'],
      action: () => router.push('/versotech/staff/entities'),
      group: 'navigation'
    },
    {
      id: 'nav-deals',
      label: 'Deals',
      description: 'Manage deal inventory',
      icon: Activity,
      keywords: ['opportunities', 'investments'],
      action: () => router.push('/versotech/staff/deals'),
      group: 'navigation'
    },
    {
      id: 'nav-approvals',
      label: 'Approvals',
      description: 'Review and approve',
      icon: UserCheck,
      keywords: ['review', 'approve', 'pending'],
      action: () => router.push('/versotech/staff/approvals'),
      group: 'navigation'
    },
    {
      id: 'nav-messages',
      label: 'Messages',
      description: 'Investor communication',
      icon: MessageSquare,
      keywords: ['chat', 'inbox', 'communication'],
      action: () => router.push('/versotech/staff/messages'),
      group: 'navigation'
    },
    {
      id: 'nav-calendar',
      label: 'Calendar',
      description: 'Deadlines and schedule',
      icon: Calendar,
      keywords: ['schedule', 'deadlines', 'events'],
      action: () => router.push('/versotech/staff/calendar'),
      group: 'navigation'
    },
    {
      id: 'nav-processes',
      label: 'Processes',
      description: 'Workflow automation',
      icon: Workflow,
      keywords: ['automation', 'workflows'],
      action: () => router.push('/versotech/staff/processes'),
      group: 'navigation'
    },
    {
      id: 'nav-requests',
      label: 'Requests',
      description: 'Investor requests',
      icon: ClipboardList,
      keywords: ['tickets', 'support'],
      action: () => router.push('/versotech/staff/requests'),
      group: 'navigation'
    },
    {
      id: 'nav-introducers',
      label: 'Introducers',
      description: 'Manage introducers',
      icon: HandHeart,
      keywords: ['referrals', 'partners'],
      action: () => router.push('/versotech/staff/introducers'),
      group: 'navigation'
    },
    {
      id: 'nav-fees',
      label: 'Fees',
      description: 'Fee management',
      icon: Calculator,
      keywords: ['billing', 'charges'],
      action: () => router.push('/versotech/staff/fees'),
      group: 'navigation'
    },
    {
      id: 'nav-reconciliation',
      label: 'Reconciliation',
      description: 'Bank reconciliation',
      icon: CreditCard,
      keywords: ['payments', 'banking'],
      action: () => router.push('/versotech/staff/reconciliation'),
      group: 'navigation'
    },
    {
      id: 'nav-doc-automation',
      label: 'Doc Automation',
      description: 'Document templates',
      icon: Package,
      keywords: ['templates', 'documents'],
      action: () => router.push('/versotech/staff/documents/automation'),
      group: 'navigation'
    },
    {
      id: 'nav-audit',
      label: 'Audit',
      description: 'Audit logs',
      icon: Shield,
      keywords: ['compliance', 'logs', 'security'],
      action: () => router.push('/versotech/staff/audit'),
      group: 'navigation'
    },
    {
      id: 'nav-admin',
      label: 'Admin',
      description: 'System administration',
      icon: Database,
      keywords: ['settings', 'config'],
      action: () => router.push('/versotech/staff/admin'),
      group: 'navigation'
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Account settings',
      icon: Settings,
      keywords: ['preferences', 'profile'],
      action: () => router.push('/versotech/settings'),
      group: 'navigation'
    },

    // Quick Actions
    {
      id: 'action-add-subscription',
      label: 'Add Subscription',
      description: 'Quick add a new subscription',
      icon: Plus,
      shortcut: `${modKey}⇧S`,
      keywords: ['create', 'new', 'subscription'],
      action: () => {
        setOpen(false)
        onQuickAddSubscription?.()
      },
      group: 'actions'
    },
    {
      id: 'action-search-investors',
      label: 'Search Investors',
      description: 'Find an investor',
      icon: Search,
      keywords: ['find', 'investor', 'search'],
      action: () => router.push('/versotech/staff/investors'),
      group: 'actions'
    }
  ]

  const investorCommands: CommandAction[] = [
    // Navigation - Investor Portal
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Portfolio overview',
      icon: LayoutDashboard,
      keywords: ['home', 'overview'],
      action: () => router.push('/versoholdings/dashboard'),
      group: 'navigation'
    },
    {
      id: 'nav-deals',
      label: 'Active Deals',
      description: 'Investment opportunities',
      icon: Activity,
      keywords: ['investments', 'opportunities'],
      action: () => router.push('/versoholdings/deals'),
      group: 'navigation'
    },
    {
      id: 'nav-holdings',
      label: 'Portfolio',
      description: 'My investments',
      icon: TrendingUp,
      keywords: ['investments', 'positions'],
      action: () => router.push('/versoholdings/holdings'),
      group: 'navigation'
    },
    {
      id: 'nav-calendar',
      label: 'Calendar',
      description: 'Deadlines and events',
      icon: Calendar,
      keywords: ['schedule', 'deadlines'],
      action: () => router.push('/versoholdings/calendar'),
      group: 'navigation'
    },
    {
      id: 'nav-messages',
      label: 'Messages',
      description: 'Communication',
      icon: MessageSquare,
      keywords: ['chat', 'inbox'],
      action: () => router.push('/versoholdings/messages'),
      group: 'navigation'
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Account settings',
      icon: Settings,
      keywords: ['preferences', 'profile'],
      action: () => router.push('/versoholdings/settings'),
      group: 'navigation'
    }
  ]

  const commands = brand === 'versotech' ? staffCommands : investorCommands

  // Toggle command palette with Cmd/Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Group commands
  const navigationCommands = commands.filter(c => c.group === 'navigation')
  const actionCommands = commands.filter(c => c.group === 'actions')

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {actionCommands.length > 0 && (
          <>
            <CommandGroup heading="Quick Actions">
              {actionCommands.map((command) => {
                const Icon = command.icon
                return (
                  <CommandItem
                    key={command.id}
                    value={`${command.label} ${command.description} ${command.keywords?.join(' ')}`}
                    onSelect={() => {
                      command.action()
                      setOpen(false)
                    }}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <div className="flex-1">
                      <div>{command.label}</div>
                      {command.description && (
                        <div className="text-xs text-muted-foreground">
                          {command.description}
                        </div>
                      )}
                    </div>
                    {command.shortcut && (
                      <CommandShortcut>{command.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigation">
          {navigationCommands.map((command) => {
            const Icon = command.icon
            const isActive = pathname === command.action.toString().match(/push\('(.+?)'\)/)?.[1]
            return (
              <CommandItem
                key={command.id}
                value={`${command.label} ${command.description} ${command.keywords?.join(' ')}`}
                onSelect={() => {
                  command.action()
                  setOpen(false)
                }}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                <div className="flex-1">
                  <div className={isActive ? 'font-semibold' : ''}>
                    {command.label}
                  </div>
                  {command.description && (
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  )}
                </div>
                {command.shortcut && (
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
