import { z } from 'zod'

// Schema for director registry (creating a new director in the global registry)
export const directorRegistrySchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(200, 'Name must be less than 200 characters'),

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

  nationality: z
    .string()
    .max(100, 'Nationality must be less than 100 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  id_number: z
    .string()
    .max(100, 'ID number must be less than 100 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val))
})

export type DirectorRegistryFormData = z.infer<typeof directorRegistrySchema>

// Schema for director assignment (linking a director to an entity)
export const directorAssignmentSchema = z.object({
  role: z
    .string()
    .min(1, 'Role is required')
    .max(100, 'Role must be less than 100 characters'),

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

export type DirectorAssignmentFormData = z.infer<typeof directorAssignmentSchema>

// Combined schema for creating and assigning a director in one step
export const directorCreateAndAssignSchema = z.object({
  // Director information
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(200, 'Name must be less than 200 characters'),

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

  nationality: z
    .string()
    .max(100, 'Nationality must be less than 100 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  id_number: z
    .string()
    .max(100, 'ID number must be less than 100 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  director_notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  // Assignment information
  role: z
    .string()
    .min(1, 'Role is required')
    .max(100, 'Role must be less than 100 characters'),

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

  assignment_notes: z
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

export type DirectorCreateAndAssignFormData = z.infer<typeof directorCreateAndAssignSchema>

// Schema for editing an existing director assignment
export const directorEditSchema = z.object({
  role: z
    .string()
    .min(1, 'Role is required')
    .max(100, 'Role must be less than 100 characters'),

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

export type DirectorEditFormData = z.infer<typeof directorEditSchema>
