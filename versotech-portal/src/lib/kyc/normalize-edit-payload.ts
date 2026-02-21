type VisibilityOptions = {
  showPersonalInfo?: boolean
  showAddress?: boolean
  showTaxInfo?: boolean
  showIdentification?: boolean
  showRoleInfo?: boolean
  showOwnershipInfo?: boolean
}

const SECTION_FIELDS = {
  personal: [
    'first_name',
    'middle_name',
    'middle_initial',
    'last_name',
    'name_suffix',
    'date_of_birth',
    'country_of_birth',
    'nationality',
    'email',
    'phone_mobile',
    'phone_office',
  ],
  address: [
    'residential_street',
    'residential_line_2',
    'residential_city',
    'residential_state',
    'residential_postal_code',
    'residential_country',
  ],
  tax: [
    'is_us_citizen',
    'is_us_taxpayer',
    'us_taxpayer_id',
    'country_of_tax_residency',
    'tax_id_number',
  ],
  identification: [
    'id_type',
    'id_number',
    'id_issue_date',
    'id_expiry_date',
    'id_issuing_country',
    'proof_of_address_date',
    'proof_of_address_expiry',
  ],
  role: ['role'],
  ownership: ['ownership_percentage'],
} as const

function toNullableTrimmed(value: unknown) {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Clean edit-form payloads so hidden sections never leak stale values and
 * empty strings are normalized to null for API validators.
 */
export function normalizeKycEditPayload<T extends Record<string, unknown>>(
  data: T,
  options: VisibilityOptions = {}
) {
  const hiddenFields = new Set<string>()

  if (options.showPersonalInfo === false) {
    SECTION_FIELDS.personal.forEach((field) => hiddenFields.add(field))
  }
  if (options.showAddress === false) {
    SECTION_FIELDS.address.forEach((field) => hiddenFields.add(field))
  }
  if (options.showTaxInfo === false) {
    SECTION_FIELDS.tax.forEach((field) => hiddenFields.add(field))
  }
  if (options.showIdentification === false) {
    SECTION_FIELDS.identification.forEach((field) => hiddenFields.add(field))
  }
  if (options.showRoleInfo === false) {
    SECTION_FIELDS.role.forEach((field) => hiddenFields.add(field))
  }
  if (options.showOwnershipInfo === false) {
    SECTION_FIELDS.ownership.forEach((field) => hiddenFields.add(field))
  }

  return Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => !hiddenFields.has(key))
      .map(([key, value]) => [key, toNullableTrimmed(value)])
  )
}

