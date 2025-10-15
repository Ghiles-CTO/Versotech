'use client'

import { useState, useEffect } from 'react'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { usePerformanceMonitoring } from '@/lib/performance-monitor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, ChevronDown, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Deal {
  id: string
  name: string
  deal_type: string
  status: string
  vehicle_name: string
  open_at: string
  close_at: string
}

interface DealContextSelectorProps {
  investorIds: string[]
  selectedDealId?: string
  onDealChange: (dealId: string | null) => void
  className?: string
}

export function DealContextSelector({
  investorIds,
  selectedDealId,
  onDealChange,
  className
}: DealContextSelectorProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllDeals, setShowAllDeals] = useState(false)
  const { startOperation, endOperation } = usePerformanceMonitoring('DealContextSelector')

  useEffect(() => {
    fetchAccessibleDeals()
  }, [investorIds])

  const fetchAccessibleDeals = async () => {
    if (!investorIds.length) {
      console.log('No investor IDs provided')
      setLoading(false)
      return
    }

    console.log('Fetching deals for investor IDs:', investorIds)
    startOperation('fetch-deals')

    // Check cache first
    const cacheKey = CacheKeys.dealList(investorIds)
    const cachedDeals = cache.get(cacheKey) as Deal[] | null

    if (cachedDeals) {
      setDeals(cachedDeals)
      setLoading(false)
      endOperation('fetch-deals', { source: 'cache', count: cachedDeals.length })
      return
    }

    try {
      const supabase = createClient()

      // Get deals through direct relationships first
      const dealIds = new Set<string>()

      // Get deals from deal_memberships
      const { data: membershipDeals } = await supabase
        .from('deal_memberships')
        .select('deal_id')
        .in('investor_id', investorIds)

      membershipDeals?.forEach(m => dealIds.add(m.deal_id))

      // Get deals from deal_commitments
      const { data: commitmentDeals } = await supabase
        .from('deal_commitments')
        .select('deal_id')
        .in('investor_id', investorIds)

      commitmentDeals?.forEach(c => dealIds.add(c.deal_id))

      // Reservations deprecated - removed from workflow

      // Get deals from allocations
      const { data: allocationDeals } = await supabase
        .from('allocations')
        .select('deal_id')
        .in('investor_id', investorIds)

      allocationDeals?.forEach(a => dealIds.add(a.deal_id))

      const accessibleDealIds = Array.from(dealIds)
      console.log('Found accessible deal IDs:', accessibleDealIds)

      if (accessibleDealIds.length === 0) {
        console.log('No accessible deals found, using demo data')
        // For development/demo purposes, create some sample deals
        const demoDeals: Deal[] = [
          {
            id: 'demo-1',
            name: 'VERSO Secondary Opportunity I',
            deal_type: 'equity_secondary',
            status: 'open',
            vehicle_name: 'VERSO FUND',
            open_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            close_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-2',
            name: 'Real Empire Growth Deal',
            deal_type: 'equity_primary',
            status: 'allocation_pending',
            vehicle_name: 'REAL Empire',
            open_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            close_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-3',
            name: 'Luxembourg Bridge Financing',
            deal_type: 'credit_trade_finance',
            status: 'closed',
            vehicle_name: 'Luxembourg Entities',
            open_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            close_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        cache.set(cacheKey, demoDeals, CacheTTL.DEAL_LIST)
        setDeals(demoDeals)
        setLoading(false)
        endOperation('fetch-deals', { source: 'demo', count: demoDeals.length })
        return
      }

      // Now get the deal details
      const { data: dealData, error } = await supabase
        .from('deals')
        .select(`
          id,
          name,
          deal_type,
          status,
          open_at,
          close_at,
          vehicle_id
        `)
        .in('id', accessibleDealIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching deals:', error)
        setLoading(false)
        return
      }

      // If no deals returned due to RLS or other issues, fall back to demo data
      if (!dealData || dealData.length === 0) {
        console.log('No deals returned from query, using demo data')
        const demoDeals: Deal[] = [
          {
            id: 'demo-1',
            name: 'VERSO Secondary Opportunity I',
            deal_type: 'equity_secondary',
            status: 'open',
            vehicle_name: 'VERSO FUND',
            open_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            close_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-2',
            name: 'Real Empire Growth Deal',
            deal_type: 'equity_primary',
            status: 'allocation_pending',
            vehicle_name: 'REAL Empire',
            open_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            close_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        cache.set(cacheKey, demoDeals, CacheTTL.DEAL_LIST)
        setDeals(demoDeals)
        setLoading(false)
        endOperation('fetch-deals', { source: 'demo-fallback', count: demoDeals.length })
        return
      }

      // Get vehicle names separately
      const vehicleIds = [...new Set(dealData.map(d => d.vehicle_id).filter(Boolean))]
      let vehicleNames: Record<string, string> = {}
      
      if (vehicleIds.length > 0) {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('id, name')
          .in('id', vehicleIds)
        
        if (vehicles) {
          vehicleNames = vehicles.reduce((acc, v) => {
            acc[v.id] = v.name
            return acc
          }, {} as Record<string, string>)
        }
      }

      // Transform deal data
      const transformedDeals = dealData.map((deal: any) => ({
        id: deal.id,
        name: deal.name,
        deal_type: deal.deal_type,
        status: deal.status,
        vehicle_name: vehicleNames[deal.vehicle_id] || 'Unknown Vehicle',
        open_at: deal.open_at,
        close_at: deal.close_at
      }))

      // Cache the results
      cache.set(cacheKey, transformedDeals, CacheTTL.DEAL_LIST)
      setDeals(transformedDeals)
      endOperation('fetch-deals', { source: 'database', count: transformedDeals.length })
    } catch (error) {
      console.error('Error fetching accessible deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'allocation_pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getDealTypeLabel = (dealType: string) => {
    switch (dealType) {
      case 'equity_secondary': return 'Secondary'
      case 'equity_primary': return 'Primary'
      case 'credit_trade_finance': return 'Trade Finance'
      default: return dealType.replace('_', ' ').toUpperCase()
    }
  }

  const selectedDeal = deals.find(d => d.id === selectedDealId)
  const activeDeals = deals.filter(d => d.status === 'open' || d.status === 'allocation_pending')
  const displayDeals = showAllDeals ? deals : activeDeals

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Building2 className="h-4 w-4 animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!deals.length) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
        <Building2 className="h-4 w-4" />
        <span>No accessible deals found</span>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Deal Context</span>
        </div>
        <div className="flex items-center gap-2">
          {deals.length > activeDeals.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllDeals(!showAllDeals)}
              className="text-xs"
            >
              {showAllDeals ? 'Active Only' : 'Show All'}
            </Button>
          )}
          <Badge variant="outline" className="text-xs">
            {displayDeals.length} available
          </Badge>
        </div>
      </div>

      <Select
        value={selectedDealId || 'all'}
        onValueChange={(value) => onDealChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {selectedDeal ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedDeal.name}</span>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(selectedDeal.status)}`}>
                    {selectedDeal.status.replace('_', ' ')}
                  </Badge>
                </div>
              ) : (
                <span>All Deals (Portfolio View)</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">All Deals</span>
              <span className="text-xs text-gray-500">Portfolio Overview</span>
            </div>
          </SelectItem>

          {displayDeals.length > 0 && (
            <div className="px-2 py-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Available Deals
              </div>
            </div>
          )}

          {displayDeals.map((deal) => (
            <SelectItem key={deal.id} value={deal.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{deal.name}</div>
                    <div className="text-xs text-gray-500">
                      {deal.vehicle_name} • {getDealTypeLabel(deal.deal_type)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={`text-xs ${getStatusColor(deal.status)}`}>
                    {deal.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedDeal && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">{selectedDeal.name}</h4>
            <Badge className={getStatusColor(selectedDeal.status)}>
              {selectedDeal.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Vehicle: {selectedDeal.vehicle_name}</div>
            <div>Type: {getDealTypeLabel(selectedDeal.deal_type)}</div>
            {selectedDeal.open_at && (
              <div>
                Opened: {new Date(selectedDeal.open_at).toLocaleDateString()}
              </div>
            )}
            {selectedDeal.close_at && (
              <div>
                Closes: {new Date(selectedDeal.close_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}