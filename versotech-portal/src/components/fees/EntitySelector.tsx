/**
 * Entity Selector Component
 *
 * Allows selection of an introducer, partner, or commercial partner for a fee model.
 * Fee models are commercial agreements with entities, not investor-facing.
 */

'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Building2, Briefcase, AlertCircle } from 'lucide-react';

export type EntityType = 'introducer' | 'partner' | 'commercial_partner';

interface Entity {
  id: string;
  name: string;
  email?: string;
  company_name?: string;
}

interface EntitySelectorProps {
  dealId: string | undefined;
  entityType: EntityType | undefined;
  onEntityTypeChange: (type: EntityType | undefined) => void;
  entityId: string | undefined;
  onEntityIdChange: (id: string | undefined) => void;
  required?: boolean;
  disabled?: boolean;
  /** Entity types to exclude from selection */
  excludeTypes?: EntityType[];
}

export function EntitySelector({
  dealId,
  entityType,
  onEntityTypeChange,
  entityId,
  onEntityIdChange,
  required = true,
  disabled = false,
  excludeTypes = [],
}: EntitySelectorProps) {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dealId && entityType) {
      loadEntities(dealId, entityType);
    } else {
      setEntities([]);
      onEntityIdChange(undefined);
    }
  }, [dealId, entityType]);

  const loadEntities = async (dId: string, type: EntityType) => {
    setLoading(true);
    setError(null);
    try {
      // Load entities dispatched to this deal based on type
      let endpoint = '';
      switch (type) {
        case 'introducer':
          endpoint = `/api/deals/${dId}/introducers`;
          break;
        case 'partner':
          endpoint = `/api/deals/${dId}/partners`;
          break;
        case 'commercial_partner':
          endpoint = `/api/deals/${dId}/commercial-partners`;
          break;
      }

      const res = await fetch(endpoint);
      if (!res.ok) {
        // If endpoint doesn't exist or returns error, try fallback
        console.warn(`Entity endpoint ${endpoint} not available, trying fallback`);
        await loadEntitiesFallback(type);
        return;
      }

      const json = await res.json();
      // Handle different response formats from various endpoints
      let entityList = json.introducers || json.partners || json.commercial_partners || [];

      // Deal-specific endpoints return { data: [...] } with transformed entities
      if (entityList.length === 0 && json.data && Array.isArray(json.data)) {
        // Transform the deal-specific format to entity format
        entityList = json.data
          .filter((item: any) => item.entity_type === type.replace('_', ''))
          .map((item: any) => ({
            id: item.entity_id,
            name: item.entity_name,
            email: item.entity_email,
          }));
      }

      // If still empty, fall back to admin endpoint to get ALL entities
      if (entityList.length === 0) {
        console.log(`No ${type}s found for deal, loading all ${type}s from admin endpoint`);
        await loadEntitiesFallback(type);
        return;
      }

      setEntities(entityList);

      // If current value is not in the list, clear it
      if (entityId && !entityList.find((e: Entity) => e.id === entityId)) {
        onEntityIdChange(undefined);
      }
    } catch (err) {
      console.error('Error loading entities:', err);
      await loadEntitiesFallback(type);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to load all entities of a type (not deal-specific)
  // Uses admin endpoints which list all entities in the system
  const loadEntitiesFallback = async (type: EntityType) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'introducer':
          endpoint = '/api/admin/introducers';
          break;
        case 'partner':
          endpoint = '/api/admin/partners';
          break;
        case 'commercial_partner':
          endpoint = '/api/admin/commercial-partners';
          break;
      }

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Failed to load ${type}s`);
      }

      const json = await res.json();
      // Admin endpoints return data in various formats - handle all possibilities
      const entityList = json.introducers || json.partners || json.commercial_partners || json.data || [];

      // Map the entity list to a common format
      const normalizedEntities = entityList.map((entity: any) => ({
        id: entity.id,
        name: entity.name || entity.legal_name || entity.company_name || entity.contact_name,
        email: entity.email || entity.contact_email,
        company_name: entity.company_name || entity.legal_name,
      }));

      setEntities(normalizedEntities);
    } catch (err) {
      console.error('Error in fallback loading:', err);
      setError(`Failed to load ${type}s`);
      setEntities([]);
    }
  };

  const handleEntityTypeChange = (value: string) => {
    if (value === 'none') {
      onEntityTypeChange(undefined);
      onEntityIdChange(undefined);
    } else {
      onEntityTypeChange(value as EntityType);
      onEntityIdChange(undefined); // Reset entity when type changes
    }
  };

  const handleEntityChange = (value: string) => {
    if (value === 'none') {
      onEntityIdChange(undefined);
    } else {
      onEntityIdChange(value);
    }
  };

  const getEntityTypeIcon = (type: EntityType | undefined) => {
    switch (type) {
      case 'introducer':
        return <Users className="h-4 w-4" />;
      case 'partner':
        return <Building2 className="h-4 w-4" />;
      case 'commercial_partner':
        return <Briefcase className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEntityTypeLabel = (type: EntityType): string => {
    switch (type) {
      case 'introducer':
        return 'Introducer';
      case 'partner':
        return 'Partner';
      case 'commercial_partner':
        return 'Commercial Partner';
    }
  };

  if (!dealId) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white font-medium">
            Entity Type {required && <span className="text-red-400">*</span>}
          </Label>
          <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 p-3 rounded border border-amber-500/30">
            <AlertCircle className="h-4 w-4" />
            <span>Select a deal first to assign an entity</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Entity Type Selector */}
      <div className="space-y-2">
        <Label className="text-white font-medium">
          Entity Type {required && <span className="text-red-400">*</span>}
        </Label>
        <Select
          value={entityType || 'none'}
          onValueChange={handleEntityTypeChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-black border-gray-700 text-white h-11">
            <SelectValue placeholder="Select entity type" />
          </SelectTrigger>
          <SelectContent className="bg-black border-gray-700 text-white">
            {!required && (
              <SelectItem value="none">No entity</SelectItem>
            )}
            {!excludeTypes.includes('introducer') && (
              <SelectItem value="introducer">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>Introducer</span>
                </div>
              </SelectItem>
            )}
            {!excludeTypes.includes('partner') && (
              <SelectItem value="partner">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-400" />
                  <span>Partner</span>
                </div>
              </SelectItem>
            )}
            {!excludeTypes.includes('commercial_partner') && (
              <SelectItem value="commercial_partner">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-400" />
                  <span>Commercial Partner</span>
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Entity Selector (only shown when type is selected) */}
      {entityType && (
        <div className="space-y-2">
          <Label className="text-white font-medium">
            {getEntityTypeLabel(entityType)} {required && <span className="text-red-400">*</span>}
          </Label>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 h-11 px-3 border border-gray-700 rounded-md bg-black">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading {entityType}s...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : entities.length === 0 ? (
            <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 p-3 rounded border border-amber-500/30">
              <AlertCircle className="h-4 w-4" />
              <span>No {entityType}s available. Add {entityType}s to the system first.</span>
            </div>
          ) : (
            <Select
              value={entityId || 'none'}
              onValueChange={handleEntityChange}
              disabled={disabled}
            >
              <SelectTrigger className="bg-black border-gray-700 text-white h-11">
                <SelectValue placeholder={`Select ${getEntityTypeLabel(entityType)}`} />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700 text-white max-h-60">
                {!required && (
                  <SelectItem value="none">No selection</SelectItem>
                )}
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    <div className="flex items-center gap-2">
                      {getEntityTypeIcon(entityType)}
                      <span>{entity.name || entity.company_name}</span>
                      {entity.email && (
                        <span className="text-gray-400 text-xs">({entity.email})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
