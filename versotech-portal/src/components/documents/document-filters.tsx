'use client'

import { DocumentType, Vehicle, Deal, DocumentFilters } from '@/types/documents'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DocumentFiltersProps {
  vehicles: Vehicle[]
  deals: Deal[]
  typeCounts: Record<string, number>
  appliedFilters: DocumentFilters
  onChange: (filters: DocumentFilters) => void
}

export function DocumentFiltersComponent({
  vehicles,
  deals,
  typeCounts,
  appliedFilters,
  onChange
}: DocumentFiltersProps) {
  const ALL_VEHICLES_VALUE = '__all_vehicles__'
  const ALL_DEALS_VALUE = '__all_deals__'

  const [search, setSearch] = useState(appliedFilters.search || '')
  const [type, setType] = useState(appliedFilters.type || '')
  const [vehicleId, setVehicleId] = useState(appliedFilters.vehicle_id ?? ALL_VEHICLES_VALUE)
  const [dealId, setDealId] = useState(appliedFilters.deal_id ?? ALL_DEALS_VALUE)

  const handleApplyFilters = () => {
    onChange({
      search: search || undefined,
      type: type || undefined,
      vehicle_id: vehicleId === ALL_VEHICLES_VALUE ? undefined : vehicleId,
      deal_id: dealId === ALL_DEALS_VALUE ? undefined : dealId
    })
  }

  const handleClearFilters = () => {
    setSearch('')
    setType('')
    setVehicleId(ALL_VEHICLES_VALUE)
    setDealId(ALL_DEALS_VALUE)
    onChange({})
  }

  const hasFilters = Boolean(
    (search && search.trim()) ||
    type ||
    vehicleId !== ALL_VEHICLES_VALUE ||
    dealId !== ALL_DEALS_VALUE
  )

  const documentTypes = [
    { value: DocumentType.STATEMENT, label: 'Position Statements', emoji: '📊' },
    { value: DocumentType.REPORT, label: 'Reports', emoji: '📈' },
    { value: DocumentType.TAX, label: 'Tax Documents', emoji: '🧾' },
    { value: DocumentType.LEGAL, label: 'Legal', emoji: '📄' },
    { value: DocumentType.NDA, label: 'NDAs', emoji: '🔒' },
    { value: DocumentType.SUBSCRIPTION, label: 'Subscriptions', emoji: '✍️' },
    { value: DocumentType.AGREEMENT, label: 'Agreements', emoji: '📝' },
    { value: DocumentType.TERM_SHEET, label: 'Term Sheets', emoji: '📋' },
    { value: DocumentType.KYC, label: 'KYC', emoji: '🆔' },
    { value: DocumentType.OTHER, label: 'Other', emoji: '📁' }
  ]

  return (
    <div className="space-y-4">
      {/* Quick type filters */}
      <div className="flex flex-wrap gap-2">
        {documentTypes.map((docType) => {
          const count = typeCounts[docType.value] || 0
          const isActive = type === docType.value

          return (
            <Badge
              key={docType.value}
              variant={isActive ? 'default' : 'outline'}
              className={`
                cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'border-2 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
              onClick={() => {
                setType(isActive ? '' : docType.value)
                onChange({
                  ...appliedFilters,
                  type: isActive ? undefined : docType.value
                })
              }}
            >
              <span className="mr-2">{docType.emoji}</span>
              {docType.label}
              {count > 0 && (
                <span className="ml-2 text-xs opacity-75">({count})</span>
              )}
            </Badge>
          )
        })}
      </div>

      {/* Advanced filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyFilters()
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Vehicle filter */}
            {vehicles.length > 0 && (
              <div>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VEHICLES_VALUE}>All vehicles</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Deal filter */}
            {deals.length > 0 && (
              <div>
                <Select value={dealId} onValueChange={setDealId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All deals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_DEALS_VALUE}>All deals</SelectItem>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 lg:col-span-4 md:col-span-2">
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>

              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="border-2 hover:bg-red-50 hover:border-red-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {type && (
                <Badge variant="secondary" className="gap-1">
                  Type: {type}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setType('')
                      handleApplyFilters()
                    }}
                  />
                </Badge>
              )}
              {vehicleId !== ALL_VEHICLES_VALUE && (
                <Badge variant="secondary" className="gap-1">
                  Vehicle: {vehicles.find(v => v.id === vehicleId)?.name || 'Unknown'}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setVehicleId(ALL_VEHICLES_VALUE)
                      handleApplyFilters()
                    }}
                  />
                </Badge>
              )}
              {dealId !== ALL_DEALS_VALUE && (
                <Badge variant="secondary" className="gap-1">
                  Deal: {deals.find(d => d.id === dealId)?.name || 'Unknown'}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setDealId(ALL_DEALS_VALUE)
                      handleApplyFilters()
                    }}
                  />
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {search}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setSearch('')
                      handleApplyFilters()
                    }}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
