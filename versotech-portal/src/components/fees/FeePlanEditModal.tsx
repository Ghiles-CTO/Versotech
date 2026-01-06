/**
 * Fee Plan Edit Modal - Clean & Reliable
 *
 * IMPORTANT: Fee plans are commercial agreements with introducers/partners.
 * They must be linked to:
 * 1. A specific deal (no global templates)
 * 2. A published term sheet (for fee limits)
 * 3. An entity (introducer, partner, or commercial partner)
 *
 * Fee values must NOT exceed term sheet limits.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Loader2, AlertTriangle } from 'lucide-react';
import type { FeePlanWithComponents } from '@/lib/fees/types';
import { TermSheetSelector, type TermSheet } from './TermSheetSelector';
import { EntitySelector, type EntityType } from './EntitySelector';
import { validateFeeComponentsAgainstTermSheet, bpsToPercent } from '@/lib/fees/term-sheet-sync';

interface FeePlanEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feePlan?: FeePlanWithComponents | null;
  dealId?: string;
  /** Pre-select a term sheet when creating a new fee plan */
  initialTermSheetId?: string;
}

interface FeeComponentForm {
  id?: string;
  kind: 'subscription' | 'management' | 'performance' | 'spread_markup' | 'flat' | 'bd_fee' | 'finra_fee' | 'other';
  calc_method: 'percent_of_investment' | 'percent_per_annum' | 'percent_of_profit' | 'per_unit_spread' | 'fixed' | 'percent_of_commitment' | 'percent_of_nav' | 'fixed_amount';
  frequency: 'one_time' | 'annual' | 'quarterly' | 'monthly' | 'on_exit' | 'on_event';
  rate_bps?: number;
  flat_amount?: number;
  description?: string;
  duration_periods?: number;
  duration_unit?: 'years' | 'months' | 'quarters' | 'life_of_vehicle';
  payment_schedule?: 'upfront' | 'recurring' | 'on_demand';
  tier_threshold_multiplier?: number;
  hurdle_rate_bps?: number;
  has_catchup?: boolean;
  catchup_rate_bps?: number;
  has_high_water_mark?: boolean;
}

export default function FeePlanEditModal({
  open,
  onClose,
  onSuccess,
  feePlan,
  dealId,
  initialTermSheetId,
}: FeePlanEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string | undefined>(dealId);
  const [isActive, setIsActive] = useState(true);
  const [components, setComponents] = useState<FeeComponentForm[]>([]);

  // NEW: Term sheet and entity linking (required per business rules)
  const [termSheetId, setTermSheetId] = useState<string | undefined>();
  const [selectedTermSheet, setSelectedTermSheet] = useState<TermSheet | null>(null);
  const [entityType, setEntityType] = useState<EntityType | undefined>();
  const [entityId, setEntityId] = useState<string | undefined>();

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setSelectedDealId(dealId);
    setIsActive(true);
    setComponents([]);
    setError(null);
    setValidationErrors([]);
    // Reset new fields - but keep initialTermSheetId if provided
    setTermSheetId(initialTermSheetId);
    setSelectedTermSheet(null);
    setEntityType(undefined);
    setEntityId(undefined);
  }, [dealId, initialTermSheetId]);

  useEffect(() => {
    if (open) {
      loadDeals();
      if (feePlan) {
        setName(feePlan.name);
        setDescription(feePlan.description || '');
        setSelectedDealId(feePlan.deal_id || undefined);
        setIsActive(feePlan.is_active);

        // Load new fields if they exist (for editing existing fee plans)
        const fp = feePlan as any; // Cast for new optional fields
        setTermSheetId(fp.term_sheet_id || undefined);
        // Note: selectedTermSheet will be loaded by TermSheetSelector when termSheetId is set

        // Determine entity type and ID from the fee plan
        if (fp.introducer_id) {
          setEntityType('introducer');
          setEntityId(fp.introducer_id);
        } else if (fp.partner_id) {
          setEntityType('partner');
          setEntityId(fp.partner_id);
        } else if (fp.commercial_partner_id) {
          setEntityType('commercial_partner');
          setEntityId(fp.commercial_partner_id);
        } else {
          setEntityType(undefined);
          setEntityId(undefined);
        }

        const formComponents: FeeComponentForm[] = (feePlan.components || []).map((comp: any) => ({
          id: comp.id,
          kind: comp.kind,
          calc_method: comp.calc_method || 'percent_per_annum',
          frequency: comp.frequency || 'quarterly',
          rate_bps: comp.rate_bps || undefined,
          flat_amount: comp.flat_amount || undefined,
          description: comp.description || '',
          duration_periods: comp.duration_periods || undefined,
          duration_unit: comp.duration_unit || undefined,
          payment_schedule: comp.payment_schedule || 'recurring',
          tier_threshold_multiplier: comp.tier_threshold_multiplier || undefined,
          hurdle_rate_bps: comp.hurdle_rate_bps || undefined,
          has_catchup: comp.has_catchup || false,
          catchup_rate_bps: comp.catchup_rate_bps || undefined,
          has_high_water_mark: comp.has_high_water_mark || false,
        }));
        setComponents(formComponents);
      } else {
        resetForm();
      }
    }
  }, [open, feePlan, dealId, resetForm]);

  // Validate fee components against term sheet limits whenever they change
  useEffect(() => {
    if (selectedTermSheet && components.length > 0) {
      const errors = validateFeeComponentsAgainstTermSheet(components, selectedTermSheet);
      setValidationErrors(errors);
    } else {
      setValidationErrors([]);
    }
  }, [components, selectedTermSheet]);

  // Handle term sheet selection
  const handleTermSheetChange = (id: string | undefined, ts: TermSheet | null) => {
    setTermSheetId(id);
    setSelectedTermSheet(ts);
  };

  const loadDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const json = await res.json();
      setDeals(json.deals || []);
    } catch (error) {
      console.error('Error loading deals:', error);
    }
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {
        kind: 'management',
        calc_method: 'percent_per_annum',
        frequency: 'quarterly',
        rate_bps: undefined,
        flat_amount: undefined,
        payment_schedule: 'recurring',
      },
    ]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, updates: Partial<FeeComponentForm>) => {
    const updated = [...components];
    updated[index] = { ...updated[index], ...updates };
    setComponents(updated);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }

    if (!selectedDealId) {
      setError('A deal must be selected. Fee models cannot be global templates.');
      return;
    }

    if (!termSheetId) {
      setError('A published term sheet must be selected. Fee models must be derived from term sheets.');
      return;
    }

    if (!entityType || !entityId) {
      setError('An entity (introducer, partner, or commercial partner) must be selected.');
      return;
    }

    // Check term sheet validation errors
    if (validationErrors.length > 0) {
      setError(`Fee values exceed term sheet limits: ${validationErrors.join('; ')}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build entity field based on type
      const entityFields: Record<string, string | undefined> = {
        introducer_id: entityType === 'introducer' ? entityId : undefined,
        partner_id: entityType === 'partner' ? entityId : undefined,
        commercial_partner_id: entityType === 'commercial_partner' ? entityId : undefined,
      };

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        deal_id: selectedDealId,
        term_sheet_id: termSheetId,
        ...entityFields,
        is_active: isActive,
        components: components.map((c) => ({
          ...c,
          description: c.description?.trim() || undefined,
        })),
      };

      const url = feePlan
        ? `/api/staff/fees/plans/${feePlan.id}`
        : '/api/staff/fees/plans';

      const res = await fetch(url, {
        method: feePlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
        }

        console.error('API Error Response:', errorData);
        console.error('Response status:', res.status, res.statusText);

        // Handle validation errors with details
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details
            .map((detail: any) => `${detail.path?.join('.')}: ${detail.message}`)
            .join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }

        // Show detailed error message from API
        const errorMsg = errorData.error || 'Failed to save fee plan';
        const detailsMsg = errorData.details ? `\nDetails: ${errorData.details}` : '';
        const hintMsg = errorData.hint ? `\nHint: ${errorData.hint}` : '';
        throw new Error(`${errorMsg}${detailsMsg}${hintMsg}`);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving fee plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to save fee plan');
    } finally {
      setLoading(false);
    }
  };

  const getFeeKindLabel = (kind: string) => {
    const labels: Record<string, string> = {
      subscription: 'Subscription',
      management: 'Management',
      performance: 'Performance',
      spread_markup: 'Spread/Markup',
      flat: 'Flat Fee',
      bd_fee: 'Broker-Dealer Fee',
      finra_fee: 'FINRA Fee',
      other: 'Other',
    };
    return labels[kind] || kind;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-black border-gray-700 text-white overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-6">
          <DialogTitle className="text-2xl font-bold text-white">
            {feePlan ? 'Edit Fee Plan' : 'Create Fee Plan'}
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            {feePlan ? 'Update fee structure' : 'Define a new fee structure'}
          </p>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded mt-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
          {/* Basic Info */}
          <div className="space-y-6 bg-gray-900/30 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-3">Basic Information</h3>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-white font-medium">Plan Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Standard Fee Structure"
                className="bg-black border-gray-700 text-white placeholder:text-gray-500 h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-white font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="bg-black border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Deal Selector - REQUIRED (no more global templates) */}
            <div className="space-y-3">
              <Label htmlFor="deal" className="text-white font-medium">
                Deal <span className="text-red-400">*</span>
              </Label>
              <Select
                value={selectedDealId || 'none'}
                onValueChange={(val) => {
                  setSelectedDealId(val === 'none' ? undefined : val);
                  // Reset term sheet and entity when deal changes
                  setTermSheetId(undefined);
                  setSelectedTermSheet(null);
                  setEntityType(undefined);
                  setEntityId(undefined);
                }}
              >
                <SelectTrigger id="deal" className="bg-black border-gray-700 text-white h-11">
                  <SelectValue placeholder="Select a deal" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700 text-white">
                  <SelectItem value="none" disabled>Select a deal...</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>{deal.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Fee models must be linked to a specific deal. Global templates are not allowed.
              </p>
            </div>

            {/* Term Sheet Selector - REQUIRED */}
            <TermSheetSelector
              dealId={selectedDealId}
              value={termSheetId}
              onChange={handleTermSheetChange}
              required={true}
            />

            {/* Entity Selector - REQUIRED */}
            <EntitySelector
              dealId={selectedDealId}
              entityType={entityType}
              onEntityTypeChange={setEntityType}
              entityId={entityId}
              onEntityIdChange={setEntityId}
              required={true}
            />

            {/* Validation Warnings */}
            {validationErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Fee Limits Exceeded</p>
                    <ul className="mt-2 space-y-1">
                      {validationErrors.map((err, i) => (
                        <li key={i} className="text-sm text-red-300">• {err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-8 pt-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="is_active" className="text-white cursor-pointer font-medium">Active</Label>
              </div>
            </div>
          </div>

          {/* Fee Components */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
              <h3 className="text-lg font-semibold text-white">Fee Components ({components.length})</h3>
              <Button onClick={addComponent} className="bg-blue-600 hover:bg-blue-700 h-11">
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </div>

            {components.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-lg bg-gray-900/20">
                <p className="text-gray-400 mb-2 font-medium">No components yet</p>
                <p className="text-sm text-gray-500">Click "Add Component" to start</p>
              </div>
            ) : (
              <div className="space-y-6">
                {components.map((component, index) => (
                  <Card key={index} className="bg-black border-gray-700">
                    <CardHeader className="bg-gray-900/50 border-b border-gray-700 flex flex-row items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <CardTitle className="text-white text-base font-semibold">
                          {getFeeKindLabel(component.kind)}
                        </CardTitle>
                      </div>
                      <Button
                        onClick={() => removeComponent(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-3">
                          <Label className="text-white text-sm font-medium">Fee Type</Label>
                          <Select
                            value={component.kind}
                            onValueChange={(val) => updateComponent(index, { kind: val as any })}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-gray-700 text-white">
                              <SelectItem value="subscription">Subscription</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                              <SelectItem value="spread_markup">Spread/Markup</SelectItem>
                              <SelectItem value="flat">Flat Fee</SelectItem>
                              <SelectItem value="bd_fee">Broker-Dealer Fee</SelectItem>
                              <SelectItem value="finra_fee">FINRA Fee</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-white text-sm font-medium">Payment</Label>
                          <Select
                            value={component.payment_schedule || 'recurring'}
                            onValueChange={(val) => updateComponent(index, { payment_schedule: val as any })}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-gray-700 text-white">
                              <SelectItem value="upfront">Upfront</SelectItem>
                              <SelectItem value="recurring">Recurring</SelectItem>
                              <SelectItem value="on_demand">On Demand</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-3">
                          <Label className="text-white text-sm font-medium">Rate (bps)</Label>
                          <Input
                            type="number"
                            value={component.rate_bps || ''}
                            onChange={(e) =>
                              updateComponent(index, {
                                rate_bps: e.target.value ? parseFloat(e.target.value) : undefined,
                              })
                            }
                            placeholder="200"
                            className="bg-gray-900 border-gray-700 text-white h-11"
                          />
                          {component.rate_bps && (
                            <p className="text-xs text-blue-400 font-medium">
                              = {(component.rate_bps / 100).toFixed(2)}%
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-white text-sm font-medium">Flat Amount ($)</Label>
                          <Input
                            type="number"
                            value={component.flat_amount || ''}
                            onChange={(e) =>
                              updateComponent(index, {
                                flat_amount: e.target.value ? parseFloat(e.target.value) : undefined,
                              })
                            }
                            placeholder="5000"
                            className="bg-gray-900 border-gray-700 text-white h-11"
                          />
                        </div>
                      </div>

                      {component.kind === 'management' && (
                        <div className="grid grid-cols-2 gap-5 pt-4 border-t border-gray-700">
                          <div className="space-y-3">
                            <Label className="text-white text-sm font-medium">Duration (periods)</Label>
                            <Input
                              type="number"
                              value={component.duration_periods || ''}
                              onChange={(e) =>
                                updateComponent(index, {
                                  duration_periods: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                              placeholder="3"
                              className="bg-gray-900 border-gray-700 text-white h-11"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-white text-sm font-medium">Unit</Label>
                            <Select
                              value={component.duration_unit || 'years'}
                              onValueChange={(val) => updateComponent(index, { duration_unit: val as any })}
                            >
                              <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-gray-700 text-white">
                                <SelectItem value="years">Years</SelectItem>
                                <SelectItem value="months">Months</SelectItem>
                                <SelectItem value="quarters">Quarters</SelectItem>
                                <SelectItem value="life_of_vehicle">Life of Vehicle</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {component.kind === 'performance' && (
                        <div className="pt-4 border-t border-gray-700 space-y-5">
                          <div className="space-y-3">
                            <Label className="text-white text-sm font-medium">Hurdle Rate (bps)</Label>
                            <Input
                              type="number"
                              value={component.hurdle_rate_bps || ''}
                              onChange={(e) =>
                                updateComponent(index, {
                                  hurdle_rate_bps: e.target.value ? parseFloat(e.target.value) : undefined,
                                })
                              }
                              placeholder="800"
                              className="bg-gray-900 border-gray-700 text-white h-11"
                            />
                            {component.hurdle_rate_bps && (
                              <p className="text-xs text-blue-400 font-medium">
                                = {(component.hurdle_rate_bps / 100).toFixed(2)}% preferred return
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`catchup-${index}`}
                              checked={component.has_catchup || false}
                              onCheckedChange={(checked) =>
                                updateComponent(index, { has_catchup: checked as boolean })
                              }
                            />
                            <Label htmlFor={`catchup-${index}`} className="text-white cursor-pointer">
                              Enable GP Catchup
                            </Label>
                          </div>

                          {component.has_catchup && (
                            <div className="ml-6 space-y-3">
                              <Label className="text-white text-sm font-medium">Catchup Rate (bps)</Label>
                              <Input
                                type="number"
                                value={component.catchup_rate_bps || ''}
                                onChange={(e) =>
                                  updateComponent(index, {
                                    catchup_rate_bps: e.target.value ? parseFloat(e.target.value) : undefined,
                                  })
                                }
                                placeholder="10000"
                                className="bg-gray-900 border-gray-700 text-white h-11"
                              />
                              {component.catchup_rate_bps && (
                                <p className="text-xs text-blue-400 font-medium">
                                  = {(component.catchup_rate_bps / 100).toFixed(2)}% catchup
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`hwm-${index}`}
                              checked={component.has_high_water_mark || false}
                              onCheckedChange={(checked) =>
                                updateComponent(index, { has_high_water_mark: checked as boolean })
                              }
                            />
                            <Label htmlFor={`hwm-${index}`} className="text-white cursor-pointer">
                              High Water Mark
                            </Label>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-white text-sm font-medium">Tier Threshold Multiplier</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={component.tier_threshold_multiplier || ''}
                              onChange={(e) =>
                                updateComponent(index, {
                                  tier_threshold_multiplier: e.target.value ? parseFloat(e.target.value) : undefined,
                                })
                              }
                              placeholder="1.5"
                              className="bg-gray-900 border-gray-700 text-white h-11"
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-700 space-y-3">
                        <Label className="text-white text-sm font-medium">Notes</Label>
                        <Textarea
                          value={component.description || ''}
                          onChange={(e) => updateComponent(index, { description: e.target.value })}
                          placeholder="Additional notes..."
                          rows={3}
                          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-gray-700 pt-6 gap-3">
          <Button onClick={onClose} variant="outline" disabled={loading} className="border-gray-700 text-white hover:bg-gray-800 h-11">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !name.trim() || !selectedDealId || !termSheetId || !entityType || !entityId || validationErrors.length > 0}
            className="bg-blue-600 hover:bg-blue-700 h-11"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              feePlan ? 'Update Plan' : 'Create Plan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
