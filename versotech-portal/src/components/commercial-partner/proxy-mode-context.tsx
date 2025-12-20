'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

interface Client {
  id: string
  name: string
  investor_type?: string
  kyc_status?: string
}

interface ProxyModeContextType {
  isProxyMode: boolean
  selectedClient: Client | null
  availableClients: Client[]
  commercialPartnerName: string | null
  enterProxyMode: (client: Client) => void
  exitProxyMode: () => void
  setAvailableClients: (clients: Client[]) => void
  setCommercialPartnerName: (name: string) => void
}

const ProxyModeContext = createContext<ProxyModeContextType | undefined>(undefined)

const PROXY_MODE_STORAGE_KEY = 'cp_proxy_mode_client'

export function ProxyModeProvider({ children }: { children: ReactNode }) {
  const [isProxyMode, setIsProxyMode] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [availableClients, setAvailableClients] = useState<Client[]>([])
  const [commercialPartnerName, setCommercialPartnerName] = useState<string | null>(null)

  // Restore from session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(PROXY_MODE_STORAGE_KEY)
    if (stored) {
      try {
        const client = JSON.parse(stored)
        setSelectedClient(client)
        setIsProxyMode(true)
      } catch {
        sessionStorage.removeItem(PROXY_MODE_STORAGE_KEY)
      }
    }
  }, [])

  const enterProxyMode = useCallback((client: Client) => {
    setSelectedClient(client)
    setIsProxyMode(true)
    sessionStorage.setItem(PROXY_MODE_STORAGE_KEY, JSON.stringify(client))
  }, [])

  const exitProxyMode = useCallback(() => {
    setSelectedClient(null)
    setIsProxyMode(false)
    sessionStorage.removeItem(PROXY_MODE_STORAGE_KEY)
  }, [])

  return (
    <ProxyModeContext.Provider
      value={{
        isProxyMode,
        selectedClient,
        availableClients,
        commercialPartnerName,
        enterProxyMode,
        exitProxyMode,
        setAvailableClients,
        setCommercialPartnerName
      }}
    >
      {children}
    </ProxyModeContext.Provider>
  )
}

export function useProxyMode() {
  const context = useContext(ProxyModeContext)
  if (context === undefined) {
    throw new Error('useProxyMode must be used within a ProxyModeProvider')
  }
  return context
}
