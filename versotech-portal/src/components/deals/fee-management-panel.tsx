'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface FeeManagementPanelProps {
  dealId: string
  dealName: string
}

interface FeePlan {
  id: string
  name: string
  description: string
  is_default: boolean
  fee_components: FeeComponent[]
}

interface FeeComponent {
  id: string
  kind: string
  calc_method: string
  rate_bps: number
  flat_amount: number
  frequency: string
  notes: string
}

interface FeeEvent {
  id: string
  event_date: string
  computed_amount: number
  currency: string
  status: string
  investors?: {
    legal_name: string
  }
  fee_components?: {
    kind: string
    calc_method: string
    rate_bps: number
  }
}

interface Invoice {
  id: string
  due_date: string
  total: number
  currency: string
  status: string
  created_at: string
  investors?: {
    legal_name: string
  }
  invoice_lines: any[]
}

export default function FeeManagementPanel({ dealId, dealName }: FeeManagementPanelProps) {
  const [feePlans, setFeePlans] = useState<FeePlan[]>([])
  const [feeEvents, setFeeEvents] = useState<FeeEvent[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)
  const [generating, setGenerating] = useState(false)

  const loadFeeData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load fee plans
      const feePlansResponse = await fetch(`/api/deals/${dealId}`)
      if (feePlansResponse.ok) {
        const dealData = await feePlansResponse.json()
        // Assuming fee plans are included in deal data
        setFeePlans([]) // Will be populated when we add fee plans to deal API
      }

      // Load fee events
      const feeEventsResponse = await fetch(`/api/deals/${dealId}/fees/compute`)
      if (feeEventsResponse.ok) {
        const eventsData = await feeEventsResponse.json()
        setFeeEvents(eventsData.fee_events || [])
      }

      // Load invoices
      const invoicesResponse = await fetch(`/api/deals/${dealId}/invoices/generate`)
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.invoices || [])
      }

    } catch (error) {
      console.error('Error loading fee data:', error)
      toast.error('Failed to load fee data')
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    loadFeeData()
  }, [dealId, loadFeeData])

  const computeFeeEvents = async () => {
    try {
      setComputing(true)
      
      const response = await fetch(`/api/deals/${dealId}/fees/compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          as_of_date: new Date().toISOString().split('T')[0]
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Computed ${result.events_created} fee events`)
        loadFeeData() // Refresh data
      } else {
        toast.error(result.error || 'Failed to compute fee events')
      }

    } catch (error) {
      console.error('Error computing fees:', error)
      toast.error('Failed to compute fee events')
    } finally {
      setComputing(false)
    }
  }

  const generateInvoices = async () => {
    try {
      setGenerating(true)
      
      const response = await fetch(`/api/deals/${dealId}/invoices/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          up_to_date: new Date().toISOString().split('T')[0]
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        loadFeeData() // Refresh data
      } else {
        toast.error(result.error || 'Failed to generate invoice')
      }

    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error('Failed to generate invoice')
    } finally {
      setGenerating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accrued': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
      case 'invoiced': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      case 'voided': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      case 'draft': return 'bg-muted text-muted-foreground'
      case 'sent': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
      case 'paid': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      case 'partial': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fee Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Fee Management Actions</h3>
        
        <div className="flex gap-4">
          <Button
            onClick={computeFeeEvents}
            disabled={computing}
            variant="outline"
          >
            {computing ? 'Computing...' : 'Compute Fee Events'}
          </Button>
          
          <Button
            onClick={generateInvoices}
            disabled={generating}
            className="bg-green-600 hover:bg-green-700"
          >
            {generating ? 'Generating...' : 'Generate Invoices'}
          </Button>
        </div>
      </Card>

      {/* Fee Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Fee Events</h3>
        
        <div className="space-y-3">
          {feeEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                  <span className="font-medium">
                    {event.fee_components?.kind} - {event.computed_amount} {event.currency}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Investor: {event.investors?.legal_name} • 
                  Date: {new Date(event.event_date).toLocaleDateString()} •
                  Method: {event.fee_components?.calc_method} ({event.fee_components?.rate_bps} bps)
                </div>
              </div>
            </div>
          ))}
          
          {feeEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No fee events computed yet
            </div>
          )}
        </div>
      </Card>

      {/* Invoices */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generated Invoices</h3>
        
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                  <span className="font-medium">
                    {invoice.total} {invoice.currency}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Investor: {invoice.investors?.legal_name} • 
                  Due: {new Date(invoice.due_date).toLocaleDateString()} •
                  Lines: {invoice.invoice_lines?.length || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(invoice.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          
          {invoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No invoices generated yet
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
