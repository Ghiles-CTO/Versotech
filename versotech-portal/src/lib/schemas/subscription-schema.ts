import { z } from 'zod'

export const subscriptionFormSchema = z
  .object({
    // Core fields (required)
    commitment: z
      .number()
      .nonnegative('Commitment must be positive'),

    currency: z
      .string()
      .length(3, 'Currency must be 3 letters')
      .transform((val) => val.toUpperCase()),

    status: z.enum(['pending', 'committed', 'active', 'closed', 'cancelled']),

    // Date fields (optional)
    effective_date: z.string().optional().nullable(),
    funding_due_at: z.string().optional().nullable(),
    committed_at: z.string().optional().nullable(),
    contract_date: z.string().optional().nullable(),

    // Share/Unit fields (optional)
    price_per_share: z.number().nonnegative('Price per share must be positive').optional().nullable(),
    cost_per_share: z.number().nonnegative('Cost per share must be positive').optional().nullable(),
    num_shares: z.number().nonnegative('Number of shares must be positive').optional().nullable(),
    units: z.number().nonnegative('Units must be positive').optional().nullable(),
    spread_per_share: z.number().optional().nullable(),

    // Fee fields (optional)
    spread_fee_amount: z.number().nonnegative('Spread fee must be positive').optional().nullable(),
    subscription_fee_percent: z
      .number()
      .min(0, 'Subscription fee percent must be positive')
      .max(100, 'Subscription fee percent cannot exceed 100%')
      .optional()
      .nullable(),
    subscription_fee_amount: z.number().nonnegative('Subscription fee must be positive').optional().nullable(),
    bd_fee_percent: z
      .number()
      .min(0, 'BD fee percent must be positive')
      .max(100, 'BD fee percent cannot exceed 100%')
      .optional()
      .nullable(),
    bd_fee_amount: z.number().nonnegative('BD fee must be positive').optional().nullable(),
    finra_fee_amount: z.number().nonnegative('FINRA fee must be positive').optional().nullable(),
    performance_fee_tier1_percent: z
      .number()
      .min(0, 'Performance fee tier 1 percent must be positive')
      .max(100, 'Performance fee tier 1 percent cannot exceed 100%')
      .optional()
      .nullable(),
    performance_fee_tier1_threshold: z.number().nonnegative('Performance fee tier 1 threshold must be positive').optional().nullable(),
    performance_fee_tier2_percent: z
      .number()
      .min(0, 'Performance fee tier 2 percent must be positive')
      .max(100, 'Performance fee tier 2 percent cannot exceed 100%')
      .optional()
      .nullable(),
    performance_fee_tier2_threshold: z.number().nonnegative('Performance fee tier 2 threshold must be positive').optional().nullable(),

    // Financial tracking fields (optional)
    funded_amount: z.number().nonnegative('Funded amount must be positive').optional().nullable(),
    outstanding_amount: z.number().nonnegative('Outstanding amount must be positive').optional().nullable(),
    capital_calls_total: z.number().nonnegative('Capital calls total must be positive').optional().nullable(),
    distributions_total: z.number().nonnegative('Distributions total must be positive').optional().nullable(),
    current_nav: z.number().optional().nullable(),

    // Business context fields (optional)
    signed_doc_id: z.string().uuid('Signed document ID must be a valid UUID').optional().nullable(),
    acknowledgement_notes: z.string().optional().nullable(),
    opportunity_name: z.string().optional().nullable(),
    sourcing_contract_ref: z.string().optional().nullable(),
    introducer_id: z.string().uuid('Introducer ID must be a valid UUID').optional().nullable(),
    introduction_id: z.string().uuid('Introduction ID must be a valid UUID').optional().nullable()
  })
  // Business logic validation refinements
  .refine(
    (data) => {
      // Effective date must be before or equal to funding due date
      if (data.effective_date && data.funding_due_at) {
        return new Date(data.effective_date) <= new Date(data.funding_due_at)
      }
      return true
    },
    {
      message: 'Funding due date must be after effective date',
      path: ['funding_due_at']
    }
  )
  .refine(
    (data) => {
      // Contract date should not be in the future
      if (data.contract_date) {
        return new Date(data.contract_date) <= new Date()
      }
      return true
    },
    {
      message: 'Contract date cannot be in the future',
      path: ['contract_date']
    }
  )
  .refine(
    (data) => {
      // Spread per share should equal price - cost (within 1 cent tolerance)
      if (data.price_per_share != null && data.cost_per_share != null && data.spread_per_share != null) {
        const expectedSpread = data.price_per_share - data.cost_per_share
        const diff = Math.abs(data.spread_per_share - expectedSpread)
        return diff <= 0.01
      }
      return true
    },
    {
      message: 'Spread per share must equal price per share minus cost per share',
      path: ['spread_per_share']
    }
  )
  .refine(
    (data) => {
      // Subscription fee amount should match percentage (within 1 cent tolerance)
      if (data.subscription_fee_percent != null && data.subscription_fee_amount != null && data.commitment) {
        const expectedAmount = (data.commitment * data.subscription_fee_percent) / 100
        const diff = Math.abs(data.subscription_fee_amount - expectedAmount)
        return diff <= 0.01
      }
      return true
    },
    {
      message: 'Subscription fee amount must match subscription fee percentage',
      path: ['subscription_fee_amount']
    }
  )
  .refine(
    (data) => {
      // BD fee amount should match percentage (within 1 cent tolerance)
      if (data.bd_fee_percent != null && data.bd_fee_amount != null && data.commitment) {
        const expectedAmount = (data.commitment * data.bd_fee_percent) / 100
        const diff = Math.abs(data.bd_fee_amount - expectedAmount)
        return diff <= 0.01
      }
      return true
    },
    {
      message: 'BD fee amount must match BD fee percentage',
      path: ['bd_fee_amount']
    }
  )
  .refine(
    (data) => {
      // Spread fee amount should match spread * shares (within 1 cent tolerance)
      if (data.spread_per_share != null && data.num_shares != null && data.spread_fee_amount != null) {
        const expectedAmount = data.spread_per_share * data.num_shares
        const diff = Math.abs(data.spread_fee_amount - expectedAmount)
        return diff <= 0.01
      }
      return true
    },
    {
      message: 'Spread fee amount must equal spread per share times number of shares',
      path: ['spread_fee_amount']
    }
  )
  .refine(
    (data) => {
      // Performance fee tier 2 threshold must be >= tier 1 threshold
      if (data.performance_fee_tier1_threshold != null && data.performance_fee_tier2_threshold != null) {
        return data.performance_fee_tier2_threshold >= data.performance_fee_tier1_threshold
      }
      return true
    },
    {
      message: 'Performance fee tier 2 threshold must be greater than or equal to tier 1 threshold',
      path: ['performance_fee_tier2_threshold']
    }
  )
  .refine(
    (data) => {
      // Funded amount must not exceed commitment
      if (data.funded_amount != null && data.commitment) {
        return data.funded_amount <= data.commitment
      }
      return true
    },
    {
      message: 'Funded amount cannot exceed commitment',
      path: ['funded_amount']
    }
  )
  .refine(
    (data) => {
      // Outstanding amount should equal commitment - funded (within 1 cent tolerance)
      if (data.funded_amount != null && data.outstanding_amount != null && data.commitment) {
        const expectedOutstanding = data.commitment - data.funded_amount
        const diff = Math.abs(data.outstanding_amount - expectedOutstanding)
        return diff <= 0.01
      }
      return true
    },
    {
      message: 'Outstanding amount must equal commitment minus funded amount',
      path: ['outstanding_amount']
    }
  )

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>
