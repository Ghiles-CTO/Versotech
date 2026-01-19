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
  staff_admin: { label: 'Staff Admin', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  staff_ops: { label: 'Staff Ops', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  staff_rm: { label: 'Staff RM', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  ceo: { label: 'CEO', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  investor: { label: 'Investor', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  partner: { label: 'Partner', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  lawyer: { label: 'Lawyer', className: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  introducer: { label: 'Introducer', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  arranger: { label: 'Arranger', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  commercial_partner: { label: 'Commercial Partner', className: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  multi_persona: { label: 'Multi-Role', className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
}

export const ENTITY_TYPE_CONFIG: Record<EntityType, { label: string; className: string }> = {
  investor: { label: 'Investor', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  partner: { label: 'Partner', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  lawyer: { label: 'Lawyer', className: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  commercial_partner: { label: 'Commercial Partner', className: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  introducer: { label: 'Introducer', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  arranger: { label: 'Arranger', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
}

export const KYC_STATUS_CONFIG: Record<string, { label: string; className: string; icon: 'check' | 'clock' | 'upload' | 'x' | 'alert' }> = {
  approved: { label: 'Approved', className: 'text-green-400', icon: 'check' },
  pending: { label: 'Pending', className: 'text-yellow-400', icon: 'clock' },
  submitted: { label: 'Submitted', className: 'text-blue-400', icon: 'upload' },
  rejected: { label: 'Rejected', className: 'text-red-400', icon: 'x' },
  expired: { label: 'Expired', className: 'text-orange-400', icon: 'alert' },
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
