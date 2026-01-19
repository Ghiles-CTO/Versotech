/**
 * Date Helper Utilities
 *
 * Shared utility functions for date-related operations across the application.
 */

/**
 * Check if an ID document is expiring soon (within 30 days) or already expired.
 *
 * @param expiryDate - The expiry date string (ISO format) or null
 * @returns 'expired' if the date is in the past, 'expiring_soon' if within 30 days, null otherwise
 */
export function getIdExpiryWarning(expiryDate: string | null): 'expired' | 'expiring_soon' | null {
  if (!expiryDate) return null

  const expiry = new Date(expiryDate)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (expiry < now) return 'expired'
  if (expiry < thirtyDaysFromNow) return 'expiring_soon'
  return null
}

/**
 * Format a date string for display in UK format (e.g., "17 Jan 2026")
 *
 * @param dateStr - The date string to format
 * @returns Formatted date string
 */
export function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Get a human-readable relative time string (e.g., "2 days ago", "Just now")
 *
 * @param dateStr - The date string to compare to now, or null
 * @returns A human-readable relative time string
 */
export function getRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'

  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Just now'
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}
