import { z } from 'zod'

export const entityFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Entity name is required')
    .max(200, 'Name must be less than 200 characters'),

  entity_code: z
    .string()
    .min(1, 'Entity code is required')
    .max(50, 'Entity code must be less than 50 characters')
    .nullable(),

  platform: z.string().max(100, 'Platform must be less than 100 characters').nullable(),

  investment_name: z
    .string()
    .max(200, 'Investment name must be less than 200 characters')
    .nullable(),

  former_entity: z
    .string()
    .max(200, 'Former entity name must be less than 200 characters')
    .nullable(),

  status: z.enum(['LIVE', 'CLOSED', 'TBD'], {
    required_error: 'Status is required'
  }),

  type: z.enum(
    [
      'fund',
      'spv',
      'securitization',
      'note',
      'venture_capital',
      'private_equity',
      'real_estate',
      'other'
    ],
    {
      required_error: 'Entity type is required'
    }
  ),

  domicile: z.string().max(100, 'Domicile must be less than 100 characters').nullable(),

  currency: z
    .string()
    .length(3, 'Currency must be exactly 3 letters')
    .transform((val) => val.toUpperCase()),

  formation_date: z.string().nullable(),

  legal_jurisdiction: z
    .string()
    .max(100, 'Legal jurisdiction must be less than 100 characters')
    .nullable(),

  registration_number: z
    .string()
    .max(100, 'Registration number must be less than 100 characters')
    .nullable(),

  reporting_type: z
    .enum(['Not Required', 'Company Only', 'Online only', 'Company + Online'])
    .nullable(),

  requires_reporting: z.boolean().nullable(),

  notes: z.string().max(5000, 'Notes must be less than 5000 characters').nullable(),

  logo_url: z
    .string()
    .url('Logo URL must be a valid URL')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  website_url: z
    .string()
    .url('Website URL must be a valid URL')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val))
})

export type EntityFormData = z.infer<typeof entityFormSchema>

// Validation for entity code uniqueness (to be used with async validation)
export async function validateEntityCodeUnique(
  entityCode: string,
  currentEntityId?: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/entities/validate-code?code=${encodeURIComponent(entityCode)}${currentEntityId ? `&excludeId=${currentEntityId}` : ''}`
    )
    const data = await response.json()
    return data.isUnique
  } catch (error) {
    console.error('Failed to validate entity code:', error)
    return true // Allow on error to not block the user
  }
}
