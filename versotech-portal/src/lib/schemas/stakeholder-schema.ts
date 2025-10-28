import { z } from 'zod'

// Stakeholder role enum
export const stakeholderRoles = [
  'lawyer',
  'accountant',
  'auditor',
  'administrator',
  'strategic_partner',
  'shareholder',
  'other'
] as const

// Schema for creating a stakeholder
export const stakeholderFormSchema = z.object({
  role: z.enum(stakeholderRoles),

  company_name: z
    .string()
    .min(1, 'Company/Firm name is required')
    .max(200, 'Company name must be less than 200 characters'),

  contact_person: z
    .string()
    .max(200, 'Contact person name must be less than 200 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  email: z
    .string()
    .email('Must be a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  phone: z
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  effective_from: z
    .string()
    .min(1, 'Effective from date is required')
    .refine((date) => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, 'Must be a valid date'),

  effective_to: z
    .string()
    .nullable()
    .refine(
      (date) => {
        if (!date) return true
        const d = new Date(date)
        return !isNaN(d.getTime())
      },
      'Must be a valid date'
    )
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val))
}).refine(
  (data) => {
    if (data.effective_to && data.effective_from) {
      return new Date(data.effective_from) <= new Date(data.effective_to)
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['effective_to']
  }
)

export type StakeholderFormData = z.infer<typeof stakeholderFormSchema>

// Schema for editing an existing stakeholder
export const stakeholderEditSchema = z.object({
  role: z.enum(stakeholderRoles),

  company_name: z
    .string()
    .min(1, 'Company/Firm name is required')
    .max(200, 'Company name must be less than 200 characters'),

  contact_person: z
    .string()
    .max(200, 'Contact person name must be less than 200 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  email: z
    .string()
    .email('Must be a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  phone: z
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  effective_from: z
    .string()
    .min(1, 'Effective from date is required')
    .refine((date) => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, 'Must be a valid date'),

  effective_to: z
    .string()
    .nullable()
    .refine(
      (date) => {
        if (!date) return true
        const d = new Date(date)
        return !isNaN(d.getTime())
      },
      'Must be a valid date'
    )
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val))
}).refine(
  (data) => {
    if (data.effective_to && data.effective_from) {
      return new Date(data.effective_from) <= new Date(data.effective_to)
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['effective_to']
  }
)

export type StakeholderEditFormData = z.infer<typeof stakeholderEditSchema>

// Helper function to get stakeholder role label
export function getStakeholderRoleLabel(role: typeof stakeholderRoles[number]): string {
  const labels: Record<typeof stakeholderRoles[number], string> = {
    lawyer: 'Lawyer / Legal Counsel',
    accountant: 'Accountant',
    auditor: 'Auditor',
    administrator: 'Administrator',
    strategic_partner: 'Strategic Partner',
    shareholder: 'Shareholder',
    other: 'Other'
  }
  return labels[role] || role
}
