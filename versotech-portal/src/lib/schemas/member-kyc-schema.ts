/**
 * Shared KYC Schema for Entity Members
 * Used by all persona member APIs (investor, arranger, partner, introducer, lawyer, commercial_partner)
 *
 * This schema includes ALL fields that MemberKYCEditDialog supports.
 */

import { z } from 'zod'

export type MemberEntityType =
  | 'investor'
  | 'partner'
  | 'introducer'
  | 'lawyer'
  | 'commercial_partner'
  | 'arranger'

const ROLE_NORMALIZATION_MAP: Record<string, string> = {
  ubo: 'beneficial_owner',
  signatory: 'authorized_signatory',
  authorized_representative: 'authorized_signatory',
  beneficiary: 'beneficial_owner',
  trustee: 'other',
  managing_member: 'other',
  general_partner: 'partner',
  limited_partner: 'partner',
}

const ENTITY_ALLOWED_ROLES: Record<MemberEntityType, Set<string>> = {
  investor: new Set([
    'director',
    'shareholder',
    'beneficial_owner',
    'authorized_signatory',
    'officer',
    'partner',
    'other',
  ]),
  partner: new Set([
    'director',
    'shareholder',
    'beneficial_owner',
    'authorized_signatory',
    'officer',
    'partner',
    'other',
  ]),
  introducer: new Set([
    'director',
    'shareholder',
    'beneficial_owner',
    'authorized_signatory',
    'officer',
    'partner',
    'other',
  ]),
  commercial_partner: new Set([
    'director',
    'shareholder',
    'beneficial_owner',
    'authorized_signatory',
    'officer',
    'partner',
    'other',
  ]),
  arranger: new Set([
    'director',
    'shareholder',
    'beneficial_owner',
    'authorized_signatory',
    'officer',
    'partner',
    'other',
  ]),
  lawyer: new Set([
    'partner',
    'associate',
    'counsel',
    'paralegal',
    'other',
  ]),
}

export function normalizeMemberRole(role: string, entityType?: MemberEntityType): string {
  const loweredRole = role.toLowerCase()
  const normalized = ROLE_NORMALIZATION_MAP[loweredRole] || loweredRole

  if (!entityType) return normalized

  const allowedRoles = ENTITY_ALLOWED_ROLES[entityType]
  if (!allowedRoles.has(normalized)) {
    return 'other'
  }

  return normalized
}

/**
 * Full member KYC schema with all individual fields
 * Matches the fields in MemberKYCEditDialog component
 */
export const memberKycSchema = z.object({
  // Role Information
  role: z.enum([
    'director',
    'shareholder',
    'beneficial_owner',
    'authorized_signatory',
    'officer',
    'partner',
    'ubo',
    'signatory',
    'authorized_representative',
    'beneficiary',
    'trustee',
    'managing_member',
    'general_partner',
    'limited_partner',
    'associate',
    'counsel',
    'paralegal',
    'other'
  ]),
  role_title: z.string().max(100).optional().nullable(),

  // Name fields (structured)
  full_name: z.string().min(1).max(255).optional(), // Legacy/computed field
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  middle_initial: z.string().max(5).optional().nullable(), // Single letter initial
  last_name: z.string().max(100).optional().nullable(),
  name_suffix: z.string().max(20).optional().nullable(),

  // Personal Information
  date_of_birth: z.string().optional().nullable(),
  country_of_birth: z.string().max(2).optional().nullable(),
  nationality: z.string().max(2).optional().nullable(),

  // Contact Information
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(), // Legacy field
  phone_mobile: z.string().max(30).optional().nullable(),
  phone_office: z.string().max(30).optional().nullable(),

  // Residential Address
  residential_street: z.string().max(255).optional().nullable(),
  residential_line_2: z.string().max(255).optional().nullable(),
  residential_city: z.string().max(100).optional().nullable(),
  residential_state: z.string().max(100).optional().nullable(),
  residential_postal_code: z.string().max(20).optional().nullable(),
  residential_country: z.string().max(2).optional().nullable(),

  // US Tax Compliance
  is_us_citizen: z.boolean().optional(),
  is_us_taxpayer: z.boolean().optional(),
  us_taxpayer_id: z.string().max(20).optional().nullable(),
  country_of_tax_residency: z.string().max(2).optional().nullable(),
  tax_id_number: z.string().max(50).optional().nullable(),

  // Identification Document
  id_type: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other']).optional().nullable(),
  id_number: z.string().max(50).optional().nullable(),
  id_issue_date: z.string().optional().nullable(),
  id_expiry_date: z.string().optional().nullable(),
  id_issuing_country: z.string().max(2).optional().nullable(),

  // Proof of Address
  proof_of_address_date: z.string().optional().nullable(),
  proof_of_address_expiry: z.string().optional().nullable(),

  // Ownership & Signatory Status
  ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  is_beneficial_owner: z.boolean().optional(),
  is_signatory: z.boolean().optional(),
  can_sign: z.boolean().optional(),

  // Signature Specimen
  signature_specimen_url: z.string().url().optional().nullable(),
  signature_specimen_uploaded_at: z.string().optional().nullable(),

  // Effective dates
  effective_from: z.string().optional().nullable(),
  effective_to: z.string().optional().nullable(),

  // KYC Status (admin-managed, but included for completeness)
  kyc_status: z.enum(['pending', 'submitted', 'approved', 'rejected', 'expired']).optional(),
  kyc_expiry_date: z.string().optional().nullable(),
})

export type MemberKycData = z.infer<typeof memberKycSchema>

/**
 * Schema for creating a new member (required fields)
 */
export const createMemberSchema = memberKycSchema.extend({
  role: z.enum([
    'director',
    'shareholder',
    'beneficial_owner',
    'authorized_signatory',
    'officer',
    'partner',
    'ubo',
    'signatory',
    'authorized_representative',
    'beneficiary',
    'trustee',
    'managing_member',
    'general_partner',
    'limited_partner',
    'associate',
    'counsel',
    'paralegal',
    'other'
  ]), // Required
}).refine(
  (data) => data.first_name || data.full_name,
  { message: 'Either first_name or full_name is required', path: ['first_name'] }
)

/**
 * Schema for updating a member (all fields optional)
 */
export const updateMemberSchema = memberKycSchema.partial()

/**
 * Helper to compute full_name from structured name fields
 */
export function computeFullName(data: {
  first_name?: string | null
  middle_name?: string | null
  middle_initial?: string | null
  last_name?: string | null
  name_suffix?: string | null
}): string {
  // Use middle_initial if no middle_name, otherwise prefer middle_name
  const middlePart = data.middle_name || data.middle_initial
  const parts = [
    data.first_name,
    middlePart,
    data.last_name,
    data.name_suffix,
  ].filter(Boolean)
  return parts.join(' ')
}

/**
 * Helper to prepare member data for database insert/update
 */
export function prepareMemberData(
  data: Partial<MemberKycData>,
  options?: {
    computeFullName?: boolean
    entityType?: MemberEntityType
  }
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  // Copy all defined values, converting empty strings to null
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === 'role' && typeof value === 'string') {
        result[key] = normalizeMemberRole(value, options?.entityType)
      } else {
        result[key] = value === '' ? null : value
      }
    }
  }

  // Compute full_name if structured name fields are provided
  if (options?.computeFullName && (data.first_name || data.last_name)) {
    result.full_name = computeFullName(data)
  }

  const normalizedRole = typeof result.role === 'string' ? result.role : null
  if (normalizedRole === 'beneficial_owner' && result.is_beneficial_owner === undefined) {
    result.is_beneficial_owner = true
  }
  if (normalizedRole === 'authorized_signatory') {
    if (result.is_signatory === undefined) {
      result.is_signatory = true
    }
    if (result.can_sign === undefined) {
      result.can_sign = true
    }
  }

  return result
}
