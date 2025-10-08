'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WorkflowInputSchema } from '@/lib/workflows'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

interface ProcessFormBuilderProps {
  schema: WorkflowInputSchema
  formData: Record<string, any>
  setFormData: (data: Record<string, any>) => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
}

export function ProcessFormBuilder({
  schema,
  formData,
  setFormData,
  errors,
  setErrors
}: ProcessFormBuilderProps) {
  
  const [investors, setInvestors] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [loadingInvestors, setLoadingInvestors] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(false)

  // Fetch investors
  useEffect(() => {
    const hasInvestorSelect = Object.values(schema).some(
      (field) => field?.type === 'investor_select'
    )
    if (!hasInvestorSelect) return

    const fetchInvestors = async () => {
      setLoadingInvestors(true)
      try {
        const response = await fetch('/api/staff/investors')
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded investors:', data.investors?.length || 0, 'investors')
          setInvestors(data.investors || [])
        } else {
          console.error('Failed to fetch investors:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch investors:', error)
      } finally {
        setLoadingInvestors(false)
      }
    }

    fetchInvestors()
  }, [schema])

  // Fetch vehicles
  useEffect(() => {
    const hasVehicleSelect = Object.values(schema).some(
      (field) => field?.type === 'vehicle_select'
    )
    if (!hasVehicleSelect) return

    const fetchVehicles = async () => {
      setLoadingVehicles(true)
      try {
        const response = await fetch('/api/staff/vehicles')
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded vehicles:', data.vehicles?.length || 0, 'vehicles')
          setVehicles(data.vehicles || [])
        } else {
          console.error('Failed to fetch vehicles:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error)
      } finally {
        setLoadingVehicles(false)
      }
    }

    fetchVehicles()
  }, [schema])

  // Fetch conversations
  useEffect(() => {
    const hasConversationSelect = Object.values(schema).some(
      (field) => field?.type === 'conversation_select'
    )
    if (!hasConversationSelect) return

    const fetchConversations = async () => {
      setLoadingConversations(true)
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded conversations:', data.conversations?.length || 0, 'conversations')
          setConversations(data.conversations || [])
        } else {
          console.error('Failed to fetch conversations:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoadingConversations(false)
      }
    }

    fetchConversations()
  }, [schema])

  const updateField = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    // Clear error when field is updated
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  const renderField = (key: string, config: z.infer<typeof import('@/lib/workflows').workflowInputFieldSchema>) => {
    if (!config) return null

    // Check if field should be hidden based on dependencies
    if (config.dependsOn && config.showWhen !== undefined) {
      const dependentValue = formData[config.dependsOn]
      if (dependentValue !== config.showWhen) {
        return null
      }
    }

    const fieldError = errors[key]
    const helperText = config.helperText

    switch (config.type) {
      case 'checkbox':
        return (
          <div key={key} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={key}
              checked={Boolean(formData[key])}
              onCheckedChange={(checked) => updateField(key, checked === true)}
            />
            <Label 
              htmlFor={key} 
              className="text-sm font-medium leading-none text-white cursor-pointer"
            >
              {config.label || key}
            </Label>
            {helperText && (
              <span className="text-xs text-gray-400 ml-2">
                {helperText}
              </span>
            )}
          </div>
        )

      case 'investor_select':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-white font-medium">{config.label || key}</Label>
            <Select
              value={formData[key] ?? ''}
              onValueChange={(value) => updateField(key, value)}
              disabled={loadingInvestors}
            >
              <SelectTrigger 
                id={key}
                className="bg-zinc-900 border-white/30 text-white hover:border-white/50 focus:border-white/70"
              >
                {loadingInvestors ? (
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading investors...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={config.placeholder || 'Select investor'} />
                )}
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/30">
                {investors.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No investors found
                  </div>
                ) : (
                  investors.map((investor) => (
                    <SelectItem 
                      key={investor.id} 
                      value={investor.id}
                      className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{investor.legal_name}</span>
                        {investor.email && (
                          <span className="text-xs text-gray-400">{investor.email}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {helperText && !fieldError && (
              <p className="text-xs text-gray-400">{helperText}</p>
            )}
            {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}
          </div>
        )

      case 'vehicle_select':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-white font-medium">{config.label || key}</Label>
            <Select
              value={formData[key] ?? ''}
              onValueChange={(value) => updateField(key, value)}
              disabled={loadingVehicles}
            >
              <SelectTrigger 
                id={key}
                className="bg-zinc-900 border-white/30 text-white hover:border-white/50 focus:border-white/70"
              >
                {loadingVehicles ? (
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading vehicles...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={config.placeholder || 'Select vehicle'} />
                )}
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/30">
                {vehicles.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No vehicles found
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <SelectItem 
                      key={vehicle.id} 
                      value={vehicle.id}
                      className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{vehicle.name}</span>
                        {vehicle.type && (
                          <span className="text-xs text-gray-400 capitalize">{vehicle.type}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {helperText && !fieldError && (
              <p className="text-xs text-gray-400">{helperText}</p>
            )}
            {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}
          </div>
        )

      case 'conversation_select':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-white font-medium">{config.label || key}</Label>
            <Select
              value={formData[key] ?? ''}
              onValueChange={(value) => updateField(key, value)}
              disabled={loadingConversations}
            >
              <SelectTrigger 
                id={key}
                className="bg-zinc-900 border-white/30 text-white hover:border-white/50 focus:border-white/70"
              >
                {loadingConversations ? (
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading conversations...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={config.placeholder || 'Select conversation'} />
                )}
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/30">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No conversations found
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <SelectItem 
                      key={conversation.id} 
                      value={conversation.id}
                      className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {conversation.name || conversation.subject || `Conversation ${conversation.id.slice(0, 8)}`}
                        </span>
                        {conversation.participants && conversation.participants.length > 0 && (
                          <span className="text-xs text-gray-400">
                            {conversation.participants.map((p: any) => p.display_name).join(', ')}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {helperText && !fieldError && (
              <p className="text-xs text-gray-400">{helperText}</p>
            )}
            {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-white font-medium">{config.label || key}</Label>
            <Select
              value={formData[key] ?? ''}
              onValueChange={(value) => updateField(key, value)}
            >
              <SelectTrigger 
                id={key}
                className="bg-zinc-900 border-white/30 text-white hover:border-white/50 focus:border-white/70"
              >
                <SelectValue placeholder={config.placeholder || 'Select option'} />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/30">
                {config.options && config.options.length > 0 ? (
                  config.options.map((option) => (
                    <SelectItem 
                      key={option.toString()} 
                      value={option.toString()}
                      className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                    >
                      {option.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No options available
                  </div>
                )}
              </SelectContent>
            </Select>
            {helperText && !fieldError && (
              <p className="text-xs text-gray-400">{helperText}</p>
            )}
            {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}
          </div>
        )

      default:
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-white font-medium">{config.label || key}</Label>
            <Input
              id={key}
              type={config.type || 'text'}
              placeholder={config.placeholder}
              value={formData[key] ?? ''}
              onChange={(e) => updateField(key, e.target.value)}
              className="bg-zinc-900 border-white/30 text-white placeholder:text-gray-500 hover:border-white/50 focus:border-white/70 focus:ring-white/20"
            />
            {helperText && !fieldError && (
              <p className="text-xs text-gray-400">{helperText}</p>
            )}
            {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([key, config]) => renderField(key, config))}
    </div>
  )
}

