import parsePhoneNumber from 'libphonenumber-js/min'

const MOBILE_PHONE_TYPES = new Set(['MOBILE', 'FIXED_LINE_OR_MOBILE'])

export function normalizePhoneNumberInput(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function isValidMobilePhoneNumber(value: string): boolean {
  try {
    const parsed = parsePhoneNumber(value)
    if (!parsed || !parsed.isValid()) {
      return false
    }

    const phoneType = parsed.getType()
    if (!phoneType) {
      return true
    }

    return MOBILE_PHONE_TYPES.has(phoneType)
  } catch {
    return false
  }
}

export function getMobilePhoneValidationError(
  value: unknown,
  required = false
): string | null {
  const normalized = normalizePhoneNumberInput(value)

  if (!normalized) {
    return required ? 'Mobile phone is required' : null
  }

  if (!isValidMobilePhoneNumber(normalized)) {
    return 'Enter a valid mobile phone number for the selected country'
  }

  return null
}
