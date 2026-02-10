import { formatCurrency } from './format'

export type CurrencyTotals = Record<string, number>

export function normalizeCurrencyCode(currency: string | null | undefined, fallback = 'USD'): string {
  const code = (currency || '').trim().toUpperCase()
  if (code.length === 3) return code
  return fallback
}

export function addCurrencyAmount(
  totals: CurrencyTotals,
  amount: number | null | undefined,
  currency: string | null | undefined
): CurrencyTotals {
  const value = Number(amount) || 0
  const code = normalizeCurrencyCode(currency)
  totals[code] = (totals[code] || 0) + value
  return totals
}

export function sumByCurrency<T>(
  items: T[],
  amountGetter: (item: T) => number | null | undefined,
  currencyGetter: (item: T) => string | null | undefined
): CurrencyTotals {
  return items.reduce<CurrencyTotals>((acc, item) => {
    addCurrencyAmount(acc, amountGetter(item), currencyGetter(item))
    return acc
  }, {})
}

export function mergeCurrencyTotals(...totals: CurrencyTotals[]): CurrencyTotals {
  return totals.reduce<CurrencyTotals>((acc, current) => {
    Object.entries(current).forEach(([currency, amount]) => {
      acc[currency] = (acc[currency] || 0) + (Number(amount) || 0)
    })
    return acc
  }, {})
}

export function currencyTotalsEntries(totals: CurrencyTotals): Array<[string, number]> {
  return Object.entries(totals)
    .filter(([, amount]) => Number(amount) !== 0)
    .sort(([a], [b]) => {
      if (a === 'USD') return -1
      if (b === 'USD') return 1
      return a.localeCompare(b)
    })
}

export function hasMixedCurrencies(totals: CurrencyTotals): boolean {
  return currencyTotalsEntries(totals).length > 1
}

export function getSingleCurrency(totals: CurrencyTotals): string | null {
  const entries = currencyTotalsEntries(totals)
  if (entries.length !== 1) return null
  return entries[0][0]
}

type FormatCurrencyTotalsOptions = {
  emptyValue?: string
  includeCodeForSingle?: boolean
  includeCodeForMixed?: boolean
  separator?: string
}

export function formatCurrencyTotals(
  totals: CurrencyTotals,
  options: FormatCurrencyTotalsOptions = {}
): string {
  const {
    emptyValue = '—',
    includeCodeForSingle = false,
    includeCodeForMixed = true,
    separator = ' / ',
  } = options
  const entries = currencyTotalsEntries(totals)
  if (entries.length === 0) return emptyValue
  if (entries.length === 1) {
    const [currency, amount] = entries[0]
    const formatted = formatCurrency(amount, currency)
    return includeCodeForSingle ? `${currency} ${formatted}` : formatted
  }

  return entries
    .map(([currency, amount]) => {
      const formatted = formatCurrency(amount, currency)
      return includeCodeForMixed ? `${currency} ${formatted}` : formatted
    })
    .join(separator)
}
