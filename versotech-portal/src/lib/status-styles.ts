/**
 * Shared status styling utilities for entity profile pages
 *
 * Used across all entity types: Investor, Introducer, Arranger, Lawyer, Partner, Commercial Partner
 */

/**
 * Entity status badge styles
 * @example <Badge className={statusStyles[entity.status]}>
 */
export const statusStyles: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  suspended: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  onboarding: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

/**
 * KYC status badge styles
 * @example <Badge className={kycStyles[entity.kycStatus]}>
 */
export const kycStyles: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  not_started: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

/**
 * Accreditation status badge styles
 */
export const accreditationStyles: Record<string, string> = {
  accredited: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  not_accredited: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
}

/**
 * Regulatory status badge styles (for Commercial Partners and Lawyers)
 */
export const regulatoryStyles: Record<string, string> = {
  regulated: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending_approval: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  unregulated: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
}

/**
 * Get style for any status type with fallback
 */
export function getStatusStyle(status: string | null | undefined, styles: Record<string, string>): string {
  if (!status) return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  return styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

/**
 * Default fallback style for unknown statuses
 */
export const defaultStyle = 'bg-gray-500/20 text-gray-400 border-gray-500/30'
