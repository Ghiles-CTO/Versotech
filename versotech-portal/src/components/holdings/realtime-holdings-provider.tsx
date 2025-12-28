'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface RealtimeUpdate {
  type: 'kpi_update' | 'position_update' | 'valuation_update' | 'allocation_update' | 'capital_call' | 'distribution' | 'fee_accrual'
  data: any
  timestamp: string
}

interface RealtimeHoldingsProviderProps {
  children: React.ReactNode
  investorIds: string[]
  onDataUpdate?: (update: RealtimeUpdate) => void
  enableNotifications?: boolean
  holdingsPath?: string
}

export function RealtimeHoldingsProvider({
  children,
  investorIds,
  onDataUpdate,
  enableNotifications = true,
  holdingsPath = '/versoholdings/holdings'
}: RealtimeHoldingsProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const channelsRef = useRef<RealtimeChannel[]>([])
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = useRef(1000) // Start with 1 second
  const reconnectHandlerRef = useRef<() => void>(() => { })
  const router = useRouter()

  // Clean up channels on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach(channel => {
        channel.unsubscribe()
      })
      channelsRef.current = []
    }
  }, [])

  // Debounced update handler to prevent excessive updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    debounce((update: RealtimeUpdate) => {
      setLastUpdate(new Date().toISOString())
      onDataUpdate?.(update)

      if (enableNotifications) {
        switch (update.type) {
          case 'position_update':
            toast.info('Portfolio position updated', {
              description: 'Your holdings have been updated with the latest data.',
              duration: 3000
            })
            break
          case 'valuation_update':
            toast.info('Valuation updated', {
              description: 'New NAV data is available for your investments.',
              duration: 3000
            })
            break
          case 'allocation_update':
            toast.success('Allocation confirmed', {
              description: 'Your deal allocation has been processed.',
              duration: 5000
            })
            break
          case 'capital_call':
            toast.warning('Capital call issued', {
              description: 'A new capital call has been issued for one of your investments.',
              duration: 10000,
              action: {
                label: 'View Details',
                onClick: () => router.push(holdingsPath)
              }
            })
            break
          case 'distribution':
            toast.success('Distribution received', {
              description: 'A distribution has been processed for your investment.',
              duration: 8000,
              action: {
                label: 'View Details',
                onClick: () => router.push(holdingsPath)
              }
            })
            break
          case 'fee_accrual':
            toast.info('Fee accrued', {
              description: 'New fees have been accrued for your investments.',
              duration: 5000
            })
            break
        }
      }
    }, 2000),
    [onDataUpdate, enableNotifications, holdingsPath, router]
  )

  // Set up realtime subscriptions
  useEffect(() => {
    if (!investorIds.length) return

    let supabase: ReturnType<typeof createClient>

    const setupSubscriptions = async () => {
      try {
        supabase = createClient()

        // Clean up existing channels
        channelsRef.current.forEach(channel => {
          channel.unsubscribe()
        })
        channelsRef.current = []

        const investorFilter = `investor_id=in.(${investorIds.join(',')})`

        // 1. Position Updates Channel
        const positionsChannel = supabase
          .channel('positions_updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'positions',
              filter: investorFilter
            },
            (payload) => {
              console.log('Position update:', payload)
              debouncedUpdate({
                type: 'position_update',
                data: payload,
                timestamp: new Date().toISOString()
              })
            }
          )
          .subscribe((status) => {
            console.log('Positions channel status:', status)
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              reconnectAttempts.current = 0
              reconnectDelay.current = 1000
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false)
              handleReconnect()
            }
          })

        // 2. Valuations Updates Channel
        const valuationsChannel = supabase
          .channel('valuations_updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'valuations'
            },
            (payload) => {
              console.log('Valuation update:', payload)
              debouncedUpdate({
                type: 'valuation_update',
                data: payload,
                timestamp: new Date().toISOString()
              })
            }
          )
          .subscribe()

        // 3. Allocations Updates Channel (for deal holdings)
        const allocationsChannel = supabase
          .channel('allocations_updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'allocations',
              filter: investorFilter
            },
            (payload) => {
              console.log('Allocation update:', payload)
              debouncedUpdate({
                type: 'allocation_update',
                data: payload,
                timestamp: new Date().toISOString()
              })
            }
          )
          .subscribe()

        // 4. Performance Snapshots Channel REMOVED (mock data)
        // const performanceChannel = ...

        // 5. Capital Calls Channel
        const capitalCallsChannel = supabase
          .channel('capital_calls_updates')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'capital_calls'
            },
            (payload) => {
              console.log('Capital call update:', payload)
              debouncedUpdate({
                type: 'capital_call',
                data: payload,
                timestamp: new Date().toISOString()
              })
            }
          )
          .subscribe()

        // 6. Distributions Channel
        const distributionsChannel = supabase
          .channel('distributions_updates')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'distributions'
            },
            (payload) => {
              console.log('Distribution update:', payload)
              debouncedUpdate({
                type: 'distribution',
                data: payload,
                timestamp: new Date().toISOString()
              })
            }
          )
          .subscribe()

        // 7. Fee Events Channel
        const feeEventsChannel = supabase
          .channel('fee_events_updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'fee_events',
              filter: investorFilter
            },
            (payload) => {
              console.log('Fee event update:', payload)
              debouncedUpdate({
                type: 'fee_accrual',
                data: payload,
                timestamp: new Date().toISOString()
              })
            }
          )
          .subscribe()

        // Store channel references
        channelsRef.current = [
          positionsChannel,
          valuationsChannel,
          allocationsChannel,
          // performanceChannel,
          capitalCallsChannel,
          distributionsChannel,
          feeEventsChannel
        ]

        console.log('Realtime subscriptions established for investors:', investorIds)

      } catch (error) {
        console.error('Error setting up realtime subscriptions:', error)
        setIsConnected(false)
        handleReconnect()
      }
    }

    // Handle reconnection with exponential backoff
    const handleReconnect = () => {
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setTimeout(() => {
          console.log(`Attempting to reconnect... (attempt ${reconnectAttempts.current + 1})`)
          reconnectAttempts.current++
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000) // Cap at 30 seconds
          setupSubscriptions()
        }, reconnectDelay.current)
      } else {
        console.error('Max reconnection attempts reached')
        toast.error('Connection lost', {
          description: 'Unable to maintain real-time updates. Please refresh the page.',
          duration: 10000,
          action: {
            label: 'Refresh',
            onClick: () => router.refresh()
          }
        })
      }
    }

    reconnectHandlerRef.current = handleReconnect

    setupSubscriptions()

    // Cleanup function
    return () => {
      channelsRef.current.forEach(channel => {
        channel.unsubscribe()
      })
      channelsRef.current = []
      setIsConnected(false)
    }
  }, [investorIds, debouncedUpdate, router])

  // Periodic connection health check
  useEffect(() => {
    const healthCheck = setInterval(() => {
      if (!isConnected && reconnectAttempts.current < maxReconnectAttempts) {
        console.log('Health check: Connection lost, attempting reconnection...')
        reconnectAttempts.current = 0 // Reset attempts for health check
        reconnectHandlerRef.current()
      }
    }, 60000) // Check every minute

    return () => clearInterval(healthCheck)
  }, [isConnected])

  // Provide connection status to children via context if needed
  return (
    <div className="relative">
      {children}

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${isConnected
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-red-100 text-red-700 border border-red-200'
            }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
          />
          {isConnected ? 'Live' : 'Offline'}
          {lastUpdate && isConnected && (
            <span className="opacity-70">
              • {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Hook to access realtime status
export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  return {
    isConnected,
    lastUpdate,
    setIsConnected,
    setLastUpdate
  }
}
