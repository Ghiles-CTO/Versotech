import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  Building2,
  Handshake,
  AlertCircle,
  CheckCircle2,
  Timer,
  CircleDollarSign
} from 'lucide-react'
import { DealsListClient } from '@/components/deals/deals-list-client'

export const dynamic = 'force-dynamic'

interface Deal {
  id: string
  name: string
  deal_type: string
  status: string
  currency: string
  offer_unit_price: number | null
  created_at: string
  vehicles?: {
    name: string
    type: string
  }
  deal_memberships: any[]
  _inventory_summary?: {
    total_units: number
    available_units: number
    reserved_units: number
    allocated_units: number
  }
}

const dealTypeLabels = {
  equity_secondary: 'Secondary',
  equity_primary: 'Primary',
  credit_trade_finance: 'Credit/Trade',
  other: 'Other'
}

const statusColors = {
  draft: 'bg-white/10 text-foreground border border-white/20',
  open: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  allocation_pending: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  closed: 'bg-blue-500/20 text-blue-200 border border-blue-400/30',
  cancelled: 'bg-red-500/20 text-red-200 border border-red-400/30'
}

export default async function DealsPage() {
  // Use service client to bypass RLS for staff users
  const supabase = createServiceClient()

  // Fetch deals data
  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (
        name,
        type
      ),
      deal_memberships (
        user_id,
        role
      )
    `)
    .order('created_at', { ascending: false })

  const dealsData: Deal[] = deals || []

  // Calculate summary statistics
  const summary = {
    total: dealsData.length,
    open: dealsData.filter(d => d.status === 'open').length,
    draft: dealsData.filter(d => d.status === 'draft').length,
    closed: dealsData.filter(d => d.status === 'closed').length,
    totalValue: dealsData.reduce((sum, deal) => {
      const price = deal.offer_unit_price || 0
      return sum + price * 1000 // Approximate based on typical deal sizes
    }, 0)
  }

  return (
    <DealsListClient deals={dealsData} summary={summary} />
    )
}



























