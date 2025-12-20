'use client'

import { useProxyMode } from './proxy-mode-context'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserCircle, X, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProxyModeBannerProps {
  className?: string
}

export function ProxyModeBanner({ className }: ProxyModeBannerProps) {
  const {
    isProxyMode,
    selectedClient,
    availableClients,
    commercialPartnerName,
    enterProxyMode,
    exitProxyMode,
    setAvailableClients,
    setCommercialPartnerName
  } = useProxyMode()

  const [isLoading, setIsLoading] = useState(false)
  const [canProxy, setCanProxy] = useState(false)

  // Fetch available clients on mount
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/commercial-partners/proxy-subscribe')
        if (response.ok) {
          const data = await response.json()
          setAvailableClients(data.clients || [])
          setCommercialPartnerName(data.commercial_partner_name || null)
          setCanProxy(data.can_execute_for_clients || false)
        }
      } catch (error) {
        console.error('Failed to fetch proxy clients:', error)
      }
    }
    fetchClients()
  }, [setAvailableClients, setCommercialPartnerName])

  // Don't render if user can't proxy
  if (!canProxy && !isProxyMode) {
    return null
  }

  const handleClientChange = (clientId: string) => {
    const client = availableClients.find(c => c.id === clientId)
    if (client) {
      enterProxyMode(client)
    }
  }

  if (isProxyMode && selectedClient) {
    return (
      <div className={`bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-3">
          <UserCircle className="h-5 w-5" />
          <span className="font-medium">
            Acting on behalf of: <strong>{selectedClient.name}</strong>
          </span>
          {selectedClient.investor_type && (
            <span className="text-amber-800 text-sm">
              ({selectedClient.investor_type})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedClient.id} onValueChange={handleClientChange}>
            <SelectTrigger className="w-[200px] bg-amber-400 border-amber-600 text-amber-950">
              <SelectValue placeholder="Switch client" />
            </SelectTrigger>
            <SelectContent>
              {availableClients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={exitProxyMode}
            className="text-amber-950 hover:bg-amber-400"
          >
            <X className="h-4 w-4 mr-1" />
            Exit Proxy Mode
          </Button>
        </div>
      </div>
    )
  }

  // Not in proxy mode - show option to enter
  if (availableClients.length > 0) {
    return (
      <div className={`bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-3 text-slate-600">
          <Users className="h-5 w-5" />
          <span className="text-sm">
            Act on behalf of a client
          </span>
        </div>
        <Select onValueChange={handleClientChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select client..." />
          </SelectTrigger>
          <SelectContent>
            {availableClients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
                {client.kyc_status !== 'approved' && client.kyc_status !== 'verified' && (
                  <span className="text-xs text-amber-600 ml-2">(KYC pending)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return null
}
