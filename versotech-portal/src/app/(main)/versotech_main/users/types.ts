// Re-export types from the API for use in components
export type {
  EntityAssociation,
  UserKyc,
  UserRow,
  UsersStats,
  UsersResponse
} from '@/app/api/admin/users/route'

// Additional types for UI components

export type EntityType = 'investor' | 'partner' | 'lawyer' | 'commercial_partner' | 'introducer' | 'arranger'

export type SystemRole =
  | 'investor'
  | 'staff_admin'
  | 'staff_ops'
  | 'staff_rm'
  | 'arranger'
  | 'introducer'
  | 'partner'
  | 'commercial_partner'
  | 'lawyer'
  | 'ceo'
  | 'multi_persona'

export type KycStatus = 'approved' | 'pending' | 'submitted' | 'rejected' | 'expired' | null

export interface RoleBadgeConfig {
  label: string
  className: string
}

export const ROLE_BADGE_CONFIG: Record<string, RoleBadgeConfig> = {
  staff_admin: { label: 'Staff Admin', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
  staff_ops: { label: 'Staff Ops', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
  staff_rm: { label: 'Staff RM', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
  ceo: { label: 'CEO', className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' },
  investor: { label: 'Investor', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' },
  partner: { label: 'Partner', className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30' },
  lawyer: { label: 'Lawyer', className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/30' },
  introducer: { label: 'Introducer', className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' },
  arranger: { label: 'Arranger', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' },
  commercial_partner: { label: 'Commercial Partner', className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30' },
  multi_persona: { label: 'Multi-Role', className: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' },
}

export const ENTITY_TYPE_CONFIG: Record<EntityType, { label: string; className: string }> = {
  investor: { label: 'Investor', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' },
  partner: { label: 'Partner', className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30' },
  lawyer: { label: 'Lawyer', className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/30' },
  commercial_partner: { label: 'Commercial Partner', className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30' },
  introducer: { label: 'Introducer', className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' },
  arranger: { label: 'Arranger', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' },
}

export const KYC_STATUS_CONFIG: Record<string, { label: string; className: string; icon: 'check' | 'clock' | 'upload' | 'x' | 'alert' }> = {
  approved: { label: 'Approved', className: 'text-green-600 dark:text-green-400', icon: 'check' },
  pending: { label: 'Pending', className: 'text-yellow-600 dark:text-yellow-400', icon: 'clock' },
  submitted: { label: 'Submitted', className: 'text-blue-600 dark:text-blue-400', icon: 'upload' },
  rejected: { label: 'Rejected', className: 'text-red-600 dark:text-red-400', icon: 'x' },
  expired: { label: 'Expired', className: 'text-orange-600 dark:text-orange-400', icon: 'alert' },
}

// Default visible columns
export const DEFAULT_VISIBLE_COLUMNS = [
  'select',
  'user',
  'email',
  'systemRole',
  'entities',
  'kyc',
  'lastLoginAt',
  'actions'
]

// All available columns
export const ALL_COLUMNS = [
  'select',
  'user',
  'email',
  'systemRole',
  'title',
  'phone',
  'officeLocation',
  'entities',
  'kyc',
  'createdAt',
  'lastLoginAt',
  'passwordSet',
  'isSuperAdmin',
  'hasSignature',
  'actions'
]

// Required columns that cannot be hidden
export const REQUIRED_COLUMNS = ['select', 'user', 'actions']
