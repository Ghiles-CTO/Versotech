/**
 * Fee Plan Edit Modal - Redesigned
 *
 * A clean, wizard-style modal for creating and editing fee plans.
 * Uses progressive disclosure to reduce cognitive load.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  ChevronDown,
  FileText,
  DollarSign,
  ScrollText,
  Check,
  Building2,
} from 'lucide-react';
import type { FeePlanWithComponents } from '@/lib/fees/types';
import { TermSheetSelector, type TermSheet } from './TermSheetSelector';
import { EntitySelector, type EntityType } from './EntitySelector';
import { validateFeeComponentsAgainstTermSheet } from '@/lib/fees/term-sheet-sync';

// ============================================================================
// TYPES
// ============================================================================

interface FeePlanEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feePlan?: FeePlanWithComponents | null;
  dealId?: string;
  initialTermSheetId?: string;
}

interface FeeComponent {
  id?: string;
  kind: 'subscription' | 'management' | 'performance' | 'spread_markup' | 'flat' | 'bd_fee' | 'finra_fee' | 'other';
  calc_method: string;
  frequency: string;
  rate_bps?: number;
  flat_amount?: number;
  notes?: string;
  payment_schedule?: string;
  duration_periods?: number;
  duration_unit?: string;
  tier_threshold_multiplier?: number;
}

interface AgreementTerms {
  duration_months: number;
  non_circumvention_months: number | null;
  non_circumvention_indefinite: boolean;
  governing_law: string;
  vat_number: string;
  intro_payment_days: number;
  perf_payment_days: number;
  hurdle_rate_bps?: number;
  has_catchup: boolean;
  catchup_rate_bps?: number;
  has_high_water_mark: boolean;
  has_no_cap: boolean;
  performance_cap_percent?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FEE_KINDS = [
  { value: 'subscription', label: 'Subscription Fee', color: 'blue' },
  { value: 'management', label: 'Management Fee', color: 'green' },
  { value: 'performance', label: 'Performance Fee', color: 'purple' },
  { value: 'flat', label: 'Flat Fee', color: 'amber' },
  { value: 'spread_markup', label: 'BI Fee PPS', color: 'cyan' },
  { value: 'other', label: 'Other', color: 'gray' },
] as const;

const CALC_METHODS = [
  { value: 'percent_of_investment', label: '% of Investment' },
  { value: 'percent_per_annum', label: '% per Annum' },
  { value: 'percent_of_profit', label: '% of Profit' },
  { value: 'per_unit_spread', label: 'Share Count' },
  { value: 'fixed_amount', label: 'Fixed Amount' },
] as const;

const GOVERNING_LAWS = [
  'British Virgin Islands',
  'England and Wales',
  'Cayman Islands',
  'Delaware, USA',
  'Singapore',
] as const;

const DEFAULT_AGREEMENT_TERMS: AgreementTerms = {
  duration_months: 36,
  non_circumvention_months: null,
  non_circumvention_indefinite: true,
  governing_law: 'British Virgin Islands',
  vat_number: '',
  intro_payment_days: 3,
  perf_payment_days: 10,
  has_catchup: false,
  has_high_water_mark: false,
  has_no_cap: true,
};

const coerceOptional = <T,>(value: T | null | undefined) => (value === null ? undefined : value);

const stripNulls = <T extends Record<string, any>>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== null)) as T;

const usesFlatAmount = (method?: string) =>
  method === 'fixed_amount' || method === 'fixed' || method === 'per_unit_spread';

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  status?: 'complete' | 'incomplete' | 'error';
}

function CollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  badge,
  status,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-5">
          <div className="text-blue-500 dark:text-blue-400 p-2 bg-blue-500/10 rounded-lg">{icon}</div>
          <span className="font-bold text-foreground text-xl">{title}</span>
          {badge && (
            <Badge variant="outline" className="text-sm border-border text-foreground px-3 py-1 font-medium">
              {badge}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-5">
          {status === 'complete' && (
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="p-1"
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-8 pb-8 pt-6 border-t border-border bg-muted/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// FEE COMPONENT CARD
// ============================================================================

interface FeeComponentCardProps {
  component: FeeComponent;
  index: number;
  onChange: (updates: Partial<FeeComponent>) => void;
  onRemove: () => void;
  termSheetLimits?: { subscription?: number; management?: number; performance?: number };
}

function FeeComponentCard({
  component,
  index,
  onChange,
  onRemove,
  termSheetLimits,
}: FeeComponentCardProps) {
  const kindConfig = FEE_KINDS.find((k) => k.value === component.kind);

  const isFlatAmount = usesFlatAmount(component.calc_method);
  const ratePercent = !isFlatAmount && component.rate_bps ? (component.rate_bps / 100).toFixed(2) : null;

  // Check if rate exceeds term sheet limit
  const exceedsLimit = useMemo(() => {
    if (!termSheetLimits || !component.rate_bps) return false;
    const limitKey = component.kind as keyof typeof termSheetLimits;
    const limit = termSheetLimits[limitKey];
    if (!limit) return false;
    return (component.rate_bps / 100) > limit;
  }, [termSheetLimits, component.rate_bps, component.kind]);

  // Color mapping for Tailwind (can't use dynamic class names)
  const getBorderColor = () => {
    switch (kindConfig?.color) {
      case 'blue': return 'border-blue-500/40';
      case 'green': return 'border-green-500/40';
      case 'purple': return 'border-purple-500/40';
      case 'amber': return 'border-amber-500/40';
      case 'cyan': return 'border-cyan-500/40';
      default: return 'border-border';
    }
  };

  const getBadgeColor = () => {
    switch (kindConfig?.color) {
      case 'blue': return 'bg-blue-500/20 text-blue-400';
      case 'green': return 'bg-green-500/20 text-green-400';
      case 'purple': return 'bg-purple-500/20 text-purple-400';
      case 'amber': return 'bg-amber-500/20 text-amber-400';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`border-2 rounded-2xl p-6 bg-card ${getBorderColor()} transition-all hover:bg-muted/60`}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-xl ${getBadgeColor()} flex items-center justify-center font-bold text-lg`}>
            {index + 1}
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Fee Type</Label>
            <Select
              value={component.kind}
              onValueChange={(val) => {
                const nextKind = val as FeeComponent['kind'];
                if (nextKind === 'spread_markup') {
                  onChange({
                    kind: nextKind,
                    calc_method: 'per_unit_spread',
                    rate_bps: undefined,
                  });
                  return;
                }
                if (nextKind === 'flat') {
                  onChange({
                    kind: nextKind,
                    calc_method: 'fixed_amount',
                    rate_bps: undefined,
                  });
                  return;
                }
                onChange({ kind: nextKind });
              }}
            >
              <SelectTrigger className="w-64 bg-muted/50 border-border text-foreground h-12 text-base font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {FEE_KINDS.map((kind) => (
                  <SelectItem key={kind.value} value={kind.value} className="text-base py-3">
                    {kind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 h-12 w-12 rounded-xl"
        >
          <Trash2 className="w-6 h-6" />
        </Button>
      </div>

      {/* Fields - 4 columns with more gap */}
      <div className="grid grid-cols-4 gap-6">
        {/* Calculation Method */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground font-medium">Calculation Method</Label>
          <Select
            value={component.calc_method}
            onValueChange={(val) => {
              onChange({
                calc_method: val,
                ...(usesFlatAmount(val)
                  ? { rate_bps: undefined }
                  : { flat_amount: undefined }),
              });
            }}
          >
            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {CALC_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value} className="text-base py-2.5">
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional: Rate OR Flat Amount based on calc_method */}
        {isFlatAmount ? (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground font-medium">
              {component.calc_method === 'per_unit_spread'
                ? 'BI Fee PPS (Deal Currency)'
                : 'Amount (Deal Currency)'}
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={component.flat_amount ?? ''}
              onChange={(e) => onChange({ flat_amount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="5,000.00"
              className="bg-muted/50 border-border text-foreground h-12 text-lg font-mono"
            />
            {component.flat_amount != null && (
              <p className="text-base text-green-600 dark:text-green-400 font-semibold">
                {component.flat_amount.toLocaleString()}
              </p>
            )}
            {component.calc_method === 'per_unit_spread' && (
              <p className="text-xs text-muted-foreground">
                Total fee = BI fee per share × share count
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground font-medium">Rate (Basis Points)</Label>
            <Input
              type="number"
              value={component.rate_bps ?? ''}
              onChange={(e) => onChange({ rate_bps: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="200"
              className={`bg-muted/50 border-border text-foreground h-12 text-lg font-mono ${exceedsLimit ? 'border-red-500 bg-red-500/10' : ''}`}
            />
            {ratePercent && (
              <p className={`text-base font-semibold ${exceedsLimit ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                = {ratePercent}%
                {exceedsLimit && ' ⚠️ exceeds limit'}
              </p>
            )}
          </div>
        )}

        {/* Payment Schedule */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground font-medium">Payment Schedule</Label>
          <Select
            value={component.payment_schedule || 'upfront'}
            onValueChange={(val) => onChange({ payment_schedule: val })}
          >
            <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="upfront" className="text-base py-2.5">Upfront</SelectItem>
              <SelectItem value="recurring" className="text-base py-2.5">Recurring</SelectItem>
              <SelectItem value="on_demand" className="text-base py-2.5">On Demand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground font-medium">Notes</Label>
          <Input
            value={component.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Optional notes..."
            className="bg-muted/50 border-border text-foreground h-12 text-base"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

export default function FeePlanEditModal({
  open,
  onClose,
  onSuccess,
  feePlan,
  dealId,
  initialTermSheetId,
}: FeePlanEditModalProps) {
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    components: true,
    agreement: false,
  });

  // Data State
  const [deals, setDeals] = useState<Array<{ id: string; name: string }>>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form State - Basic Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string | undefined>(dealId);
  const [isActive, setIsActive] = useState(true);

  // Form State - Term Sheet & Entity
  const [termSheetId, setTermSheetId] = useState<string | undefined>(initialTermSheetId);
  const [selectedTermSheet, setSelectedTermSheet] = useState<TermSheet | null>(null);
  const [entityType, setEntityType] = useState<EntityType | undefined>();
  const [entityId, setEntityId] = useState<string | undefined>();

  // Form State - Components
  const [components, setComponents] = useState<FeeComponent[]>([]);

  // Form State - Agreement Terms
  const [agreementTerms, setAgreementTerms] = useState<AgreementTerms>(DEFAULT_AGREEMENT_TERMS);

  // Derived State
  const isEditing = !!feePlan;
  const hasPerformanceComponent = components.some((c) => c.kind === 'performance');
  const hasSubscriptionComponent = components.some((c) => c.kind === 'subscription');

  const termSheetLimits = useMemo(() => {
    if (!selectedTermSheet) return undefined;
    return {
      subscription: selectedTermSheet.subscription_fee_percent || undefined,
      management: selectedTermSheet.management_fee_percent || undefined,
      performance: selectedTermSheet.carried_interest_percent || undefined,
    };
  }, [selectedTermSheet]);

  // Check section completion
  const basicInfoComplete = name.trim() && selectedDealId && termSheetId && entityType && entityId;
  const componentsValid = validationErrors.length === 0;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load deals on open
  useEffect(() => {
    if (open) {
      loadDeals();
    }
  }, [open]);

  // Initialize form when opening
  useEffect(() => {
    if (!open) return;

    if (feePlan) {
      // Edit mode - load existing data
      setName(feePlan.name);
      setDescription(feePlan.description || '');
      setSelectedDealId(feePlan.deal_id || undefined);
      setIsActive(feePlan.is_active);

      const fp = feePlan as any;
      setTermSheetId(fp.term_sheet_id || undefined);

      // Determine entity
      if (fp.introducer_id) {
        setEntityType('introducer');
        setEntityId(fp.introducer_id);
      } else if (fp.partner_id) {
        setEntityType('partner');
        setEntityId(fp.partner_id);
      } else if (fp.commercial_partner_id) {
        setEntityType('commercial_partner');
        setEntityId(fp.commercial_partner_id);
      }

      // Load agreement terms
      setAgreementTerms({
        duration_months: fp.agreement_duration_months ?? 36,
        non_circumvention_months: fp.non_circumvention_months ?? null,
        non_circumvention_indefinite: fp.non_circumvention_months == null,
        governing_law: fp.governing_law ?? 'British Virgin Islands',
        vat_number: fp.vat_registration_number ?? '',
        intro_payment_days: 3,
        perf_payment_days: 10,
        hurdle_rate_bps: undefined,
        has_catchup: false,
        catchup_rate_bps: undefined,
        has_high_water_mark: false,
        has_no_cap: true,
        performance_cap_percent: undefined,
      });

      // Load components
      const existingComponents = (feePlan.components || []) as any[];
      const subComp = existingComponents.find((c) => c.kind === 'subscription');
      const perfComp = existingComponents.find((c) => c.kind === 'performance');

      // Extract agreement terms from components
      if (subComp) {
        setAgreementTerms((prev) => ({
          ...prev,
          intro_payment_days: subComp.payment_days_after_event ?? 3,
        }));
      }
      if (perfComp) {
        setAgreementTerms((prev) => ({
          ...prev,
          perf_payment_days: perfComp.payment_days_after_event ?? 10,
          hurdle_rate_bps: perfComp.hurdle_rate_bps,
          has_catchup: perfComp.has_catchup ?? false,
          catchup_rate_bps: perfComp.catchup_rate_bps,
          has_high_water_mark: perfComp.has_high_water_mark ?? false,
          has_no_cap: perfComp.has_no_cap ?? true,
          performance_cap_percent: perfComp.performance_cap_percent,
        }));
      }

      setComponents(
        existingComponents.map((c: any) => ({
          id: c.id,
          kind: c.kind,
          calc_method: c.calc_method
            ?? (c.kind === 'spread_markup' && c.flat_amount != null
              ? 'per_unit_spread'
              : c.kind === 'flat'
                ? 'fixed_amount'
                : 'percent_of_investment'),
          frequency: c.frequency ?? 'one_time',
          rate_bps: coerceOptional(c.rate_bps),
          flat_amount: coerceOptional(c.flat_amount),
          notes: c.notes ?? '',
          payment_schedule: c.payment_schedule ?? 'upfront',
          duration_periods: coerceOptional(c.duration_periods),
          duration_unit: coerceOptional(c.duration_unit),
        }))
      );
    } else {
      // Create mode - reset form
      resetForm();
    }
  }, [open, feePlan, dealId, initialTermSheetId]);

  // Validate components against term sheet
  useEffect(() => {
    if (selectedTermSheet && components.length > 0) {
      const errors = validateFeeComponentsAgainstTermSheet(components, selectedTermSheet);
      setValidationErrors(errors);
    } else {
      setValidationErrors([]);
    }
  }, [components, selectedTermSheet]);

  // Auto-expand agreement section when entity is selected
  useEffect(() => {
    if (entityType && entityId) {
      setExpandedSections((prev) => ({ ...prev, agreement: true }));
    }
  }, [entityType, entityId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setSelectedDealId(dealId);
    setIsActive(true);
    setTermSheetId(initialTermSheetId);
    setSelectedTermSheet(null);
    setEntityType(undefined);
    setEntityId(undefined);
    setComponents([]);
    setAgreementTerms(DEFAULT_AGREEMENT_TERMS);
    setError(null);
    setValidationErrors([]);
    setExpandedSections({ basic: true, components: true, agreement: false });
  }, [dealId, initialTermSheetId]);

  const loadDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const json = await res.json();
      setDeals(json.deals || []);
    } catch (err) {
      console.error('Error loading deals:', err);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {
        kind: 'subscription',
        calc_method: 'percent_of_investment',
        frequency: 'one_time',
        payment_schedule: 'upfront',
      },
    ]);
  };

  const updateComponent = (index: number, updates: Partial<FeeComponent>) => {
    setComponents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const removeComponent = (index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAgreementTerms = (updates: Partial<AgreementTerms>) => {
    setAgreementTerms((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    // Validate
    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }
    if (!selectedDealId) {
      setError('A deal must be selected');
      return;
    }
    if (!termSheetId) {
      setError('A term sheet must be selected');
      return;
    }
    if (!entityType || !entityId) {
      setError('An entity must be selected');
      return;
    }
    if (validationErrors.length > 0) {
      setError(`Fee values exceed term sheet limits: ${validationErrors.join('; ')}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build entity fields
      const entityFields = {
        introducer_id: entityType === 'introducer' ? entityId : undefined,
        partner_id: entityType === 'partner' ? entityId : undefined,
        commercial_partner_id: entityType === 'commercial_partner' ? entityId : undefined,
      };

      // Build components with agreement terms merged
      // IMPORTANT: has_catchup and has_high_water_mark are NOT NULL in DB
      const processedComponents = components.map((c) => {
        const { id, notes, ...rest } = c;
        const isFlatMethod = usesFlatAmount(rest.calc_method);
        const normalized = {
          ...rest,
          rate_bps: isFlatMethod ? undefined : rest.rate_bps,
          flat_amount: isFlatMethod ? rest.flat_amount : undefined,
        };

        // Base fields for ALL components - include NOT NULL boolean defaults
        const base = stripNulls({
          ...normalized,
          notes: notes?.trim() || undefined,
          // These columns are NOT NULL in DB - must always provide values
          has_catchup: false,
          has_high_water_mark: false,
          ...(id && id.length > 10 ? { id } : {}),
        });

        if (c.kind === 'subscription') {
          return stripNulls({
            ...base,
            payment_days_after_event: agreementTerms.intro_payment_days,
          });
        }

        if (c.kind === 'performance') {
          return stripNulls({
            ...base,
            payment_days_after_event: agreementTerms.perf_payment_days,
            hurdle_rate_bps: agreementTerms.hurdle_rate_bps ?? undefined,
            has_catchup: agreementTerms.has_catchup,
            catchup_rate_bps: agreementTerms.has_catchup ? (agreementTerms.catchup_rate_bps ?? undefined) : undefined,
            has_high_water_mark: agreementTerms.has_high_water_mark,
            has_no_cap: agreementTerms.has_no_cap,
            performance_cap_percent: agreementTerms.has_no_cap
              ? undefined
              : (agreementTerms.performance_cap_percent ?? undefined),
          });
        }

        return base;
      });

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        deal_id: selectedDealId,
        term_sheet_id: termSheetId,
        ...entityFields,
        is_active: isActive,
        agreement_duration_months: agreementTerms.duration_months,
        non_circumvention_months: agreementTerms.non_circumvention_indefinite ? null : agreementTerms.non_circumvention_months,
        governing_law: agreementTerms.governing_law,
        vat_registration_number: agreementTerms.vat_number.trim() || null,
        components: processedComponents,
      };

      const url = feePlan ? `/api/staff/fees/plans/${feePlan.id}` : '/api/staff/fees/plans';
      const res = await fetch(url, {
        method: feePlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        const msg = errorData.error || 'Failed to save';
        const details = errorData.details ? `\n${errorData.details}` : '';
        throw new Error(`${msg}${details}`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fee plan');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[1400px] !w-[96vw] !max-h-[94vh] !p-0 bg-background border-border text-foreground overflow-hidden flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="px-10 py-6 border-b border-border bg-gradient-to-r from-blue-500/5 dark:from-blue-900/10 via-muted/30 to-transparent shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
                {isEditing ? 'Edit Fee Plan' : 'Create New Fee Plan'}
              </DialogTitle>
              <p className="text-base text-muted-foreground mt-2">
                {isEditing ? 'Modify fee structure and agreement terms' : 'Define a fee structure for a partner or introducer agreement'}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg border border-border">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                  className="border-border h-5 w-5"
                />
                <Label htmlFor="is_active" className="text-sm text-muted-foreground cursor-pointer font-medium">
                  Plan Active
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-10 py-4 bg-red-500/10 border-b border-red-500/30 shrink-0"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-base">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6">
          {/* Section 1: Basic Information */}
          <CollapsibleSection
            title="Basic Information"
            icon={<FileText className="w-5 h-5" />}
            isOpen={expandedSections.basic}
            onToggle={() => toggleSection('basic')}
            status={basicInfoComplete ? 'complete' : undefined}
          >
            <div className="space-y-6">
              {/* Row 1: Plan Name & Description side by side */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base text-foreground font-medium">
                    Plan Name <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Standard Introducer Fee Plan"
                    className="bg-muted/50 border-border text-foreground h-12 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-base text-foreground font-medium">Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description of this fee arrangement..."
                    className="bg-muted/50 border-border text-foreground h-12 text-base focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Deal, Term Sheet, Entity - 3 columns */}
              <div className="grid grid-cols-3 gap-8">
                {/* Deal */}
                <div className="space-y-3">
                  {dealId ? (
                    <>
                      <Label className="text-base text-foreground font-medium">Deal</Label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground h-12">
                        <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <span className="text-base truncate">{deals.find((d) => d.id === dealId)?.name || 'Loading...'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Label className="text-base text-foreground font-medium">
                        Deal <span className="text-red-500 dark:text-red-400">*</span>
                      </Label>
                      <Select
                        value={selectedDealId || ''}
                        onValueChange={(val) => {
                          setSelectedDealId(val || undefined);
                          setTermSheetId(undefined);
                          setSelectedTermSheet(null);
                          setEntityType(undefined);
                          setEntityId(undefined);
                        }}
                      >
                        <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 text-base">
                          <SelectValue placeholder="Select a deal" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {deals.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id} className="text-base py-2.5">
                              {deal.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>

                {/* Term Sheet */}
                <div className="space-y-3">
                  <TermSheetSelector
                    dealId={selectedDealId}
                    value={termSheetId}
                    onChange={(id, ts) => {
                      setTermSheetId(id);
                      setSelectedTermSheet(ts);
                    }}
                    required={true}
                  />
                </div>

                {/* Entity Type Quick Select - simplified */}
                <div className="space-y-3">
                  <Label className="text-base text-foreground font-medium">
                    Entity Type <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Select
                    value={entityType || ''}
                    onValueChange={(val) => {
                      setEntityType(val as EntityType || undefined);
                      setEntityId(undefined);
                    }}
                    disabled={!selectedDealId}
                  >
                    <SelectTrigger className="bg-muted/50 border-border text-foreground h-12 text-base">
                      <SelectValue placeholder={selectedDealId ? "Select type" : "Select deal first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="introducer" className="text-base py-2.5">Introducer</SelectItem>
                      <SelectItem value="partner" className="text-base py-2.5">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Entity Selection (only if type selected) */}
              {entityType && selectedDealId && (
                <div className="pt-4 border-t border-border">
                  <EntitySelector
                    dealId={selectedDealId}
                    entityType={entityType}
                    onEntityTypeChange={setEntityType}
                    entityId={entityId}
                    onEntityIdChange={setEntityId}
                    required={true}
                    excludeTypes={['commercial_partner']}
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 2: Fee Components */}
          <CollapsibleSection
            title="Fee Components"
            icon={<DollarSign className="w-5 h-5" />}
            isOpen={expandedSections.components}
            onToggle={() => toggleSection('components')}
            badge={`${components.length} component${components.length !== 1 ? 's' : ''}`}
            status={components.length > 0 ? (componentsValid ? 'complete' : 'error') : undefined}
          >
            <div className="space-y-4">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div className="text-sm text-red-400">
                      <p className="font-medium">Fees exceed term sheet limits:</p>
                      <ul className="mt-1 space-y-1">
                        {validationErrors.map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Components List */}
              {components.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No fee components defined</p>
                  <Button
                    type="button"
                    onClick={addComponent}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-border text-muted-foreground hover:bg-muted"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Component
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((comp, index) => (
                    <FeeComponentCard
                      key={index}
                      component={comp}
                      index={index}
                      onChange={(updates) => updateComponent(index, updates)}
                      onRemove={() => removeComponent(index)}
                      termSheetLimits={termSheetLimits}
                    />
                  ))}
                  <Button
                    type="button"
                    onClick={addComponent}
                    variant="outline"
                    size="sm"
                    className="w-full border-border border-dashed text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Component
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 3: Agreement Terms (only for introducers/partners) */}
          {(entityType === 'introducer' || entityType === 'partner') && (
            <CollapsibleSection
              title="Agreement Terms"
              icon={<ScrollText className="w-5 h-5" />}
              isOpen={expandedSections.agreement}
              onToggle={() => toggleSection('agreement')}
              badge={entityType === 'introducer' ? 'DOC 3' : 'Placement'}
            >
              <div className="space-y-6">
                {/* General Terms */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    General Terms
                  </h4>
                  <div className="grid grid-cols-3 gap-4 pl-4">
                    {/* Duration */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Agreement Duration</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={agreementTerms.duration_months}
                          onChange={(e) => updateAgreementTerms({ duration_months: Number(e.target.value) || 36 })}
                          className="bg-muted/50 border-border text-foreground h-9 w-20"
                        />
                        <span className="text-xs text-muted-foreground">months</span>
                      </div>
                    </div>

                    {/* Non-Circumvention */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Non-Circumvention</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={agreementTerms.non_circumvention_indefinite}
                          onCheckedChange={(checked) => {
                            updateAgreementTerms({
                              non_circumvention_indefinite: !!checked,
                              non_circumvention_months: checked ? null : 24,
                            });
                          }}
                          className="border-border"
                        />
                        <span className="text-xs text-muted-foreground">Indefinite</span>
                        {!agreementTerms.non_circumvention_indefinite && (
                          <>
                            <Input
                              type="number"
                              min="1"
                              value={agreementTerms.non_circumvention_months || ''}
                              onChange={(e) => updateAgreementTerms({ non_circumvention_months: Number(e.target.value) || null })}
                              className="bg-muted/50 border-border text-foreground h-8 w-16"
                            />
                            <span className="text-xs text-muted-foreground">mo</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Governing Law */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Governing Law</Label>
                      <Select
                        value={agreementTerms.governing_law}
                        onValueChange={(val) => updateAgreementTerms({ governing_law: val })}
                      >
                        <SelectTrigger className="bg-muted/50 border-border text-foreground h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {GOVERNING_LAWS.map((law) => (
                            <SelectItem key={law} value={law} className="text-xs">
                              {law}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Introduction Fee Terms */}
                {hasSubscriptionComponent && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Introduction Fee Payment
                    </h4>
                    <div className="pl-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Payment After Closing</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="90"
                            value={agreementTerms.intro_payment_days}
                            onChange={(e) => updateAgreementTerms({ intro_payment_days: Number(e.target.value) || 3 })}
                            className="bg-muted/50 border-border text-foreground h-9 w-20"
                          />
                          <span className="text-xs text-muted-foreground">business days after share certificate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Fee Terms */}
                {hasPerformanceComponent && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      Performance Fee (Carried Interest)
                    </h4>
                    <div className="pl-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Payment Days */}
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Payment After Redemption</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="90"
                              value={agreementTerms.perf_payment_days}
                              onChange={(e) => updateAgreementTerms({ perf_payment_days: Number(e.target.value) || 10 })}
                              className="bg-muted/50 border-border text-foreground h-9 w-20"
                            />
                            <span className="text-xs text-muted-foreground">days</span>
                          </div>
                        </div>

                        {/* Hurdle Rate */}
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Hurdle Rate</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={agreementTerms.hurdle_rate_bps || ''}
                              onChange={(e) => updateAgreementTerms({ hurdle_rate_bps: e.target.value ? Number(e.target.value) : undefined })}
                              placeholder="800"
                              className="bg-muted/50 border-border text-foreground h-9 w-24"
                            />
                            <span className="text-xs text-muted-foreground">bps</span>
                          </div>
                          {agreementTerms.hurdle_rate_bps && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">= {(agreementTerms.hurdle_rate_bps / 100).toFixed(2)}%</p>
                          )}
                        </div>
                      </div>

                      {/* Checkboxes Row */}
                      <div className="flex flex-wrap gap-6">
                        {/* GP Catchup */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={agreementTerms.has_catchup}
                            onCheckedChange={(checked) => updateAgreementTerms({ has_catchup: !!checked })}
                            className="border-border"
                          />
                          <span className="text-sm text-muted-foreground">GP Catchup</span>
                          {agreementTerms.has_catchup && (
                            <div className="flex items-center gap-1 ml-2">
                              <Input
                                type="number"
                                value={agreementTerms.catchup_rate_bps || ''}
                                onChange={(e) => updateAgreementTerms({ catchup_rate_bps: e.target.value ? Number(e.target.value) : undefined })}
                                className="bg-muted/50 border-border text-foreground h-8 w-20"
                              />
                              <span className="text-xs text-muted-foreground">bps</span>
                            </div>
                          )}
                        </div>

                        {/* High Water Mark */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={agreementTerms.has_high_water_mark}
                            onCheckedChange={(checked) => updateAgreementTerms({ has_high_water_mark: !!checked })}
                            className="border-border"
                          />
                          <span className="text-sm text-muted-foreground">High Water Mark</span>
                        </div>

                        {/* No Cap */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={agreementTerms.has_no_cap}
                            onCheckedChange={(checked) => {
                              updateAgreementTerms({
                                has_no_cap: !!checked,
                                performance_cap_percent: checked ? undefined : 20,
                              });
                            }}
                            className="border-border"
                          />
                          <span className="text-sm text-muted-foreground">No Cap</span>
                          {!agreementTerms.has_no_cap && (
                            <div className="flex items-center gap-1 ml-2">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={agreementTerms.performance_cap_percent || ''}
                                onChange={(e) => updateAgreementTerms({ performance_cap_percent: e.target.value ? Number(e.target.value) : undefined })}
                                className="bg-muted/50 border-border text-foreground h-8 w-16"
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VAT */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    VAT Information
                  </h4>
                  <div className="pl-4">
                    <div className="space-y-2 max-w-xs">
                      <Label className="text-xs text-muted-foreground">VAT Registration Number</Label>
                      <Input
                        value={agreementTerms.vat_number}
                        onChange={(e) => updateAgreementTerms({ vat_number: e.target.value })}
                        placeholder="e.g., GB123456789"
                        className="bg-muted/50 border-border text-foreground h-9"
                      />
                      <p className="text-xs text-muted-foreground">Leave blank if not VAT registered</p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-border bg-muted/60 flex items-center justify-between shrink-0">
          <div className="text-base text-muted-foreground">
            <span className="font-semibold text-foreground text-lg">{components.length}</span> fee component{components.length !== 1 ? 's' : ''} defined
            {validationErrors.length > 0 && (
              <span className="text-red-500 dark:text-red-400 ml-4 inline-flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {validationErrors.length} validation error{validationErrors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border text-foreground hover:bg-muted h-12 px-8 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading || !basicInfoComplete || validationErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-500 h-12 px-10 min-w-[180px] text-base font-semibold shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{isEditing ? 'Update Fee Plan' : 'Create Fee Plan'}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
