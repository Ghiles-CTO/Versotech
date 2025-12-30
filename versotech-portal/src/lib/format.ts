export const formatCurrency = (value: number | null | undefined, currency: string = 'USD') => {
  if (!value) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatBps = (bps: number | null | undefined) => {
  if (bps === null || bps === undefined) return '—'
  return `${bps} bps`
}

export const formatPercentage = (value: number | null | undefined) => {
  if (!value) return '0%'
  return `${(value * 100).toFixed(1)}%`
}

export const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date?.getTime?.())) return '—'
  // Use explicit locale to prevent hydration mismatch between server/client
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}




