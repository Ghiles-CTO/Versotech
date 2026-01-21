/**
 * Fee Management Validation Schemas
 * Zod schemas for validating API requests
 */

import { z } from 'zod';
import { flexibleUuidSchema, optionalFlexibleUuidSchema } from './validation-helpers';

// Enum schemas
export const feeKindSchema = z.enum([
  'subscription',
  'management',
  'performance',
  'spread_markup',
  'flat',
  'bd_fee',
  'finra_fee',
  'other',
]);

export const feeCalcMethodSchema = z.enum([
  'percent_of_investment',
  'percent_per_annum',
  'percent_of_profit',
  'per_unit_spread',
  'fixed',
  'percent_of_commitment',
  'percent_of_nav',
  'fixed_amount',
]);

export const feeFrequencySchema = z.enum([
  'one_time',
  'annual',
  'quarterly',
  'monthly',
  'on_exit',
  'on_event',
]);

export const paymentScheduleSchema = z.enum(['upfront', 'recurring', 'on_demand']);

export const durationUnitSchema = z.enum(['years', 'months', 'quarters', 'life_of_vehicle']);

export const feeEventStatusSchema = z.enum([
  'accrued',
  'invoiced',
  'paid',
  'voided',
  'waived',
  'disputed',
  'cancelled',
]);

export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'disputed',
]);

export const feeScheduleStatusSchema = z.enum(['active', 'completed', 'cancelled', 'paused']);

export const commissionStatusSchema = z.enum(['accrued', 'approved', 'paid']);

// Fee Component schema
export const feeComponentSchema = z.object({
  id: flexibleUuidSchema.optional(), // Allow existing component IDs on update
  kind: feeKindSchema,
  calc_method: feeCalcMethodSchema.optional(),
  frequency: feeFrequencySchema.optional(),
  rate_bps: z.number().int().min(0).max(100000).optional(),
  flat_amount: z.number().min(0).optional(),
  hurdle_rate_bps: z.number().int().min(0).max(100000).optional(),
  has_catchup: z.boolean().optional(),
  catchup_rate_bps: z.number().int().min(0).max(100000).optional(),
  has_high_water_mark: z.boolean().optional(),
  base_calculation: z.string().optional(),
  notes: z.string().optional(),
  duration_periods: z.number().int().positive().optional(),
  duration_unit: durationUnitSchema.optional(),
  payment_schedule: paymentScheduleSchema.optional(),
  tier_threshold_multiplier: z.number().positive().optional(),
  next_tier_component_id: optionalFlexibleUuidSchema,
  // NEW: Payment timing fields for DOC 3
  payment_days_after_event: z.number().int().min(1).max(90).optional(),
  performance_cap_percent: z.number().min(0).max(100).optional(),
  has_no_cap: z.boolean().optional(),
});

// Date string schema for DATE columns (accepts YYYY-MM-DD or ISO datetime)
const dateStringSchema = z.string().refine(
  (val) => {
    // Accept YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return true;
    // Accept ISO datetime format (will be truncated to date by Postgres)
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return true;
    return false;
  },
  { message: 'Invalid date format. Expected YYYY-MM-DD or ISO datetime.' }
);

/**
 * Fee Plan schemas
 *
 * IMPORTANT: Per Fred's requirements (2024), fee plans are commercial agreements
 * with introducers/partners, NOT investor-facing fee disclosures.
 *
 * Required fields:
 * - deal_id: Must be linked to a specific deal (no global templates)
 * - term_sheet_id: Must be derived from a published term sheet
 * - Entity: ONE of introducer_id, partner_id, or commercial_partner_id
 *
 * Fee values must NOT exceed term sheet limits.
 */
export const createFeePlanSchema = z.object({
  // Required: Must be linked to a deal (no global templates per Fred)
  deal_id: flexibleUuidSchema,
  vehicle_id: optionalFlexibleUuidSchema,
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  // Note: is_default is deprecated - fee models must be manually created
  is_default: z.boolean().optional().default(false),
  effective_from: dateStringSchema.optional(),
  effective_until: dateStringSchema.optional(),
  components: z.array(feeComponentSchema).default([]),

  // NEW: Required term sheet link (for fee limit validation)
  term_sheet_id: flexibleUuidSchema,

  // NEW: Entity link - exactly ONE must be provided
  introducer_id: optionalFlexibleUuidSchema,
  partner_id: optionalFlexibleUuidSchema,
  commercial_partner_id: optionalFlexibleUuidSchema,

  // NEW: Agreement fields for DOC 3 generation (introducers & partners)
  agreement_duration_months: z.number().int().min(1).max(120).optional().default(36),
  // Non-circumvention: null = indefinite, number = specific months
  non_circumvention_months: z.number().int().min(1).max(240).nullable().optional(),
  vat_registration_number: z.string().max(50).nullable().optional(),
  governing_law: z.string().optional().default('British Virgin Islands'),
}).refine(
  (data) => {
    // Ensure exactly one entity is provided
    const entityCount = [
      data.introducer_id,
      data.partner_id,
      data.commercial_partner_id,
    ].filter(Boolean).length;
    return entityCount === 1;
  },
  {
    message: 'Exactly one entity must be specified: introducer_id, partner_id, or commercial_partner_id',
    path: ['entity'],
  }
);

// For updates, all fields are optional except we add is_active
// Note: Uses .safeExtend() because createFeePlanSchema has a refinement
export const updateFeePlanSchema = createFeePlanSchema.partial().safeExtend({
  is_active: z.boolean().optional(),
});

// Fee Event schemas
export const createFeeEventSchema = z.object({
  deal_id: optionalFlexibleUuidSchema,
  investor_id: flexibleUuidSchema,
  allocation_id: optionalFlexibleUuidSchema,
  fee_component_id: optionalFlexibleUuidSchema,
  fee_type: feeKindSchema,
  event_date: z.string().datetime(),
  period_start_date: z.string().datetime().optional(),
  period_end_date: z.string().datetime().optional(),
  base_amount: z.number().min(0),
  computed_amount: z.number().min(0),
  rate_bps: z.number().int().min(0).max(100000).optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
});

export const updateFeeEventSchema = z.object({
  status: feeEventStatusSchema.optional(),
  computed_amount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Invoice Line Item schema
export const invoiceLineItemSchema = z.object({
  kind: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().positive().optional().default(1),
  unit_price: z.number().optional(),
  amount: z.number().min(0),
});

// Invoice schemas
export const createInvoiceSchema = z.object({
  investor_id: flexibleUuidSchema,
  deal_id: optionalFlexibleUuidSchema,
  due_date: z.string().datetime(),
  fee_event_ids: z.array(flexibleUuidSchema),
  custom_line_items: z.array(invoiceLineItemSchema).optional(),
  notes: z.string().optional(),
  auto_send_enabled: z.boolean().optional().default(false),
  reminder_days_before: z.number().int().min(1).max(90).optional().default(7),
});

export const updateInvoiceSchema = z.object({
  due_date: z.string().datetime().optional(),
  status: invoiceStatusSchema.optional(),
  notes: z.string().optional(),
  auto_send_enabled: z.boolean().optional(),
  reminder_days_before: z.number().int().min(1).max(90).optional(),
});

export const markInvoicePaidSchema = z.object({
  paid_amount: z.number().positive(),
  paid_at: z.string().datetime().optional(),
  payment_reference: z.string().optional(),
});

// Fee Schedule schemas
export const createFeeScheduleSchema = z.object({
  fee_component_id: flexibleUuidSchema,
  investor_id: flexibleUuidSchema,
  deal_id: optionalFlexibleUuidSchema,
  allocation_id: optionalFlexibleUuidSchema,
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  total_periods: z.number().int().positive(),
});

export const updateFeeScheduleSchema = z.object({
  status: feeScheduleStatusSchema.optional(),
  end_date: z.string().datetime().optional(),
  total_periods: z.number().int().positive().optional(),
});

// Commission schemas
export const createCommissionSchema = z.object({
  introducer_id: flexibleUuidSchema,
  introduction_id: optionalFlexibleUuidSchema,
  deal_id: optionalFlexibleUuidSchema,
  investor_id: optionalFlexibleUuidSchema,
  basis_type: z.string().min(1),
  rate_bps: z.number().int().min(0).max(100000),
  base_amount: z.number().min(0),
  accrual_amount: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  payment_due_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const approveCommissionSchema = z.object({
  approved_by: flexibleUuidSchema,
  notes: z.string().optional(),
});

export const markCommissionPaidSchema = z.object({
  paid_at: z.string().datetime(),
  payment_reference: z.string().optional(),
  invoice_id: optionalFlexibleUuidSchema,
});

// Filter schemas
export const feeEventFiltersSchema = z.object({
  investor_id: optionalFlexibleUuidSchema,
  deal_id: optionalFlexibleUuidSchema,
  allocation_id: optionalFlexibleUuidSchema,
  fee_type: feeKindSchema.optional(),
  status: feeEventStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  period_from: z.string().optional(), // Filter by period_start_date >= period_from
  period_to: z.string().optional(), // Filter by period_start_date <= period_to
  limit: z.coerce.number().int().positive().max(500).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const invoiceFiltersSchema = z.object({
  investor_id: optionalFlexibleUuidSchema,
  deal_id: optionalFlexibleUuidSchema,
  status: invoiceStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(500).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const commissionFiltersSchema = z.object({
  introducer_id: optionalFlexibleUuidSchema,
  deal_id: optionalFlexibleUuidSchema,
  status: commissionStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(500).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Date range schema for reports
export const dateRangeSchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

// Export schema for reports
export const exportFormatSchema = z.enum(['csv', 'excel', 'pdf']);

export const reportExportSchema = z.object({
  format: exportFormatSchema,
  date_range: dateRangeSchema.optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});
