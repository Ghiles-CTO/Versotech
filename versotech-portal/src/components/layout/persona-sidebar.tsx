'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { usePersona, Persona } from '@/contexts/persona-context'
import { useTheme } from '@/components/theme-provider'
import {
  LayoutDashboard,
  Building2,
  FileText,
  FileSignature,
  MessageSquare,
  CheckSquare,
  TrendingUp,
  Users,
  Workflow,
  ClipboardList,
  Shield,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HandHeart,
  Calculator,
  Activity,
  Briefcase,
  UserCheck,
  Search,
  Bell,
  Calendar,
  Lock,
  Share2,
  ArrowRightLeft,
  UserPlus,
  Scale,
  PenTool
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
}

// Navigation items for each persona type
const PERSONA_NAV_ITEMS: Record<string, NavItem[]> = {
  // CEO persona - Verso Capital management (full access)
  // Note: CEO Profile is accessed via user menu (Profile Settings), not sidebar
  ceo: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Overview' },
    { name: 'Messages', href: '/versotech_main/messages', icon: MessageSquare, description: 'Inbox' },
    { name: 'Approvals', href: '/versotech_main/approvals', icon: UserCheck, description: 'Pending approvals' },
    { name: 'Deals', href: '/versotech_main/deals', icon: Activity, description: 'Deal management' },
    { name: 'Vehicles', href: '/versotech_main/entities', icon: Building2, description: 'Investment vehicles' },
    { name: 'Investors', href: '/versotech_main/investors', icon: Users, description: 'Investor relations' },
    { name: 'Subscriptions', href: '/versotech_main/subscriptions', icon: FileText, description: 'Subscription tracking' },
    { name: 'Requests', href: '/versotech_main/requests', icon: ClipboardList, description: 'Service requests' },
    { name: 'Documents', href: '/versotech_main/documents', icon: FileText, description: 'Document center' },
    { name: 'VersoSign', href: '/versotech_main/versosign', icon: FileSignature, description: 'E-signatures' },
    { name: 'Introducers', href: '/versotech_main/introducers', icon: HandHeart, description: 'Partners' },
    { name: 'Introducer Agreements', href: '/versotech_main/introducer-agreements', icon: FileText, description: 'Fee agreements' },
    { name: 'Arrangers', href: '/versotech_main/arrangers', icon: Briefcase, description: 'Regulated entities' },
    { name: 'Users', href: '/versotech_main/users', icon: Users, description: 'All user types' },
    { name: 'Calendar', href: '/versotech_main/calendar', icon: Calendar, description: 'Schedule' },
    { name: 'KYC Review', href: '/versotech_main/kyc-review', icon: UserCheck, description: 'KYC compliance' },
    { name: 'Fees', href: '/versotech_main/fees', icon: Calculator, description: 'Billing' },
    { name: 'Reconciliation', href: '/versotech_main/reconciliation', icon: Calculator, description: 'Payments' },
    { name: 'Audit', href: '/versotech_main/audit', icon: Shield, description: 'Compliance logs' },
    { name: 'Processes', href: '/versotech_main/processes', icon: Workflow, description: 'Workflows' },
    { name: 'Admin', href: '/versotech_main/admin', icon: Database, description: 'System settings' },
  ],

  // Staff persona - common items for non-CEO staff roles (staff_ops, staff_rm)
  staff: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Overview' },
    { name: 'Messages', href: '/versotech_main/messages', icon: MessageSquare, description: 'Inbox' },
    { name: 'Approvals', href: '/versotech_main/approvals', icon: UserCheck, description: 'Pending approvals' },
    { name: 'Deals', href: '/versotech_main/deals', icon: Activity, description: 'Deal management' },
    { name: 'Vehicles', href: '/versotech_main/entities', icon: Building2, description: 'Investment vehicles' },
    { name: 'Investors', href: '/versotech_main/investors', icon: Users, description: 'Investor relations' },
    { name: 'Subscriptions', href: '/versotech_main/subscriptions', icon: FileText, description: 'Subscription tracking' },
    { name: 'Requests', href: '/versotech_main/requests', icon: ClipboardList, description: 'Service requests' },
    { name: 'Documents', href: '/versotech_main/documents', icon: FileText, description: 'Document center' },
    { name: 'VersoSign', href: '/versotech_main/versosign', icon: FileSignature, description: 'E-signatures' },
    { name: 'Introducers', href: '/versotech_main/introducers', icon: HandHeart, description: 'Partners' },
    { name: 'Introducer Agreements', href: '/versotech_main/introducer-agreements', icon: FileText, description: 'Fee agreements' },
    { name: 'Arrangers', href: '/versotech_main/arrangers', icon: Briefcase, description: 'Regulated entities' },
    { name: 'Users', href: '/versotech_main/users', icon: Users, description: 'All user types' },
    { name: 'Calendar', href: '/versotech_main/calendar', icon: Calendar, description: 'Schedule' },
  ],

  // Investor persona
  investor: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Portfolio overview' },
    { name: 'Investment Opportunities', href: '/versotech_main/opportunities', icon: TrendingUp, description: 'Active deals & pipeline' },
    { name: 'Portfolio', href: '/versotech_main/portfolio', icon: Briefcase, description: 'My investments' },
    { name: 'Documents', href: '/versotech_main/documents', icon: FileText, description: 'My documents' },
    { name: 'Inbox', href: '/versotech_main/inbox', icon: MessageSquare, description: 'Tasks, messages & notifications' },
    { name: 'Profile', href: '/versotech_main/profile', icon: UserCheck, description: 'Entity & members' },
  ],

  // Arranger persona
  arranger: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Overview' },
    { name: 'My Mandates', href: '/versotech_main/my-mandates', icon: FileSignature, description: 'Deals I manage' },
    { name: 'Subscription Packs', href: '/versotech_main/subscription-packs', icon: FileText, description: 'Pack review' },
    { name: 'Escrow', href: '/versotech_main/escrow', icon: Lock, description: 'Escrow status' },
    { name: 'Reconciliation', href: '/versotech_main/arranger-reconciliation', icon: Calculator, description: 'Financials' },
    { name: 'Fee Plans', href: '/versotech_main/fee-plans', icon: Calculator, description: 'Fee structures' },
    { name: 'Payment Requests', href: '/versotech_main/payment-requests', icon: ClipboardList, description: 'Fee collection' },
    { name: 'My Partners', href: '/versotech_main/my-partners', icon: Users, description: 'Partner network' },
    { name: 'My Introducers', href: '/versotech_main/my-introducers', icon: UserPlus, description: 'Introducer network' },
    { name: 'My Commercial Partners', href: '/versotech_main/my-commercial-partners', icon: Building2, description: 'CP network' },
    { name: 'My Lawyers', href: '/versotech_main/my-lawyers', icon: Scale, description: 'Legal counsel' },
    { name: 'VERSOSign', href: '/versotech_main/versosign', icon: FileSignature, description: 'E-signatures' },
    { name: 'Profile', href: '/versotech_main/arranger-profile', icon: UserCheck, description: 'Entity & KYC status' },
  ],

  // Introducer persona
  // NOTE: Messages removed per PRD - introducers have no messaging user stories (passive notification recipients only)
  introducer: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Overview' },
    { name: 'Introductions', href: '/versotech_main/introductions', icon: UserPlus, description: 'My introductions' },
    { name: 'Agreements', href: '/versotech_main/introducer-agreements', icon: FileText, description: 'Fee agreements' },
    { name: 'My Commissions', href: '/versotech_main/my-commissions', icon: Calculator, description: 'Commission tracking & invoices' },
    { name: 'VersoSign', href: '/versotech_main/versosign', icon: FileSignature, description: 'E-signatures' },
    { name: 'Profile', href: '/versotech_main/introducer-profile', icon: UserCheck, description: 'My profile' },
  ],

  // Partner persona
  // PRD Section 5.6: My Transactions as Partner - tracking referrals, commissions, invoicing
  partner: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Overview' },
    { name: 'Opportunities', href: '/versotech_main/opportunities', icon: TrendingUp, description: 'Investment opportunities' },
    { name: 'Transactions', href: '/versotech_main/partner-transactions', icon: ArrowRightLeft, description: 'My referred investors' },
    { name: 'My Commissions', href: '/versotech_main/my-commissions', icon: Calculator, description: 'Revenue & invoicing' },
    { name: 'Shared Deals', href: '/versotech_main/shared-transactions', icon: Share2, description: 'Co-referred deals' },
    { name: 'VersoSign', href: '/versotech_main/versosign', icon: FileSignature, description: 'E-signatures' },
    { name: 'Profile', href: '/versotech_main/partner-profile', icon: UserCheck, description: 'Entity & members' },
  ],

  // Commercial Partner persona
  commercial_partner: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Overview' },
    { name: 'Opportunities', href: '/versotech_main/opportunities', icon: TrendingUp, description: 'Investment opportunities' },
    { name: 'Client Transactions', href: '/versotech_main/client-transactions', icon: Users, description: 'Client investors' },
    { name: 'Portfolio', href: '/versotech_main/portfolio', icon: Briefcase, description: 'My investments' },
    { name: 'Agreements', href: '/versotech_main/placement-agreements', icon: FileText, description: 'Placement agreements' },
    { name: 'Profile', href: '/versotech_main/commercial-partner-profile', icon: FileSignature, description: 'Signature & settings' },
    { name: 'Notifications', href: '/versotech_main/notifications', icon: Bell, description: 'Alerts & updates' },
    { name: 'Messages', href: '/versotech_main/messages', icon: MessageSquare, description: 'Communications' },
  ],

  // Lawyer persona
  // NOTE: Messages removed - lawyers are passive notification recipients only (same as introducers)
  // NOTE: Notifications removed from sidebar - header bell icon provides access (avoids redundancy)
  lawyer: [
    { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard, description: 'Overview' },
    { name: 'Assigned Deals', href: '/versotech_main/assigned-deals', icon: Briefcase, description: 'My deals' },
    { name: 'Escrow', href: '/versotech_main/escrow', icon: Lock, description: 'Escrow management' },
    { name: 'Subscription Packs', href: '/versotech_main/subscription-packs', icon: FileText, description: 'Pack review' },
    { name: 'VersoSign', href: '/versotech_main/versosign', icon: PenTool, description: 'E-signatures' },
    { name: 'Reconciliation', href: '/versotech_main/lawyer-reconciliation', icon: Calculator, description: 'Financials' },
    { name: 'Profile', href: '/versotech_main/lawyer-profile', icon: FileSignature, description: 'Signature & settings' },
  ],
}

/**
 * Get navigation items for a specific persona
 */
function getNavForPersona(persona: Persona): NavItem[] {
  // CEO persona now has its own nav items (no longer uses staff + extras)
  return PERSONA_NAV_ITEMS[persona.persona_type] || []
}

/**
 * Merge navigation items from multiple personas (deduping by href)
 */
function mergeNavItems(personas: Persona[]): NavItem[] {
  const seen = new Set<string>()
  const merged: NavItem[] = []

  for (const persona of personas) {
    const items = getNavForPersona(persona)
    for (const item of items) {
      if (!seen.has(item.href)) {
        seen.add(item.href)
        merged.push(item)
      }
    }
  }

  return merged
}

export function PersonaSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const { personas, activePersona } = usePersona()
  const { theme } = useTheme()

  // Hydration fix: Only apply theme after component mounts to avoid SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine if dark mode based on ACTIVE persona only
  // Use mounted check to prevent hydration mismatch (server renders light, client may have dark)
  const isDark = mounted && theme === 'staff-dark'

  // Build navigation based on active persona or all personas
  const navItems = useMemo(() => {
    // If user has active persona, show items for that persona only
    if (activePersona) {
      return getNavForPersona(activePersona)
    }
    // Otherwise merge all persona nav items
    return mergeNavItems(personas)
  }, [activePersona, personas])

  // Filter nav items by search
  const filteredNavItems = navItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle sign out
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/versotech_main/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className={cn(
      "flex flex-col h-screen transition-all duration-300 border-r relative z-50",
      collapsed ? "w-[80px]" : "w-[280px]",
      isDark
        ? "bg-zinc-950 border-white/5 text-zinc-400"
        : "bg-white border-gray-100 text-gray-600"
    )}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between h-20">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="relative h-10 w-32 overflow-hidden">
              <Image
                src="/versotech-logo.jpg"
                alt="Logo"
                fill
                className={cn(
                  "object-contain object-left",
                  isDark && "invert"
                )}
                priority
              />
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto">
            <div className={cn(
              "relative h-8 w-8 rounded-lg overflow-hidden",
              isDark ? "bg-white/5 ring-1 ring-white/10" : "bg-gray-50 ring-1 ring-gray-100"
            )}>
              <Image
                src="/versotech-logo.jpg"
                alt="Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-8 h-6 w-6 rounded-full border shadow-sm z-50 hidden md:flex items-center justify-center transition-colors",
            isDark
              ? "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              : "bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative group">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
              isDark
                ? "text-gray-500 group-focus-within:text-white"
                : "text-gray-400 group-focus-within:text-gray-900"
            )} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 py-2 rounded-lg text-sm transition-all outline-none",
                isDark
                  ? "bg-white/5 border border-white/5 text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-white/10"
                  : "bg-gray-50 border border-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-blue-500/10"
              )}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 space-y-1">
        {filteredNavItems.map((item) => {
          const isDashboard = item.name === 'Dashboard'
          const isActive = isDashboard
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} className="block group relative">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? isDark
                    ? "bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-400"
                    : "bg-blue-50 text-blue-700"
                  : isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? isDark ? "text-blue-400" : "text-blue-600"
                    : isDark ? "text-gray-500 group-hover:text-white" : "text-gray-400 group-hover:text-gray-600"
                )} />

                {!collapsed && (
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                    isDark ? "bg-blue-500" : "bg-blue-600"
                  )} />
                )}
              </div>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className={cn(
                  "absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border",
                  isDark
                    ? "bg-zinc-800 border-white/10 text-white"
                    : "bg-white border-gray-100 text-gray-900"
                )}>
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Sign Out */}
      <div className={cn(
        "p-4 border-t mt-auto",
        isDark ? "border-white/5" : "border-gray-100"
      )}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3",
            isDark
              ? "text-gray-400 hover:text-red-400 hover:bg-white/5"
              : "text-gray-600 hover:text-red-600 hover:bg-red-50"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  )
}
