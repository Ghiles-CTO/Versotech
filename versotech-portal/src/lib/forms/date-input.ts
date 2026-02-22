import * as React from 'react'

/**
 * Keeps partial/full date input constrained to YYYY-MM-DD shape while typing.
 * This prevents malformed years (e.g. 5+ digits) from being entered.
 */
export function sanitizeDateInputValue(rawValue: string): string {
  if (!rawValue) return rawValue

  const normalized = rawValue.replace(/[^\d-]/g, '')
  const [rawYear = '', rawMonth = '', rawDay = ''] = normalized.split('-')

  const year = rawYear.slice(0, 4)
  const month = rawMonth.slice(0, 2)
  const day = rawDay.slice(0, 2)

  if (!normalized.includes('-')) return year
  if (normalized.split('-').length === 2) return `${year}-${month}`
  return `${year}-${month}-${day}`
}

export function clampDateInputYear(event: React.FormEvent<HTMLInputElement>) {
  const input = event.currentTarget
  const sanitized = sanitizeDateInputValue(input.value)
  if (input.value !== sanitized) {
    input.value = sanitized
  }
}
