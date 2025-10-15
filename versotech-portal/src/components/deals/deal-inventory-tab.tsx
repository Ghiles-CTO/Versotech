'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Package } from 'lucide-react'
import { AddShareLotModal } from './add-share-lot-modal'

interface DealInventoryTabProps {
  dealId: string
  shareLots: any[]
  inventorySummary: {
    total_units: number
    available_units: number
    reserved_units: number
    allocated_units: number
  }
}

export function DealInventoryTab({ dealId, shareLots, inventorySummary }: DealInventoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {inventorySummary.total_units.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-200">
              {inventorySummary.available_units.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-200">
              {inventorySummary.reserved_units.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-sky-200">
              {inventorySummary.allocated_units.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Share Lots Table */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="h-5 w-5" />
                Share Lots
              </CardTitle>
              <CardDescription>Inventory sources and allocation tracking</CardDescription>
            </div>
            <AddShareLotModal dealId={dealId} />
          </div>
        </CardHeader>
        <CardContent>
          {!shareLots || shareLots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No share lots added yet. Click "Add Share Lot" to begin.
            </div>
          ) : (
            <div className="space-y-3">
              {shareLots.map((lot) => (
                <div
                  key={lot.id}
                  className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {lot.share_sources?.counterparty_name || 'Unknown Source'}
                        </span>
                        <Badge variant="outline" className="border-white/20 text-xs">
                          {lot.share_sources?.kind}
                        </Badge>
                        <Badge className={
                          lot.status === 'available' ? 'bg-emerald-500/20 text-emerald-200' :
                          lot.status === 'exhausted' ? 'bg-red-500/20 text-red-200' :
                          'bg-amber-500/20 text-amber-200'
                        }>
                          {lot.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Total: {lot.units_total.toLocaleString()} units</span>
                        <span>Remaining: {lot.units_remaining.toLocaleString()} units</span>
                        <span>Cost: {lot.currency} {lot.unit_cost.toFixed(2)}/unit</span>
                        {lot.acquired_at && (
                          <span>Acquired: {new Date(lot.acquired_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
