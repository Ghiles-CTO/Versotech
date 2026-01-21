/**
 * Fee Management Type Definitions
 * TypeScript types for fee plans, components, events, invoices, and schedules
 */

// Enums matching database types
export type FeeKind =
  | 'subscription'
  | 'management'
  | 'performance'
  | 'spread_markup'
  | 'flat'
  | 'other';

export type FeeCalcMethod =
  | 'percent_of_investment'
  | 'percent_per_annum'
  | 'percent_of_profit'
  | 'per_unit_spread'
  | 'fixed'
  | 'percent_of_commitment'
  | 'percent_of_nav'
  | 'fixed_amount';

export type FeeFrequency =
  | 'one_time'
  | 'annual'
  | 'quarterly'
  | 'monthly'
  | 'on_exit'
  | 'on_event';

export type PaymentSchedule = 'upfront' | 'recurring' | 'on_demand';

export type DurationUnit = 'years' | 'months' | 'quarters' | 'life_of_vehicle';

export type FeeEventStatus =
  | 'accrued'
  | 'invoiced'
  | 'paid'
  | 'voided'
  | 'waived'
  | 'disputed'
  | 'cancelled';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'
  | 'disputed';

export type FeeScheduleStatus = 'active' | 'completed' | 'cancelled' | 'paused';

export type CommissionStatus = 'accrued' | 'approved' | 'paid';

// Core entity interfaces
export interface FeePlan {
  id: string;
  deal_id?: string;
  vehicle_id?: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  effective_from?: string;
  effective_until?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FeeComponent {
  id: string;
  fee_plan_id: string;
  kind: FeeKind;
  calc_method: FeeCalcMethod;
  frequency: FeeFrequency;
  rate_bps?: number;
  flat_amount?: number;
  hurdle_rate_bps?: number;
  has_catchup?: boolean;
  catchup_rate_bps?: number;
  has_high_water_mark?: boolean;
  base_calculation?: string;
  notes?: string;
  // New columns from migrations
  duration_periods?: number;
  duration_unit?: DurationUnit;
  payment_schedule?: PaymentSchedule;
  tier_threshold_multiplier?: number;
  next_tier_component_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FeeEvent {
  id: string;
  deal_id?: string;
  investor_id: string;
  allocation_id?: string;
  fee_component_id?: string;
  fee_type: FeeKind;
  event_date: string;
  period_start_date?: string;
  period_end_date?: string;
  base_amount: number;
  computed_amount: number;
  rate_bps?: number;
  currency: string;
  status: FeeEventStatus;
  invoice_id?: string;
  payment_id?: string;
  source_ref?: string;
  notes?: string;
  processed_at?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  investor_id: string;
  deal_id?: string;
  invoice_number: string;
  due_date: string;
  sent_at?: string;
  paid_at?: string;
  subtotal: number;
  tax?: number;
  total: number;
  paid_amount?: number;
  balance_due?: number;
  status: InvoiceStatus;
  generated_from?: string;
  doc_id?: string;
  match_status?: string;
  created_by?: string;
  created_at: string;
  // New columns from migrations
  reminder_task_id?: string;
  auto_send_enabled?: boolean;
  reminder_days_before?: number;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  fee_event_id?: string;
  kind?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
}

export interface FeeSchedule {
  id: string;
  fee_component_id: string;
  investor_id: string;
  deal_id?: string;
  allocation_id?: string;
  start_date: string;
  end_date?: string;
  total_periods: number;
  completed_periods: number;
  next_due_date?: string;
  status: FeeScheduleStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface IntroducerCommission {
  id: string;
  introducer_id: string;
  introduction_id?: string;
  deal_id?: string;
  investor_id?: string;
  basis_type: string;
  rate_bps: number;
  base_amount: number;
  accrual_amount: number;
  currency: string;
  status: CommissionStatus;
  invoice_id?: string;
  payment_due_date?: string;
  paid_at?: string;
  approved_by?: string;
  approved_at?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
}

// Extended types with relationships
export interface FeePlanWithComponents extends FeePlan {
  components: FeeComponent[];
}

export interface FeeEventWithDetails extends FeeEvent {
  investor?: {
    id: string;
    display_name: string;
    email: string;
  };
  deal?: {
    id: string;
    name: string;
  };
  fee_component?: FeeComponent;
}

export interface InvoiceWithLines extends Invoice {
  lines: InvoiceLine[];
  investor?: {
    id: string;
    display_name: string;
    email: string;
  };
  deal?: {
    id: string;
    name: string;
  };
  // Validation fields added by API
  has_discrepancy?: boolean;
  discrepancy_amount?: number;
}

export interface FeeScheduleWithDetails extends FeeSchedule {
  fee_component: FeeComponent;
  investor: {
    id: string;
    display_name: string;
    email: string;
  };
  deal?: {
    id: string;
    name: string;
  };
}

// API request/response types
export interface CreateFeePlanRequest {
  deal_id?: string;
  vehicle_id?: string;
  name: string;
  description?: string;
  is_default?: boolean;
  effective_from?: string;
  effective_until?: string;
  components: Omit<FeeComponent, 'id' | 'fee_plan_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateFeePlanRequest extends Partial<CreateFeePlanRequest> {
  is_active?: boolean;
}

export interface CreateFeeEventRequest {
  deal_id?: string;
  investor_id: string;
  allocation_id?: string;
  fee_component_id?: string;
  fee_type: FeeKind;
  event_date: string;
  period_start_date?: string;
  period_end_date?: string;
  base_amount: number;
  computed_amount: number;
  rate_bps?: number;
  currency?: string;
  notes?: string;
}

export interface CreateInvoiceRequest {
  investor_id: string;
  deal_id?: string;
  due_date: string;
  fee_event_ids: string[];
  custom_line_items?: Omit<InvoiceLine, 'id' | 'invoice_id'>[];
  notes?: string;
  auto_send_enabled?: boolean;
  reminder_days_before?: number;
}

export interface CreateFeeScheduleRequest {
  fee_component_id: string;
  investor_id: string;
  deal_id?: string;
  allocation_id?: string;
  start_date: string;
  end_date?: string;
  total_periods: number;
}

// Dashboard/Report types
export interface FeeKPIs {
  total_fees_ytd: number;
  total_fees_mtd: number;
  total_fees_qtd: number;
  outstanding_invoices_count: number;
  outstanding_invoices_amount: number;
  overdue_invoices_count: number;
  overdue_invoices_amount: number;
  upcoming_fees_30days: number;
  introducer_commissions_owed: number;
}

export interface FeesByType {
  subscription: number;
  management: number;
  performance: number;
  spread_markup: number;
  other: number;
}

export interface FeesByDeal {
  deal_id: string;
  deal_name: string;
  total_fees: number;
  by_type: FeesByType;
}

export interface InvoiceStatusBreakdown {
  draft: number;
  sent: number;
  paid: number;
  partially_paid: number;
  overdue: number;
  cancelled: number;
  disputed: number;
}

export interface MonthlyFeeRevenue {
  month: string;
  total: number;
  by_type: FeesByType;
}

export interface UpcomingFee {
  id: string;
  investor_name: string;
  deal_name?: string;
  fee_type: FeeKind;
  amount: number;
  due_date: string;
  status: 'upcoming' | 'generated' | 'invoiced';
}

// Filter types for API queries
export interface FeeEventFilters {
  investor_id?: string;
  deal_id?: string;
  fee_type?: FeeKind;
  status?: FeeEventStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface InvoiceFilters {
  investor_id?: string;
  deal_id?: string;
  status?: InvoiceStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface CommissionFilters {
  introducer_id?: string;
  deal_id?: string;
  status?: CommissionStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}
