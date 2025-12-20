'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, Building2, User } from 'lucide-react'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/components/profile/entity-form-dialog'

interface CounterpartyEntity {
  id: string
  entity_type: string
  legal_name: string
  jurisdiction?: string
  representative_name?: string
}

interface EntitySelectorProps {
  value: {
    subscription_type: 'personal' | 'entity'
    counterparty_entity_id?: string | null
  }
  onChange: (value: {
    subscription_type: 'personal' | 'entity'
    counterparty_entity_id?: string | null
  }) => void
}

export function EntitySelector({ value, onChange }: EntitySelectorProps) {
  const [entities, setEntities] = useState<CounterpartyEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      const response = await fetch('/api/investors/me/counterparty-entities')
      if (!response.ok) throw new Error('Failed to load entities')

      const data = await response.json()
      setEntities(data.entities || [])
    } catch (error) {
      console.error('Error loading entities:', error)
      toast.error('Failed to load entities')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: 'personal' | 'entity') => {
    onChange({
      subscription_type: type,
      counterparty_entity_id: type === 'personal' ? null : value.counterparty_entity_id
    })
  }

  const handleEntityChange = (entityId: string) => {
    onChange({
      subscription_type: 'entity',
      counterparty_entity_id: entityId
    })
  }

  const handleFormSuccess = async () => {
    setFormDialogOpen(false)
    await loadEntities()
  }

  const getEntityTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      trust: 'Trust',
      llc: 'LLC',
      partnership: 'Partnership',
      family_office: 'Family Office',
      law_firm: 'Law Firm',
      investment_bank: 'Investment Bank',
      fund: 'Fund',
      corporation: 'Corporation',
      other: 'Other'
    }
    return typeLabels[type] || type
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base font-medium">Investment Type</Label>
        <RadioGroup
          value={value.subscription_type}
          onValueChange={(val) => handleTypeChange(val as 'personal' | 'entity')}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <RadioGroupItem value="personal" id="personal" />
            <Label htmlFor="personal" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Invest Personally</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Subscribe using your personal investor profile
              </p>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <RadioGroupItem value="entity" id="entity" />
            <Label htmlFor="entity" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Invest Through Entity</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Subscribe through a legal entity (trust, LLC, partnership, etc.)
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {value.subscription_type === 'entity' && (
        <div className="space-y-3 pl-8 border-l-2 border-primary/20">
          <Label htmlFor="entity-select">Select Entity</Label>
          {loading ? (
            <div className="text-sm text-gray-600">Loading entities...</div>
          ) : entities.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                You haven't added any entities yet. Create one to invest through a legal entity.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Entity
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                value={value.counterparty_entity_id || ''}
                onValueChange={handleEntityChange}
              >
                <SelectTrigger id="entity-select" className="bg-white text-gray-900 border-gray-300">
                  <SelectValue placeholder="Select an entity" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900 border-gray-200">
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id} className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entity.legal_name}</span>
                        <span className="text-xs text-gray-500">
                          ({getEntityTypeBadge(entity.entity_type)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Entity
              </Button>

              {value.counterparty_entity_id && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  {(() => {
                    const selectedEntity = entities.find(
                      (e) => e.id === value.counterparty_entity_id
                    )
                    if (!selectedEntity) return null

                    return (
                      <div className="space-y-1 text-sm">
                        <div className="font-medium text-gray-900">{selectedEntity.legal_name}</div>
                        <div className="text-gray-600">
                          Type: {getEntityTypeBadge(selectedEntity.entity_type)}
                        </div>
                        {selectedEntity.jurisdiction && (
                          <div className="text-gray-600">
                            Jurisdiction: {selectedEntity.jurisdiction}
                          </div>
                        )}
                        {selectedEntity.representative_name && (
                          <div className="text-gray-600">
                            Representative: {selectedEntity.representative_name}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <EntityFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
