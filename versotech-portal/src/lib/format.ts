export const formatCurrency = (value: number | null | undefined, currency: string = 'USD') => {
  const numeric = Number(value)
  const safeValue = Number.isFinite(numeric) ? numeric : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(safeValue)
}

export const formatBps = (bps: number | null | undefined) => {
  if (bps === null || bps === undefined) return '—'
  return `${bps} bps`
}

export const formatPercentage = (value: number | null | undefined) => {
  if (!value) return '0%'
  return `${(value * 100).toFixed(1)}%`
}

type ViewerDateValue = string | Date | null | undefined

type ViewerDateOptions = {
  timeZone?: string
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

const toValidDate = (value: ViewerDateValue) => {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date?.getTime?.())) return '—'
  return date
}

const resolveViewerTimeZone = (value: ViewerDateValue, timeZone?: string) => {
  if (timeZone) return timeZone
  if (typeof value === 'string' && DATE_ONLY_REGEX.test(value)) return 'UTC'
  return undefined
}

export const formatViewerDate = (value: ViewerDateValue, options: ViewerDateOptions = {}) => {
  const date = toValidDate(value)
  if (date === '—') return date

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: resolveViewerTimeZone(value, options.timeZone),
  }).format(date)
}

export const formatViewerDateTime = (
  value: ViewerDateValue,
  options: ViewerDateOptions = {}
) => {
  const date = toValidDate(value)
  if (date === '—') return date

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: resolveViewerTimeZone(value, options.timeZone),
  }).format(date).replace(',', '')
}

export const formatDate = (value: ViewerDateValue) => {
  return formatViewerDate(value)
}

export const formatDateTime = (value: ViewerDateValue) => {
  return formatViewerDateTime(value)
}
