/**
 * Individual KYC Validation Schemas
 * Zod schemas for validating individual KYC data (for members and individual investors)
 */

import { z } from 'zod'
import { COUNTRIES } from '@/components/kyc/country-select'

// Valid country codes from our COUNTRIES list
const validCountryCodes = COUNTRIES.map((c) => c.code) as [string, ...string[]]

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Country code schema - validates against ISO 3166-1 alpha-2 codes
 */
export const countryCodeSchema = z.enum(validCountryCodes, {
  errorMap: () => ({ message: 'Please select a valid country' }),
})

/**
 * Optional country code
 */
export const optionalCountrySchema = countryCodeSchema.optional().nullable()

/**
 * Date string schema - accepts YYYY-MM-DD format
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD')

/**
 * Optional date string
 */
export const optionalDateSchema = dateStringSchema.optional().nullable()

/**
 * Phone number schema - basic international format validation
 */
export const phoneSchema = z
  .string()
  .min(7, 'Phone number must be at least 7 characters')
  .max(20, 'Phone number must be at most 20 characters')
  .regex(/^[+\d\s()-]+$/, 'Invalid phone number format')

/**
 * Optional phone number
 */
export const optionalPhoneSchema = phoneSchema.optional().nullable().or(z.literal(''))

// ============================================================================
// Personal Information Schema
// ============================================================================

/**
 * Personal information schema for individual KYC
 * Used for members and individual investors
 */
export const personalInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().min(1, 'Last name is required').max(100),
  name_suffix: z.string().max(20).optional().nullable(),

  date_of_birth: dateStringSchema.refine(
    (val) => {
      const dob = new Date(val)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()
      const dayDiff = today.getDate() - dob.getDate()
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age
      return actualAge >= 18
    },
    { message: 'Must be at least 18 years old' }
  ),

  country_of_birth: countryCodeSchema,
  nationality: countryCodeSchema,

  email: z.string().email('Invalid email address').optional().nullable(),
  phone_mobile: phoneSchema,
  phone_office: optionalPhoneSchema,
})

/**
 * Partial personal info schema for updates
 */
export const partialPersonalInfoSchema = personalInfoSchema.partial()

// ============================================================================
// Address Schema
// ============================================================================

/**
 * Full address schema
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200),
  line_2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional().nullable(),
  postal_code: z.string().min(1, 'Postal code is required').max(20),
  country: countryCodeSchema,
})

/**
 * Partial address schema for updates
 */
export const partialAddressSchema = addressSchema.partial()

/**
 * Residential address schema (with residential_ prefix)
 */
export const residentialAddressSchema = z.object({
  residential_street: z.string().min(1, 'Street address is required').max(200),
  residential_line_2: z.string().max(200).optional().nullable(),
  residential_city: z.string().min(1, 'City is required').max(100),
  residential_state: z.string().max(100).optional().nullable(),
  residential_postal_code: z.string().min(1, 'Postal code is required').max(20),
  residential_country: countryCodeSchema,
})

/**
 * Registered address schema (for entities)
 */
export const registeredAddressSchema = z.object({
  registered_street: z.string().min(1, 'Street address is required').max(200),
  registered_line_2: z.string().max(200).optional().nullable(),
  registered_city: z.string().min(1, 'City is required').max(100),
  registered_state: z.string().max(100).optional().nullable(),
  registered_postal_code: z.string().min(1, 'Postal code is required').max(20),
  registered_country: countryCodeSchema,
})

// ============================================================================
// Tax Information Schema
// ============================================================================

/**
 * US Taxpayer ID schema (SSN: XXX-XX-XXXX or EIN: XX-XXXXXXX)
 */
export const usTaxpayerIdSchema = z
  .string()
  .regex(
    /^(\d{3}-\d{2}-\d{4}|\d{2}-\d{7})$/,
    'Invalid US Taxpayer ID format. Expected SSN (XXX-XX-XXXX) or EIN (XX-XXXXXXX)'
  )

/**
 * Tax information schema
 */
export const taxInfoSchema = z
  .object({
    is_us_citizen: z.boolean().default(false),
    is_us_taxpayer: z.boolean().default(false),
    us_taxpayer_id: z.string().optional().nullable(),
    country_of_tax_residency: countryCodeSchema,
    tax_id_number: z.string().max(50).optional().nullable(),
  })
  .refine(
    (data) => {
      // If US citizen or US taxpayer, require US taxpayer ID
      if (data.is_us_citizen || data.is_us_taxpayer) {
        return data.us_taxpayer_id && data.us_taxpayer_id.length > 0
      }
      return true
    },
    {
      message: 'US Taxpayer ID is required for US citizens and US tax persons',
      path: ['us_taxpayer_id'],
    }
  )

/**
 * Partial tax info schema for updates
 */
export const partialTaxInfoSchema = taxInfoSchema.partial()

// ============================================================================
// Identification Document Schema
// ============================================================================

/**
 * ID document types
 */
export const idTypeSchema = z.enum([
  'passport',
  'national_id',
  'drivers_license',
  'residence_permit',
])

/**
 * Identification document schema
 */
export const identificationSchema = z
  .object({
    id_type: idTypeSchema,
    id_number: z.string().min(1, 'ID number is required').max(50),
    id_issue_date: optionalDateSchema,
    id_expiry_date: dateStringSchema.refine(
      (val) => {
        const expiry = new Date(val)
        const today = new Date()
        return expiry > today
      },
      { message: 'ID document must not be expired' }
    ),
    id_issuing_country: countryCodeSchema,
  })
  .refine(
    (data) => {
      // If issue date provided, it must be before expiry date
      if (data.id_issue_date && data.id_expiry_date) {
        const issue = new Date(data.id_issue_date)
        const expiry = new Date(data.id_expiry_date)
        return issue < expiry
      }
      return true
    },
    {
      message: 'Issue date must be before expiry date',
      path: ['id_issue_date'],
    }
  )

/**
 * Partial identification schema for updates
 */
export const partialIdentificationSchema = identificationSchema.partial()

// ============================================================================
// Complete Individual KYC Schema
// ============================================================================

/**
 * Complete individual KYC schema combining all sections
 */
export const individualKycSchema = z
  .object({
    // Personal Info
    first_name: z.string().min(1, 'First name is required').max(100),
    middle_name: z.string().max(100).optional().nullable(),
    last_name: z.string().min(1, 'Last name is required').max(100),
    name_suffix: z.string().max(20).optional().nullable(),
    date_of_birth: dateStringSchema,
    country_of_birth: countryCodeSchema,
    nationality: countryCodeSchema,
    email: z.string().email('Invalid email address').optional().nullable(),
    phone_mobile: phoneSchema,
    phone_office: optionalPhoneSchema,

    // Residential Address
    residential_street: z.string().min(1, 'Street address is required').max(200),
    residential_line_2: z.string().max(200).optional().nullable(),
    residential_city: z.string().min(1, 'City is required').max(100),
    residential_state: z.string().max(100).optional().nullable(),
    residential_postal_code: z.string().min(1, 'Postal code is required').max(20),
    residential_country: countryCodeSchema,

    // Tax Information
    is_us_citizen: z.boolean().default(false),
    is_us_taxpayer: z.boolean().default(false),
    us_taxpayer_id: z.string().optional().nullable(),
    country_of_tax_residency: countryCodeSchema,
    tax_id_number: z.string().max(50).optional().nullable(),

    // Identification Document
    id_type: idTypeSchema,
    id_number: z.string().min(1, 'ID number is required').max(50),
    id_issue_date: optionalDateSchema,
    id_expiry_date: dateStringSchema,
    id_issuing_country: countryCodeSchema,
  })
  .refine(
    (data) => {
      // Age validation
      const dob = new Date(data.date_of_birth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()
      const dayDiff = today.getDate() - dob.getDate()
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age
      return actualAge >= 18
    },
    {
      message: 'Must be at least 18 years old',
      path: ['date_of_birth'],
    }
  )
  .refine(
    (data) => {
      // US taxpayer ID requirement
      if (data.is_us_citizen || data.is_us_taxpayer) {
        return data.us_taxpayer_id && data.us_taxpayer_id.length > 0
      }
      return true
    },
    {
      message: 'US Taxpayer ID is required for US citizens and US tax persons',
      path: ['us_taxpayer_id'],
    }
  )
  .refine(
    (data) => {
      // ID expiry validation
      const expiry = new Date(data.id_expiry_date)
      const today = new Date()
      return expiry > today
    },
    {
      message: 'ID document must not be expired',
      path: ['id_expiry_date'],
    }
  )

/**
 * Partial individual KYC schema for updates
 */
export const partialIndividualKycSchema = individualKycSchema.partial()

// ============================================================================
// Member KYC Schema (for entity members)
// ============================================================================

/**
 * Entity member KYC schema
 */
export const memberKycSchema = z
  .object({
    // Basic member fields
    role: z.enum(['director', 'ubo', 'signatory', 'authorized_representative', 'beneficiary']),

    // Individual KYC fields
    first_name: z.string().min(1, 'First name is required').max(100),
    middle_name: z.string().max(100).optional().nullable(),
    last_name: z.string().min(1, 'Last name is required').max(100),
    name_suffix: z.string().max(20).optional().nullable(),
    date_of_birth: dateStringSchema,
    country_of_birth: countryCodeSchema,
    nationality: countryCodeSchema,
    email: z.string().email('Invalid email address').optional().nullable(),
    phone_mobile: optionalPhoneSchema,
    phone_office: optionalPhoneSchema,

    // Address
    residential_street: z.string().max(200).optional().nullable(),
    residential_line_2: z.string().max(200).optional().nullable(),
    residential_city: z.string().max(100).optional().nullable(),
    residential_state: z.string().max(100).optional().nullable(),
    residential_postal_code: z.string().max(20).optional().nullable(),
    residential_country: optionalCountrySchema,

    // Tax Information
    is_us_citizen: z.boolean().default(false),
    is_us_taxpayer: z.boolean().default(false),
    us_taxpayer_id: z.string().optional().nullable(),
    country_of_tax_residency: optionalCountrySchema,
    tax_id_number: z.string().max(50).optional().nullable(),

    // Identification
    id_type: idTypeSchema.optional().nullable(),
    id_number: z.string().max(50).optional().nullable(),
    id_issue_date: optionalDateSchema,
    id_expiry_date: optionalDateSchema,
    id_issuing_country: optionalCountrySchema,

    // UBO-specific
    ownership_percentage: z.number().min(0).max(100).optional().nullable(),
  })
  .refine(
    (data) => {
      // US taxpayer ID requirement
      if (data.is_us_citizen || data.is_us_taxpayer) {
        return data.us_taxpayer_id && data.us_taxpayer_id.length > 0
      }
      return true
    },
    {
      message: 'US Taxpayer ID is required for US citizens and US tax persons',
      path: ['us_taxpayer_id'],
    }
  )

/**
 * Partial member KYC schema for updates
 */
export const partialMemberKycSchema = memberKycSchema.partial()

// ============================================================================
// Type Exports
// ============================================================================

export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type Address = z.infer<typeof addressSchema>
export type ResidentialAddress = z.infer<typeof residentialAddressSchema>
export type RegisteredAddress = z.infer<typeof registeredAddressSchema>
export type TaxInfo = z.infer<typeof taxInfoSchema>
export type Identification = z.infer<typeof identificationSchema>
export type IndividualKyc = z.infer<typeof individualKycSchema>
export type MemberKyc = z.infer<typeof memberKycSchema>
export type IdType = z.infer<typeof idTypeSchema>
