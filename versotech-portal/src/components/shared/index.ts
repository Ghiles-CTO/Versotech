/**
 * Shared Components
 *
 * Reusable components for KYC editing across all personas
 */

// KYC Edit Dialogs
export { EntityKYCEditDialog, individualKycEditSchema } from './entity-kyc-edit-dialog'
export type { IndividualKycEditForm, EntityType } from './entity-kyc-edit-dialog'

export { MemberKYCEditDialog, memberKycEditSchema, MEMBER_ROLES } from './member-kyc-edit-dialog'
export type { MemberKycEditForm } from './member-kyc-edit-dialog'

export { EntityAddressEditDialog, entityAddressSchema } from './entity-address-edit-dialog'
export type { EntityAddressForm } from './entity-address-edit-dialog'

// KYC Display Components
export { IndividualKycDisplay } from './individual-kyc-display'
export type { IndividualKycData } from './individual-kyc-display'
